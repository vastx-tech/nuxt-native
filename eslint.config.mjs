import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true
  }
}).append({
  // The VS Code extension is a separate package with its own
  // package.json/tsconfig.json/node_modules — only its compiled output
  // needs excluding here (its own `src/` is plain TS, already valid input
  // for this same config).
  ignores: ['vscode-extension/out/**', 'vscode-extension/node_modules/**']
}).append({
  // Nuxt's file-based routing names pages by their file (index.vue,
  // [id].vue) — the multi-word rule exists to avoid clashing with native
  // HTML elements, which doesn't apply to files nuxt-native's router
  // resolves by path, never registers as a global component.
  files: ['playground/app/pages/**/*.vue'],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
})
