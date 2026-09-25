import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  appVue,
  gitignore,
  indexPage,
  nuxtConfig,
  packageJson,
  tsconfig
} from '../lib/scaffold-templates.mjs'
import { run } from '../lib/run.mjs'
import { init } from './init.mjs'

/**
 * The one-command "ready to run on device" path: scaffolds a new Nuxt +
 * Nuxt Native project, installs its dependencies, and wires up the native
 * platforms — everything `nuxt-native init` does, plus the project itself.
 *
 * There is no npm lifecycle hook that safely does this from `npm install
 * nuxt-native` alone: a package writing files into a consumer's project as
 * an install side effect is exactly the postinstall-script pattern the npm
 * ecosystem (and CI systems that run with --ignore-scripts) treats as a red
 * flag. A `create` command that the user explicitly invokes is the same
 * pattern `create-react-app`/`create-expo-app`/`create-vite` use for the
 * same reason.
 */
export async function create(name, { appId, platforms } = {}) {
  if (!name) {
    throw new Error('[nuxt-native] Usage: nuxt-native create <project-name> [--app-id com.example.app] [--platforms ios,android]')
  }

  const targetDir = resolve(process.cwd(), name)
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    throw new Error(`[nuxt-native] ${targetDir} already exists and is not empty.`)
  }

  const resolvedAppId = appId ?? `com.example.${name.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'app'}`
  const resolvedPlatforms = platforms?.length ? platforms : ['ios', 'android']

  console.log(`[nuxt-native] Scaffolding ${name}/ ...`)
  scaffold(targetDir, { appId: resolvedAppId, appName: name })

  console.log('[nuxt-native] Installing dependencies (this pulls Nuxt, nuxt-native, and NativeScript) ...')
  await run('npm', ['install'], { cwd: targetDir })

  // init() operates on process.cwd() (it reads nuxt.config.ts and shells to
  // `ns` relative to it) — switch into the new project the same way a user
  // would `cd` into it before running `nuxt-native init` themselves.
  process.chdir(targetDir)
  await init({ platforms: resolvedPlatforms })

  console.log(`
[nuxt-native] ${name} is ready. Next:
  cd ${name}
  npx nuxt-native dev ${resolvedPlatforms[0]}
`)
}

function scaffold(targetDir, { appId, appName }) {
  mkdirSync(resolve(targetDir, 'app/pages'), { recursive: true })

  writeFileSync(resolve(targetDir, 'package.json'), packageJson(appName))
  writeFileSync(resolve(targetDir, 'nuxt.config.ts'), nuxtConfig(appId, appName))
  writeFileSync(resolve(targetDir, 'tsconfig.json'), tsconfig())
  writeFileSync(resolve(targetDir, '.gitignore'), gitignore())
  writeFileSync(resolve(targetDir, 'app/app.vue'), appVue())
  // tailwind.config.cjs/postcss.config.cjs/app/app.css are written by
  // ensureTailwindSetup() inside init(), which create() calls below —
  // one place for both create's fresh-scaffold path and init's
  // retrofit-an-existing-project path, instead of duplicating this here.
  writeFileSync(resolve(targetDir, 'app/pages/index.vue'), indexPage())
}
