import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true
  }
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
