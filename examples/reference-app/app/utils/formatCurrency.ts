/**
 * Deliberately not `Intl.NumberFormat`: full ICU data isn't guaranteed to
 * be bundled in a NativeScript app's JS engine on every platform/build
 * configuration, so `Intl`-based formatting is a real reliability risk
 * here, not just a style choice — a plain, dependency-free implementation
 * avoids it entirely. Cents in, formatted string out, so callers never
 * juggle floating-point currency math themselves.
 */
export function formatCurrency(amountInCents: number, symbol = '$'): string {
  const sign = amountInCents < 0 ? '-' : ''
  const whole = Math.floor(Math.abs(amountInCents) / 100)
  const cents = Math.abs(amountInCents) % 100
  const wholeWithSeparators = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}${symbol}${wholeWithSeparators}.${cents.toString().padStart(2, '0')}`
}
