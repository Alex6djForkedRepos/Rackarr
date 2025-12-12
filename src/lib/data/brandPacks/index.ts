/**
 * Brand Pack Index
 * Exports all brand-specific device packs
 */

import type { DeviceType } from '$lib/types';
import { ubiquitiDevices } from './ubiquiti';
import { mikrotikDevices } from './mikrotik';

export { ubiquitiDevices, mikrotikDevices };

/**
 * Brand section data structure
 */
export interface BrandSection {
	id: string;
	title: string;
	devices: DeviceType[];
	defaultExpanded: boolean;
}

/**
 * Get all brand pack sections
 * Does not include the generic section (that comes from the layout store)
 */
export function getBrandPacks(): BrandSection[] {
	return [
		{
			id: 'ubiquiti',
			title: 'Ubiquiti',
			devices: ubiquitiDevices,
			defaultExpanded: false
		},
		{
			id: 'mikrotik',
			title: 'Mikrotik',
			devices: mikrotikDevices,
			defaultExpanded: false
		}
	];
}

/**
 * Get devices for a specific brand
 */
export function getBrandDevices(brandId: string): DeviceType[] {
	switch (brandId) {
		case 'ubiquiti':
			return ubiquitiDevices;
		case 'mikrotik':
			return mikrotikDevices;
		default:
			return [];
	}
}
