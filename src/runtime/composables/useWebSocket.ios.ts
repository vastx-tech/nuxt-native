import { onUnmounted, ref, type Ref } from 'vue'

/**
 * iOS has a real first-party WebSocket API since iOS 13 —
 * NSURLSessionWebSocketTask — needing no extra dependency the way
 * Android's OkHttp does (see useWebSocket.android.ts). Interop syntax
 * (Objective-C selectors map to camelCase methods with one positional
 * argument per `:` in the selector, e.g. `initWithString:` ->
 * `.initWithString(text)`) follows NativeScript's standard, documented
 * ObjC bridging convention.
 *
 * UNVERIFIED: this project has no Xcode/macOS access at all (confirmed
 * throughout this whole framework's development), so unlike
 * useWebSocket.android.ts — which was checked against real, working
 * NativeScript interop patterns actually used in @nativescript/core's own
 * source — this file has not been compiled or run. It's a genuine,
 * best-effort implementation against Apple's documented API, not a stub,
 * but treat it as unconfirmed until someone with iOS tooling verifies it,
 * same as every other iOS code path in this framework.
 *
 * Import this WITHOUT a `.js` suffix — see useWebSocket.android.ts's own
 * doc comment for exactly why (confirmed via a real webpack compile).
 */

export interface UseWebSocketOptions {
  onOpen?: () => void
  onMessage?: (data: string) => void
  onClose?: (code: number, reason: string) => void
  onError?: (message: string) => void
}

export interface WebSocketHandle {
  connected: Ref<boolean>
  lastMessage: Ref<string | null>
  send: (data: string) => void
  close: (code?: number, reason?: string) => void
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}): WebSocketHandle {
  const connected = ref(false)
  const lastMessage = ref<string | null>(null)

  const nsUrl = NSURL.URLWithString(url)
  const session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
    NSURLSessionConfiguration.defaultSessionConfiguration,
    NSURLSessionWebSocketDelegateImpl.new().initWithCallbacks(
      () => {
        connected.value = true
        options.onOpen?.()
      },
      (code: number, reason: string) => {
        connected.value = false
        options.onClose?.(code, reason)
      }
    ),
    null
  )

  const task = session.webSocketTaskWithURL(nsUrl)

  function receiveLoop() {
    task.receiveMessageWithCompletionHandler((message: any, error: NSError | null) => {
      if (error) {
        connected.value = false
        options.onError?.(error.localizedDescription)
        return
      }
      if (message?.string) {
        lastMessage.value = message.string
        options.onMessage?.(message.string)
      }
      receiveLoop()
    })
  }

  task.resume()
  receiveLoop()

  function send(data: string) {
    const message = NSURLSessionWebSocketMessage.alloc().initWithString(data)
    task.sendMessageCompletionHandler(message, (error: NSError | null) => {
      if (error) options.onError?.(error.localizedDescription)
    })
  }

  function close(code = 1000, reason = 'closed by client') {
    const reasonData = NSString.stringWithString(reason).dataUsingEncoding(NSUTF8StringEncoding)
    task.cancelWithCloseCodeReason(code, reasonData)
  }

  onUnmounted(() => close())

  return { connected, lastMessage, send, close }
}

/**
 * NSURLSessionWebSocketDelegate as a NativeScript-extended native class —
 * same `.extend({...})` class-extension pattern as the Android side, just
 * with `interfaces: [...]` since this is an Objective-C protocol
 * (NativeScript's documented convention for implementing a protocol from
 * JS, mirroring the interfaces: [...] usage confirmed in
 * @nativescript/core's own AttachListener example).
 */
const NSURLSessionWebSocketDelegateImpl = (NSObject as any).extend(
  {
    onOpenCallback: null as (() => void) | null,
    onCloseCallback: null as ((code: number, reason: string) => void) | null,
    initWithCallbacks(onOpen: () => void, onClose: (code: number, reason: string) => void) {
      this.onOpenCallback = onOpen
      this.onCloseCallback = onClose
      return this
    },
    URLSessionWebSocketTaskDidOpenWithProtocol(_session: any, _task: any, _protocol: string) {
      this.onOpenCallback?.()
    },
    URLSessionWebSocketTaskDidCloseWithCodeReason(_session: any, _task: any, code: number, reason: any) {
      const reasonString = reason ? NSString.alloc().initWithDataEncoding(reason, NSUTF8StringEncoding).toString() : ''
      this.onCloseCallback?.(code, reasonString)
    }
  },
  { interfaces: [(NSURLSessionWebSocketDelegate as any)] }
)
