import { join } from 'node:path'
import { ensureMarkedBlock } from './marked-block.mjs'

/**
 * Adds OkHttp as a real Gradle dependency via App_Resources/Android/
 * app.gradle — the same real, sanctioned `apply from:` include used for
 * version management (see app-version.mjs). Needed because, confirmed by
 * reading @nativescript/core's own Android HTTP implementation directly
 * (http/http-request-internal/index.android.js), it uses NativeScript's
 * own org.nativescript.widgets.Async.Http.MakeRequest, not OkHttp — so
 * OkHttp isn't guaranteed to be on the classpath just from depending on
 * @nativescript/core. No maintained NativeScript WebSocket plugin exists
 * on npm either (checked directly), so src/runtime/composables/
 * useWebSocket.android.ts talks to OkHttp's real, stable WebSocket API
 * directly via NativeScript's Java interop — this just makes sure the
 * class is actually there to interop with.
 *
 * Pinned to 4.12.0, not the newer 5.x line: confirmed via a real Gradle
 * build failure that OkHttp 5.x split the `okhttp-android` artifact out
 * as a dependency of the main `okhttp` artifact, and that split module's
 * AAR metadata requires `compileSdk` 37+ (a "checkDebugAarMetadata"
 * failure). NativeScript's own Android runtime here defaults compileSdk
 * to 35 (App_Resources/Android's `NS_DEFAULT_COMPILE_SDK_VERSION`,
 * confirmed directly in a real project's platforms/android/gradle.
 * properties) — bumping that just to satisfy one dependency isn't
 * something this framework should force on every project, so this stays
 * on the last pre-split 4.x major instead, which has no such requirement.
 */
export function ensureWebSocketDependency(projectRoot) {
  const path = join(projectRoot, 'App_Resources', 'Android', 'app.gradle')
  ensureMarkedBlock(path, 'websocket support (OkHttp)', `
dependencies {
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
}
`)
}
