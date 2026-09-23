# Nuxt Native

Build real native iOS and Android apps with Nuxt and Vue — no WebView, no DOM.
Vue components render as actual native views (`UIView` / `android.view.View`),
the same way React Native components render as real native views instead of
HTML. Nuxt Native brings Nuxt's developer experience — file-based pages,
auto-imported composables/components, a single module system — to that model,
built on [NativeScript](https://nativescript.org)'s native runtime rather
than reinventing one from scratch.

> **Status: early / pre-alpha, but confirmed running on a real device.** The
> `create` command has taken a project from an empty folder to a rendering
> Android app on physical hardware — the module, composables, UI kit, CLI
> (including release signing, a doctor command, and a bundle analyzer),
> and the native build pipeline it hands off to all work together end to
> end. Auto-imports don't yet reach the on-device bundle (native pages
> need explicit imports for now), and iOS is entirely unverified — every
> real-device confirmation so far is Android. See
> [ARCHITECTURE.md](./ARCHITECTURE.md) for exactly what's confirmed vs.
> still the frontier — that's where contributors are most needed.

## Why not Capacitor / a WebView?

Capacitor-style tools ship your Nuxt app as compiled web code running inside
a native WebView. That's a fine, fast path to "app-store distributable," but
it isn't native UI — you still get DOM rendering, web-style scrolling, and a
WebView's performance ceiling. Nuxt Native takes the harder path on purpose:
Vue's renderer targets real native views directly, so the result looks,
scrolls, and performs like a native app because it *is* one — the same
tradeoff React Native and Flutter made, applied to the Nuxt/Vue ecosystem.

## How it fits together

- **`app/pages/`** — you author pages the normal Nuxt way (file-based
  routing, dynamic segments like `[id].vue`).
- **`useNativeRouter()`** replaces vue-router at runtime — there's no DOM
  `history` to push state onto, so navigation pushes/pops NativeScript's
  native Frame backstack instead. Route names still come from your page
  files, so authoring still feels like Nuxt.
- **Composables** (`useDevice`, `useSafeArea`, `useGeolocation`,
  `useCamera`, ...) wrap native device APIs, auto-imported like any Nuxt
  composable.
- **Components** (`<NPage>`, `<NActionBar>`, `<NTabs>`) are thin,
  safe-area-aware wrappers around NativeScript-Vue's native primitives
  (`<Frame>`, `<ActionBar>`, `<TabStrip>`, ...).
- **A UI kit** (`<NButton>`, `<NText>`, `<NInput>`, `<NCard>`, `<NSwitch>`,
  `<NSpinner>`, `<NAvatar>`, `<NBadge>`, `<NDivider>`, `<NFlex>`,
  `useBottomSheet()`, `useModal()`) — themeable, sensibly-defaulted
  components on top of the primitives above, so building a real screen
  doesn't start from `<StackLayout>` and inline styles every time.
- **Tailwind, scoped to what NativeScript can actually render** — `create`
  wires up a real `tailwind.config.cjs`/`postcss.config.cjs`/`app.css`, so
  `class="flex-col items-center gap-4 bg-indigo-600 rounded-lg p-3"` on an
  `<NFlex>` or any UI kit component works the same way it would on web. See
  [UI kit](#ui-kit) below for what's in scope and why.
- **Familiar HTML tag names** — `<div>`, `<p>`, `<img>`, `<input>`,
  `<h1>`–`<h6>` compile straight to real native views, no import needed. See
  [HTML tag names](#html-tag-names) below for the full mapping and what it
  deliberately doesn't attempt.
- **Pinia, as a first-class citizen** — install `pinia` and `nuxt-native
  init`/`create` wires `createPinia()` into the app bootstrap automatically.
  See [State management (Pinia)](#state-management-pinia) below.
- **`useMcpClient()`** — apps can connect to [MCP](https://modelcontextprotocol.io)
  servers and call their tools. See [MCP client](#mcp-client-usemcpclient)
  below.
- **`useWebSocket()`** — real native WebSocket support (OkHttp on Android,
  `NSURLSessionWebSocketTask` on iOS), no npm plugin dependency. See
  [Real-time networking](#real-time-networking-usewebsocket) below.
- **The `nuxt-native` CLI** generates the on-device bootstrap from
  `app/pages` and hands off to NativeScript's own toolchain (`ns run`,
  `ns build`) for the actual native compile/deploy/LiveSync — that's
  battle-tested infrastructure we orchestrate rather than replace. It also
  ships `doctor` (checks a project against every misconfiguration this
  framework has actually hit), `keystore create` (generates an Android
  signing keystore, never touches your passwords), `analyze` (a bundle
  size report), `lint` (catches a `navigate()` call to a route that
  doesn't exist), and `clean`.

## Quickstart

> **Not on npm yet.** `nuxt-native` hasn't been published to the npm
> registry, so every command below installs straight from this repo
> instead — `npm install nuxt-native` on its own will 404 (or worse,
> install an unrelated package if that name is ever taken by someone
> else).

One command, empty directory to a project with dependencies installed and
native platforms wired up:

```bash
npx github:vastx-tech/nuxt-native create my-app --app-id com.example.myapp
cd my-app
npx nuxt-native dev android   # or: ios
```

`create` scaffolds `nuxt.config.ts`, a starter `app/pages/index.vue` +
`app/pages/details/[id].vue` demonstrating navigation, runs `npm install`,
writes `nativescript.config.ts`, and runs `ns platform add` for each
platform (`--platforms ios,android`, defaults to both) — including
replacing the splash screen NativeScript's own template generates with
Nuxt Native's own branding, so a fresh install doesn't launch showing
someone else's logo. Verified end-to-end from a clean directory via `npx`;
the only step it can't do for you is provide an actual Android SDK / Xcode
install — `ns platform add` will tell you clearly if either is missing.

Adding it to an **existing** Nuxt project instead:

```bash
npm install github:vastx-tech/nuxt-native nativescript-vue @nativescript/core
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-native'],
  native: {
    appId: 'com.example.myapp',
    appName: 'My App'
  }
})
```

```bash
npx nuxt-native init          # scaffolds nativescript.config.ts + native platforms
npx nuxt-native dev ios       # build, deploy, and LiveSync to a simulator/device
npx nuxt-native dev android
```

Write pages under `app/pages/` using NativeScript-Vue's native elements —
`<Frame>`, `<StackLayout>`, `<Label>`, `<Button>`, `<TabStrip>` — instead of
HTML. `<NPage>`, `<NActionBar>`, and `<NTabs>` wrap the common ones with
sensible defaults. See [`playground/`](./playground) for a working example.

## UI kit

```vue
<template>
  <NPage title="Sign in">
    <StackLayout style="padding: 20">
      <NText text="Welcome back" variant="h1" />
      <NInput v-model="email" label="Email" placeholder="you@example.com" />
      <NInput v-model="password" label="Password" secure :error="error" />
      <NButton text="Sign in" variant="primary" :loading="loading" @tap="signIn" />
      <NButton text="Forgot password?" variant="ghost" @tap="openHelp" />
    </StackLayout>
  </NPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBottomSheet } from 'nuxt-native/runtime/composables/useBottomSheet.js'
import HelpSheet from '../components/help-sheet.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { open } = useBottomSheet()

async function signIn() {
  loading.value = true
  // ...
  loading.value = false
}

function openHelp() {
  open(HelpSheet)
}
</script>
```

Every component ships with sensible defaults pulled from a shared
`theme.ts` (colors, spacing, radii, type scale) — pass a `variant`/`size`
prop to restyle, or override individual style props directly, same as any
NativeScript-Vue element. `useBottomSheet()`/`useModal()` show any
component of your own as a bottom sheet or modal via nativescript-vue's
real `$showModal` — your content component can dismiss itself by importing
`$closeModal` from `'nativescript-vue'` directly.

### Tailwind

NativeScript's CSS engine only understands a fixed set of properties —
spacing, color, typography, borders/radius, opacity, shadow, visibility,
z-index, and flex properties (but only on a real `<FlexboxLayout>`). It has
no concept of `display`, `position`, `overflow`, or CSS grid at all — those
are NativeScript layout *containers* (`StackLayout`/`FlexboxLayout`/
`GridLayout`/`AbsoluteLayout`), never CSS properties. So `create` generates
a `tailwind.config.cjs` with `corePlugins` as an **allowlist** of only the
utilities that map to something NativeScript can actually render — running
Tailwind's full, unfiltered utility set would just generate a lot of classes
that silently do nothing. It's pinned to Tailwind **v3** specifically,
since v4 dropped the JS-config `corePlugins` API this relies on.

```vue
<template>
  <NPage title="Sign in">
    <NFlex class="flex-col p-5 gap-4">
      <NText text="Welcome back" variant="h1" class="text-center" />
      <NFlex class="flex-row items-center justify-between gap-2 bg-slate-100 rounded-lg p-3">
        <NText text="Remember me" />
        <NSwitch v-model="remember" />
      </NFlex>
      <NButton text="Sign in" class="bg-indigo-600 rounded-lg p-3" @tap="signIn" />
    </NFlex>
  </NPage>
</template>
```

`<NFlex>` is a bare `<FlexboxLayout>` wrapper — flex utility classes
(`flex-row`/`flex-col`, `items-*`, `justify-*`, `gap-*`) only do anything on
one of these, the same way flex utilities only do anything on a real flex
container on web. **Not supported**: `grid-*` (NativeScript's grid is
configured via `columns`/`rows` template strings, not CSS), `absolute`/
`inset-*`/`top-*` (no CSS `position` concept), and Tailwind's `rotate-*`/
`scale-*`/`translate-*`/transform utilities (they compose via CSS custom
properties NativeScript's transform parser doesn't resolve — use the native
`rotate`/`scaleX`/`translateX` style props directly instead). Verified end
to end at the pipeline level (real Tailwind + PostCSS output fed through
the same CSS parser `@nativescript/webpack` uses) — see
[ARCHITECTURE.md](./ARCHITECTURE.md) for the full trail, including why this
ships Android-first with iOS's `<FlexboxLayout>` performance deliberately
left to a real on-device benchmark before it's the default there too.

## HTML tag names

Common HTML tags compile straight to real native views — no Vue component
wrapper needed, no import:

```vue
<template>
  <NPage title="Article">
    <div class="p-5 gap-2">
      <h1>Nuxt Native</h1>
      <p>A real paragraph of wrapping text, styled with Tailwind.</p>
      <p><strong>Bold</strong> and <em>italic</em> both work inline-ish.</p>
      <img src="https://example.com/cover.png" />
      <input v-model="query" placeholder="Search" />
      <a @tap="openDocs">Read the docs</a>
      <button @tap="openDocs">Native button</button>
    </div>
  </NPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const query = ref('')
function openDocs() { /* ... */ }
</script>
```

`div`→`StackLayout`, `p`/`h1`–`h6`→`Label` (bold + sized for headings),
`img`→`Image`, `input`→`TextField` (`v-model` works — see below),
`a`/`strong`/`b`/`em`/`i`→styled `Label`s, `ul`/`ol`/`li`/`header`/`footer`/
`nav`/`main`/`section`/`article`/`aside`/`form`→`StackLayout` (semantic
sugar only, no visual distinction). `button`/`label`/`span` already resolve
to NativeScript's real `Button`/`Label`/`Span` with zero extra work — tag
matching is case/hyphen-insensitive.

This is tag-name sugar over real native primitives, **not an HTML/CSS
engine** — there's no block/inline text flow, no floats/position, no form
submission, no table layout, and `<br>`/`<table>`/`<select>` aren't mapped
to anything (there's no sane native equivalent). If you need to render
actual arbitrary HTML/CSS (a CMS article, a third-party checkout page),
that's what NativeScript's own `<WebView>` is for — mixed in only where you
actually need it, not as the whole app's rendering model. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for why "compile arbitrary HTML/CSS to
native with no WebView" isn't attempted here — it's the scope of a browser
engine, not a framework feature.

`v-model` on `<input>` needed one extra fix worth knowing about: Vue's
compiler treats real HTML form tags specially and compiles `v-model` there
to import a `vModelText` helper from `'vue'` — which plain
`nativescript-vue` doesn't have (it re-exports `@vue/runtime-core`, no
DOM). `nuxt-native` ships its own `vModelText` for NativeScript's
`TextField`, aliased in automatically. Nothing to configure.

## State management (Pinia)

```bash
npm install pinia @vue/devtools-api
npx nuxt-native init android   # re-wires the bootstrap now that pinia is present
```

```ts
// app/stores/counter.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() { count.value++ }
  return { count, increment }
})
```

```vue
<template>
  <NPage title="Home">
    <NFlex class="flex-col p-5 gap-4">
      <NText :text="`Count: ${counter.count}`" />
      <NButton text="Increment" @tap="counter.increment" />
    </NFlex>
  </NPage>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter'
const counter = useCounterStore()
</script>
```

`nuxt-native init`/`create` detects a `pinia` dependency and wires
`createApp(RootFrame).use(createPinia())` into the generated bootstrap
automatically — nothing else to configure. Stores are plain Pinia, explicitly
imported the same way composables are today (see the auto-imports note
above) — no special nuxt-native API. This works because Pinia's core is
pure Vue reactivity with no DOM dependency at all (checked directly against
its actual dist output, not assumed), and every DOM/devtools-only code path
it has is gated behind a `typeof window !== 'undefined'` check that's
simply always false in NativeScript's runtime. Verified with a real
`webpack()` compile: a store used from a page compiles cleanly and its
code is confirmed present in the emitted bundle — see ARCHITECTURE.md for
the full verification trail.

Not every Nuxt module works this way — most inject their functionality
through Nuxt's own Vite/Nitro build hooks, which the native build never
runs at all (it's a separate NativeScript webpack pipeline end to end), or
assume a DOM/SSR context that doesn't exist here. Pinia works because its
actual logic has neither dependency; before adding another module, check
whether the same is true for it.

## MCP client (`useMcpClient()`)

Apps built with nuxt-native can connect to [MCP](https://modelcontextprotocol.io)
servers and call their tools — e.g. building an AI-assistant mobile app.

```vue
<script setup lang="ts">
import { useMcpClient } from 'nuxt-native/runtime/composables/useMcpClient.js'

const mcp = useMcpClient()
await mcp.connect('https://your-mcp-server.example.com/mcp')
const tools = await mcp.listTools()
const result = await mcp.callTool('search', { query: 'nuxt native' })
</script>
```

This implements MCP's "Streamable HTTP" transport in its non-streaming
mode — the only mode a NativeScript app can actually speak. Confirmed
directly against a real device (not assumed): NativeScript's runtime has
`fetch`/`XMLHttpRequest` but no `WebSocket` and no `EventSource`, which
rules out MCP's stdio/WebSocket transports and the streaming half of
Streamable HTTP (server-initiated messages need `EventSource`-style SSE
parsing). What's left — POST a JSON-RPC message, read an `application/json`
response directly — is fully spec-compliant, confirmed against the real
MCP TypeScript SDK's own client transport as exactly the code path it
falls back to itself against a non-streaming server, not a simplification
invented here. A server that insists on streaming responses gets a clear
error, not a silent hang.

Verified against a real MCP server (`mcp-server/test-http-server.mjs`,
also useful for testing your own MCP-powered pages locally): the full
`initialize` → `notifications/initialized` → `tools/list` → `tools/call`
sequence, session ID correctly captured and echoed, run with plain
`fetch` — the same API surface the device has. Compiles cleanly through
the real native webpack build alongside a real, full-sized app. Not yet
confirmed inside an actual compiled app running on a physical device
against a network-reachable server (needs real network topology this
session didn't have set up) — everything short of that on-device run is
verified.

## Real-time networking (`useWebSocket()`)

```vue
<script setup lang="ts">
import { useWebSocket } from 'nuxt-native/runtime/composables/useWebSocket'

const ws = useWebSocket('wss://your-server.example.com/socket', {
  onOpen: () => console.log('connected'),
  onMessage: (data) => console.log('got:', data),
  onClose: (code, reason) => console.log('closed', code, reason)
})
ws.send('hello')
</script>
```

Import this one **without** a `.js` suffix, unlike every other composable —
see the composable's own doc comment for exactly why (it's a real,
confirmed resolution-order interaction between this package's `exports`
field and webpack's platform-extension list, not an arbitrary choice).

NativeScript has no global `WebSocket` (confirmed on a real device: `typeof
WebSocket` is `"undefined"`), and no maintained NativeScript WebSocket
plugin exists on npm (checked directly). This talks to each platform's
real native WebSocket capability directly instead: Android via OkHttp
(added as a real Gradle dependency automatically by `nuxt-native init`,
since `@nativescript/core`'s own HTTP module uses its own native widget,
not OkHttp — confirmed by reading its Android implementation), iOS via
`NSURLSessionWebSocketTask` (a first-party OS API since iOS 13, no extra
dependency needed). The Java/Objective-C interop patterns used
(`SomeClass.extend({...})` to subclass a native class from JS) are
confirmed as NativeScript's real, standard convention by reading three
independent usages in `@nativescript/core`'s own source before writing
this, not invented.

**Verification status, honestly**: the Android implementation is fully
verified on real hardware — real webpack build, real `gradlew.bat
assembleDebug`, real `adb install` onto a physically connected device, a
real Node.js WebSocket server bridged over USB via `adb reverse`. On
launch the app logged a real `open` event and the server's own greeting
message, received live; tapping a real on-screen button sent a real
message that the server logged and echoed back, and the device logged the
echo. Two real bugs were only caught this way, not by compiling: OkHttp
5.x's split `okhttp-android` artifact needs `compileSdk` 37+ (this
project defaults to 35), fixed by pinning to OkHttp 4.12.0; and Android
blocks cleartext (`ws://`) traffic by default for apps targeting API 28+,
fixed with a debug-only network security config permitting cleartext to
`127.0.0.1`/`10.0.2.2`/`localhost` (`nuxt-native init` wires this up
automatically, same as the OkHttp dependency — see `ARCHITECTURE.md` for
the full detail). Production apps should use `wss://` regardless; the
cleartext exception only applies to debug builds. The iOS implementation
is unverified in the same way every other iOS code path in this framework
is (no Xcode/macOS access at all) — a real, best-effort implementation
against Apple's documented API, not a stub, but not compiled or run.

## Gradle memory tuning

`nuxt-native init` also patches `platforms/android/gradle.properties` once,
right after `ns platform add` scaffolds it: the stock `@nativescript/android`
template ships `org.gradle.jvmargs=-Xmx16384M` — a flat 16 GB Gradle daemon
heap ceiling, regardless of the machine actually running the build. On a
real machine with 5.74 GB of *total* RAM, that's a heap ceiling triple the
entire machine's physical memory, and a very plausible cause of otherwise
mysterious build flakiness (Windows can fail to spawn new processes under
severe memory pressure).

The replacement is computed from the machine's actual total RAM (35% of
it, clamped to 768 MB–3 GB — there's no real benefit to a NativeScript
app's build ever exceeding ~3 GB of daemon heap), plus `kotlin.daemon.jvmargs`
and `org.gradle.workers.max=2` to cap the other JVMs Gradle spins up. It's
written once (marked with a comment so reruns don't clobber a value you've
since customized yourself) and never touches the file again after that.
Verified with a real, full clean rebuild after applying it — succeeded
identically with a fraction of the memory.

The generated `webpack.config.cjs` gets the same treatment for
`ForkTsCheckerWebpackPlugin` (a separate Node process `@nativescript/webpack`
spawns just for type-checking, defaulting to a flat 4 GB memory limit): on a
machine with less than 8 GB of RAM it's removed entirely (the main build
already runs `ts-loader` with `transpileOnly: true`, so nothing about the
actual compile depends on it — you still get type errors from your editor
or a `vue-tsc`/`tsc` run), and above that threshold its memory limit is
scaled to the machine instead of left at the flat default.

## Auto-imports

Composables — both nuxt-native's own (`useDevice`, `useWebSocket`, ...) and
anything you add yourself under `app/composables/` — are usable in any page
or component with no `import` statement, the same DX Nuxt itself gives you
for its own build:

```vue
<script setup lang="ts">
const device = useDevice()
const { connected } = useWebSocket('wss://your-server.example.com/socket')
</script>
```

This isn't Nuxt's own `unimport`/auto-import machinery running under the
hood (that package is ESM-only, and the native build's `webpack.config.cjs`
is loaded with a plain synchronous `require()` that can't consume it) — it's
a small first-party webpack loader that does the same thing: a fast scan for
composable names actually used in a file, skipping anything already
imported or declared locally, then injecting the right import. Regenerated
automatically on every `init`/`dev`/`build`, so a composable you add to
`app/composables/` is picked up on the very next run.

One real limitation: only composables are covered, not your own custom
`.vue` components — those still need a normal explicit import (auto-
importing components is a different mechanism in real Nuxt, not this one).

## Plugins

A "nuxt-native plugin" is just an ordinary npm package that exports one or
more `useXxx()` composables — install it like anything else. If it needs
native setup (a Gradle dependency, an Android permission, an iOS
`Info.plist` entry, ...), list it in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  native: {
    plugins: ['some-nuxt-native-plugin']
  }
})
```

`nuxt-native init`/`dev`/`build` will then look for a `"./nuxt-native"`
subpath export on that package (it needs to declare this in its own
`package.json`'s `exports` map) and, if present, call its
`ensure(projectRoot, platforms)` function — the same idempotent pattern
this framework uses for its own native setup (OkHttp for `useWebSocket()`,
the cleartext network exception, etc.), so it's safe to run on every
build, not just the first one. A plugin with no such export is left alone
— most plugins (anything that's pure JS/TS interop, or that wraps an
already-installed NativeScript plugin needing no extra native config)
don't need one.

## CLI reference

```bash
nuxt-native create <name> [--app-id com.example.app] [--platforms ios,android]
nuxt-native init [ios] [android]     # add to an existing project
nuxt-native dev <ios|android> [ns run flags...]
nuxt-native build <ios|android> [ns build flags...]
nuxt-native doctor                   # check the project, then run `ns info`
nuxt-native keystore create --alias <name> [--output ./release.keystore]
nuxt-native analyze <ios|android>    # bundle size report → report/report.html
nuxt-native lint                     # catch a navigate() call to a route that doesn't exist
nuxt-native clean                    # remove platforms/, hooks/, and cached build artifacts
nuxt-native version [show]           # show the current version + versionCode
nuxt-native version bump <major|minor|patch>
nuxt-native version sync             # write the current version to native platform files
```

`dev`/`build` forward any flags after `<ios|android>` straight to the real
`ns run`/`ns build` — nothing NativeScript supports is off-limits. For a
signed Android release, generate a keystore once and set the environment
variables it prints (never written to disk):

```bash
npx nuxt-native keystore create --alias my-app
# then, once NUXT_NATIVE_KEYSTORE_* is set in your shell/CI secrets:
npx nuxt-native build android --release
```

## App release versioning

`package.json`'s own `version` field (standard semver) is the single
source of truth, plus a `nativeVersionCode` field for Android's separate
integer build number (Play Store requires it to only ever increase, which
a semver string alone can't express — e.g. two releases can share a
patch-bumped version but still need distinct versionCodes).

```bash
npx nuxt-native version              # show the current version + versionCode
npx nuxt-native version bump patch   # 1.0.0 (1) -> 1.0.1 (2), synced automatically
npx nuxt-native version sync         # re-sync current values without bumping
```

`bump`/`sync` write `android.defaultConfig.versionCode`/`versionName` into
`App_Resources/Android/app.gradle` (a real Gradle `apply from:` include
NativeScript's own build already supports — confirmed, not guessed) rather
than editing the manifest directly, since `platforms/android/app/src/main/
AndroidManifest.xml` gets regenerated from `@nativescript/android`'s own
template on every `ns platform add` and wouldn't survive. AGP's
`defaultConfig` always wins over the manifest's own `android:versionCode`/
`versionName` attributes, so this is the standard, sanctioned override
mechanism, not a workaround. Only touches `App_Resources/iOS/Info.plist`
if that platform was actually added. Idempotent via a marked block, so a
project's own `app.gradle` customizations outside it are never touched.
Verified end to end: a real `bump patch` → real `gradlew.bat assembleDebug`
→ `aapt dump badging` on the resulting APK confirmed `versionCode='2'
versionName='1.0.1'` actually landed in the compiled app, not just the
source files.

## VS Code extension

`vscode-extension/` (not yet published to the Marketplace — see its own
README) puts every command above in the Command Palette, plus a device
picker and hot-restart/force-restart/stop controls on the status bar. It
runs everything inside a real integrated terminal rather than a background
process, specifically because `ns run`'s interactive controls only work
over a real TTY (confirmed by reading NativeScript's own source, not
assumed) — click into that terminal at any point and the same keys work
by hand too.

## MCP server (agent-driven dev workflow)

`mcp-server/` (see its own README) exposes `nuxt-native`'s dev workflow —
`doctor`, `build`, `lint`, `clean`, `analyze`, device listing, install +
launch, log reading — as [MCP](https://modelcontextprotocol.io) tools, so
any MCP-speaking AI agent (Claude Code, Claude Desktop, anything else that
speaks MCP) can drive a project directly instead of shelling out blind.
Every tool calls the same `cli/commands/*.mjs` functions the real CLI
uses — there's no separate implementation to drift out of sync. Verified
end to end with a real MCP client driving the real server over the real
stdio transport, including a real install + launch + logcat read against
a physical Android device.

## Repository layout

```
src/                the Nuxt module (composables, components, route generation)
cli/, bin/          the nuxt-native CLI (native bootstrap + ns run/build orchestration)
playground/         example Nuxt app consuming the module
vscode-extension/   the VS Code extension (separate package.json/build)
mcp-server/         MCP server exposing the dev workflow to AI agents (separate package.json)
```

## Contributing

This is a young project tackling a genuinely hard problem — read
[ARCHITECTURE.md](./ARCHITECTURE.md) first to see the current state and
where help is most valuable, then open an issue or PR.

## License

[MIT](./LICENSE)
