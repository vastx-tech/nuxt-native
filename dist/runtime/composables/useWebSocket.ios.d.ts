import { type Ref } from 'vue';
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
    onOpen?: () => void;
    onMessage?: (data: string) => void;
    onClose?: (code: number, reason: string) => void;
    onError?: (message: string) => void;
}
export interface WebSocketHandle {
    connected: Ref<boolean>;
    lastMessage: Ref<string | null>;
    send: (data: string) => void;
    close: (code?: number, reason?: string) => void;
}
export declare function useWebSocket(url: string, options?: UseWebSocketOptions): WebSocketHandle;
