export function stylingGuide() {
  return `# Styling a Nuxt Native app

This is a native UI, not a browser. Use Tailwind v3 for supported static styles,
component props for built-in variants, and numeric native styles for dynamic values.
The framework bundles @nativescript/tailwind with compatibility for NativeScript 9
gap, max-size, and text properties. Do not install a second adapter in this app.

## One spacing convention

Tailwind rem lengths compile to device-independent pixels (DIPs): 1rem = 16 DIP.
Use p-4 for 16 DIP of padding, gap-3 for 12 DIP between children, and p-5 for 20 DIP.
Numeric native styles use DIPs: :style="{ padding: 16 }" matches p-4.
Native CSS px units are physical pixels, so prefer unitless numbers in custom CSS.
Typed helpers use their own documented token scale; prefer numeric arguments when
matching utilities (padding(16)). Their px strings currently mean DIPs, unlike CSS px.
Avoid em, viewport units, and browser layout expressions such as calc() for spacing.

## Layout and spacing ownership

- NPage manages safe areas. Place one content layout inside it; add page padding there.
- NFlex is a native FlexboxLayout. Set flex-col or flex-row explicitly.
- Put gap-* on NFlex, not on a Label, Button, or StackLayout.
- Let the parent gap space siblings; avoid adding child margins for the same space.
- GridLayout uses rows/columns and row/col attributes. Unassigned children can overlap.
- A ScrollView has one layout child. Avoid h-full/flex-1 to size the scrolling axis.
- NButton size and NCard padding control their internal inline styles. Do not expect
  Tailwind classes to override those defaults. Put external spacing on a wrapper.
- Native Button widgets have platform-specific padding/minimum sizes. For consistent
  component sizing, use NButton with its size prop.

## Example

\`\`\`vue
<NPage title="Example">
  <NFlex class="flex-col p-5 gap-4">
    <Label text="Hello" class="text-2xl font-bold" />
    <Label text="Native spacing, familiar classes." textWrap="true" class="text-base" />
    <NButton text="Continue" size="md" />
  </NFlex>
</NPage>
\`\`\`

## Supported styles

Use the generated Tailwind corePlugins allowlist. Browser display/grid/position,
space-*, ring-*, transform utilities, hover, and responsive breakpoint variants are
not part of this default contract. Use native layouts and native transform props.
Keep complete class names in source: use count > 0 ? 'text-green-600' : 'text-red-600',
not 'text-' + color + '-600'. Our content scan includes app Vue, JS, and TS files.
Dark mode uses NativeScript's .ns-dark class.

Native CSS remains available in app/app.css and Vue style blocks. Prefer unitless
DIP lengths. Custom properties supported by NativeScript may still be filtered by
the adapter; use a supported inline native style for properties outside its contract.

## Build and existing projects

Keep Tailwind on v3. postcss.config.cjs runs Tailwind then
require('nuxt-native/cli/lib/native-tailwind.cjs')(). This wrapper runs the official
adapter exactly once, after generation. The adapter is a framework dependency,
so NativeScript does not auto-discover its separate Tailwind v4 Webpack pipeline.
If the app already directly depends on @nativescript/tailwind, remove that direct
dependency or explicitly set tailwind: { autoload: false } in nativescript.config.ts.

init/dev/build upgrade the old unmodified generated PostCSS config and save a
.before-native-tailwind backup. Custom configs and existing style files are preserved;
add the wrapper last yourself if setup reports a custom pipeline. Rebuild after migration.
The unit fix can enlarge spacing that previously rendered incorrectly as 1 DIP.
Review screens which compensated with unusually large spacing values.

When diagnosing spacing, inspect the parent layout, gap, child margins, component
inline styles, and safe-area padding before adding more classes. Verify the screen
on the target device; a successful CSS compile is not a visual layout test.
`
}

export function stylingAgentInstructions() {
  return `# Working on this Nuxt Native app

Read STYLING.md before creating or changing UI. Use its native layout and spacing
conventions. This project uses Tailwind v3 with the framework's bundled NativeScript
adapter; do not replace it with a browser Tailwind/v4 setup. Use NFlex with explicit
direction and parent gap for sibling spacing. Keep complete class names in source.
Respect component props and native inline styles; do not stack conflicting spacing
utilities to compensate for layout problems. Test numeric CSS output and report
whether device-level visual verification was performed.
`
}
