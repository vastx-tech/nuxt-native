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
  `<NSpinner>`, `<NAvatar>`, `<NBadge>`, `<NDivider>`, `useBottomSheet()`,
  `useModal()`) — themeable, sensibly-defaulted components on top of the
  primitives above, so building a real screen doesn't start from
  `<StackLayout>` and inline styles every time.
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

## Repository layout

```
src/            the Nuxt module (composables, components, route generation)
cli/, bin/      the nuxt-native CLI (native bootstrap + ns run/build orchestration)
playground/     example Nuxt app consuming the module
```

## Contributing

This is a young project tackling a genuinely hard problem — read
[ARCHITECTURE.md](./ARCHITECTURE.md) first to see the current state and
where help is most valuable, then open an issue or PR.

## License

[MIT](./LICENSE)
