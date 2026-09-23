import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadNativeConfig } from '../lib/load-config.mjs'
import { ensureNativeScriptConfig } from '../lib/nativescript-config.mjs'
import { ensureWebpackConfig } from '../lib/webpack-config.mjs'
import { generateEntry } from '../lib/generate-entry.mjs'
import { applySplashBranding } from '../lib/splash.mjs'
import { ensureTailwindSetup } from '../lib/tailwind-setup.mjs'
import { ensureGradleMemorySettings } from '../lib/gradle-tuning.mjs'
import { ensureWebSocketDependency } from '../lib/websocket-setup.mjs'
import { run } from '../lib/run.mjs'

export async function init({ platforms } = {}) {
  const config = await loadNativeConfig()
  const targets = platforms?.length ? platforms : config.platforms

  const configPath = ensureNativeScriptConfig(process.cwd(), config)
  console.log(`[nuxt-native] nativescript.config.ts ready at ${configPath}`)

  const webpackConfigPath = ensureWebpackConfig(process.cwd())
  console.log(`[nuxt-native] webpack config ready at ${webpackConfigPath}`)

  await ensureTailwindSetup(process.cwd())
  console.log('[nuxt-native] Tailwind config ready (tailwind.config.cjs/postcss.config.cjs/app/app.css)')

  generateEntry({ pagesDir: 'app/pages' })
  console.log('[nuxt-native] Generated .nuxt-native/ bootstrap from app/pages')

  for (const platform of targets) {
    // `ns platform add` exits non-zero when the platform is already added
    // (reproduced directly: a real project where `platform add android` had
    // already been run once — rerunning it printed "Platform android
    // already added" and still exited with code 127) — run()'s exit-code
    // check can't tell that apart from a real failure, so it would abort
    // init() here every time, before ever reaching applySplashBranding()
    // below. `nuxt-native init` is supposed to be safe to rerun on a
    // project in any state, so check for the platform's own directory
    // first instead of relying on the CLI's exit code for this case.
    if (existsSync(join(process.cwd(), 'platforms', platform))) {
      console.log(`[nuxt-native] platforms/${platform} already exists, skipping ns platform add`)
      continue
    }
    console.log(`[nuxt-native] ns platform add ${platform} (scaffolds App_Resources on first run)`)
    await run('npx', ['--yes', 'nativescript', 'platform', 'add', platform])
  }

  // Runs after `ns platform add` unconditionally, not just on first init:
  // it's cheap, idempotent (always regenerates the same images), and
  // covers the case where App_Resources already existed (so the platform
  // loop above was a no-op) but was never branded yet.
  applySplashBranding(join(process.cwd(), 'App_Resources'), targets)
  console.log('[nuxt-native] Applied Nuxt Native splash screen branding')

  // Also runs unconditionally (idempotent via its own marker check): the
  // stock @nativescript/android template ships a flat 16 GB Gradle daemon
  // heap ceiling regardless of the machine's real specs, which is a real
  // problem on small machines specifically. Only patches platforms/android/
  // gradle.properties once, and never overwrites a value the project has
  // since customized itself.
  ensureGradleMemorySettings(join(process.cwd(), 'platforms'), targets)
  console.log('[nuxt-native] Tuned Gradle memory settings for this machine')

  // Unconditional, like the two settings above: OkHttp is a small (~750
  // KB), extremely common Android dependency (most real apps already pull
  // it in transitively via something else), and useWebSocket() needs it
  // present to interop with regardless of whether a given app actually
  // calls it — matching the "batteries included" UI-kit-style default
  // this framework already takes elsewhere, rather than gating it behind
  // detecting real usage.
  if (targets.includes('android')) {
    ensureWebSocketDependency(process.cwd())
    console.log('[nuxt-native] Added OkHttp (for useWebSocket()) to App_Resources/Android/app.gradle')
  }

  console.log('[nuxt-native] Init complete. Next: nuxt-native dev <ios|android>')
}
