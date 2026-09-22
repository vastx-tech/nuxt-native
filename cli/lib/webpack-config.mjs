import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const WEBPACK_CONFIG_FILENAME = 'webpack.config.cjs'

/**
 * Writes webpack.config.cjs if the project doesn't have one yet — the
 * NativeScript CLI (`ns build`/`ns run`) requires this file (pointed at via
 * `bundlerConfigPath` in nativescript.config.ts, see ensureNativeScriptConfig)
 * plus a `@nativescript/webpack` devDependency.
 *
 * It's `.cjs`, not `.js`: `@nativescript/webpack` loads this file with a
 * plain `require(configPath)` (confirmed by reading its bin source), and
 * nuxt-native-generated projects have `"type": "module"` in package.json —
 * under that, a plain `.js` file is loaded as an ES module and `require()`
 * throws ERR_REQUIRE_ESM. `.cjs` is always CommonJS regardless of the
 * package's `"type"`, which is exactly what this file's `require()`/
 * `module.exports` syntax needs. Verified by invoking the generated config
 * directly with `node -e "require('./webpack.config.js')(...)"` — reproduced
 * ERR_REQUIRE_ESM with the `.js` name, confirmed clean with `.cjs`.
 *
 * `@nativescript/webpack` ships a base "vue" module rule and a
 * VueLoaderPlugin placeholder, but does not wire up an actual vue-loader —
 * nativescript-vue ships that wiring itself as
 * `nativescript-vue/nativescript.webpack.js` (it also aliases the bare
 * "vue" specifier to "nativescript-vue" at the bundler level, which is what
 * lets composables written as `import { ref } from 'vue'` resolve
 * correctly in the on-device bundle). Without this file, `.vue` pages have
 * no loader at all and webpack fails immediately on the first import.
 *
 * The `#build/nuxt-native/route-manifest.mjs` alias: useNativeRouter.ts
 * (nuxt-native's own composable) imports its route table from that exact
 * specifier — `#build` is a Nuxt-internal alias Nuxt's OWN Vite/webpack
 * build registers, resolving to `.nuxt/`. The native build never goes
 * through Nuxt's builder at all, so that alias doesn't exist here —
 * reproduced directly: `Module not found: Can't resolve
 * '#build/nuxt-native/route-manifest.mjs'`. Aliasing the same literal
 * specifier to this project's own CLI-generated `.nuxt-native/
 * route-manifest.mjs` lets the identical composable source resolve
 * correctly in both contexts without forking it.
 */
export function ensureWebpackConfig(projectRoot) {
  const configPath = join(projectRoot, WEBPACK_CONFIG_FILENAME)
  if (existsSync(configPath)) return configPath

  writeFileSync(configPath, `const path = require('path')
const webpack = require('@nativescript/webpack')

module.exports = (env) => {
  webpack.init(env)
  require('nativescript-vue/nativescript.webpack')(webpack)

  webpack.chainWebpack((config) => {
    config.resolve.alias.set(
      '#build/nuxt-native/route-manifest.mjs$',
      path.resolve(__dirname, '.nuxt-native/route-manifest.mjs')
    )
  })

  // A *separate*, high-order chainWebpack call, not folded into the one
  // above: @nativescript/webpack's resolveConfig() calls
  // applyExternalConfigs() internally, which scans every dependency for
  // its own top-level nativescript.webpack.js and auto-registers it —
  // meaning nativescript-vue's require() above AND this auto-discovery
  // both register its alias-setting chain (same default order 0), and the
  // auto-discovered one runs *inside* resolveConfig()'s own call stack,
  // i.e. strictly after anything this factory function registers directly.
  // So a same-order override here would still lose to that duplicate,
  // regardless of registration sequence — confirmed by instrumenting the
  // chain functions directly, not assumed. An explicit higher \`order\`
  // is the only thing that reliably wins, since webpackChains sorts by
  // order first and only falls back to registration sequence for ties.
  // See vue-compat.ts for why this override exists: compiler-dom compiles
  // v-model on <input> to import vModelText from 'vue', which plain
  // nativescript-vue doesn't have.
  webpack.chainWebpack((config) => {
    config.resolve.alias.set(
      'vue',
      require.resolve('nuxt-native/runtime/vue-compat.js')
    )
  }, { order: 10 })

  return webpack.resolveConfig()
}
`)

  return configPath
}
