/**
 * Stand-in for the `vue` import on native builds (see the alias in
 * webpack.config.cjs for how/why it's wired in).
 *
 * nativescript-vue re-exports Vue's real runtime-core, but not
 * runtime-dom — so it has everything a Vue component needs *except*
 * the v-model directive objects (vModelText, vModelCheckbox, ...),
 * which live in runtime-dom because they're written against DOM APIs
 * (`.value`, `input`/`change` events) that don't exist here.
 *
 * compiler-dom (the SFC template compiler nativescript-vue's pipeline
 * uses) doesn't know that: it still compiles a bare `v-model` on a
 * native element to `import { vModelText } from 'vue'` etc., so
 * anything resolving `vue` has to export those names or the build
 * fails to even bundle — regardless of whether a given project's
 * templates happen to use v-model on a native element directly. (The
 * project's own N* components, e.g. NInput/NSwitch, sidestep this
 * entirely by taking `modelValue`/`update:modelValue` as plain
 * component props instead — v-model on a *component* is handled by
 * runtime-core alone and never touches these directives. These exist
 * for the case of v-model written directly on a raw native tag.)
 *
 * Each directive below is a real implementation wired to the native
 * property/event the corresponding NativeScript view actually fires —
 * confirmed against @nativescript/core's own types — not a DOM-API
 * polyfill. Intentionally simplified vs. runtime-dom's originals: no
 * IME-composition tracking and no focus-guard on incoming updates
 * (NSVElement exposes no reliable "is this the focused native view"
 * check), and modifiers are applied read-side on every change rather
 * than distinguishing `input` vs `change` timing, since NativeScript's
 * text controls only ever fire the one `textChange` event.
 */
import type { ObjectDirective } from 'nativescript-vue';
export * from 'nativescript-vue';
interface VModelElement {
    tagName: string;
    text?: string;
    getAttribute(name: string): unknown;
    setAttribute(name: string, value: unknown): void;
    addEventListener(event: string, handler: any): void;
    removeEventListener(event: string, handler: any): void;
    _assign?: (value: any) => void;
    _vModelHandler?: (() => void) | null;
}
/** TextField / TextView: native `text` property, native `textChange` event. */
export declare const vModelText: ObjectDirective<VModelElement, any>;
/** Switch: native `checked` property, native `checkedChange` event. */
export declare const vModelCheckbox: ObjectDirective<VModelElement, any>;
/** `v-model` on a plain, non-component native tag whose element type can
 * only be known at runtime (e.g. bound to a dynamic `:is`) — dispatches
 * to the directive for the element actually resolved. */
export declare const vModelDynamic: ObjectDirective<VModelElement, any>;
/** No native radio-group control is registered by this framework today —
 * fail loudly with next steps rather than silently binding nothing. */
export declare const vModelRadio: ObjectDirective<VModelElement, any>;
/** No native <select>-equivalent is registered by this framework today —
 * fail loudly with next steps rather than silently binding nothing. */
export declare const vModelSelect: ObjectDirective<VModelElement, any>;
