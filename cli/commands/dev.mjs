import { generateEntry } from '../lib/generate-entry.mjs'
import { run } from '../lib/run.mjs'

/**
 * `nsArgs` is forwarded verbatim to `ns run` — e.g. `--device <id>`,
 * `--emulator`, `--release`. See build.mjs's comment on why this is a
 * pass-through rather than a reimplemented/whitelisted flag set.
 */
export async function dev(platform, nsArgs = []) {
  if (platform !== 'ios' && platform !== 'android') {
    throw new Error('[nuxt-native] Usage: nuxt-native dev <ios|android> [ns run flags...]')
  }

  generateEntry({ pagesDir: 'app/pages' })
  console.log(`[nuxt-native] Bootstrap regenerated. Handing off to NativeScript's LiveSync (ns run ${platform})...`)

  // `ns run` builds, deploys to the connected device/simulator, and
  // LiveSyncs subsequent file changes — that hot-reload-to-device loop is
  // NativeScript's, not reimplemented here.
  await run('npx', ['--yes', 'nativescript', 'run', platform, ...nsArgs])
}
