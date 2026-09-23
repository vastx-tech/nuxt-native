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
 */
const NUXT_NATIVE_COMPOSABLES = [
  { name: 'useWebSocket', from: 'nuxt-native/runtime/composables/useWebSocket' },
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
 * Assumes each project composable file exports a named function matching
 * its own filename (`useFoo.ts` -> `useFoo`) — the same assumption this
 * framework's own composables all follow. A real static export analysis
 * (like Nuxt's own scanner does) would handle mismatched names too, but
 * would need a real AST parse per file; this filename convention covers
 * the common case without that cost, and is an explicit, documented
 * limitation rather than a silent one.
 */
export function collectAutoImportEntries(projectRoot, composablesDir = 'app/composables') {
  const entries = [...NUXT_NATIVE_COMPOSABLES]
  const dir = join(projectRoot, composablesDir)

  if (existsSync(dir)) {
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
