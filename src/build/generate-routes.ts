import type { NuxtPage } from '@nuxt/schema'

export interface NativeRouteEntry {
  /** Route name, used as the navigation target passed to useNativeRouter().navigate() */
  name: string
  /** Nuxt-style path, e.g. "/details/:id" */
  path: string
  /** Absolute filesystem path to the page's .vue component */
  file: string
  /** Dynamic segment names extracted from `path` */
  params: string[]
}

/**
 * Flattens Nuxt's nested page tree (from the `pages:extend` hook) into a
 * single list of routes the NativeScript Frame-based router can navigate
 * between. Nuxt's own vue-router instance is not used at runtime — there is
 * no DOM history to drive — this manifest is the native replacement.
 */
export function generateRouteManifest(pages: NuxtPage[], parentPath = ''): NativeRouteEntry[] {
  const routes: NativeRouteEntry[] = []

  for (const page of pages) {
    if (!page.file) continue

    const path = joinRoutePath(parentPath, page.path)
    // Deliberately ignore Nuxt's own `page.name` (kebab-case, e.g.
    // "details-id") in favor of deriving the name from `path` ourselves:
    // cli/lib/scan-pages.mjs runs standalone, outside Nuxt's pages module,
    // and needs to produce the *same* route name for the *same* page
    // without access to Nuxt's naming. Both derive it from the path/file
    // segments using the same underscore-joining rule so `navigate('name')`
    // resolves the same route whichever generator produced the manifest.
    const name = routeNameFromPath(path)
    const params = [...path.matchAll(/:(\w+)/g)].map(match => match[1])

    routes.push({ name, path, file: page.file, params })

    if (page.children?.length) {
      routes.push(...generateRouteManifest(page.children, path))
    }
  }

  return routes
}

/** Renders the manifest as an ES module. Each entry keeps its component as a
 * dynamic `import()` so bundlers (Vite for typechecking, NativeScript's
 * webpack for the device bundle) code-split per route instead of eagerly
 * loading every page. */
export function renderRouteManifestModule(routes: NativeRouteEntry[]): string {
  const entries = routes.map(route => [
    '  {',
    `    name: ${JSON.stringify(route.name)},`,
    `    path: ${JSON.stringify(route.path)},`,
    `    params: ${JSON.stringify(route.params)},`,
    `    component: () => import(${JSON.stringify(route.file)})`,
    '  }'
  ].join('\n'))

  return `export const routes = [\n${entries.join(',\n')}\n]\n`
}

function joinRoutePath(parent: string, child: string) {
  const joined = `${parent}/${child}`.replace(/\/+/g, '/').replace(/\/$/, '')
  return joined || '/'
}

function routeNameFromPath(path: string) {
  // Nuxt 4's page.path renders dynamic segments as ":id()" (parens marking
  // "required"), not just ":id" — the trailing "()" is punctuation this
  // function otherwise turns into a trailing "_", so it must be stripped
  // the same way cli/lib/scan-pages.mjs strips the trailing "_" left by a
  // file segment's closing "]" in "[id].vue". Keeping both stripping rules
  // identical is what keeps the two independent generators agreeing on a
  // route's name.
  const slug = path
    .replace(/^\/|\/$/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_|_$/g, '')
  return slug || 'index'
}
