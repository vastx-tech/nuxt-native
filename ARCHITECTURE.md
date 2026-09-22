# Architecture

Nuxt Native's goal is React Native/Flutter for the Nuxt ecosystem: Vue
components rendered as real native views, not a WebView. This document is
the honest map of what that requires, what's implemented, and what isn't —
so contributors know exactly where the frontier is.

## Why NativeScript, not a from-scratch renderer

A "true native renderer" needs two things a WebView-based tool (Capacitor,
Ionic) doesn't: a JS runtime with native marshalling (so JS can call
`UIView`/`android.view.View` APIs directly, no bridge-over-HTTP, no WebView
process), and a Vue renderer that creates native view instances instead of
DOM nodes. Building both from scratch is most of what NativeScript itself
is — a mature, years-old project. Reinventing it would be a multi-year
detour before a single native view ever appeared on screen. Nuxt Native
builds *on* NativeScript's runtime and on `nativescript-vue`'s renderer,
and focuses its own effort on the part that's actually missing: Nuxt's
developer experience layered on top of that renderer.

## Why not Nuxt's own build pipeline (Vite/Nitro)

Nuxt's builder assumes a browser target: it generates a client entry that
mounts Vue to a DOM node, and Nitro exists to produce a server response to
hydrate. Neither applies here — there's no DOM node, and `ssr: false` on
native builds means there's no server response either. Rather than fight
Nuxt's builder internals to make it emit something it wasn't designed to
emit, Nuxt Native uses Nuxt only for what it's actually good at in this
context — file-based page discovery, the module/auto-import system, config
— and hands the actual on-device bundle to NativeScript's own webpack-based
toolchain, which already knows how to produce a native bundle correctly.

```
app/pages/*.vue  ──(pages:extend hook)──►  route manifest  ──►  useNativeRouter()
                 ──(nuxt-native CLI scan)──►  .nuxt-native/app.js  ──►  ns run/build
```

Two independent consumers read the same page tree: the Nuxt module (via
`pages:extend`, for editor/type-checking DX and the manifest `vue-tsc` sees)
and the CLI (via a standalone filesystem scan, since `init`/`dev`/`build`
run outside Nuxt's dev server). See `src/build/generate-routes.ts` and
`cli/lib/scan-pages.mjs` — they implement the same file-based routing
conventions independently on purpose, rather than sharing a runtime
dependency between a Nuxt-hooked build step and a standalone CLI process.

## Status

| Layer | State | Notes |
|---|---|---|
| Nuxt module (`src/module.ts`) | Implemented, verified | Registers composables/components auto-import dirs, disables SSR, generates the route manifest template via a real `@nuxt/kit` `pages:extend` hook. Confirmed against a real `nuxi dev` run on Nuxt 4 + `vue-tsc` — the manifest is actually written to `.nuxt/nuxt-native/route-manifest.mjs` with correct route names. (An earlier draft called `addTemplate` *inside* the `pages:extend` callback, which silently produced nothing — Nuxt snapshots its template list before that hook fires. Fixed by registering the template once at `setup()` and only capturing the page tree in the hook.) |
| Route generation (`src/build/generate-routes.ts`, `cli/lib/scan-pages.mjs`) | Implemented, verified | Supports Nuxt's common file-based routing subset: `index.vue`, nested folders, `[param].vue`, `[...catchAll].vue`. Both generators independently produce the identical route name/params for the same page (checked against Nuxt 4's actual `:id()`-style dynamic-segment syntax). Route groups / more exotic Nuxt routing features aren't ported yet. |
| `useNativeRouter()` | Implemented, typechecked, untested on-device | Wraps nativescript-vue's real exports `$navigateTo`/`$navigateBack` (an earlier draft used `navigateTo`/`navigateBack`, which don't exist on that package — caught by `vue-tsc` against the actual installed types). Keeps its own route-name stack since NativeScript's `Page` has no built-in concept of a Nuxt route name. |
| Composables (`useDevice`, `useSafeArea`) | Implemented, typechecked, untested on-device | Thin wrappers over `@nativescript/core` APIs (`Device`, `Screen`, `Frame.currentPage.getSafeAreaInsets()`); every field name checked against the installed package's `.d.ts` files. |
| Composables (`useGeolocation`, `useCamera`) | Implemented, typechecked, untested on-device | Wrap the optional `@nativescript/geolocation` / `@nativescript/camera` plugins via dynamic `import()`. Checking their real `.d.ts` files caught two silent-failure bugs in an earlier draft: `enableLocationRequest()` resolves `void` and *rejects* on denial rather than resolving `false` (so the old truthy-check on its result never actually detected denial), and `requestPermissions()` from the camera plugin always resolves — its result's `.Success` field carries the outcome, it never rejects. Both are now handled by branching on the right signal instead of a resolved-truthiness guess. |
| Components (`<NPage>`, `<NActionBar>`, `<NTabs>`) | Implemented, untested on-device | Thin wrappers around NativeScript-Vue's native elements (`<Page>`, `<ActionBar>`, `<BottomNavigation>`). |
| CLI `create` | Implemented, verified | Scaffolds a new project (package.json, nuxt.config.ts, starter pages), runs `npm install`, then calls `init`. Verified twice end-to-end: once invoking the local bin directly, once as a cold `npx github:vastx-tech/nuxt-native create ...` from an empty directory with a cleared npx cache — both correctly resolved `nuxt-native` from its GitHub dependency spec, generated a correct route manifest, and reached the real `ns platform add`, which then correctly reported this machine's missing Android SDK (that part is unavoidable — no SDK, no local build, by design). |
| CLI `init` | Implemented, delegates the hard part | Writes `nativescript.config.ts` if missing, then shells to `ns platform add <platform>` — NativeScript's own template scaffolds `App_Resources` (AndroidManifest.xml, Info.plist, icons), which is *not* hand-generated here on purpose; that's fragile, version-sensitive boilerplate NativeScript already maintains correctly. |
| CLI `dev` / `build` | Implemented, delegates the hard part | Regenerates `.nuxt-native/` then shells to `ns run <platform>` / `ns build <platform>`. NativeScript's own webpack + LiveSync handle the actual native compile/deploy/hot-reload — not reimplemented here. |
| The actual compiler/bundler (`webpack.config.cjs`, `.vue` → native bundle) | Implemented, partially verified | This was missing entirely until reported — `init`/`create` generated `nativescript.config.ts` and the route manifest, but no `webpack.config.js`, no `@nativescript/webpack` devDependency, and nothing wiring `vue-loader` to nativescript-vue's renderer, so `.vue` pages had no loader at all. Fixed by generating `webpack.config.cjs` that calls the official `nativescript-vue/nativescript.webpack.js` helper (it registers vue-loader against `@nativescript/webpack`'s base "vue" rule and aliases the bare `vue` specifier to `nativescript-vue`, which is what lets `import { ref } from 'vue'` resolve correctly on-device). It's `.cjs`, not `.js`, because `@nativescript/webpack` loads it with a plain `require(configPath)` (confirmed by reading its bin source) and nuxt-native projects have `"type": "module"` in package.json — under that, `require()` of a `.js` file throws `ERR_REQUIRE_ESM`; reproduced directly, then confirmed clean after renaming to `.cjs` and pointing `nativescript.config.ts`'s `bundlerConfigPath` at it. What's still unverified: invoking the resolved config with a hand-built `env` object gets one step further (`webpack.init(env)` then fails on a value only the real `ns` CLI supplies — the native platform directory, which only exists after `ns platform add` succeeds, which needs a real Android SDK/Xcode this environment doesn't have). |
| `bundlerConfigPath` reliably reaching `ns` | Worked around, root cause unconfirmed | A real user hit `ns run android` reporting the hardcoded default `webpack.config.js` "does not exist" — despite `nativescript.config.ts` correctly containing `bundlerConfigPath: "webpack.config.cjs"` and that exact file being present. Directly replicating the CLI's own TS-parsing logic (`ts.transpileModule` + eval, same as `project-config-service.js`) against their file's content extracted `bundlerConfigPath` correctly, ruling out a parsing bug in our generated config. Leading theory: `init`/`dev`/`build` invoke `ns` via `npx --yes nativescript ...`, which resolves from npx's own cache rather than the project's `node_modules` — a stale cached CLI build predating `bundlerConfigPath` support would silently ignore it and fall back to the default, matching the error's exact wording (the fallback branch, not the one used when a custom path is recognized). Fixed pragmatically either way: `nativescript.config.ts` now also sets the older `webpackConfigPath` field to the same path — `bundlerConfigPath` falls back to it internally, so an outdated CLI that only understands the older field still resolves correctly. Not fully root-caused: haven't confirmed which npx-cached version the reporting user actually had. |
| Auto-imports reaching the on-device bundle | **Not yet wired** | `addImportsDir`/`addComponentsDir` in the Nuxt module cover editor DX and `vue-tsc`, but the CLI's handoff to `ns run`/`ns build` does not yet inject the equivalent `unplugin-auto-import`/`unplugin-vue-components` webpack plugins into NativeScript's build. Until this lands, native pages need explicit `import { useDevice } from 'nuxt-native'`-style imports rather than relying on auto-import. |
| End-to-end device/emulator testing | **Not done** | Nothing in this repo has been run against a real iOS/Android build yet — there's no mobile toolchain in the environment this was authored in. Treat the `ns`/NativeScript integration points as a well-reasoned first draft, not a verified one. |

## Roadmap

1. Get a real Android SDK or Xcode install in front of this so `ns platform
   add` can finish (it's the one thing that genuinely can't be automated
   here) — then `ns build android` is the real end-to-end test of
   `webpack.config.cjs` and everything upstream of it. High odds it surfaces
   another gap the same way the missing webpack config and its `.cjs`
   requirement did; treat that as expected, not a sign anything above is
   unreliable.
2. Wire `unplugin-auto-import`/`unplugin-vue-components` into the
   NativeScript webpack build the CLI hands off to, so auto-imports work
   identically in editor DX and on-device.
3. Expand the native-aware UI kit (lists, action sheets, modals, tab
   navigators) past the current `<NPage>`/`<NActionBar>`/`<NTabs>` set.
4. Port more of Nuxt's file-based routing conventions (route groups,
   layouts-equivalent) into `generate-routes.ts`/`scan-pages.mjs`.
5. CI: a real device-farm or simulator smoke test, once (1) is verified.
6. Publish to npm once (1)-(3) are further along. Until then, install from
   `github:vastx-tech/nuxt-native` (see README) — that install path only
   works at all because `package.json` has a `prepare` script that runs
   `nuxt-module-build build`; `npm install`'s git-dependency flow runs
   `prepare`, not `prepack` (verified by installing the pushed repo into a
   scratch project and checking what actually landed in `node_modules`).
