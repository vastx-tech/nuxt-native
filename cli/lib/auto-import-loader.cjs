'use strict'

const fs = require('node:fs')
const path = require('node:path')

// Loaders execute per-file, potentially many times per build (and again on
// every incremental rebuild in `nuxt-native dev`) — read+parse
// .nuxt-native/auto-imports.json once per webpack process, not per file.
// A dev-mode restart (the normal way to pick up a newly added composable
// file, same workflow as any other new-file case in this CLI) naturally
// clears this cache along with the whole process.
let cachedEntries = null
let cachedFromPath = null

function loadEntries(rootContext) {
  const entriesPath = path.join(rootContext, '.nuxt-native', 'auto-imports.json')
  if (cachedEntries && cachedFromPath === entriesPath) return cachedEntries

  if (!fs.existsSync(entriesPath)) {
    cachedEntries = []
    cachedFromPath = entriesPath
    return cachedEntries
  }

  cachedEntries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'))
  cachedFromPath = entriesPath
  return cachedEntries
}

/**
 * A first-party, minimal auto-import transform — not the `unimport`
 * package Nuxt itself uses, since `unimport` ships ESM-only (confirmed:
 * its package.json `exports` has no CJS entry at all) and this loader has
 * to run inside `@nativescript/webpack`'s webpack.config.cjs, which is
 * loaded with a plain, synchronous `require(configPath)(env)` — no
 * Promise/ESM handling at all (confirmed by reading
 * `@nativescript/webpack/dist/bin/index.js` directly: the returned config
 * is passed straight into `webpack(configuration)`, never awaited).
 *
 * Strategy mirrors unimport's own real approach though, not a lesser
 * substitute: a fast identifier scan (not full type-aware analysis),
 * skipping any name the file already imports or declares itself, same as
 * Nuxt's own auto-imports do. Registered as an `enforce: 'pre'` rule (see
 * webpack-config.mjs) against plain `.ts` files and against vue-loader's
 * split-out `<script>` sub-request (`resourceQuery` containing
 * `type=script`).
 *
 * One real, confirmed-by-testing subtlety: for that split `<script>`
 * sub-request, `resourcePath` is the *same physical .vue file* as the raw,
 * unsplit request — webpack reads the whole SFC (template, script, style,
 * all of it) fresh from disk again for this virtual module, and
 * vue-loader's own loader (which runs after this one) re-parses whatever
 * `source` it receives from scratch (confirmed by reading vue-loader's own
 * `dist/index.js`: it calls `parse(source, ...)` unconditionally, for both
 * the raw request and every split sub-request). So this loader is never
 * handed *just* the isolated script text — prepending import lines at
 * position 0 (this file's first, wrong attempt) lands them *before*
 * `<template>`, outside every recognized SFC block, where vue-loader's own
 * block-extraction silently drops them — confirmed by inspecting a real
 * compiled bundle and finding the call sites present but the import
 * missing entirely. The fix is to find the actual `<script ...>` opening
 * tag and inject right after it, not at the top of the string.
 */
module.exports = function autoImportLoader(source) {
  // Belt-and-suspenders, not decorative: the webpack rule itself already
  // restricts this loader to plain .ts files and vue-loader's split-out
  // <script> sub-request (see webpack-config.mjs) via `resourceQuery`, but
  // that restriction was confirmed (via direct instrumentation of a real
  // build) to not reliably exclude the sibling <template> sub-request in
  // this project's actual, merged config — @nativescript/webpack does its
  // own config-merging on top of webpack-chain's output, and something in
  // that merge doesn't preserve/enforce resourceQuery matching the way a
  // plain webpack config would. Guarding here makes correctness the
  // loader's own responsibility instead of depending on that behavior:
  // never touch a request whose resourceQuery says it's anything other
  // than a script block (a <template>/<style> block, or a component-only
  // request some other tool adds), and never touch a plain .ts request
  // that's secretly a declaration file.
  if (this.resourceQuery && !/type=script/.test(this.resourceQuery)) return source
  if (/\.d\.ts$/.test(this.resourcePath)) return source

  const rootContext = this.rootContext || process.cwd()
  const entries = loadEntries(rootContext)
  if (entries.length === 0) return source

  const missing = entries.filter(({ name }) => {
    if (!new RegExp(`\\b${name}\\b`).test(source)) return false
    const alreadyImported = new RegExp(`\\bimport\\b[^;]*\\b${name}\\b[^;]*\\bfrom\\b`).test(source)
    const declaredLocally = new RegExp(`\\b(?:function|const|let|var)\\s+${name}\\b`).test(source)
    return !alreadyImported && !declaredLocally
  })

  if (missing.length === 0) return source

  const importLines = missing.map(({ name, from }) => `import { ${name} } from ${JSON.stringify(from)};`).join('\n')

  const isVueFile = /\.vue$/.test(this.resourcePath)
  if (!isVueFile) return `${importLines}\n${source}`

  // Inject right after the <script ...> opening tag, not at position 0 —
  // see the doc comment above for exactly why that distinction matters.
  const scriptTagMatch = /<script\b[^>]*>/.exec(source)
  if (!scriptTagMatch) return source // no <script> block in this SFC at all — nothing to do

  const insertAt = scriptTagMatch.index + scriptTagMatch[0].length
  return source.slice(0, insertAt) + '\n' + importLines + source.slice(insertAt)
}
