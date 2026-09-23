import { existsSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

/**
 * Every nuxt-native runtime composable, explicit and hand-maintained —
 * same precedent as RUNTIME_COMPONENTS in generate-entry.mjs, not
 * directory-scanned. `useWebSocket` specifically MUST stay a hand-listed
 * entry with its real, suffix-less specifier: it's platform-split
 * (useWebSocket.android.ts/.ios.ts), and directory-scanning would either
 * hit a duplicate-export-name conflict (both files export `useWebSocket`)
 * or resolve to one literal platform file instead of letting webpack's
 * own platform-extension list pick the right one — the same trap
 * documented in the composable's own file.
 *
 * `useWebSocket` additionally carries a `typesFrom` pointing straight at
 * the `.android` variant: TypeScript's own module resolution (used for
 * ambient auto-import types — see `renderAutoImportTypes` below) has no
 * concept of webpack's platform-extension list, so the real, suffix-less
 * runtime specifier doesn't resolve to anything for typechecking
 * purposes (no literal `useWebSocket.ts`/`.d.ts` exists, only the two
 * platform variants). Both platforms export the same interface shape, so
 * picking one for editor/typecheck purposes isn't a correctness issue —
 * the same limitation any React Native project with `.ios.ts`/`.android.ts`
 * splits lives with in an editor too.
 */
const NUXT_NATIVE_COMPOSABLES = [
  { name: 'useWebSocket', from: 'nuxt-native/runtime/composables/useWebSocket', typesFrom: 'nuxt-native/runtime/composables/useWebSocket.android.js' },
  { name: 'useCamera', from: 'nuxt-native/runtime/composables/useCamera.js' },
  { name: 'useGeolocation', from: 'nuxt-native/runtime/composables/useGeolocation.js' },
  { name: 'useBottomSheet', from: 'nuxt-native/runtime/composables/useBottomSheet.js' },
  { name: 'useDevice', from: 'nuxt-native/runtime/composables/useDevice.js' },
  { name: 'useModal', from: 'nuxt-native/runtime/composables/useModal.js' },
  { name: 'useNativeRouter', from: 'nuxt-native/runtime/composables/useNativeRouter.js' },
  { name: 'useSafeArea', from: 'nuxt-native/runtime/composables/useSafeArea.js' },
  { name: 'useMcpClient', from: 'nuxt-native/runtime/composables/useMcpClient.js' }
]

/**
 * Computes the full auto-import entry list for a project: nuxt-native's
 * own composables above, plus one entry per file directly inside the
 * project's own `app/composables/` (mirroring Nuxt's real convention for
 * that directory). Regenerated on every `generateEntry()` call (init/dev/
 * build all call it), so a composable file added after the project's
 * webpack.config.cjs was first written is picked up on the next build —
 * the config file itself never needs rewriting, only this data.
 *
 * Assumes each project composable/util file exports a named function
 * matching its own filename (`useFoo.ts` -> `useFoo`, `formatDate.ts` ->
 * `formatDate`) — the same assumption this framework's own composables
 * all follow. A real static export analysis (like Nuxt's own scanner
 * does) would handle mismatched names too, but would need a real AST
 * parse per file; this filename convention covers the common case
 * without that cost, and is an explicit, documented limitation rather
 * than a silent one. Pinia stores (`app/stores/`) are deliberately NOT
 * covered here for the same reason real Nuxt's own auto-import doesn't
 * use this filename-matching approach for them either: a store file
 * conventionally exports `useCartStore` from `cart.ts` — a real name
 * mismatch this simple convention can't handle — so store composables
 * still need an explicit import.
 *
 * Scans both `app/composables/` and `app/utils/`, mirroring Nuxt's own
 * convention that both directories auto-import their exports the same
 * way (utils/ isn't just for composables' internal helpers on the web
 * either).
 */
export function collectAutoImportEntries(projectRoot, dirs = ['app/composables', 'app/utils']) {
  const entries = [...NUXT_NATIVE_COMPOSABLES]

  for (const relDir of dirs) {
    const dir = join(projectRoot, relDir)
    if (!existsSync(dir)) continue

    for (const file of readdirSync(dir)) {
      if (!/\.(?:ts|js)$/.test(file)) continue
      const name = basename(file, extname(file))
      // Forward-slash even on Windows: this ends up as a literal import
      // specifier in generated/read output, same reasoning as scan-pages.mjs's
      // own route `file` field.
      const from = join(dir, file).replace(/\\/g, '/')
      entries.push({ name, from })
    }
  }

  return entries
}

/**
 * Ambient global type declarations for every auto-import entry —
 * otherwise `vue-tsc`/the editor's TS server have no idea these names
 * exist (auto-import is a webpack-loader-level, build-time transform;
 * TypeScript's own resolution never sees it), and would flag every single
 * auto-imported composable/util as `Cannot find name`. Same purpose as
 * Nuxt's own generated `.nuxt/types/imports.d.ts` for its `#imports`
 * auto-import, just written by hand instead of by `unimport`'s own
 * dts-generation (which, like its webpack plugin, is ESM-only and not
 * usable from this CLI's synchronous CJS/mixed context anyway).
 */
export function renderAutoImportTypes(entries) {
  const declarations = entries
    .map(({ name, from, typesFrom }) => `  const ${name}: typeof import(${JSON.stringify(typesFrom ?? from)})['${name}']`)
    .join('\n')

  return `// Generated by nuxt-native — do not edit by hand, regenerated on every
// init/dev/build. Gives vue-tsc/your editor's TS server static knowledge
// of every auto-imported composable/util so they don't show as
// "Cannot find name" errors, even though no file actually imports them.
export {}
declare global {
${declarations}
}
`
}
