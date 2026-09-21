import { spawn } from 'node:child_process'

/**
 * Runs a CLI command with inherited stdio (so device logs / build output
 * stream straight to the user's terminal) and resolves/rejects on exit.
 */
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}
