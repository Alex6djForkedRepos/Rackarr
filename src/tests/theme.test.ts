import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadThemeFromStorage, saveThemeToStorage, applyThemeToDocument } from '$lib/utils/theme';

describe('theme utilities', () => {
	describe('loadThemeFromStorage', () => {
		beforeEach(() => {
			localStorage.clear();
		});

		it('returns dark as default when no theme is stored', () => {
			expect(loadThemeFromStorage()).toBe('dark');
		});

		it('returns stored theme when valid', () => {
			localStorage.setItem('rackarr_theme', 'light');
			expect(loadThemeFromStorage()).toBe('light');

			localStorage.setItem('rackarr_theme', 'dark');
			expect(loadThemeFromStorage()).toBe('dark');
		});

		it('returns dark for invalid stored value', () => {
			localStorage.setItem('rackarr_theme', 'invalid');
			expect(loadThemeFromStorage()).toBe('dark');
		});
	});

	describe('saveThemeToStorage', () => {
		beforeEach(() => {
			localStorage.clear();
		});

		it('saves theme to localStorage', () => {
			saveThemeToStorage('light');
			expect(localStorage.getItem('rackarr_theme')).toBe('light');

			saveThemeToStorage('dark');
			expect(localStorage.getItem('rackarr_theme')).toBe('dark');
		});
	});

	describe('applyThemeToDocument', () => {
		afterEach(() => {
			delete document.documentElement.dataset['theme'];
		});

		it('sets theme data attribute on document', () => {
			applyThemeToDocument('light');
			expect(document.documentElement.dataset['theme']).toBe('light');

			applyThemeToDocument('dark');
			expect(document.documentElement.dataset['theme']).toBe('dark');
		});
	});
});
