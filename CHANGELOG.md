# Changelog

Releases are git tags on GitHub. Pin one in your app's package.json with
`"nuxt-native": "github:vastx-tech/nuxt-native#vX.Y.Z"`. Without a tag, you get
whatever is on `main` when you install.

## Unreleased

### Added

- `v-tap="handler"`: a tap handler for any view that counts every tap on Android,
  with a ripple (`v-tap.noripple` for none). `@tap` on a layout or label drops a
  quick second tap there. Registered globally and type-checked.

### Fixed

- Builds no longer leave whitespace-only changes in `App_Resources` on Windows.
  `app.gradle` and the generated theme files keep their line endings, and aren't
  rewritten when nothing changed.

## 2.1.0 - 2026-10-15

Version 2.1.0 is the first tagged release, based on feedback from a developer
building a production app with nuxt-native.

### Fixed

- Auto-imported helpers no longer override a component's own props of the same
  name (`size`, `placeholder`, `padding`, ...). This only broke release builds.
- `<NTabs>` works again. It previously used components that NativeScript 9 no
  longer includes.
- `<NButton>` counts every tap on Android. A quick second tap used to be dropped.
- `<NPage>` no longer shows an empty toolbar on pages without a title.
- `resolveIconSvg()` no longer throws when no size is given.
- On Windows, builds no longer fail with `'gradlew.bat' is not recognized` when
  the `NoDefaultCurrentDirectoryInExePath` environment variable is set.

### Added

- `<NTabs>` keeps every tab alive, so switching tabs doesn't rebuild them, and the
  Android back button returns to the first tab.
- `useStorage(key, default)`: a ref saved on the device, restored when the app
  starts.
- Pinia stores can be saved on the device with `persist: true` or
  `persist: { pick, key }`.
- Every export in `app/composables/`, `app/utils/` and `app/stores/` is
  auto-imported, whatever the file is called. Pinia stores included.
- Names used only in templates are auto-imported and type-check. `vue-tsc` now
  also checks props of the built-in `N*` components.
- `native.theme` in nuxt.config sets the Android window background, status bar
  and accent colours, which removes the white flash between pages in dark apps.
- `native.android.minSdk` (default 23) and `native.android.stopGradleDaemon`.
- New projects get a `typecheck` script with `vue-tsc`.
- STYLING.md: Android layout pitfalls and how to debug release builds.

### Changed

- Android projects now require Android 6.0 (API 23) by default, up from 5.0.
  Current Google Play services and Firebase need it. Set
  `native.android.minSdk: 21` to keep the old minimum.
- Gradle's memory limit is now at most 2 GB, and on machines with less than 12 GB
  of RAM the Gradle daemon is stopped after each build.
