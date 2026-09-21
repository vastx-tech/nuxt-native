export interface NuxtNativeOptions {
  /**
   * Reverse-DNS application identifier, e.g. "com.acme.myapp".
   * Used when scaffolding the native iOS/Android projects.
   */
  appId: string
  /** Human-readable app name shown on the device home screen. */
  appName: string
  /** Native platforms this project targets. */
  platforms: Array<'ios' | 'android'>
  /**
   * Path (relative to the app's srcDir) to the root Vue component that
   * `nativescript-vue` mounts as the app's first Frame/Page.
   */
  entry: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    native?: Partial<NuxtNativeOptions>
  }
  interface NuxtOptions {
    native: NuxtNativeOptions
  }
}
