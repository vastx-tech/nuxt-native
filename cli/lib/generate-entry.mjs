import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { scanPages } from './scan-pages.mjs'

const OUT_DIR = '.nuxt-native'

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

function renderAppEntry() {
  return `import { createApp } from 'nativescript-vue'
import RootFrame from './root-frame.vue'

createApp(RootFrame).start()
`
}
