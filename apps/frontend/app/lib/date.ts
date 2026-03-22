export function formatUtcDateTime(input: string | Date): string {
  // Deterministic SSR/CSR output: fixed locale + UTC timezone.
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(input))
}
