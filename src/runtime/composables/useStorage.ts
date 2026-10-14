import { effectScope, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { ApplicationSettings } from '@nativescript/core'

// One ref per key for the whole app, so every component using the same key
// sees the same value, and the persisting watcher lives for the app's
// lifetime rather than the first caller's (a detached scope: it isn't
// stopped when the component that created it unmounts).
const refs = new Map<string, Ref<unknown>>()
const scope = effectScope(true)

/**
 * A ref saved on the device, like VueUse's `useStorage` on the web —
 * there's no `localStorage` in a native app. Backed by NativeScript's
 * `ApplicationSettings` (SharedPreferences on Android, NSUserDefaults on
 * iOS), so it's for settings and small state, not large data sets.
 *
 *   const theme = useStorage('theme', 'system')
 *   const recent = useStorage<string[]>('recent-searches', [])
 *   recent.value.push('tokyo')   // deep changes are saved too
 *   recent.value = undefined     // removes the key; reads return the default again
 *
 * Values are stored as JSON, so use plain data (no class instances, Dates
 * become strings). A stored value that can't be parsed falls back to the
 * default. Keys are used as given, so a key another plugin also writes
 * with ApplicationSettings is shared with it.
 */
export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const existing = refs.get(key)
  if (existing) return existing as Ref<T>

  const state = ref(read(key, defaultValue)) as Ref<T>
  refs.set(key, state)

  let resetting = false
  scope.run(() => {
    watch(state, (value) => {
      if (resetting) {
        resetting = false
        return
      }
      if (value === undefined) {
        ApplicationSettings.remove(key)
        // Keep the ref usable: reading it again gives the default back,
        // without that reset being saved as a value of its own.
        if (defaultValue !== undefined) {
          resetting = true
          state.value = copy(defaultValue)
        }
      } else {
        ApplicationSettings.setString(key, JSON.stringify(value))
      }
    }, { deep: true })
  })

  return state
}

function read<T>(key: string, defaultValue: T): T {
  if (!ApplicationSettings.hasKey(key)) return copy(defaultValue)
  try {
    return JSON.parse(ApplicationSettings.getString(key)) as T
  } catch {
    return copy(defaultValue)
  }
}

// So mutating the ref never mutates the caller's default (e.g. a shared
// `[]` constant), which would also change what "reset" goes back to.
function copy<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value)) as T
}
