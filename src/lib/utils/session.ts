/**
 * Session persistence utilities
 * Manages auto-save to sessionStorage for work-in-progress protection
 */

import type { Layout } from '$lib/types';
import { validateLayoutStructure } from './serialization';
import { migrateLayout } from './migration';

export const STORAGE_KEY = 'rackarr_session';

/**
 * Save layout to sessionStorage
 * @param layout - Layout to save
 */
export function saveToSession(layout: Layout): void {
	try {
		const json = JSON.stringify(layout);
		sessionStorage.setItem(STORAGE_KEY, json);
	} catch {
		// sessionStorage not available or quota exceeded
	}
}

/**
 * Load layout from sessionStorage
 * Automatically migrates older layout versions
 * @returns Layout if valid session exists, null otherwise
 */
export function loadFromSession(): Layout | null {
	try {
		const json = sessionStorage.getItem(STORAGE_KEY);
		if (!json) return null;

		const parsed: unknown = JSON.parse(json);
		if (!validateLayoutStructure(parsed)) {
			return null;
		}

		// Migrate if needed (supports v0.1.0 and v1.0)
		if (parsed.version === '0.1.0' || parsed.version === '1.0') {
			return migrateLayout(parsed);
		}

		return parsed;
	} catch {
		// sessionStorage not available or invalid JSON
		return null;
	}
}

/**
 * Clear session from sessionStorage
 */
export function clearSession(): void {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// sessionStorage not available
	}
}

/**
 * Check if a valid session exists
 * @returns true if valid session exists
 */
export function hasSession(): boolean {
	return loadFromSession() !== null;
}
