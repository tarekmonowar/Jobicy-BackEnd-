// Dedup hash: sha256(normalizedTitle + '|' + normalizedCompany).
import { createHash } from 'crypto';
import { normalizeCompany, normalizeTitle } from '@/common/utils/normalize.util';

/**
 * Produces a stable fingerprint for job deduplication during ingestion.
 */
export function fingerprint(title: string, company: string): string {
  const normalized = `${normalizeTitle(title)}|${normalizeCompany(company)}`;
  return createHash('sha256').update(normalized).digest('hex');
}
