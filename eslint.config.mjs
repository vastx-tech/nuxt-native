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
  ignores: ['vscode-extension/out/**', 'vscode-extension/node_modules/**', 'mcp-server/node_modules/**']
}).append({
  // Nuxt's file-based routing names pages by their file (index.vue,
  // [id].vue) — the multi-word rule exists to avoid clashing with native
  // HTML elements, which doesn't apply to files nuxt-native's router
  // resolves by path, never registers as a global component.
  files: ['playground/app/pages/**/*.vue'],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
}).append({
  // Direct Java/Objective-C interop (OkHttp's WebSocket API on Android,
  // NSURLSessionWebSocketTask's delegate callbacks on iOS) — the actual
  // native callback parameter types either have no npm type definitions
  // at all (OkHttp) or are typed loosely enough by @nativescript/types
  // that real interop code genuinely needs `any` at these boundaries,
  // the same way @nativescript/core's own native-callback code (e.g.
  // AttachListener in ui/frame/index.android.js) is untyped plain JS.
  files: ['src/runtime/composables/useWebSocket.*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
}).append({
  // Ambient .d.ts files describe shape only — `class` with only static
  // members or an empty body is exactly how you declare a native class's
  // type surface without a runtime implementation, unlike the rule's
  // normal target (an accidentally-static-only class in real, executed
  // code).
  files: ['**/*.d.ts'],
  rules: {
    '@typescript-eslint/no-extraneous-class': 'off'
  }
})
