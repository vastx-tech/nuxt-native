import { ENTRY_FILE } from './generate-entry.mjs'

// Until nuxt-native is published to npm, generated projects depend on it
// straight from GitHub. Once it's published, this is the one line to change.
export const NUXT_NATIVE_DEPENDENCY_SPEC = 'github:vastx-tech/nuxt-native'

export function packageJson(appName) {
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
        'nuxt-native': NUXT_NATIVE_DEPENDENCY_SPEC,
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
        typescript: '~5.8.0'
      }
    },
    null,
    2
  )}\n`
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
        '.nuxt-native/**/*.vue'
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
  <NPage title="Home">
    <StackLayout style="padding: 20">
      <Label :text="\`Running on \${device.os} \${device.osVersion}\`" />
      <Button text="Go to details" style="margin-top: 20" @tap="openDetails" />
    </StackLayout>
  </NPage>
</template>

<script setup lang="ts">
// Explicit imports, not auto-import: the Nuxt module's addImportsDir()
// covers editor DX and vue-tsc, but the native webpack build never goes
// through Nuxt's auto-import codegen at all (see ARCHITECTURE.md — this
// is the one still-open gap a real device run surfaced). Until that's
// wired in, native pages need this explicit form.
import { useDevice } from 'nuxt-native/runtime/composables/useDevice.js'
import { useNativeRouter } from 'nuxt-native/runtime/composables/useNativeRouter.js'

const device = useDevice()
const { navigate } = useNativeRouter()

function openDetails() {
  navigate('details_id', { params: { id: '42' } })
}
</script>
`
}

export function detailsPage() {
  return `<template>
  <NPage title="Details">
    <StackLayout style="padding: 20">
      <Label :text="\`Item #\${id}\`" />
      <Button text="Back" style="margin-top: 20" @tap="back" />
    </StackLayout>
  </NPage>
</template>

<script setup lang="ts">
import { useNativeRouter } from 'nuxt-native/runtime/composables/useNativeRouter.js'

const props = defineProps<{ id?: string }>()
const id = props.id ?? 'unknown'
const { back } = useNativeRouter()
</script>
`
}
