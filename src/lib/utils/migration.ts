/**
 * Layout Migration Utilities
 * Handles migration of layouts from older versions to current version
 */

import type { Layout, Rack, PlacedDevice } from '$lib/types';
import { CURRENT_VERSION, DEFAULT_RACK_VIEW, DEFAULT_DEVICE_FACE } from '$lib/types/constants';

/**
 * Migrate a layout from any version to the current version
 * Adds missing fields with appropriate defaults
 * Returns a new layout object (does not modify original)
 */
export function migrateLayout(layout: Layout): Layout {
	// Deep clone to avoid modifying original
	const migrated: Layout = JSON.parse(JSON.stringify(layout));

	// Update version
	migrated.version = CURRENT_VERSION;

	// Migrate racks
	migrated.racks = migrated.racks.map(migrateRack);

	return migrated;
}

/**
 * Migrate a single rack
 * Adds view property if missing, migrates all devices
 */
function migrateRack(rack: Rack): Rack {
	const migratedRack = { ...rack };

	// Add view property if missing (v0.1 -> v0.2)
	if (!('view' in migratedRack)) {
		migratedRack.view = DEFAULT_RACK_VIEW;
	}

	// Migrate all placed devices
	migratedRack.devices = rack.devices.map(migrateDevice);

	return migratedRack;
}

/**
 * Migrate a single placed device
 * Adds face property if missing
 */
function migrateDevice(device: PlacedDevice): PlacedDevice {
	const migratedDevice = { ...device };

	// Add face property if missing (v0.1 -> v0.2)
	if (!('face' in migratedDevice)) {
		migratedDevice.face = DEFAULT_DEVICE_FACE;
	}

	return migratedDevice;
}
