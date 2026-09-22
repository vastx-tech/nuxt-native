import { createRequire } from 'node:module'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { scanPages } from './scan-pages.mjs'

const OUT_DIR = '.nuxt-native'

/**
 * Path (relative to project root) to the generated bootstrap entry —
 * shared with nativescript-config.mjs and scaffold-templates.mjs, which
 * both need to point at it (nativescript.config.ts's `main` field and
 * package.json's `main` fallback) so @nativescript/webpack's
 * getEntryPath() can find it instead of throwing on an undefined path.
 */
export const ENTRY_FILE = `${OUT_DIR}/app.js`

/**
 * Regenerates the standalone native bootstrap: a route manifest (mirroring
 * what the Nuxt module generates for editor/type-checking DX, see
 * src/build/generate-routes.ts) plus the actual entry file NativeScript's
 * webpack build loads on-device. This is intentionally decoupled from
 * Nuxt's own Vite/Nitro build — there is no server response to render and
 * no DOM to hydrate, so the on-device bundle is produced by NativeScript's
 * own webpack toolchain instead of nuxi.
 */
export function generateEntry({ projectRoot = process.cwd(), pagesDir = 'app/pages' } = {}) {
  const outDir = join(projectRoot, OUT_DIR)
  const resolvedPagesDir = resolve(projectRoot, pagesDir)

  if (!existsSync(resolvedPagesDir)) {
    throw new Error(`[nuxt-native] Pages directory not found: ${resolvedPagesDir}`)
  }

  const routes = scanPages(resolvedPagesDir)
  if (routes.length === 0) {
    throw new Error(`[nuxt-native] No .vue pages found in ${resolvedPagesDir}`)
  }

  const initial = routes.find(r => r.name === 'index') ?? routes[0]

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'route-manifest.mjs'), renderManifest(routes))
  writeFileSync(join(outDir, 'root-frame.vue'), renderRootFrame(initial))
  writeFileSync(join(outDir, 'app.js'), renderAppEntry({ usePinia: isPiniaInstalled(projectRoot) }))

  // @nativescript/webpack's app-css-loader resolves "./app.css" relative to
  // the entry file's own directory (confirmed against its source) — i.e.
  // .nuxt-native/app.css, not the project's real app/app.css. That real
  // file is the one thing here users actually author (Tailwind directives,
  // custom CSS); everything else in .nuxt-native/ is generated. So this
  // copies it into place on every generate pass, same as the other
  // generated files, instead of asking users to hand-maintain a duplicate.
  // Optional: projects that don't use app/app.css (or predate this feature)
  // just don't get one, and app-css-loader silently no-ops on a missing file.
  const appCssPath = resolve(projectRoot, 'app/app.css')
  if (existsSync(appCssPath)) {
    copyFileSync(appCssPath, join(outDir, 'app.css'))
  }

  return { routes, initial, outDir }
}

function renderManifest(routes) {
  const entries = routes.map(route => [
    '  {',
    `    name: ${JSON.stringify(route.name)},`,
    `    path: ${JSON.stringify(route.path)},`,
    `    params: ${JSON.stringify(route.params)},`,
    `    component: () => import(${JSON.stringify(route.file)})`,
    '  }'
  ].join('\n'))

  return `export const routes = [\n${entries.join(',\n')}\n]\n`
}

function renderRootFrame(initial) {
  return `<template>
  <Frame>
    <Initial />
  </Frame>
</template>

<script setup>
import Initial from ${JSON.stringify(initial.file)}
</script>
`
}

// The Nuxt module's addComponentsDir() registers <NPage>/<NActionBar>/
// <NTabs> globally for Nuxt's own build (editor DX, vue-tsc) — the native
// webpack build never goes through that, so nothing registers them there
// at all. Global .component() calls here are nativescript-vue's
// equivalent: the same mechanism Nuxt itself ultimately relies on
// (Vue's app-level component registry), just invoked directly instead of
// through Nuxt's auto-import codegen.
const RUNTIME_COMPONENTS = [
  { tag: 'NPage', specifier: 'nuxt-native/runtime/components/NPage.vue' },
  { tag: 'NActionBar', specifier: 'nuxt-native/runtime/components/NActionBar.vue' },
  { tag: 'NTabs', specifier: 'nuxt-native/runtime/components/NTabs.vue' },
  { tag: 'NFlex', specifier: 'nuxt-native/runtime/components/NFlex.vue' },
  { tag: 'NButton', specifier: 'nuxt-native/runtime/components/NButton.vue' },
  { tag: 'NText', specifier: 'nuxt-native/runtime/components/NText.vue' },
  { tag: 'NInput', specifier: 'nuxt-native/runtime/components/NInput.vue' },
  { tag: 'NCard', specifier: 'nuxt-native/runtime/components/NCard.vue' },
  { tag: 'NSwitch', specifier: 'nuxt-native/runtime/components/NSwitch.vue' },
  { tag: 'NSpinner', specifier: 'nuxt-native/runtime/components/NSpinner.vue' },
  { tag: 'NAvatar', specifier: 'nuxt-native/runtime/components/NAvatar.vue' },
  { tag: 'NBadge', specifier: 'nuxt-native/runtime/components/NBadge.vue' },
  { tag: 'NDivider', specifier: 'nuxt-native/runtime/components/NDivider.vue' }
  // NBottomSheet deliberately excluded: it's shown imperatively via
  // useBottomSheet()'s $showModal call (which references it by direct JS
  // import, not by template tag name), never used as a template tag
  // itself, so it needs no global registration here.
]

/**
 * Optional, first-class Pinia support: wired into the bootstrap only if
 * the project actually depends on `pinia` (checked below), never forced.
 *
 * Why this is safe on a runtime with no DOM at all: Pinia's own dist
 * (`pinia.js`, the one file its package.json `exports` map resolves to
 * unconditionally) has zero references to `document`/`localStorage`/
 * `navigator`, and its one real runtime dependency (`nostics`, a
 * zero-dependency diagnostic-message formatter) has none either — checked
 * by downloading both via `npm pack` and grepping their actual dist
 * output, not assumed from the package description. Its every DOM/
 * devtools-only code path (`registerPiniaDevtools`, the devtools plugin
 * itself, a `saveAs` file-download helper) is gated behind a single
 * `IS_CLIENT = typeof window !== "undefined"` check — and NativeScript's
 * runtime never defines a global `window` (confirmed by grepping
 * @nativescript/core for one), so every one of those branches is simply
 * never taken at runtime, the same way they wouldn't be during SSR.
 * `@vue/devtools-api` (pinia's one non-optional peer dependency — its
 * `setupDevtoolsPlugin` import is static, so webpack needs it resolvable
 * even though `IS_CLIENT` means it's never actually called) was checked
 * the same way: zero `window` references in its own main entry.
 * Everything Pinia's core imports from `vue` (`effectScope`,
 * `getCurrentInstance`, `inject`, `markRaw`, `toRaw`, `toRefs`, ...)
 * resolves correctly through the existing `vue` → `nativescript-vue` alias,
 * since `nativescript-vue`'s own entry does `export * from
 * '@vue/runtime-core'` (confirmed directly), and its pinned
 * `@vue/runtime-core` version satisfies Pinia's `vue: ^3.5.11` peer
 * requirement with room to spare.
 */
function isPiniaInstalled(projectRoot) {
  try {
    createRequire(join(projectRoot, 'package.json')).resolve('pinia')
    return true
  } catch {
    return false
  }
}

function renderAppEntry({ usePinia } = {}) {
  const imports = RUNTIME_COMPONENTS
    .map(({ tag, specifier }) => `import ${tag} from ${JSON.stringify(specifier)}`)
    .join('\n')
  const registrations = RUNTIME_COMPONENTS
    .map(({ tag }) => `  .component(${JSON.stringify(tag)}, ${tag})`)
    .join('\n')

  const piniaImport = usePinia ? `import { createPinia } from 'pinia'\n` : ''
  const piniaUse = usePinia ? '  .use(createPinia())\n' : ''

  return `import { createApp } from 'nativescript-vue'
import { registerHtmlElements } from 'nuxt-native/runtime/html-elements.js'
${piniaImport}import RootFrame from './root-frame.vue'
${imports}

registerHtmlElements()

createApp(RootFrame)
${piniaUse}${registrations}
  .start()
`
}
