import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { appCss, postcssConfig, tailwindConfig } from './scaffold-templates.mjs'

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
 */
export function ensureTailwindSetup(projectRoot) {
  writeIfMissing(join(projectRoot, 'tailwind.config.cjs'), tailwindConfig())
  writeIfMissing(join(projectRoot, 'postcss.config.cjs'), postcssConfig())
  writeIfMissing(join(projectRoot, 'app/app.css'), appCss())
}

function writeIfMissing(path, contents) {
  if (existsSync(path)) return
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}
