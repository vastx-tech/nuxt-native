import { loadNativeConfig } from '../lib/load-config.mjs'
import { ensureNativeScriptConfig } from '../lib/nativescript-config.mjs'
import { generateEntry } from '../lib/generate-entry.mjs'
import { run } from '../lib/run.mjs'

export async function init({ platforms } = {}) {
  const config = await loadNativeConfig()
  const targets = platforms?.length ? platforms : config.platforms

  const configPath = ensureNativeScriptConfig(process.cwd(), config)
  console.log(`[nuxt-native] nativescript.config.ts ready at ${configPath}`)

  generateEntry({ pagesDir: 'app/pages' })
  console.log('[nuxt-native] Generated .nuxt-native/ bootstrap from app/pages')

  for (const platform of targets) {
    console.log(`[nuxt-native] ns platform add ${platform} (scaffolds App_Resources on first run)`)
    await run('npx', ['--yes', 'nativescript', 'platform', 'add', platform])
  }

  console.log('[nuxt-native] Init complete. Next: nuxt-native dev <ios|android>')
}
