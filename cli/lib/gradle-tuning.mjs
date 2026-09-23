import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { totalmem } from 'node:os'
import { join } from 'node:path'

const MARKER = '# nuxt-native: memory settings tuned for this machine'

/**
 * @nativescript/android's own scaffolded `platforms/android/gradle.properties`
 * ships `org.gradle.jvmargs=-Xmx16384M` — a flat 16 GB Gradle daemon heap
 * ceiling, completely independent of the machine actually running the
 * build. Reproduced directly: a real user's build was consuming excessive
 * memory, traced to this exact line, on a machine with 5.74 GB of *total*
 * RAM — a heap ceiling triple the entire machine's physical memory. That
 * kind of oversized `-Xmx` doesn't just waste memory when idle; under
 * real build load the daemon grows toward it, and severe memory pressure
 * on a small machine plausibly explains other flaky behavior seen in the
 * same session (intermittent `CreateProcess` failures spawning gradlew.bat,
 * which Windows can produce under low-memory conditions).
 *
 * Confirmed this file is safe to patch once and leave alone: it's copied
 * into `platforms/<platform>/` only during `ns platform add`'s one-time
 * scaffold (no reference to it anywhere in the `nativescript` CLI's own
 * prepare/build code path — only `@nativescript/android`'s own postinstall
 * template copy), not regenerated on every `prepare`/`build`. So this runs
 * once, right after `platform add`, and is idempotent via a marker comment
 * — it never re-tunes a value a user has since customized themselves.
 *
 * The replacement heap size is computed as a fraction of the machine's
 * total* memory (stable across runs, unlike free memory), clamped to a
 * range that's been the Gradle/AGP community's long-standing recommendation
 * for small-to-medium Android projects regardless of how much RAM the
 * machine actually has — there's no real benefit to a NativeScript app's
 * build ever exceeding ~3 GB of Gradle daemon heap, and 768 MB is the
 * floor below which Gradle itself tends to struggle on real projects.
 */
export function ensureGradleMemorySettings(platformsPath, platforms) {
  for (const platform of platforms) {
    if (platform !== 'android') continue // no equivalent oversized default confirmed on iOS

    const propsPath = join(platformsPath, 'android', 'gradle.properties')
    if (!existsSync(propsPath)) continue

    const content = readFileSync(propsPath, 'utf8')
    if (content.includes(MARKER)) continue

    const heapMb = computeHeapSizeMb()
    const kotlinHeapMb = Math.max(384, Math.round(heapMb / 2))

    let updated = content.replace(
      /^org\.gradle\.jvmargs\s*=.*$/m,
      `org.gradle.jvmargs=-Xmx${heapMb}M`
    )
    if (!/^org\.gradle\.jvmargs\s*=/m.test(updated)) {
      updated += `\norg.gradle.jvmargs=-Xmx${heapMb}M\n`
    }
    if (!/^org\.gradle\.workers\.max\s*=/m.test(updated)) {
      updated += `org.gradle.workers.max=2\n`
    }
    if (!/^kotlin\.daemon\.jvmargs\s*=/m.test(updated)) {
      updated += `kotlin.daemon.jvmargs=-Xmx${kotlinHeapMb}M\n`
    }
    updated += `\n${MARKER} (${heapMb}M, based on ${Math.round(totalmem() / 1024 / 1024)}M total RAM)\n`

    writeFileSync(propsPath, updated)
  }
}

function computeHeapSizeMb() {
  const totalMb = totalmem() / 1024 / 1024
  const fraction = Math.floor(totalMb * 0.35)
  return Math.min(3072, Math.max(768, fraction))
}
