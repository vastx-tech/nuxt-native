import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { appCss, postcssConfig, tailwindConfig } from './scaffold-templates.mjs'
import { run } from './run.mjs'

/**
 * Writes tailwind.config.cjs/postcss.config.cjs/app/app.css if a project
 * doesn't have them yet — same "ensure" pattern as
 * ensureNativeScriptConfig()/ensureWebpackConfig(), and for the same
 * reason: `create` writing these once at scaffold time only covers
 * brand-new projects. A project created before this feature existed (or
 * one that only ran `init` against an existing Nuxt app, which never goes
 * through `create`'s scaffold step at all) would otherwise have no way to
 * pick it up short of hand-authoring all three files — `nuxt-native init`
 * is supposed to be the safe, idempotent command that brings a project up
 * to date, so this belongs here, not just in `create`.
 *
 * Each file is independent and only written if missing, so re-running
 * this never clobbers a project's own Tailwind customizations.
 *
 * `create` also declares tailwindcss/postcss in the fresh package.json it
 * generates and runs `npm install` once, so they're always present there.
 * `init` alone has neither — it's meant to work against a project whose
 * package.json it never touches (see the README's "adding to an existing
 * project" flow) — so postcss.config.cjs's `require('tailwindcss')` would
 * otherwise throw `Cannot find module 'tailwindcss'` the moment `ns run`/
 * `ns build` first processes app.css. Reproduced by a real user retrofitting
 * an existing project via `init` alone. Fixed the same way `create` avoids
 * it: install both here too, but only if they're not already resolvable
 * from the project (so this is a no-op, not a redundant install, for any
 * project that already has them — including everything `create` scaffolds).
 */
export async function ensureTailwindSetup(projectRoot) {
  writeIfMissing(join(projectRoot, 'tailwind.config.cjs'), tailwindConfig())
  writeIfMissing(join(projectRoot, 'postcss.config.cjs'), postcssConfig())
  writeIfMissing(join(projectRoot, 'app/app.css'), appCss())

  if (!isResolvable('tailwindcss', projectRoot)) {
    console.log('[nuxt-native] Installing tailwindcss/postcss (not found in this project) ...')
    await run('npm', ['install', '--save-dev', 'tailwindcss@^3.4.19', 'postcss@^8.5.28'], { cwd: projectRoot })
  }
}

function isResolvable(specifier, projectRoot) {
  try {
    createRequire(join(projectRoot, 'package.json')).resolve(specifier)
    return true
  } catch {
    return false
  }
}

function writeIfMissing(path, contents) {
  if (existsSync(path)) return
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}
