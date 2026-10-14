import type { Ref } from 'vue';
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
export declare function useStorage<T>(key: string, defaultValue: T): Ref<T>;
