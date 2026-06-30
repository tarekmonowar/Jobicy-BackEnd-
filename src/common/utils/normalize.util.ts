// Title/company/skill normalization and developer-role category classification.
import { JobCategory } from '@/generated/prisma';

/** Maps common skill aliases to canonical display names. */
export const SKILL_MAP: Record<string, string> = {
  reactjs: 'React',
  'react.js': 'React',
  react: 'React',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  node: 'Node.js',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  aws: 'AWS',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
};

/**
 * Lowercases, trims, strips seniority words, and collapses whitespace.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\b(sr|jr|senior|junior)\b\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lowercases company name and strips common legal suffixes/punctuation.
 */
export function normalizeCompany(company: string): string {
  return company
    .toLowerCase()
    .trim()
    .replace(/\b(ltd|limited|inc|pvt|llc|corp|corporation)\b\.?/gi, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a skill string using SKILL_MAP aliases.
 */
export function normalizeSkill(skill: string): string {
  const key = skill.toLowerCase().trim();
  return SKILL_MAP[key] ?? skill.trim();
}

/**
 * Classifies a job into a developer category from title + skills keywords.
 */
export function classifyCategory(
  title: string,
  skills: string[],
): JobCategory {
  const haystack = `${title} ${skills.join(' ')}`.toLowerCase();

  if (
    /full[\s-]?stack|fullstack/.test(haystack) ||
    (haystack.includes('frontend') && haystack.includes('backend'))
  ) {
    return JobCategory.FULLSTACK;
  }
  if (/back[\s-]?end|backend/.test(haystack)) {
    return JobCategory.BACKEND;
  }
  if (/front[\s-]?end|frontend/.test(haystack)) {
    return JobCategory.FRONTEND;
  }
  if (/software engineer/.test(haystack)) {
    return JobCategory.SOFTWARE_ENGINEER;
  }
  if (/mobile|android|ios|flutter|react native/.test(haystack)) {
    return JobCategory.MOBILE;
  }
  if (/devops|sre|platform engineer/.test(haystack)) {
    return JobCategory.DEVOPS;
  }
  if (/\bqa\b|quality assurance|test engineer/.test(haystack)) {
    return JobCategory.QA;
  }

  return JobCategory.OTHER;
}
