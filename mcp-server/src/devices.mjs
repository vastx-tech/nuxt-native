import { spawn } from 'node:child_process'

/**
 * Plain-JS port of vscode-extension/src/devices.ts's listDevices() — same
 * verified mechanism (`ns device --json`, confirmed against NativeScript
 * CLI's own ListDevicesCommand source), duplicated rather than imported
 * across packages since vscode-extension is compiled TypeScript with its
 * own build step and this package intentionally has none.
 */
export function listDevices(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['--yes', 'nativescript', 'device', '--json'], {
      cwd,
      shell: process.platform === 'win32'
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`ns device --json exited with code ${code}: ${stderr}`))
        return
      }
      try {
        const parsed = JSON.parse(stdout)
        resolve(parsed.devices ?? [])
      } catch (error) {
        reject(new Error(`Could not parse \`ns device --json\` output: ${error.message}`))
      }
    })
  })
}
