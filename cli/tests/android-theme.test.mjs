import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { ensureAndroidMinSdk, ensureAndroidTheme, isDark } from '../lib/android-theme.mjs'
import { nuxtConfig, packageJson } from '../lib/scaffold-templates.mjs'

function withProject(fn) {
  const root = mkdtempSync(join(tmpdir(), 'nuxt-native-theme-'))
  try {
    return fn(root, rel => join(root, 'App_Resources/Android/src/main/res', rel))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('no native.theme leaves the template theme alone', () => withProject((root, res) => {
  ensureAndroidTheme(root, undefined)
  assert.equal(existsSync(res('values/styles.xml')), false)
}))

test('a dark background gives a dark theme with that window background', () => withProject((root, res) => {
  ensureAndroidTheme(root, { background: '#0b1020', primary: '#7C5CFF', accent: '#22d3ee' })
  const styles = readFileSync(res('values/styles.xml'), 'utf8')
  assert.match(styles, /parent="Theme\.AppCompat\.NoActionBar"/)
  assert.match(styles, /android:windowBackground">@color\/ns_background/)
  assert.match(readFileSync(res('values/colors.xml'), 'utf8'), /ns_background">#0B1020/)
  // the template's v21 colours redefine ns_accent, so ours must be there too
  assert.match(readFileSync(res('values-v21/colors.xml'), 'utf8'), /ns_accent">#22D3EE/)
  assert.match(readFileSync(res('values-v21/styles.xml'), 'utf8'), /parent="android:Widget\.Material\.DatePicker"/)
  assert.match(readFileSync(res('values-v23/styles.xml'), 'utf8'), /windowLightStatusBar">false/)
}))

test('a light background keeps the light theme and dark status bar icons', () => withProject((root, res) => {
  ensureAndroidTheme(root, { background: '#F8FAFC' })
  assert.match(readFileSync(res('values/styles.xml'), 'utf8'), /parent="Theme\.AppCompat\.Light\.NoActionBar"/)
  assert.match(readFileSync(res('values-v23/styles.xml'), 'utf8'), /windowLightStatusBar">true/)
}))

test('the project\'s own resource files are never overwritten', () => withProject((root, res) => {
  mkdirSync(res('values'), { recursive: true })
  writeFileSync(res('values/styles.xml'), '<resources>mine</resources>')
  const skipped = ensureAndroidTheme(root, { background: '#000000' })
  assert.deepEqual(skipped, ['values/styles.xml'])
  assert.equal(readFileSync(res('values/styles.xml'), 'utf8'), '<resources>mine</resources>')
  // generated files are regenerated, e.g. after a colour change
  ensureAndroidTheme(root, { background: '#111111' })
  assert.match(readFileSync(res('values/colors.xml'), 'utf8'), /#111111/)
}))

test('invalid colours fail with a clear message', () => withProject((root) => {
  assert.throws(() => ensureAndroidTheme(root, { background: 'navy' }), /native\.theme\.background must be a hex colour/)
}))

test('isDark splits at the perceptual midpoint', () => {
  assert.equal(isDark('#0B1020'), true)
  assert.equal(isDark('#4F46E5'), true)
  assert.equal(isDark('#F8FAFC'), false)
  assert.equal(isDark('#FFD54F'), false)
})

test('minSdk defaults to 23 and is rewritten in place', () => withProject((root) => {
  const gradle = join(root, 'App_Resources/Android/app.gradle')
  mkdirSync(join(root, 'App_Resources/Android'), { recursive: true })
  writeFileSync(gradle, '// my own config\n')
  ensureAndroidMinSdk(root)
  assert.match(readFileSync(gradle, 'utf8'), /minSdkVersion 23/)
  ensureAndroidMinSdk(root, 26)
  const content = readFileSync(gradle, 'utf8')
  assert.match(content, /minSdkVersion 26/)
  assert.doesNotMatch(content, /minSdkVersion 23/)
  assert.match(content, /my own config/)
  assert.throws(() => ensureAndroidMinSdk(root, 19), /at least 21/)
}))

test('the starter ships a theme, a typecheck script and vue-tsc', () => {
  const pkg = JSON.parse(packageJson('demo'))
  assert.equal(pkg.scripts.typecheck, 'vue-tsc --noEmit')
  assert.ok(pkg.devDependencies['vue-tsc'])
  assert.match(nuxtConfig('org.demo', 'Demo'), /theme: \{\s*background: '#F8FAFC'/)
})

test('platforms/android goes on PATH only when Windows skips the current directory', async () => {
  const { childEnv } = await import('../lib/run.mjs')
  const env = { Path: 'C:/Windows', NoDefaultCurrentDirectoryInExePath: '1' }
  const patched = childEnv('D:/app', env, 'win32')
  assert.equal(patched.Path, `${join('D:/app', 'platforms', 'android')};C:/Windows`)
  assert.equal(env.Path, 'C:/Windows', 'the parent environment is not modified')
  assert.equal(childEnv('D:/app', { Path: 'C:/Windows' }, 'win32').Path, 'C:/Windows')
  assert.equal(childEnv('/app', { PATH: '/usr/bin', NoDefaultCurrentDirectoryInExePath: '1' }, 'darwin').PATH, '/usr/bin')
})
