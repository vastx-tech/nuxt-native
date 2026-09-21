import { readdirSync, statSync } from 'node:fs'
import { join, relative, extname, basename } from 'node:path'

/**
 * File-based route scanner for the CLI's standalone entry-generation step
 * (init/dev/build run outside Nuxt's dev server, so `pages:extend` isn't
 * available — this mirrors the same conventions as
 * src/build/generate-routes.ts, which runs *inside* Nuxt for type-checking
 * and editor DX). Supports the common subset of Nuxt's file-based routing:
 *   pages/index.vue         -> "/"            name: "index"
 *   pages/details.vue       -> "/details"      name: "details"
 *   pages/details/[id].vue  -> "/details/:id"  name: "details_id"
 *   pages/[...slug].vue     -> "/:slug*"       name: "slug"
 */
export function scanPages(pagesDir) {
  const files = walk(pagesDir)
  return files.map(file => toRoute(pagesDir, file))
}

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) results.push(...walk(full))
    else if (extname(full) === '.vue') results.push(full)
  }
  return results
}

function toRoute(pagesDir, file) {
  const rel = relative(pagesDir, file).replace(/\\/g, '/').replace(/\.vue$/, '')
  const segments = rel.split('/').filter(segment => segment !== 'index')

  const pathSegments = segments.map((segment) => {
    const catchAll = segment.match(/^\[\.\.\.(.+)\]$/)
    if (catchAll) return `:${catchAll[1]}*`

    const dynamic = segment.match(/^\[(.+)\]$/)
    if (dynamic) return `:${dynamic[1]}`

    return segment
  })

  // pathSegments.join('/') is '' for the root page, so this is always "/..."
  // at minimum — never empty — hence no `|| '/'` fallback needed.
  const path = `/${pathSegments.join('/')}`
  const name = rel === 'index'
    ? 'index'
    : rel.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || basename(file, '.vue')

  const params = [...path.matchAll(/:(\w+)\*?/g)].map(match => match[1])

  // Forward-slash even on Windows: `file` ends up inside a generated
  // `import(...)` specifier (see generate-entry.mjs), and Nuxt's own page
  // scanner (which src/build/generate-routes.ts reads from) normalizes
  // `page.file` the same way — keeping both generators' output identical
  // matters more than preserving the OS-native separator here.
  return { name, path, file: file.replace(/\\/g, '/'), params }
}
