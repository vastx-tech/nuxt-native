import { Color, Image, Label, StackLayout, TextField } from '@nativescript/core'
import { registerElement } from 'nativescript-vue'
import { colors, fontSizes } from './theme'

/**
 * Registers familiar HTML tag names as real NativeScript native views, using
 * nativescript-vue's own public `registerElement(name, resolver, meta)` API
 * — the exact mechanism it uses internally for `<StackLayout>`/`<Label>`/
 * `<Button>` etc. (confirmed by reading its element registry directly).
 *
 * This is NOT an HTML/CSS engine: there is no block/inline formatting, no
 * float/position, no form-submission semantics, no automatic table layout.
 * It's tag-name sugar over real native primitives — `<div>` compiles to a
 * real `StackLayout`, `<p>` to a real `Label`, and so on — chosen because
 * they're the closest real native equivalent, not because the semantics
 * match HTML exactly.
 *
 * Verified this doesn't get short-circuited by Vue's compiler treating
 * these as literal DOM elements (they're real HTML tag names, unlike
 * "StackLayout"): nativescript-vue's renderer never uses `@vue/runtime-dom`
 * at all (it's built on plain `@vue/runtime-core` + its own `NSVElement`
 * class), and `NSVElement`'s constructor calls this same registry's
 * `getViewClass(tagName)` for *every* element vnode regardless of which
 * compiled form produced it (a `resolveComponent()` fallback-to-string, or
 * a direct `createElementVNode()` call for a compiler-recognized native
 * tag) — confirmed by reading `NSVElement`'s constructor and `nodeOps.
 * createElement()` directly, not assumed from the tag names alone.
 *
 * A few real HTML tags need no registration at all: nativescript-vue's tag
 * matching is case/hyphen-insensitive (`normalizeElementName`), and its own
 * `Button`/`Label`/`Span` registrations already collide with lowercase
 * `button`/`label`/`span` — so those three already resolve to a real
 * native Button, Label, and (text-run-only) Span today, with zero extra
 * work. `<label>`/`<span>` end up as the *same* native `Label` — a decent
 * coincidental match for `label` (both are "a piece of text"), and a real
 * constraint worth knowing for `span` (NativeScript's `Span` can only
 * nest inside a Label/FormattedString's text run, not hold arbitrary
 * child views the way an HTML `<span>` can).
 *
 * Deliberately not mapped, rather than mapped to something misleading:
 * `<table>`/`<tr>`/`<td>`, `<select>`/`<option>`, `<form>`'s submission
 * behavior (its container mapping below is layout-only), `<br>` (no native
 * "mid-flow line break" primitive to map it to).
 */
export function registerHtmlElements() {
  registerElement('div', () => StackLayout)
  registerElement('img', () => Image)
  registerElement('input', () => TextField, {
    model: { prop: 'text', event: 'textChange' }
  })

  registerElement('p', () => HtmlParagraph)
  registerElement('a', () => HtmlAnchor)
  registerElement('strong', () => HtmlBold)
  registerElement('b', () => HtmlBold)
  registerElement('em', () => HtmlItalic)
  registerElement('i', () => HtmlItalic)

  registerElement('h1', () => makeHeading(fontSizes['3xl']))
  registerElement('h2', () => makeHeading(fontSizes['2xl']))
  registerElement('h3', () => makeHeading(fontSizes.xl))
  registerElement('h4', () => makeHeading(fontSizes.lg))
  registerElement('h5', () => makeHeading(fontSizes.md))
  registerElement('h6', () => makeHeading(fontSizes.sm))

  // Pure layout/semantic sugar over StackLayout — same native view, just a
  // familiar tag name. No visual distinction between them, same as they'd
  // have none without their own CSS either.
  for (const tag of ['ul', 'ol', 'li', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside', 'form']) {
    registerElement(tag, () => StackLayout)
  }
}

class HtmlParagraph extends Label {
  constructor() {
    super()
    this.textWrap = true
  }
}

class HtmlBold extends Label {
  constructor() {
    super()
    this.textWrap = true
    this.fontWeight = 'bold'
  }
}

class HtmlItalic extends Label {
  constructor() {
    super()
    this.textWrap = true
    this.fontStyle = 'italic'
  }
}

/** No native navigation: this only gets you link-like styling. Wire up
 * `useNativeRouter()`'s `navigate()` yourself via `@tap`. */
class HtmlAnchor extends Label {
  constructor() {
    super()
    this.textWrap = true
    this.textDecoration = 'underline'
    this.color = new Color(colors.primary)
  }
}

function makeHeading(fontSize: number) {
  return class HtmlHeading extends Label {
    constructor() {
      super()
      this.textWrap = true
      this.fontWeight = 'bold'
      this.fontSize = fontSize
    }
  }
}
