import { generateEntry } from '../lib/generate-entry.mjs'
import { run } from '../lib/run.mjs'

export async function build(platform, { release = false } = {}) {
  if (platform !== 'ios' && platform !== 'android') {
    throw new Error('[nuxt-native] Usage: nuxt-native build <ios|android> [--release]')
  }

  generateEntry({ pagesDir: 'app/pages' })

  const args = ['--yes', 'nativescript', 'build', platform]
  if (release) args.push('--release')

  console.log(`[nuxt-native] ns build ${platform}${release ? ' --release' : ''}`)
  await run('npx', args)
}
