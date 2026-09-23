# Nuxt Native reference app

A small, real (not toy-sized-to-the-point-of-uselessness) shop app —
product list, product detail, a cart backed by Pinia — built to demonstrate
the recommended project architecture for a Nuxt Native app. Every pattern
here is something the framework actually, verifiably supports; nothing is
aspirational.

Lives inside the framework's own repo, and depends on `nuxt-native` via
`"file:../.."` rather than `github:vastx-tech/nuxt-native` — so it always
builds against the exact local code in this checkout, not a published
snapshot. A real project outside this repo should depend on it the way
`nuxt-native create` generates (`github:vastx-tech/nuxt-native` today, a
normal npm version once published) instead.

## Folder structure

```
app/
  pages/          file-based routing (see "Routing" below)
  components/     reusable Vue components — NOT auto-imported, import explicitly
  composables/    useXxx() functions — auto-imported, no import statement needed
  utils/          plain helper functions — auto-imported, same as composables/
  stores/         Pinia stores — NOT auto-imported, import explicitly (see why below)
  app.vue         unused at native runtime; exists only so `nuxi dev`/typecheck have a root component
  app.css         Tailwind directives
```

This mirrors Nuxt's own directory conventions on purpose — the goal is that
if you already know how a Nuxt project is organized, you already know how
to organize a Nuxt Native one. The differences from a web Nuxt project are
exactly the places where "there's no DOM/server, this is a real native
app" changes what's possible, and each one is called out below rather than
left as a surprise.

## Routing

`app/pages/index.vue`, `app/pages/products/[id].vue`, `app/pages/cart.vue`
map to routes `index`, `products_id`, `cart` — the same `index.vue` /
`[param].vue` conventions Nuxt itself uses. There's no `vue-router`/DOM
`history` under the hood (there's no DOM at all) — `useNativeRouter()`
pushes/pops NativeScript's native Frame backstack instead, but you author
pages and navigate between them (`navigate('products_id', { params: { id
} })`) the same way regardless.

## Auto-imports

`useProducts()` (this app's own composable, `app/composables/useProducts.ts`)
and `formatCurrency()` (this app's own util, `app/utils/formatCurrency.ts`)
are both used in these pages/components with **no import statement** —
same as `useNativeRouter()`, `useDevice()`, and every other nuxt-native
composable. Add a new file to `app/composables/` or `app/utils/` exporting
a function whose name matches the filename, and it's usable the same way
on the next `dev`/`build` — no wiring needed.

Two things this does **not** cover, on purpose:

- **Project components** (`ProductCard.vue`, `SectionHeader.vue`) still
  need an explicit `import` wherever they're used — component
  auto-import is a different mechanism in real Nuxt (component
  discovery, not the same `unimport`-style scan), and isn't part of
  this yet.
- **Pinia stores** (`useCartStore`) also need an explicit `import`. Real
  Nuxt's own Pinia auto-import (`@pinia/nuxt`) works because it does a
  real static-export analysis to find the store's actual exported name
  regardless of what the file is called — `cart.ts` exports
  `useCartStore`, not `useCart`. This framework's auto-import instead
  assumes a file's export name matches its filename (cheap, no AST
  parse needed, correct for every composable/util here) — which is
  exactly the assumption a Pinia store file breaks. Explicit import for
  stores, deliberately, not a bug.

## State management

`app/stores/cart.ts` is a plain Pinia setup-store (`defineStore('cart', ()
=> {...})`) — nothing native-specific about it. Pinia works here because
its actual store engine has no DOM dependency at all (confirmed by
reading its real dist output, see `ARCHITECTURE.md` in the framework repo
for the full verification) — it's wired in automatically by
`generateEntry()` once it detects `pinia` is an installed dependency,
which this app's `package.json` declares.

## Styling

Tailwind utility classes (`flex-col`, `gap-4`, `p-5`, ...) work on
`<NFlex>` and other views — but only the utilities NativeScript's CSS
engine can actually apply are enabled (`tailwind.config.cjs`'s
`corePlugins` allowlist, generated for you, documents exactly which ones
and why). Colors passed as raw values (`color="#64748b"`) rather than
Tailwind classes in a couple of places here (`NText`'s `color` prop) are
deliberate — component-level props, not CSS classes, are how this
framework's own UI kit (`NText`, `NButton`, `NCard`, ...) takes color/
variant input; Tailwind classes are for layout/spacing on raw views.

## Running this app

```
npm install
npx nuxt-native init
npx nuxt-native dev android   # or ios
```
