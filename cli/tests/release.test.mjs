import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { nextVersion, stampChangelog, unreleasedNotes } from '../../scripts/release.mjs'
import { NUXT_NATIVE_DEPENDENCY_SPEC, packageJson } from '../lib/scaffold-templates.mjs'

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

test('next version from a bump or an explicit version', () => {
  assert.equal(nextVersion('2.1.0', 'patch'), '2.1.1')
  assert.equal(nextVersion('2.1.3', 'minor'), '2.2.0')
  assert.equal(nextVersion('2.1.3', 'major'), '3.0.0')
  assert.equal(nextVersion('2.1.0', 'v2.2.0'), '2.2.0')
  assert.equal(nextVersion('2.1.0', '2.1.0'), '2.1.0')
  assert.throws(() => nextVersion('2.1.0', 'banana'), /Not a version/)
  assert.throws(() => nextVersion('2.1.0', undefined), /Usage/)
})

const CHANGELOG = `# Changelog

Intro.

## Unreleased

### Fixed

- A bug.

## 2.0.0 - 2026-01-01

- Old.
`

test('release notes are the Unreleased section only', () => {
  assert.equal(unreleasedNotes(CHANGELOG), '### Fixed\n\n- A bug.')
  assert.equal(unreleasedNotes('# Changelog\n\n## Unreleased\n\n## 1.0.0\n- x\n'), '')
  assert.equal(unreleasedNotes('# Changelog\n\n## Unreleased\n\n- last section\n'), '- last section')
})

test('stamping moves Unreleased under the version and keeps an empty Unreleased', () => {
  const stamped = stampChangelog(CHANGELOG, '2.1.0', '2026-10-15')
  assert.match(stamped, /## Unreleased\n\n## 2\.1\.0 - 2026-10-15\n\n### Fixed\n\n- A bug\.\n\n## 2\.0\.0/)
  assert.equal(unreleasedNotes(stamped), '')
  assert.throws(() => stampChangelog('# Changelog\n', '2.1.0', '2026-10-15'), /no "## Unreleased"/)
})

test('new projects are pinned to this version\'s release tag', () => {
  assert.equal(NUXT_NATIVE_DEPENDENCY_SPEC, `github:vastx-tech/nuxt-native#v${version}`)
  assert.equal(JSON.parse(packageJson('demo')).dependencies['nuxt-native'], NUXT_NATIVE_DEPENDENCY_SPEC)
})

test('the real CHANGELOG.md has an Unreleased heading the release script can stamp', () => {
  const changelog = readFileSync(new URL('../../CHANGELOG.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  assert.doesNotThrow(() => stampChangelog(changelog, '9.9.9', '2026-01-01'))
})
