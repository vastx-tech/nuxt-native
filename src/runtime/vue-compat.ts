import type { NSVElement } from 'nativescript-vue'

export * from 'nativescript-vue'

/**
 * `@vue/compiler-dom` (which vue-loader uses here, same as any other Vue
 * project) special-cases `v-model` on tags it recognizes as native HTML
 * form elements (`input`, `select`, `textarea`) — it compiles those to
 * `withDirectives(vnode, [[_vModelText, value]])`, importing `vModelText`
 * from `'vue'`, instead of the plain prop+event binding it emits for
 * everything else (which is what makes `v-model` work on our own
 * `<TextField>`/`<Switch>`/etc. via their `registerElement(..., { model })`
 * meta). Since `html-elements.ts` registers `<input>` as a real HTML tag
 * name, `v-model` on it hits that native-form-element path — but
 * `nativescript-vue` re-exports `@vue/runtime-core`, not `@vue/runtime-dom`
 * (there's no DOM here), so it has no `vModelText` to import. Reproduced
 * directly: a real webpack compile of `<input v-model="x">` warns "export
 * 'vModelText' was not found in 'vue'" and the binding does nothing.
 *
 * Fixed by providing our own `vModelText`, modeled directly on
 * `@vue/runtime-dom`'s real implementation (same directive-hook shape,
 * same `getModelAssigner` pattern reading `onUpdate:modelValue` off the
 * vnode) but operating on NativeScript's `TextField` instead of a real DOM
 * input: `el` here is nativescript-vue's own `NSVElement` wrapper, which
 * exposes a `text` property delegating to the real `TextField` and a
 * DOM-shaped `addEventListener` (both confirmed by reading
 * nativescript-vue's `dom` module directly) — so this listens for the real
 * `textChange` event instead of DOM `input`/`change`, and reads/writes
 * `el.text` instead of `el.value`. `webpack.config.cjs` aliases `'vue'` to this
 * module (after nativescript-vue's own webpack helper sets its alias, so
 * this one wins) specifically so the compiler-emitted `import { vModelText
 * } from 'vue'` resolves to a real implementation instead of `undefined`.
 */
// Minimal local shapes for what this reads off Vue's directive hook
// arguments — not importing @vue/runtime-core's own VNode/DirectiveBinding
// types since nuxt-native doesn't declare it as a direct dependency
// (nativescript-vue pulls it in transitively; depending on its types here
// without declaring it would be relying on an implicit resolution).
interface ModelVNode {
  props?: Record<string, unknown> | null
}
interface ModelBinding {
  value: unknown
}
type ModelAssign = (value: unknown) => void

const assigners = new WeakMap<object, ModelAssign | false>()

function getModelAssigner(vnode: ModelVNode): ModelAssign | false {
  const fn = vnode.props?.['onUpdate:modelValue'] ?? false
  if (Array.isArray(fn)) {
    return (value: unknown) => fn.forEach((f: ModelAssign) => f(value))
  }
  return (fn as ModelAssign | false)
}

export const vModelText = {
  created(el: NSVElement, _binding: ModelBinding, vnode: ModelVNode) {
    assigners.set(el, getModelAssigner(vnode))
    el.addEventListener('textChange', (args: { value: unknown }) => {
      const assign = assigners.get(el)
      if (assign) assign(args.value)
    })
  },
  mounted(el: NSVElement, { value }: ModelBinding) {
    el.text = value == null ? '' : (value as string)
  },
  beforeUpdate(el: NSVElement, { value }: ModelBinding, vnode: ModelVNode) {
    assigners.set(el, getModelAssigner(vnode))
    if (el.text !== value) {
      el.text = value == null ? '' : (value as string)
    }
  }
}
