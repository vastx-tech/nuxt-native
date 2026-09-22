import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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
  writeFileSync(join(outDir, 'app.js'), renderAppEntry())

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

function renderAppEntry() {
  const imports = RUNTIME_COMPONENTS
    .map(({ tag, specifier }) => `import ${tag} from ${JSON.stringify(specifier)}`)
    .join('\n')
  const registrations = RUNTIME_COMPONENTS
    .map(({ tag }) => `  .component(${JSON.stringify(tag)}, ${tag})`)
    .join('\n')

  return `import { createApp } from 'nativescript-vue'
import RootFrame from './root-frame.vue'
${imports}

createApp(RootFrame)
${registrations}
  .start()
`
}
