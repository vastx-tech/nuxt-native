import { spawn } from 'node:child_process'
import { join } from 'node:path'

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
      env: childEnv(options.cwd ?? process.cwd()),
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

/**
 * The NativeScript CLI starts Gradle as a bare `gradlew.bat` with
 * platforms/android as its working directory, relying on Windows' cmd
 * finding programs in the current directory. With the
 * NoDefaultCurrentDirectoryInExePath environment variable set (AI coding
 * agents and some hardened Windows setups set it), cmd doesn't, and the
 * build fails with "'gradlew.bat' is not recognized" — reported by an
 * external developer as "Gradle wasn't found unless I added it to PATH",
 * and reproduced here. Putting the project's own platforms/android on
 * PATH for the child process finds the same wrapper, without re-enabling
 * current-directory lookup for anything else.
 */
export function childEnv(cwd, env = process.env, platform = process.platform) {
  if (platform !== 'win32' || !env.NoDefaultCurrentDirectoryInExePath) return env
  const pathKey = Object.keys(env).find(key => key.toUpperCase() === 'PATH') ?? 'Path'
  return { ...env, [pathKey]: `${join(cwd, 'platforms', 'android')};${env[pathKey] ?? ''}` }
}
