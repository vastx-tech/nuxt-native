import { loadNuxtConfig } from '@nuxt/kit'

const defaults = {
  appId: 'org.nuxtnative.app',
  appName: 'NuxtNativeApp',
  platforms: ['ios', 'android'],
  entry: 'app/app.vue'
}

/**
 * Reads the `native` key from the project's nuxt.config so the CLI and the
 * Nuxt module agree on appId/appName/entry without duplicating config.
 */
export async function loadNativeConfig(cwd = process.cwd()) {
  const config = await loadNuxtConfig({ cwd })
  return { ...defaults, ...(config.native ?? {}) }
}
