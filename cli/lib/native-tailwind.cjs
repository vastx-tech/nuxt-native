const nativeTailwind = require('@nativescript/tailwind')
const valueParser = require('postcss-value-parser')

// NativeScript 9 supports these, but @nativescript/tailwind 4.0.10's
// property filter omits them. Keep this exception list small and tested.
const preservedProperties = new Set([
  'gap', 'row-gap', 'column-gap', 'max-width', 'max-height',
  'white-space', 'text-overflow'
])

module.exports = () => ({
  postcssPlugin: 'nuxt-native-tailwind',
  async OnceExit(root, { result }) {
    const preserved = new Map()
    root.walkDecls((decl) => {
      // Upstream's rem regex mishandles multi-digit fractional lengths
      // (12.5rem). Parse numeric tokens, leaving URLs and strings alone.
      const parsed = valueParser(decl.value)
      parsed.walk((node) => {
        if (node.type === 'function' && node.value.toLowerCase() === 'url') return false
        if (node.type !== 'word') return
        const match = /^(-?(?:\d+(?:\.\d*)?|\.\d+))rem$/i.exec(node.value)
        if (match) node.value = String(Number((Number(match[1]) * 16).toFixed(6)))
      })
      decl.value = parsed.toString()
      if (preservedProperties.has(decl.prop)) {
        preserved.set(decl, decl.prop)
        // Upstream keeps custom properties and still normalizes their values.
        decl.prop = `--nuxt-native-preserve-${decl.prop}`
      }
    })
    try {
      const output = await nativeTailwind.process(root, { from: result.opts.from, map: false })
      result.messages.push(...output.messages)
    } finally {
      for (const [decl, prop] of preserved) decl.prop = prop
    }
  }
})
module.exports.postcss = true
