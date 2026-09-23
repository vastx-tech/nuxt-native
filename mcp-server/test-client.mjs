// A real MCP client, driving the real server over the real stdio
// transport — not a mock. Usage: node test-client.mjs <absolute-project-path> [--full]
// (--full additionally exercises install_and_launch/read_logs, which need
// a real connected Android device and a build already produced).
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const client = new Client({ name: 'test-client', version: '0.0.1' })
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('./bin/server.mjs', import.meta.url))]
})

await client.connect(transport)

const { tools } = await client.listTools()
console.log('=== TOOLS REGISTERED ===')
console.log(tools.map((t) => t.name).join(', '))

const projectPath = process.argv[2]
console.log('\n=== CALLING doctor ===')
const doctorResult = await client.callTool({ name: 'doctor', arguments: { projectPath } })
console.log(doctorResult.content[0].text)

console.log('\n=== CALLING list_devices ===')
const devicesResult = await client.callTool({ name: 'list_devices', arguments: { projectPath } })
console.log(devicesResult.content[0].text)

if (process.argv[3] === '--full') {
  console.log('\n=== CALLING install_and_launch (needs a built APK + connected Android device) ===')
  const installResult = await client.callTool({ name: 'install_and_launch', arguments: { projectPath } })
  console.log(installResult.content[0].text)

  console.log('\n=== CALLING read_logs ===')
  const logsResult = await client.callTool({ name: 'read_logs', arguments: { lines: 100 } })
  console.log(logsResult.content[0].text.slice(0, 1000))
}

await client.close()
console.log('\n=== DONE, client closed cleanly ===')
