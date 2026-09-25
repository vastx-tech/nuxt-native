#!/usr/bin/env node
import { create } from '../cli/commands/create.mjs'
import { init } from '../cli/commands/init.mjs'
import { dev } from '../cli/commands/dev.mjs'
import { build } from '../cli/commands/build.mjs'
import { doctor } from '../cli/commands/doctor.mjs'
import { keystoreCreate } from '../cli/commands/keystore.mjs'
import { analyze } from '../cli/commands/analyze.mjs'
import { lint } from '../cli/commands/lint.mjs'
import { clean } from '../cli/commands/clean.mjs'
import { version } from '../cli/commands/version.mjs'

const [, , command, ...args] = process.argv

try {
  switch (command) {
    case 'mcp':
      // Load the SDK only when serving MCP; stdout belongs to the protocol.
      await import('../mcp-server/bin/server.mjs')
      break

    case 'create': {
      const [name, ...rest] = args
      await create(name, {
        appId: flagValue(rest, '--app-id'),
        platforms: flagValue(rest, '--platforms')?.split(','),
        link: flagValue(rest, '--link')
      })
      break
    }

    case 'init':
      await init({ platforms: args.length ? args : undefined })
      break

    case 'dev':
      await dev(args[0], args.slice(1))
      break

    case 'build':
      await build(args[0], args.slice(1))
      break

    case 'doctor':
      await doctor()
      break

    case 'keystore': {
      const [action, ...rest] = args
      if (action !== 'create') {
        throw new Error('[nuxt-native] Usage: nuxt-native keystore create --alias <name> [--output ./release.keystore] [--validity 10000]')
      }
      const validity = flagValue(rest, '--validity')
      await keystoreCreate({
        alias: flagValue(rest, '--alias'),
        output: flagValue(rest, '--output'),
        validityDays: validity ? Number(validity) : undefined
      })
      break
    }

    case 'analyze':
      await analyze(args[0])
      break

    case 'lint':
      await lint()
      break

    case 'clean':
      await clean()
      break

    case 'version':
      await version(args[0], args[1])
      break

    default:
      printHelp()
      process.exit(command ? 1 : 0)
  }
} catch (error) {
  console.error(error.message ?? error)
  process.exit(1)
}

function flagValue(args, flag) {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function printHelp() {
  console.log(`nuxt-native — build real native iOS/Android apps with Nuxt

Usage:
  nuxt-native create <name> [--app-id com.example.app] [--platforms ios,android] [--link /path/to/nuxt-native]
                                      Scaffold a new project, install deps, and wire up native platforms.
                                      --link points at a local nuxt-native checkout instead of fetching from
                                      GitHub (npm symlinks it — no network fetch, and skips the checkout's
                                      own prepare-script cost too). Recommended over a bare \`npx
                                      vastx-tech/nuxt-native create\` while developing nuxt-native itself, or
                                      on a memory-constrained machine — a fresh GitHub install has to run
                                      nuxt-native's own build as part of installing it, which can OOM-crash
                                      before \`create\` ever runs.
  nuxt-native init [ios] [android]    Scaffold nativescript.config.ts + native platforms (existing project)
  nuxt-native dev <ios|android> [ns run flags...]     Build, deploy, and LiveSync to a device/simulator
  nuxt-native build <ios|android> [ns build flags...] Produce a native build artifact
  nuxt-native doctor                  Check the project for every known misconfiguration, then run \`ns info\`
  nuxt-native mcp                     Start the MCP server over stdio for an AI coding agent
  nuxt-native keystore create --alias <name> [--output ./release.keystore] [--validity 10000]
                                      Generate an Android release-signing keystore
  nuxt-native analyze <ios|android>   Build with a bundle size report (report/report.html)
  nuxt-native lint                    Check every navigate() call against real routes
  nuxt-native clean                   Remove platforms/, hooks/, and cached native build artifacts
  nuxt-native version [show]          Show the current version + versionCode
  nuxt-native version bump <major|minor|patch>
                                      Bump package.json's version + versionCode, sync to native files
  nuxt-native version sync            Write the current version/versionCode to native platform files

Flags after <ios|android> are forwarded as-is to the underlying \`ns run\`/
\`ns build\` command — e.g. a signed Android release:
  nuxt-native build android --release --key-store-path ./my.keystore \\
    --key-store-password *** --key-store-alias *** --key-store-alias-password ***

...or generate a keystore once with \`nuxt-native keystore create\`, set the
NUXT_NATIVE_KEYSTORE_* environment variables it prints, and just run
\`nuxt-native build android --release\` — no flags to retype.
`)
}
