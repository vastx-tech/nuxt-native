import { spawn } from 'node:child_process'

/**
 * A connected device or running emulator/simulator, as reported by the
 * real `ns device --json` (confirmed by reading NativeScript CLI's
 * ListDevicesCommand source directly — it's a genuine, documented `--json`
 * flag, not something inferred from parsing the human-readable table).
 */
export interface NativeDevice {
  identifier: string
  displayName: string
  platform: string
  type: string
  status: string
}

/** No `vscode` import here on purpose — this is plain Node.js child-process
 * + JSON parsing, testable without loading the VS Code extension host at
 * all (verified directly against a real `ns device --json` run). */
export function listDevices(cwd: string): Promise<NativeDevice[]> {
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
        const parsed = JSON.parse(stdout) as { devices: NativeDevice[] }
        resolve(parsed.devices ?? [])
      } catch (error) {
        reject(new Error(`Could not parse \`ns device --json\` output: ${(error as Error).message}`))
      }
    })
  })
}
