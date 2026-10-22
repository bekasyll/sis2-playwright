/** "$14.15" → 14.15 */
export function parsePrice(displayed: string): number {
  return Number(displayed.replace(/[^0-9.]/g, ''));
}

/** 28.3 → "$28.30", formatted the way the cart shows it (Angular number:'1.2-2'). */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return '$' + rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
