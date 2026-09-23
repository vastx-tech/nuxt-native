import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `@nativescript/android`'s own scaffolded `AndroidManifest.xml` (written
 * fresh on every `ns platform add`, same file the launcher-icon fallback
 * and app-version rows in ARCHITECTURE.md already document as
 * regenerated/not-directly-editable) includes a legacy `package="..."`
 * attribute on the root `<manifest>` element. Newer Android Gradle Plugin
 * versions don't just warn about this (the "value is ignored" message
 * this framework's earlier work already saw) — on at least AGP's version
 * here, it's a hard `processDebugMainManifest` build failure:
 * "Incorrect package=... found in source AndroidManifest.xml ... no
 * longer supported". Reproduced identically on two separate real
 * projects scaffolded from scratch, not a one-off.
 *
 * Confirmed safe to just remove: `platforms/android/app/build.gradle`
 * (also `@nativescript/android`'s own generated file, via its
 * `setAppIdentifier()`/`computeNamespace()`) already sets
 * `android.defaultConfig.applicationId` and `android.namespace`
 * independently — the manifest's own `package` attribute was always
 * redundant with those, not the actual source of truth AGP uses today.
 *
 * Same timing/idempotency shape as `ensureGradleMemorySettings`: runs
 * once right after `ns platform add` (this file is scaffolded fresh only
 * then, never touched again by `ns prepare`/`build`), and is naturally
 * idempotent — if the attribute is already gone, this is a no-op.
 */
export function ensureManifestNamespaceFix(platformsPath, platforms) {
  for (const platform of platforms) {
    if (platform !== 'android') continue // no equivalent issue confirmed on iOS

    const manifestPath = join(platformsPath, 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
    if (!existsSync(manifestPath)) continue

    const content = readFileSync(manifestPath, 'utf8')
    const updated = content.replace(/\s*package="[^"]*"/, '')
    if (updated === content) continue

    writeFileSync(manifestPath, updated)
  }
}
