// A real MCP server over real HTTP (StreamableHTTPServerTransport, stateful
// — its stateless mode requires every request to be independently
// self-contained, which doesn't fit a client that initializes once and
// calls tools afterward — with enableJsonResponse: true so it answers
// application/json instead of streaming text/event-stream, the only mode
// src/runtime/composables/useMcpClient.ts actually supports). Useful for
// testing that composable locally: run this, then connect to
// http://<this-machine's-LAN-IP>:3939/mcp from a device on the same
// network (127.0.0.1 only works from this same machine).
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

const mcp = new McpServer({ name: 'test-server', version: '0.0.1' })
mcp.registerTool(
  'echo',
  { title: 'Echo', description: 'Echoes back the given text', inputSchema: { text: z.string() } },
  async ({ text }) => ({ content: [{ type: 'text', text: `echo: ${text}` }] })
)

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID(), enableJsonResponse: true })
await mcp.connect(transport)

const server = createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined
  await transport.handleRequest(req, res, body)
})

server.listen(3939, () => console.log('test MCP HTTP server on http://127.0.0.1:3939/mcp'))
