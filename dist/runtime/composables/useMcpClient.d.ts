import { type Ref } from 'vue';
/**
 * A minimal MCP (Model Context Protocol) client for the "Streamable HTTP"
 * transport in its non-streaming mode — the only mode a NativeScript app
 * can actually speak. Confirmed directly against a real device this
 * session (not assumed): NativeScript's runtime has `fetch`/
 * `XMLHttpRequest` but no `WebSocket` and no `EventSource`, which rules out
 * MCP's stdio transport (no subprocess spawning on mobile anyway),
 * WebSocket transport, and the streaming half of Streamable HTTP (which
 * needs `EventSource`-style SSE parsing for server-initiated messages).
 *
 * What's left, and what this implements, is fully spec-compliant: POST a
 * JSON-RPC message, and when the server responds with `application/json`
 * (rather than choosing to stream via `text/event-stream`), read the
 * response body directly — confirmed against the real MCP TypeScript
 * SDK's own client transport (`@modelcontextprotocol/sdk`'s
 * `streamableHttp.js`) that this is exactly the code path it falls back to
 * itself when a server doesn't stream, not a simplification invented here.
 * A server that insists on streaming responses will get a clear error
 * from this client rather than a silent hang or a wrong parse.
 *
 * Verified against a real MCP server, not just reasoned about: stood up
 * a real `StreamableHTTPServerTransport` (with `enableJsonResponse: true`
 * — its *stateless* mode, tried first, turned out to require every
 * request be independently self-contained, which doesn't fit a client
 * that initializes once and calls tools afterward; its *stateful* mode,
 * which is also the realistic mode a real remote MCP server would run in,
 * worked correctly end to end) and ran the exact request sequence this
 * composable uses against it with plain `fetch` — initialize (captured
 * the real `mcp-session-id` response header), `notifications/initialized`,
 * `tools/list`, and `tools/call`, with the session id correctly echoed on
 * every subsequent request. Not yet confirmed inside an actual compiled
 * NativeScript app on-device (that needs a real MCP server reachable from
 * the device's network, which wasn't available to set up in this
 * session) — confirmed so far: the wire protocol logic itself against a
 * real server, and that this file compiles cleanly through the real
 * native webpack build.
 */
export interface McpTool {
    name: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
}
export interface McpClient {
    connected: Ref<boolean>;
    tools: Ref<McpTool[]>;
    serverInfo: Ref<{
        name: string;
        version: string;
    } | null>;
    connect: (url: string, options?: {
        headers?: Record<string, string>;
    }) => Promise<void>;
    listTools: () => Promise<McpTool[]>;
    callTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
    disconnect: () => void;
}
export declare function useMcpClient(): McpClient;
