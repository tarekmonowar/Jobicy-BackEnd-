// Parses JWT-style TTL strings (e.g. "15m", "7d") into milliseconds.
const TTL_PATTERN = /^(\d+)([smhd])$/;

const MULTIPLIERS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Converts a duration string like "7d" or "15m" to milliseconds.
 * Falls back to 7 days when the format is unrecognized.
 */
export function parseTtlToMs(ttl: string): number {
  const match = TTL_PATTERN.exec(ttl.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  return value * (MULTIPLIERS[unit] ?? MULTIPLIERS.d);
}

/** Returns a Date offset from now by the given TTL string. */
export function expiresAtFromTtl(ttl: string): Date {
  return new Date(Date.now() + parseTtlToMs(ttl));
}
