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
 */
export function ensureWebSocketDependency(projectRoot) {
  const path = join(projectRoot, 'App_Resources', 'Android', 'app.gradle')
  ensureMarkedBlock(path, 'websocket support (OkHttp)', `
dependencies {
    implementation 'com.squareup.okhttp3:okhttp:5.5.0'
}
`)
}
