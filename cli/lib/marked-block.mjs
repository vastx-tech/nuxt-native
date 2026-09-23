import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Idempotently writes a marker-delimited block into a file nuxt-native
 * shares with a project's own hand-authored content (App_Resources/
 * Android/app.gradle, currently the only real user of this) — reruns
 * replace only nuxt-native's own section between the markers, never
 * anything else the file has. If the file doesn't have this marker yet
 * (a fresh file, or a project's own pre-existing app.gradle nuxt-native
 * has never touched), the block is appended rather than assumed to own
 * the whole file.
 *
 * Originally written inline in cli/lib/app-version.mjs; factored out once
 * cli/lib/websocket-setup.mjs needed the exact same "coexist with another
 * managed block, and with the project's own content, in the same file"
 * behavior — confirmed safe for multiple independent callers to use on
 * the same file, since each only looks for and touches its own marker
 * name.
 */
export function ensureMarkedBlock(path, marker, block) {
  const startMarker = `// nuxt-native: ${marker} — see nuxt-native's docs`
  const endMarker = `// nuxt-native: end ${marker}`
  const fullBlock = `${startMarker}\n${block.trim()}\n${endMarker}\n`

  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, fullBlock)
    return
  }

  const content = readFileSync(path, 'utf8')
  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)
  if (startIdx !== -1 && endIdx !== -1) {
    const before = content.slice(0, startIdx)
    const after = content.slice(endIdx + endMarker.length)
    writeFileSync(path, before + fullBlock.trimEnd() + after)
  } else {
    writeFileSync(path, content.trimEnd() + '\n\n' + fullBlock)
  }
}
