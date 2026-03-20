'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Storage Keys
// ============================================================

export const STORAGE_KEYS = {
  BUILDINGS: 'faseel-buildings',
  UNITS: 'faseel-units',
  USERS: 'faseel-users',
  SERVICE_PROVIDERS: 'faseel-providers',
  REQUESTS: 'faseel-requests',
  HOA_FEES: 'faseel-hoa-fees',
  CONTRACTS: 'faseel-contracts',
  NOTIFICATIONS: 'faseel-notifications',
} as const;

// ============================================================
// ID Generator
// ============================================================

/** Generates IDs like `bld-a1b2c3`, `sp-d4e5f6` */
export function generateId(prefix: string): string {
  const hex = Math.random().toString(16).slice(2, 8);
  return `${prefix}-${hex}`;
}

// ============================================================
// Low-level CRUD helpers (no React dependency)
// ============================================================

const isClient = typeof window !== 'undefined';

/** Read an array from localStorage, returning `fallback` if missing or invalid. */
export function getFromStorage<T>(key: string, fallback: T[]): T[] {
  if (!isClient) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Overwrite the value for `key` in localStorage. */
export function saveToStorage<T>(key: string, data: T[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or other write error — silently ignore
  }
}

/** Append a single item (must have an `id` field). */
export function addToStorage<T extends { id: string }>(key: string, item: T): void {
  const current = getFromStorage<T>(key, []);
  saveToStorage(key, [...current, item]);
}

/** Shallow-merge `updates` into the item whose id matches. */
export function updateInStorage<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>,
): void {
  const current = getFromStorage<T>(key, []);
  const next = current.map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );
  saveToStorage(key, next);
}

/** Remove the item with the given `id`. */
export function deleteFromStorage(key: string, id: string): void {
  const current = getFromStorage<{ id: string }>(key, []);
  saveToStorage(key, current.filter((item) => item.id !== id));
}

// ============================================================
// React Hook
// ============================================================

/**
 * React hook that keeps state in sync with localStorage.
 *
 * On mount it reads from `key`; if nothing is stored it seeds
 * localStorage with `initialData`. The returned setter automatically
 * persists every change.
 *
 * SSR-safe: returns `initialData` during server rendering and
 * hydrates from localStorage after mount.
 */
export function useLocalStorageState<T>(
  key: string,
  initialData: T[],
): [T[], (value: T[] | ((prev: T[]) => T[])) => void] {
  const [data, setDataInternal] = useState<T[]>(initialData);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const stored = getFromStorage<T>(key, []);
    if (stored.length > 0) {
      setDataInternal(stored);
    } else {
      // Seed localStorage with initial data
      saveToStorage(key, initialData);
      setDataInternal(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Setter that writes through to localStorage
  const setData = useCallback(
    (value: T[] | ((prev: T[]) => T[])) => {
      setDataInternal((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return [data, setData];
}
