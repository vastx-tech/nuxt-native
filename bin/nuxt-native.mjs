#!/usr/bin/env node
import { init } from '../cli/commands/init.mjs'
import { dev } from '../cli/commands/dev.mjs'
import { build } from '../cli/commands/build.mjs'

const [, , command, ...args] = process.argv

try {
  switch (command) {
    case 'init':
      await init({ platforms: args.length ? args : undefined })
      break

    case 'dev':
      await dev(args[0])
      break

    case 'build':
      await build(args[0], { release: args.includes('--release') })
      break

    default:
      printHelp()
      process.exit(command ? 1 : 0)
  }
} catch (error) {
  console.error(error.message ?? error)
  process.exit(1)
}

function printHelp() {
  console.log(`nuxt-native — build real native iOS/Android apps with Nuxt

Usage:
  nuxt-native init [ios] [android]   Scaffold nativescript.config.ts + native platforms
  nuxt-native dev <ios|android>      Build, deploy, and LiveSync to a device/simulator
  nuxt-native build <ios|android> [--release]   Produce a native build artifact
`)
}
