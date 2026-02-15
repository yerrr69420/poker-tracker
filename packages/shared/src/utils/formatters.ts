/**
 * Format cents to currency string.
 * @example formatCurrency(15000) → "$150.00"
 * @example formatCurrency(-5000) → "-$50.00"
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  const abs = Math.abs(cents);
  const dollars = abs / 100;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(dollars);
  return cents < 0 ? `-${formatted}` : formatted;
}

/**
 * Format cents as a short profit string with +/- prefix.
 * @example formatProfit(15000) → "+$150.00"
 * @example formatProfit(-5000) → "-$50.00"
 * @example formatProfit(0)     → "$0.00"
 */
export function formatProfit(cents: number, currency = 'USD'): string {
  if (cents === 0) return formatCurrency(0, currency);
  const prefix = cents > 0 ? '+' : '';
  return `${prefix}${formatCurrency(cents, currency)}`;
}

/**
 * Format a duration in minutes to a readable string.
 * @example formatDuration(90) → "1h 30m"
 * @example formatDuration(45) → "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculate duration in minutes between two ISO date strings.
 */
export function durationMinutes(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, diff / 60000);
}

/**
 * Format ISO date string to short display.
 * @example formatDate("2025-01-15T10:00:00Z") → "Jan 15, 2025"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format ISO date string to time display.
 * @example formatTime("2025-01-15T10:30:00Z") → "10:30 AM"
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format ISO date string to relative time.
 * @example formatRelativeTime("2025-01-15T10:00:00Z") → "2 hours ago"
 */
export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
}

/**
 * Convert dollars to cents (integer).
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars.
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}
