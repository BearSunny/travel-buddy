import { ANIMALS } from './animals';

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

/**
 * Simple hash function for strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get deterministic color class for a user
 */
export function getColorForUser(userId: string): string {
  const hash = hashString(userId);
  return COLORS[hash % COLORS.length];
}

/**
 * Get deterministic animal emoji for a user
 */
export function getAnimalForUser(userId: string): string {
  const hash = hashString(userId);
  return ANIMALS[hash % ANIMALS.length];
}

/**
 * Generate display name for guest users
 */
export function generateGuestName(userId: string): string {
  const hash = hashString(userId);
  const num = (hash % 9999).toString().padStart(4, '0');
  return `Guest-${num}`;
}
