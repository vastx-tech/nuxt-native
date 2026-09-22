import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createCanvas, drawNGlyph, encodePng, fillCircle } from './png.mjs'

// A deep indigo, deliberately distinct from Nuxt's own brand green (this is
// a third-party framework, not an official Nuxt project) and from
// NativeScript's default template blue/white — so a fresh install reads as
// "Nuxt Native," not as either of the frameworks it's built from.
const BRAND_BACKGROUND = [49, 46, 129, 255] // indigo-900
const BRAND_FOREGROUND = [255, 255, 255, 255]

// Exact pixel dimensions of the files `ns platform add` generates from
// NativeScript's own project template (@nativescript/template-hello-world-ts)
// — read directly from that template's PNG headers so these replacements
// don't shift layout or blur at any density/scale NativeScript itself uses.
const ANDROID_BACKGROUND_SIZES = {
  ldpi: [270, 444],
  mdpi: [360, 592],
  hdpi: [540, 888],
  xhdpi: [720, 1184],
  xxhdpi: [1080, 1776],
  xxxhdpi: [1440, 2368]
}

const ANDROID_LOGO_SIZES = {
  ldpi: [150, 29],
  mdpi: [200, 39],
  hdpi: [300, 58],
  xhdpi: [400, 78],
  xxhdpi: [600, 117],
  xxxhdpi: [800, 156]
}

const IOS_BACKGROUND_SIZES = {
  'LaunchScreen-AspectFill.png': [768, 1024],
  'LaunchScreen-AspectFill@2x.png': [1536, 2048],
  'LaunchScreen-AspectFill@3x.png': [2304, 3072]
}

const IOS_LOGO_SIZES = {
  'LaunchScreen-Center.png': [390, 74],
  'LaunchScreen-Center@2x.png': [780, 148],
  'LaunchScreen-Center@3x.png': [1170, 222]
}

/**
 * Overwrites just the splash-screen images inside an already-scaffolded
 * App_Resources (from `ns platform add`) with nuxt-native's own branding,
 * instead of NativeScript's default wordmark-on-white. Everything else in
 * App_Resources (manifests, icons, Info.plist, Gradle files, ...) is left
 * untouched — deliberately narrow, matching the same reasoning as not
 * hand-generating App_Resources itself: only touch the specific files this
 * needs to, and let NativeScript's own template keep owning the rest.
 *
 * Only brands the platforms actually passed — `ns platform add` populates
 * Android/iOS as separate subtrees of the same App_Resources, so branding
 * a platform that was never added would just create a stray, orphaned
 * directory tree for it.
 */
export function applySplashBranding(appResourcesPath, platforms) {
  if (platforms.includes('android')) {
    const androidRes = join(appResourcesPath, 'Android/src/main/res')
    for (const [density, [width, height]] of Object.entries(ANDROID_BACKGROUND_SIZES)) {
      writePng(join(androidRes, `drawable-${density}/background.png`), renderBackground(width, height))
    }
    for (const [density, [width, height]] of Object.entries(ANDROID_LOGO_SIZES)) {
      writePng(join(androidRes, `drawable-${density}/logo.png`), renderLogoBadge(width, height))
    }
  }

  if (platforms.includes('ios')) {
    const iosImageAssets = join(appResourcesPath, 'iOS/Assets.xcassets')
    for (const [filename, [width, height]] of Object.entries(IOS_BACKGROUND_SIZES)) {
      writePng(join(iosImageAssets, 'LaunchScreen.AspectFill.imageset', filename), renderBackground(width, height))
    }
    for (const [filename, [width, height]] of Object.entries(IOS_LOGO_SIZES)) {
      writePng(join(iosImageAssets, 'LaunchScreen.Center.imageset', filename), renderLogoBadge(width, height))
    }
  }
}

function renderBackground(width, height) {
  return encodePng(width, height, createCanvas(width, height, BRAND_BACKGROUND))
}

/** A centered circular badge with a simple "N" mark, on transparent — the
 * logo layer sits on top of the (opaque) background layer in both
 * NativeScript's Android layer-list and its iOS storyboard. */
function renderLogoBadge(width, height) {
  const buf = createCanvas(width, height, [0, 0, 0, 0])
  const cx = width / 2
  const cy = height / 2
  const diameter = height * 0.9
  fillCircle(buf, width, height, cx, cy, diameter / 2, BRAND_FOREGROUND)

  const glyphHeight = diameter * 0.5
  const glyphWidth = glyphHeight * 0.72
  drawNGlyph(
    buf,
    width,
    height,
    { x: cx - glyphWidth / 2, y: cy - glyphHeight / 2, width: glyphWidth, height: glyphHeight },
    BRAND_BACKGROUND
  )

  return encodePng(width, height, buf)
}

function writePng(path, pngBuffer) {
  if (!existsSync(dirname(path))) {
    // The imageset/drawable-* directory should already exist from `ns
    // platform add`; only create it if this runs against an App_Resources
    // laid out differently than expected, rather than silently no-op-ing.
    mkdirSync(dirname(path), { recursive: true })
  }
  writeFileSync(path, pngBuffer)
}
