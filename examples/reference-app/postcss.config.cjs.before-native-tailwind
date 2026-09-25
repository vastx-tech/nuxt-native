// @nativescript/webpack already runs every .css file through
// postcss-loader (confirmed against its base config) and merges in
// whatever plugins this file exports — so this is the only wiring
// Tailwind needs on the build side.
module.exports = {
  plugins: [require('tailwindcss')]
}
