import { generateEntry } from '../lib/generate-entry.mjs'
import { run } from '../lib/run.mjs'

/**
 * `nsArgs` is forwarded verbatim to `ns build` — e.g. `--release
 * --key-store-path ./my.keystore --key-store-password *** --key-store-alias
 * *** --key-store-alias-password ***` for a signed Android release build,
 * or `--aab`, `--compileSdk <level>`, `--copy-to <path>`, etc. Deliberately
 * not reimplemented/whitelisted here: `ns build` already knows every flag
 * it supports, and that set changes over NativeScript releases — a
 * pass-through avoids this CLI silently dropping flags NativeScript adds
 * or already has.
 */
export async function build(platform, nsArgs = []) {
  if (platform !== 'ios' && platform !== 'android') {
    throw new Error('[nuxt-native] Usage: nuxt-native build <ios|android> [ns build flags...]')
  }

  generateEntry({ pagesDir: 'app/pages' })

  console.log(`[nuxt-native] ns build ${platform} ${nsArgs.join(' ')}`.trimEnd())
  await run('npx', ['--yes', 'nativescript', 'build', platform, ...nsArgs])
}
