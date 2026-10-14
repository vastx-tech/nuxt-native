import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveIconSvg } from '../../src/runtime/icons.ts'

const set = {
  prefix: 'x',
  icons: {
    heart: { body: '<path fill="currentColor" d="M0 0"/>' },
    wide: { body: '<path d="M0 0"/>', width: 48 }
  },
  width: 24,
  height: 24
}
const size = svg => svg.match(/width="[^"]+" height="[^"]+"/)[0]

test('works without a size (it used to throw inside iconToSVG)', () => {
  assert.equal(size(resolveIconSvg(set, 'heart', { color: 'red' })), 'width="24" height="24"')
  assert.match(resolveIconSvg(set, 'heart', { color: 'red' }), /fill="red"/)
})

test('one given size keeps the aspect ratio; two are used as given', () => {
  assert.equal(size(resolveIconSvg(set, 'heart', { width: 48 })), 'width="48" height="48"')
  assert.equal(size(resolveIconSvg(set, 'wide', { height: 48 })), 'width="96" height="48"')
  assert.equal(size(resolveIconSvg(set, 'heart', { width: 10, height: 20 })), 'width="10" height="20"')
})

test('the same icon and options return the cached markup', () => {
  const a = resolveIconSvg(set, 'heart', { color: 'blue' })
  assert.equal(resolveIconSvg(set, 'heart', { color: 'blue' }), a)
  assert.notEqual(resolveIconSvg(set, 'heart', { color: 'green' }), a)
  assert.throws(() => resolveIconSvg(set, 'missing'), /Icon "missing" was not found/)
})
