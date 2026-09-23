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

## VS Code extension

`vscode-extension/` (not yet published to the Marketplace — see its own
README) puts every command above in the Command Palette, plus a device
picker and hot-restart/force-restart/stop controls on the status bar. It
runs everything inside a real integrated terminal rather than a background
process, specifically because `ns run`'s interactive controls only work
over a real TTY (confirmed by reading NativeScript's own source, not
assumed) — click into that terminal at any point and the same keys work
by hand too.

## Repository layout

```
src/                the Nuxt module (composables, components, route generation)
cli/, bin/          the nuxt-native CLI (native bootstrap + ns run/build orchestration)
playground/         example Nuxt app consuming the module
vscode-extension/   the VS Code extension (separate package.json/build)
```

## Contributing

This is a young project tackling a genuinely hard problem — read
[ARCHITECTURE.md](./ARCHITECTURE.md) first to see the current state and
where help is most valuable, then open an issue or PR.

## License

[MIT](./LICENSE)
