import type { IconifyJSON } from '@iconify/types';
export interface ResolveIconSvgOptions {
    /**
     * Replaces `currentColor` in the icon body with this value. Most
     * Iconify sets (confirmed directly in real icon data, e.g. Lucide)
     * use `currentColor` so the icon inherits a CSS `color` on the web —
     * there's no CSS cascade here to resolve that against, so it's
     * swapped for a real color explicitly instead of left unresolved.
     */
    color?: string;
    width?: number;
    height?: number;
}
/**
 * Turns an Iconify icon (looked up from an already-imported icon-set
 * JSON — `import iconSet from '@iconify-json/lucide/icons.json'`, a
 * plain JSON import webpack bundles like any other) into real `<svg>`
 * markup usable as `<NSvg>`'s `src`.
 *
 * Deliberately takes the icon set as a parameter instead of resolving
 * `@iconify-json/<prefix>` by string internally: which set(s) an app
 * installs is its own choice, and a plain static `import` lets webpack
 * bundle only the sets actually used — a dynamic `import()`/`require()`
 * by name would need to be async (icon-set JSON isn't known until
 * runtime) and would bundle every installed set regardless of use.
 *
 * `getIconData`/`iconToSVG` are confirmed real exports of `@iconify/utils`
 * (checked directly against its published dist) — `getIconData` resolves
 * aliases/rotation within the set, `iconToSVG` produces the real
 * `{ attributes: { width?, height?, viewBox }, body }` shape framework
 * integrations (e.g. `@iconify/vue`) build their own `<svg>` wrapper
 * from; `xmlns` isn't part of that output and is added here, the same
 * way those integrations add it themselves.
 */
export declare function resolveIconSvg(iconSet: IconifyJSON, name: string, options?: ResolveIconSvgOptions): string;
