import { describe, it, expect } from 'vitest';
import { getStarterLibrary } from '$lib/data/starterLibrary';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { createLayout } from '$lib/utils/serialization';

describe('Starter Device Type Library', () => {
	describe('getStarterLibrary', () => {
		it('returns 27 device types', () => {
			const deviceTypes = getStarterLibrary();
			expect(deviceTypes).toHaveLength(27);
		});

		it('most categories have at least one starter device type', () => {
			const deviceTypes = getStarterLibrary();
			const categoriesWithDevices = new Set(deviceTypes.map((d) => d.rackarr.category));

			// At minimum, these core categories must have devices
			expect(categoriesWithDevices.has('server')).toBe(true);
			expect(categoriesWithDevices.has('network')).toBe(true);
			expect(categoriesWithDevices.has('blank')).toBe(true);
		});

		it('all device types have valid properties', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.slug).toBeTruthy();
				expect(deviceType.u_height).toBeGreaterThanOrEqual(0.5);
				expect(deviceType.u_height).toBeLessThanOrEqual(42);
				expect(deviceType.rackarr.colour).toBeTruthy();
				expect(deviceType.rackarr.category).toBeTruthy();
			});
		});

		it('device type slugs are unique', () => {
			const deviceTypes = getStarterLibrary();
			const slugs = deviceTypes.map((d) => d.slug);
			const uniqueSlugs = new Set(slugs);

			expect(uniqueSlugs.size).toBe(slugs.length);
		});

		it('device types have correct category colours', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.rackarr.colour).toBe(CATEGORY_COLOURS[deviceType.rackarr.category]);
			});
		});

		it('device type slugs are kebab-case', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
			});
		});
	});

	describe('Specific starter device types', () => {
		it('includes server device types', () => {
			const deviceTypes = getStarterLibrary();
			const servers = deviceTypes.filter((d) => d.rackarr.category === 'server');

			expect(servers.length).toBeGreaterThanOrEqual(3);
			expect(servers.some((d) => d.model === '1U Server' && d.u_height === 1)).toBe(true);
			expect(servers.some((d) => d.model === '2U Server' && d.u_height === 2)).toBe(true);
			expect(servers.some((d) => d.model === '4U Server' && d.u_height === 4)).toBe(true);
		});

		it('includes network device types', () => {
			const deviceTypes = getStarterLibrary();
			const network = deviceTypes.filter((d) => d.rackarr.category === 'network');

			expect(network.length).toBeGreaterThanOrEqual(3);
			expect(network.some((d) => d.model === '1U Switch')).toBe(true);
			expect(network.some((d) => d.model === '1U Router')).toBe(true);
			expect(network.some((d) => d.model === '1U Firewall')).toBe(true);
		});

		it('includes patch panel device types', () => {
			const deviceTypes = getStarterLibrary();
			const patchPanels = deviceTypes.filter((d) => d.rackarr.category === 'patch-panel');

			expect(patchPanels.length).toBeGreaterThanOrEqual(2);
			expect(patchPanels.some((d) => d.model === '1U Patch Panel')).toBe(true);
			expect(patchPanels.some((d) => d.model === '2U Patch Panel')).toBe(true);
		});

		it('includes power device types', () => {
			const deviceTypes = getStarterLibrary();
			const power = deviceTypes.filter((d) => d.rackarr.category === 'power');

			expect(power.length).toBeGreaterThanOrEqual(3);
			expect(power.some((d) => d.model === '1U PDU')).toBe(true);
			expect(power.some((d) => d.model === '2U UPS')).toBe(true);
			expect(power.some((d) => d.model === '4U UPS')).toBe(true);
		});

		it('includes blank panel device types', () => {
			const deviceTypes = getStarterLibrary();
			const blanks = deviceTypes.filter((d) => d.rackarr.category === 'blank');

			expect(blanks.length).toBeGreaterThanOrEqual(3);
			expect(blanks.some((d) => d.model === '0.5U Blank' && d.u_height === 0.5)).toBe(true);
			expect(blanks.some((d) => d.model === '1U Blank')).toBe(true);
			expect(blanks.some((d) => d.model === '2U Blank')).toBe(true);
		});

		it('includes half-U blanking fan', () => {
			const deviceTypes = getStarterLibrary();
			const cooling = deviceTypes.filter((d) => d.rackarr.category === 'cooling');

			expect(cooling.some((d) => d.model === '0.5U Blanking Fan' && d.u_height === 0.5)).toBe(true);
		});

		it('includes shelf device types', () => {
			const deviceTypes = getStarterLibrary();
			const shelves = deviceTypes.filter((d) => d.rackarr.category === 'shelf');

			expect(shelves.length).toBe(3);
			expect(shelves.some((d) => d.model === '1U Shelf' && d.u_height === 1)).toBe(true);
			expect(shelves.some((d) => d.model === '2U Shelf' && d.u_height === 2)).toBe(true);
			expect(shelves.some((d) => d.model === '4U Shelf' && d.u_height === 4)).toBe(true);
		});

		it('shelf device types have correct colour', () => {
			const deviceTypes = getStarterLibrary();
			const shelves = deviceTypes.filter((d) => d.rackarr.category === 'shelf');

			shelves.forEach((shelf) => {
				expect(shelf.rackarr.colour).toBe('#8B4513');
			});
		});
	});

	describe('Layout integration', () => {
		it('new layout includes starter library', () => {
			const layout = createLayout();

			expect(layout.device_types.length).toBe(27);
			expect(layout.device_types[0]?.slug).toBeTruthy();
		});

		it('starter device types have valid structure', () => {
			const layout = createLayout();
			const starterDeviceType = layout.device_types[0];

			expect(starterDeviceType).toBeDefined();
			expect(starterDeviceType!.slug).toBeTruthy();
			expect(starterDeviceType!.u_height).toBeGreaterThan(0);
			expect(starterDeviceType!.rackarr.category).toBeTruthy();
		});
	});
});
