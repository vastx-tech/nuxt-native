import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A real, reproduced NativeScript-CLI-level bug, not a nuxt-native one:
 * `ns platform add ios` can scaffold `App_Resources/iOS/Info.plist` with
 * only `CFBundleDisplayName`/`CFBundleName` — missing every other key a
 * real, working iOS app needs. Confirmed by downloading and diffing the
 * actual template NativeScript's own scaffolding is supposed to produce
 * (`@nativescript/template-hello-world-ts@9.1.1`'s own
 * `App_Resources/iOS/Info.plist`) against a real broken one reproduced on
 * a fresh `nuxt-native create --platforms ios` project — every key below
 * is missing from the broken one and present in the real template.
 *
 * Two real, independently-confirmed symptoms trace back to this:
 * 1. `CFBundleExecutable` missing → `xcrun simctl install` fails with
 *    "missing or invalid CFBundleExecutable in its Info.plist" — the
 *    exact error, and the exact fix, also documented in NativeScript's own
 *    tracker (github.com/NativeScript/nativescript-cli#4048).
 * 2. `UILaunchStoryboardName` missing → the app installs and launches,
 *    but doesn't fill the screen (iOS falls back to legacy scaled
 *    compatibility mode without a valid launch-screen reference) —
 *    confirmed on a real physical device. The referenced `LaunchScreen`
 *    storyboard itself isn't missing (it's a separate file from Info.plist,
 *    and this framework's own `splash.mjs` already writes into its image
 *    assets successfully) — only the Info.plist key pointing at it was.
 *
 * Only inserts a key if it's entirely missing — never overwrites an
 * existing value (that's `app-version.mjs`'s job for the two version
 * keys specifically, which this deliberately doesn't duplicate). Values
 * are raw plist XML fragments (not just strings) so boolean/array/dict-
 * valued keys can be expressed the same way as string-valued ones.
 */
const REQUIRED_KEYS = {
  CFBundleDevelopmentRegion: '<string>en</string>',
  CFBundleExecutable: '<string>$(EXECUTABLE_NAME)</string>',
  CFBundleIdentifier: '<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>',
  CFBundleInfoDictionaryVersion: '<string>6.0</string>',
  CFBundlePackageType: '<string>APPL</string>',
  CFBundleShortVersionString: '<string>1.0</string>',
  CFBundleSignature: '<string>????</string>',
  CFBundleVersion: '<string>1</string>',
  LSRequiresIPhoneOS: '<true/>',
  UILaunchStoryboardName: '<string>LaunchScreen</string>',
  UIRequiresFullScreen: '<true/>',
  UIRequiredDeviceCapabilities: '<array>\n\t\t<string>armv7</string>\n\t</array>',
  UISupportedInterfaceOrientations: '<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>',
  'UISupportedInterfaceOrientations~ipad': '<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t\t<string>UIInterfaceOrientationPortraitUpsideDown</string>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>',
  UIApplicationSceneManifest: '<dict>\n\t\t<key>UIApplicationPreferredDefaultSceneSessionRole</key>\n\t\t<string>UIWindowSceneSessionRoleApplication</string>\n\t\t<key>UIApplicationSupportsMultipleScenes</key>\n\t\t<false/>\n\t</dict>'
}

export function ensureIosInfoPlistKeys(projectRoot) {
  const path = join(projectRoot, 'App_Resources', 'iOS', 'Info.plist')
  if (!existsSync(path)) return

  let content = readFileSync(path, 'utf8')
  let changed = false

  for (const [key, value] of Object.entries(REQUIRED_KEYS)) {
    if (new RegExp(`<key>${key}</key>`).test(content)) continue
    content = content.replace('<dict>', `<dict>\n\t<key>${key}</key>\n\t${value}`)
    changed = true
  }

  if (changed) writeFileSync(path, content)
}
