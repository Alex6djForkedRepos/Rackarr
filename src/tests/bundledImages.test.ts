/**
 * Tests for bundled images manifest
 * TDD: Write tests first, then implement
 */

import { describe, it, expect } from 'vitest';
import { getBundledImage, getBundledImageSlugs } from '$lib/data/bundledImages';

describe('bundledImages', () => {
	describe('getBundledImage', () => {
		it('returns URL for 1u-server front image', () => {
			const url = getBundledImage('1u-server', 'front');
			expect(url).toBeDefined();
			expect(typeof url).toBe('string');
			expect(url).toContain('.webp');
		});

		it('returns URL for 2u-server front image', () => {
			const url = getBundledImage('2u-server', 'front');
			expect(url).toBeDefined();
			expect(typeof url).toBe('string');
		});

		it('returns URL for 4u-server front image', () => {
			const url = getBundledImage('4u-server', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 8-port-switch front image', () => {
			const url = getBundledImage('8-port-switch', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 24-port-switch front image', () => {
			const url = getBundledImage('24-port-switch', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 48-port-switch front image', () => {
			const url = getBundledImage('48-port-switch', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 1u-router-firewall front image', () => {
			const url = getBundledImage('1u-router-firewall', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 1u-storage front image', () => {
			const url = getBundledImage('1u-storage', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 2u-storage front image', () => {
			const url = getBundledImage('2u-storage', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 4u-storage front image', () => {
			const url = getBundledImage('4u-storage', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 2u-ups front image', () => {
			const url = getBundledImage('2u-ups', 'front');
			expect(url).toBeDefined();
		});

		it('returns URL for 1u-console-drawer front image', () => {
			const url = getBundledImage('1u-console-drawer', 'front');
			expect(url).toBeDefined();
		});

		it('returns undefined for nonexistent device', () => {
			const url = getBundledImage('nonexistent-device', 'front');
			expect(url).toBeUndefined();
		});

		it('returns undefined for rear face when no rear image exists', () => {
			const url = getBundledImage('1u-server', 'rear');
			expect(url).toBeUndefined();
		});

		it('returns undefined for device without bundled image', () => {
			// Blanks don't have bundled images
			const url = getBundledImage('1u-blank', 'front');
			expect(url).toBeUndefined();
		});
	});

	describe('getBundledImageSlugs', () => {
		it('returns list of device slugs with bundled images', () => {
			const slugs = getBundledImageSlugs();
			expect(Array.isArray(slugs)).toBe(true);
			expect(slugs.length).toBe(12); // 3 servers + 4 network + 3 storage + 1 power + 1 kvm
		});

		it('includes all server slugs', () => {
			const slugs = getBundledImageSlugs();
			expect(slugs).toContain('1u-server');
			expect(slugs).toContain('2u-server');
			expect(slugs).toContain('4u-server');
		});

		it('includes all network slugs', () => {
			const slugs = getBundledImageSlugs();
			expect(slugs).toContain('8-port-switch');
			expect(slugs).toContain('24-port-switch');
			expect(slugs).toContain('48-port-switch');
			expect(slugs).toContain('1u-router-firewall');
		});

		it('includes all storage slugs', () => {
			const slugs = getBundledImageSlugs();
			expect(slugs).toContain('1u-storage');
			expect(slugs).toContain('2u-storage');
			expect(slugs).toContain('4u-storage');
		});

		it('includes power slugs', () => {
			const slugs = getBundledImageSlugs();
			expect(slugs).toContain('2u-ups');
		});

		it('includes kvm slugs', () => {
			const slugs = getBundledImageSlugs();
			expect(slugs).toContain('1u-console-drawer');
		});
	});
});
