import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { WEBPACK_CONFIG_FILENAME } from './webpack-config.mjs'

/**
 * Writes nativescript.config.ts if the project doesn't have one yet. This
 * is the file the NativeScript CLI (`ns`) reads to know the appId and where
 * the native-buildable source lives (`appPath`) — App_Resources itself is
 * intentionally NOT hand-generated here: `ns platform add <platform>`
 * scaffolds a correct, version-matched App_Resources tree from NativeScript's
 * own template the first time it runs against this config, which is far
 * more reliable than us hand-authoring AndroidManifest.xml/Info.plist.
 *
 * `bundlerConfigPath` points `ns` at webpack.config.cjs instead of its
 * default `webpack.config.js` — see webpack-config.mjs for why the `.cjs`
 * extension is required in a `"type": "module"` project.
 */
export function ensureNativeScriptConfig(projectRoot, { appId }) {
  const configPath = join(projectRoot, 'nativescript.config.ts')
  if (existsSync(configPath)) return configPath

  writeFileSync(configPath, `import type { NativeScriptConfig } from '@nativescript/core'

export default {
  id: ${JSON.stringify(appId)},
  appPath: '.nuxt-native',
  appResourcesPath: 'App_Resources',
  bundlerConfigPath: ${JSON.stringify(WEBPACK_CONFIG_FILENAME)},
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  }
} satisfies NativeScriptConfig
`)

  return configPath
}
