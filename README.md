# Nuxt Native

Build real native iOS and Android apps with Nuxt and Vue — no WebView, no DOM.
Vue components render as actual native views (`UIView` / `android.view.View`),
the same way React Native components render as real native views instead of
HTML. Nuxt Native brings Nuxt's developer experience — file-based pages,
auto-imported composables/components, a single module system — to that model,
built on [NativeScript](https://nativescript.org)'s native runtime rather
than reinventing one from scratch.

> **Status: early / pre-alpha.** The Nuxt-side developer experience (module,
> composables, components, route generation, CLI) is implemented and
> documented below. The native build pipeline it hands off to has not been
> run against a real device or emulator yet. See
> [ARCHITECTURE.md](./ARCHITECTURE.md) for exactly what's solid vs. what's
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
- **The `nuxt-native` CLI** generates the on-device bootstrap from
  `app/pages` and hands off to NativeScript's own toolchain (`ns run`,
  `ns build`) for the actual native compile/deploy/LiveSync — that's
  battle-tested infrastructure we orchestrate rather than replace.

## Quickstart

> **Not on npm yet.** `nuxt-native` hasn't been published to the npm
> registry, so install it straight from this repo instead of `npm install
> nuxt-native` — that command will 404 (or worse, install an unrelated
> package if that name is ever taken by someone else).

```bash
npx nuxi init my-app
cd my-app
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
