// ============================================================
// SMART BILLING — Utility Functions
// ============================================================

/**
 * Format a number as Indian Rupees.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a large number with Indian notation (e.g. 12,48,560).
 */
export function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

/**
 * Format a date string to a readable form.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a datetime string.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns how many days until/from a date.
 */
export function daysFromNow(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Truncate a string to n characters.
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Debounce a function.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
