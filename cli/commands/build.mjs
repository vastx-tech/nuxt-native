import { generateEntry } from '../lib/generate-entry.mjs'
import { loadNativeConfig } from '../lib/load-config.mjs'
import { ensureProjectSetup } from '../lib/ensure-project-setup.mjs'
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

  // Same idempotent setup init() runs — see dev.mjs's comment and
  // ensure-project-setup.mjs.
  const config = await loadNativeConfig()
  await ensureProjectSetup(process.cwd(), config, [platform])

  const finalArgs = [...nsArgs]
  if (finalArgs.includes('--release') && !finalArgs.some(arg => arg.startsWith('--key-store'))) {
    const envArgs = keystoreArgsFromEnv()
    if (envArgs) {
      console.log('[nuxt-native] --release with no --key-store-* flags — using NUXT_NATIVE_KEYSTORE_* environment variables')
      finalArgs.push(...envArgs)
    }
  }

  console.log(`[nuxt-native] ns build ${platform} ${finalArgs.join(' ')}`.trimEnd())
  await run('npx', ['--yes', 'nativescript', 'build', platform, ...finalArgs])
}

/**
 * See keystore.mjs: `nuxt-native keystore create` never persists a
 * password to disk, only prints these variable names — reading them here
 * is what makes `nuxt-native build android --release` (no flags) work
 * once they're set, without ever writing a secret to a project file.
 */
function keystoreArgsFromEnv() {
  const {
    NUXT_NATIVE_KEYSTORE_PATH,
    NUXT_NATIVE_KEYSTORE_PASSWORD,
    NUXT_NATIVE_KEYSTORE_ALIAS,
    NUXT_NATIVE_KEYSTORE_ALIAS_PASSWORD
  } = process.env

  if (!NUXT_NATIVE_KEYSTORE_PATH) return null

  return [
    '--key-store-path', NUXT_NATIVE_KEYSTORE_PATH,
    '--key-store-password', NUXT_NATIVE_KEYSTORE_PASSWORD,
    '--key-store-alias', NUXT_NATIVE_KEYSTORE_ALIAS,
    '--key-store-alias-password', NUXT_NATIVE_KEYSTORE_ALIAS_PASSWORD
  ]
}
