import { join } from 'node:path'
import { loadNativeConfig } from '../lib/load-config.mjs'
import { ensureNativeScriptConfig } from '../lib/nativescript-config.mjs'
import { ensureWebpackConfig } from '../lib/webpack-config.mjs'
import { generateEntry } from '../lib/generate-entry.mjs'
import { applySplashBranding } from '../lib/splash.mjs'
import { ensureTailwindSetup } from '../lib/tailwind-setup.mjs'
import { run } from '../lib/run.mjs'

export async function init({ platforms } = {}) {
  const config = await loadNativeConfig()
  const targets = platforms?.length ? platforms : config.platforms

  const configPath = ensureNativeScriptConfig(process.cwd(), config)
  console.log(`[nuxt-native] nativescript.config.ts ready at ${configPath}`)

  const webpackConfigPath = ensureWebpackConfig(process.cwd())
  console.log(`[nuxt-native] webpack config ready at ${webpackConfigPath}`)

  ensureTailwindSetup(process.cwd())
  console.log('[nuxt-native] Tailwind config ready (tailwind.config.cjs/postcss.config.cjs/app/app.css)')

  generateEntry({ pagesDir: 'app/pages' })
  console.log('[nuxt-native] Generated .nuxt-native/ bootstrap from app/pages')

  for (const platform of targets) {
    console.log(`[nuxt-native] ns platform add ${platform} (scaffolds App_Resources on first run)`)
    await run('npx', ['--yes', 'nativescript', 'platform', 'add', platform])
  }

  // Runs after `ns platform add` unconditionally, not just on first init:
  // it's cheap, idempotent (always regenerates the same images), and
  // covers the case where App_Resources already existed (so the platform
  // loop above was a no-op) but was never branded yet.
  applySplashBranding(join(process.cwd(), 'App_Resources'), targets)
  console.log('[nuxt-native] Applied Nuxt Native splash screen branding')

  console.log('[nuxt-native] Init complete. Next: nuxt-native dev <ios|android>')
}
