import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A real, reproduced NativeScript-CLI-level bug, not a nuxt-native one:
 * `ns platform add ios` can scaffold `App_Resources/iOS/Info.plist` with
 * only `CFBundleDisplayName`/`CFBundleName` — missing `CFBundleExecutable`
 * and every other key `${EXECUTABLE_NAME}`-style Xcode variable
 * substitution actually needs. The result builds and prepares without
 * error (Xcode has no reason to complain about a plist it's told to use
 * as-is), but `xcrun simctl install` then fails with "Bundle ... has
 * missing or invalid CFBundleExecutable in its Info.plist" — the exact
 * error, and the exact fix (these same keys), independently confirmed in
 * NativeScript's own tracker (github.com/NativeScript/nativescript-cli
 * #4048) and reproduced for real on a fresh `nuxt-native create --platforms
 * ios` project.
 *
 * Only inserts a key if it's entirely missing — never overwrites an
 * existing value (that's `app-version.mjs`'s job for the two version
 * keys specifically, which this deliberately doesn't duplicate).
 */
const REQUIRED_KEYS = {
  CFBundleExecutable: '$(EXECUTABLE_NAME)',
  CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
  CFBundlePackageType: 'APPL',
  CFBundleShortVersionString: '1.0',
  CFBundleVersion: '1'
}

export function ensureIosInfoPlistKeys(projectRoot) {
  const path = join(projectRoot, 'App_Resources', 'iOS', 'Info.plist')
  if (!existsSync(path)) return

  let content = readFileSync(path, 'utf8')
  let changed = false

  for (const [key, value] of Object.entries(REQUIRED_KEYS)) {
    if (new RegExp(`<key>${key}</key>`).test(content)) continue
    content = content.replace('<dict>', `<dict>\n\t<key>${key}</key>\n\t<string>${value}</string>`)
    changed = true
  }

  if (changed) writeFileSync(path, content)
}
