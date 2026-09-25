import { ENTRY_FILE } from './generate-entry.mjs'

// Until nuxt-native is published to npm, generated projects depend on it
// straight from GitHub. Once it's published, this is the one line to change.
export const NUXT_NATIVE_DEPENDENCY_SPEC = 'github:vastx-tech/nuxt-native'

export function packageJson(appName, dependencySpec = NUXT_NATIVE_DEPENDENCY_SPEC) {
  return `${JSON.stringify(
    {
      name: appName,
      private: true,
      // Deliberately NOT "type": "module". This project's own generated
      // files (webpack.config.cjs, .nuxt-native/app.js — the latter only
      // ever consumed through webpack's own module system, never Node's)
      // don't need it, but NativeScript's Android runtime ships plain
      // CommonJS build tooling under platforms/android/build-tools/ that
      // does — those files have no closer package.json of their own, so
      // Node resolves their module type from THIS one. With "type":
      // "module" set, Node treats that vendored CommonJS script as ESM
      // too and `require` throws `ReferenceError: require is not defined`
      // — reproduced by a real user's `ns run android` deploy step.
      // Fallback only: nativescript.config.ts's own `main` field (set by
      // ensureNativeScriptConfig) is checked first by
      // @nativescript/webpack's getEntryPath() — this covers the case
      // where that field is somehow not read (see its own comment for why
      // that's not just theoretical).
      main: ENTRY_FILE,
      scripts: {
        'native:init': 'nuxt-native init',
        'native:dev:ios': 'nuxt-native dev ios',
        'native:dev:android': 'nuxt-native dev android',
        'native:build:ios': 'nuxt-native build ios --release',
        'native:build:android': 'nuxt-native build android --release'
      },
      dependencies: {
        'nuxt-native': dependencySpec,
        'nativescript-vue': '^3.1.2',
        '@nativescript/core': '^9.1.2',
        nuxt: '^4.0.0'
      },
      devDependencies: {
        // Required by `ns build`/`ns run` directly (it looks for this exact
        // package name as a project dependency) — pinned to the same range
        // nativescript-vue itself builds and tests against.
        '@nativescript/webpack': '~5.0.38',
        // ts-loader (a dependency of @nativescript/webpack) peer-depends on
        // this — @nativescript/webpack only lists it in ITS OWN
        // devDependencies (used to build itself), which are never installed
        // transitively for consumers. Without it, ts-loader's own compiler
        // resolution (`require('typescript')`) throws, gets swallowed into
        // an unused error message, and it presses on with `compiler`
        // undefined — crashing on `compiler.sys.fileExists` the moment it
        // tries to locate a tsconfig. Confirmed by reading ts-loader's
        // compilerSetup.js directly; reproduced by a real user's build log.
        typescript: '~5.8.0',
        // Pinned to the 3.x line deliberately, not "latest" (which is now
        // Tailwind v4): tailwind.config.cjs's `corePlugins` allowlist below
        // is a v3-only, JS-config API — v4 moved to CSS-first config and
        // dropped it. See tailwind.config.cjs's own comment for why that
        // allowlist (not the full utility set) is what's actually safe to
        // generate against NativeScript's CSS engine.
        tailwindcss: '^3.4.19',
        postcss: '^8.5.28'
      }
    },
    null,
    2
  )}\n`
}

export function projectReadme() {
  return `# Nuxt Native app

Run on Android with \`npx nuxt-native dev android\` (or use \`ios\` on macOS).

Read [STYLING.md](./STYLING.md) before changing layout or spacing. The framework
uses Tailwind v3 with its bundled @nativescript/tailwind adapter.

## AI coding agents (MCP)

The framework includes an MCP server. No separate clone or server folder is needed.
Configure your agent to launch \`npx nuxt-native mcp\` from this project directory.
The agent starts and stops the server; you do not need to run it in another terminal.
It uses stdio, so a manual launch waits for MCP messages rather than opening a web page.

For clients using the \`mcpServers\` format, such as Claude Code's \`.mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "nuxt-native": {
      "command": "npx",
      "args": ["nuxt-native", "mcp"]
    }
  }
}
\`\`\`

If your Windows client cannot launch npx directly, use command \`cmd\` and
args \`["/c", "npx", "nuxt-native", "mcp"]\`.
For clients launched elsewhere, set their working directory to this project or
use command \`node\` with the absolute path to
\`node_modules/nuxt-native/bin/nuxt-native.mjs\` followed by \`mcp\` as arguments.

Try: "Use nuxt-native to run doctor and lint for this project's absolute path,
then build Android, install it on my connected device, and check the logs.
Run the steps sequentially."

Tools include doctor, lint, build, list_devices, install_and_launch, read_logs,
analyze, version, and clean. Pass the app's absolute path as projectPath when
the tool requests it. Native builds still require the platform SDK and JDK;
Android installation and logs require ADB and a connected device or emulator.
This development server is separate from the app's useMcpClient() HTTP client.
`
}

export function nuxtConfig(appId, appName) {
  return `export default defineNuxtConfig({
  modules: ['nuxt-native'],
  compatibilityDate: '${new Date().toISOString().slice(0, 10)}',

  native: {
    appId: ${JSON.stringify(appId)},
    appName: ${JSON.stringify(appName)}
  }
})
`
}

export function tsconfig() {
  // A real, standalone config — not Nuxt's usual references-only shell
  // pointing at .nuxt/tsconfig.*.json. That style only works once `nuxi
  // prepare`/`nuxi dev` has generated `.nuxt/`, which never happens in this
  // framework's actual workflow (see ARCHITECTURE.md on why the native
  // build bypasses Nuxt's own builder entirely). More importantly,
  // @nativescript/webpack's ts-loader rule reads this exact file directly
  // via getProjectTSConfigPath() to compile <script lang="ts"> blocks in
  // .vue pages — a references-only config with no real `compilerOptions`
  // would leave it with nothing usable even once `typescript` itself is
  // installed (see the typescript devDependency comment in packageJson()
  // for the other half of this bug). Trade-off: editor auto-import
  // IntelliSense for composables/components still needs `npx nuxi prepare`
  // run at least once — this file prioritizes a working native build.
  return `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        // Required for TS18003 "No inputs were found": TypeScript's own
        // `include` glob-matching filters by a hardcoded extension list
        // (.ts/.d.ts, plus .js only with this flag) no matter what the
        // glob pattern spells — listing "*.vue" in `include` does not
        // register .vue as a recognized extension. None of our generated
        // files are bare .ts, so without allowJs literally nothing in
        // `include` ever counts as a root file. With it, .nuxt-native/
        // app.js (plain JS) does, which is enough to satisfy "at least
        // one input" — reproduced/fixed via a real webpack compile, not
        // just config resolution.
        allowJs: true,
        isolatedModules: true,
        // nativescript-vue re-exports the full Vue Composition API
        // alongside its native createApp — mapping the bare "vue"
        // specifier here is what makes `import { ref } from 'vue'`
        // type-check correctly against it (nativescript-vue's own
        // documented recommendation for consumers).
        paths: {
          vue: ['./node_modules/nativescript-vue']
        }
      },
      // nuxt.config.ts deliberately excluded: it's never bundled into the
      // native entry, only read by Nuxt's own tooling — but including it
      // here puts it in scope for @nativescript/webpack's
      // ForkTsCheckerWebpackPlugin (which activates now that `typescript`
      // is an actual dependency), and it fails there since `defineNuxtConfig`
      // is an ambient global Nuxt's own generated types provide, which we
      // don't have without running `nuxi prepare`. Reproduced directly via
      // a real `webpack()` compilation, not just config resolution.
      //
      // Explicit per-extension globs, not a bare "app/**/*": TypeScript's
      // own `include` glob-matching only recognizes .ts/.d.ts (and .js
      // only with allowJs) when enumerating root files for the config —
      // it has no special awareness of .vue (that comes from vue-tsc,
      // which plain ts-loader here doesn't use). A pattern matching zero
      // recognized-extension files makes `ts.parseJsonConfigFileContent`
      // fail with TS18003 "No inputs were found", which `ts-loader`
      // treats as fatal — reproduced directly via a real webpack compile.
      include: [
        'app/**/*.ts',
        'app/**/*.vue',
        '.nuxt-native/**/*.js',
        '.nuxt-native/**/*.mjs',
        '.nuxt-native/**/*.vue',
        // Ambient auto-import declarations (see auto-imports.mjs's
        // renderAutoImportTypes) — without this, vue-tsc/the editor's TS
        // server would flag every auto-imported composable/util as
        // "Cannot find name", even though the actual build resolves them
        // correctly via the auto-import webpack loader.
        '.nuxt-native/**/*.d.ts'
      ]
    },
    null,
    2
  )}\n`
}

export function gitignore() {
  return `.output
.data
.nuxt
.nitro
.cache
dist
node_modules
.nuxt-native
platforms
hooks
*.hprof
.env
.env.*
!.env.example
`
}

// The full property list NativeScript's CSS engine actually recognizes,
// confirmed by grepping every `cssName:` registration across
// @nativescript/core/ui/ (not just style-properties.js — text-align,
// letter-spacing, etc. live in separate files). Deliberately excluded from
// the allowlist below even though the property names would match:
//  - display/position/top/right/bottom/left/overflow/float/cursor/
//    pointer-events: NativeScript has no concept of any of these at all —
//    layout is chosen by container type (FlexboxLayout/GridLayout/
//    AbsoluteLayout), never by a `position` CSS property.
//  - transition-*/animation-*: NativeScript has its own imperative
//    Animation API, not CSS transitions.
//  - rotate/scale/translate/skew and the `transform` shorthand: Tailwind
//    v3 composes these from CSS custom properties (`translate(var(
//    --tw-translate-x), ...)`), but NativeScript's transform value parser
//    (see convertToTransform in style-properties.js) expects literal
//    numbers, not `var()` references — confirmed by reading that parser
//    directly. Enabling these plugins would generate classes that
//    silently do nothing.
//  - space (space-x/space-y), ring, divide, backdropFilter: rely on
//    sibling-combinator selectors or CSS features not confirmed to work
//    against NativeScript's css-tree-based engine.
//  - preflight: Tailwind's HTML/box-sizing reset — meaningless for views
//    that were never HTML elements to begin with.
// This controls generation, not runtime compatibility. The bundled
// @nativescript/tailwind adapter converts units and filters output; our
// wrapper preserves NativeScript 9 properties missing from its filter.
const TAILWIND_CORE_PLUGINS = [
  'margin',
  'padding',
  'gap',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'backgroundColor',
  'borderRadius',
  'borderWidth',
  'borderColor',
  'boxShadow',
  'opacity',
  'textColor',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'textAlign',
  'textDecoration',
  'textTransform',
  'letterSpacing',
  'lineHeight',
  'whiteSpace',
  'textOverflow',
  'visibility',
  'zIndex',
  // FlexboxLayout-scoped (see NFlex.vue) — real CSS properties, but only
  // take effect on an actual <FlexboxLayout>/<NFlex>, same as flexbox only
  // does anything on a real flex container on web.
  'flexDirection',
  'flexWrap',
  'flex',
  'flexGrow',
  'flexShrink',
  'order',
  'justifyContent',
  'alignItems',
  'alignContent',
  'alignSelf'
]

export function tailwindConfig() {
  return `// Generated by \`nuxt-native create\`. \`corePlugins\` is deliberately an
// allowlist (not the full Tailwind set) — see the comment above
// TAILWIND_CORE_PLUGINS in nuxt-native's own cli/lib/scaffold-templates.mjs
// for exactly which utilities NativeScript's CSS engine can and can't
// apply, and why. Safe to edit, but removing entries here doesn't make
// NativeScript support them — it only controls what Tailwind generates.
module.exports = {
  content: ['./app/**/*.{vue,js,ts}', './.nuxt-native/**/*.{js,vue}'],
  darkMode: ['class', '.ns-dark'],
  corePlugins: ${JSON.stringify(TAILWIND_CORE_PLUGINS, null, 2).replace(/\n/g, '\n  ')},
  theme: {
    extend: {}
  }
}
`
}

export function postcssConfig() {
  return `// Tailwind v3 generates utilities; the bundled @nativescript/tailwind
// adapter converts them to native CSS and preserves NativeScript 9 gaps.
// Keep this adapter last. Do not also enable upstream's v4 autoload pipeline.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('nuxt-native/cli/lib/native-tailwind.cjs')()
  ]
}
`
}

export function appCss() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`
}

export function appVue() {
  return `<template>
  <!-- Unused at native runtime: nativescript-vue mounts .nuxt-native/root-frame.vue
       (generated by \`nuxt-native init\`/\`dev\`/\`build\` from app/pages) instead of
       Nuxt's own client entry. This file only exists so \`nuxi dev\`/typecheck have
       a root component to resolve. -->
  <div />
</template>
`
}

export function indexPage() {
  return `<template>
  <NPage title="Counter">
    <NFlex class="flex-col p-5 gap-4">
      <Label text="Welcome to Nuxt Native" class="text-2xl font-bold text-center" />
      <Label text="Tap the buttons to change the count." class="text-base text-center" />
      <Label :text="String(count)" class="text-5xl font-bold text-center" />
      <NButton text="Increment +" size="lg" @tap="count++" />
      <NButton text="Decrement -" variant="secondary" size="lg" @tap="count--" />
    </NFlex>
  </NPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>
`
}
