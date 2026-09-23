/**
 * OkHttp has no npm type definitions (it's a Java library, not a JS/TS
 * one) — @nativescript/types only covers the Android SDK itself, not
 * third-party Java libraries added via Gradle (see
 * cli/lib/websocket-setup.mjs for why useWebSocket.android.ts needs it as
 * a real dependency in the first place). This is a minimal ambient
 * declaration covering only the classes/methods useWebSocket.android.ts
 * actually calls — real, current OkHttp 5.x method signatures (confirmed
 * against OkHttp's own long-stable, documented WebSocket API), not a
 * generated or exhaustive binding.
 */
declare namespace okhttp3 {
  class OkHttpClient {
    static Builder: new () => {
      build(): OkHttpClient
    }
    newWebSocket(request: Request, listener: WebSocketListener): WebSocket
    dispatcher(): { executorService(): { shutdown(): void } }
  }

  class Request {
    static Builder: new () => {
      url(url: string): { build(): Request }
    }
  }

  class WebSocket {
    send(text: string): boolean
    close(code: number, reason: string | null): boolean
  }

  class Response {}

  abstract class WebSocketListener {
    static extend(methods: Record<string, unknown>): new () => WebSocketListener
  }
}
