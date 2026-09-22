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

const [, , command, ...args] = process.argv

try {
  switch (command) {
    case 'create': {
      const [name, ...rest] = args
      await create(name, {
        appId: flagValue(rest, '--app-id'),
        platforms: flagValue(rest, '--platforms')?.split(',')
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
  nuxt-native create <name> [--app-id com.example.app] [--platforms ios,android]
                                      Scaffold a new project, install deps, and wire up native platforms
  nuxt-native init [ios] [android]    Scaffold nativescript.config.ts + native platforms (existing project)
  nuxt-native dev <ios|android> [ns run flags...]     Build, deploy, and LiveSync to a device/simulator
  nuxt-native build <ios|android> [ns build flags...] Produce a native build artifact
  nuxt-native doctor                  Check the project for every known misconfiguration, then run \`ns info\`
  nuxt-native keystore create --alias <name> [--output ./release.keystore] [--validity 10000]
                                      Generate an Android release-signing keystore
  nuxt-native analyze <ios|android>   Build with a bundle size report (report/report.html)
  nuxt-native lint                    Check every navigate() call against real routes
  nuxt-native clean                   Remove platforms/, hooks/, and cached native build artifacts

Flags after <ios|android> are forwarded as-is to the underlying \`ns run\`/
\`ns build\` command — e.g. a signed Android release:
  nuxt-native build android --release --key-store-path ./my.keystore \\
    --key-store-password *** --key-store-alias *** --key-store-alias-password ***

...or generate a keystore once with \`nuxt-native keystore create\`, set the
NUXT_NATIVE_KEYSTORE_* environment variables it prints, and just run
\`nuxt-native build android --release\` — no flags to retype.
`)
}
