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
 */
export function ensureWebpackConfig(projectRoot) {
  const configPath = join(projectRoot, WEBPACK_CONFIG_FILENAME)
  if (existsSync(configPath)) return configPath

  writeFileSync(configPath, `const webpack = require('@nativescript/webpack')

module.exports = (env) => {
  webpack.init(env)
  require('nativescript-vue/nativescript.webpack')(webpack)

  return webpack.resolveConfig()
}
`)

  return configPath
}
