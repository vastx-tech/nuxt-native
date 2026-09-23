import { spawn } from 'node:child_process'

// Ambient, module-level capture buffer — null in normal CLI use, meaning
// run() inherits stdio exactly as before (real terminal, real live output).
// Set (via withCapturedOutput()) only by non-terminal consumers of these
// same command functions — specifically mcp-server/, which wraps doctor()/
// build()/lint()/etc. as MCP tools over a stdio transport, where stdout IS
// the JSON-RPC protocol channel: anything these functions or the processes
// they spawn write directly to it would corrupt the connection. Threading
// a `capture` option through every run() call site across doctor.mjs/
// build.mjs/lint.mjs/clean.mjs/analyze.mjs would work too, but would mean
// touching five working, already-verified files for a concern only one
// new caller has; an ambient flag toggled around the call instead keeps
// every existing call site — and real terminal usage — completely
// unchanged.
let captureBuffer = null

/**
 * Runs `fn` (expected to call run() zero or more times, and/or console.log/
 * console.error directly, the same way doctor()/lint()/etc. already do)
 * with all of that output captured instead of printed, returning it
 * alongside fn's own return value. Restores real console/run() behavior
 * afterward even if fn throws.
 */
export async function withCapturedOutput(fn) {
  const previousBuffer = captureBuffer
  const buf = { text: '' }
  captureBuffer = buf
  const originalLog = console.log
  const originalError = console.error
  const originalExitCode = process.exitCode
  console.log = (...args) => { buf.text += args.join(' ') + '\n' }
  console.error = (...args) => { buf.text += args.join(' ') + '\n' }
  process.exitCode = undefined
  try {
    const result = await fn()
    return { result, output: buf.text, exitCode: process.exitCode ?? 0 }
  } catch (err) {
    err.output = buf.text
    throw err
  } finally {
    captureBuffer = previousBuffer
    console.log = originalLog
    console.error = originalError
    process.exitCode = originalExitCode
  }
}

/**
 * Runs a CLI command with inherited stdio (so device logs / build output
 * stream straight to the user's terminal) and resolves/rejects on exit —
 * unless called inside withCapturedOutput(), in which case stdout/stderr
 * are piped and appended to that call's buffer instead.
 */
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const buf = captureBuffer
    const child = spawn(command, args, {
      stdio: buf ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: process.platform === 'win32',
      ...options
    })

    if (buf) {
      child.stdout.on('data', (chunk) => { buf.text += chunk })
      child.stderr.on('data', (chunk) => { buf.text += chunk })
    }

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}
