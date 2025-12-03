/**
 * v0.2 Type Definitions
 * NetBox-compatible data structures with snake_case naming
 *
 * These types are created alongside existing types to enable incremental migration.
 * Export with V02 suffix to avoid conflicts during transition.
 */

// Re-export shared enums from main types (these don't change)
export type { DeviceCategory, FormFactor, RackView } from './index';

/**
 * Airflow direction (NetBox-compatible)
 */
export type AirflowV02 =
	| 'front-to-rear'
	| 'rear-to-front'
	| 'left-to-right'
	| 'right-to-left'
	| 'side-to-rear'
	| 'passive';

/**
 * Device face in rack
 */
export type DeviceFaceV02 = 'front' | 'rear' | 'both';

/**
 * Weight unit
 */
export type WeightUnitV02 = 'kg' | 'lb';

/**
 * Rackarr-specific extensions to DeviceType
 */
export interface RackarrDeviceTypeExtensionsV02 {
	colour: string; // Hex colour for display
	category: import('./index').DeviceCategory; // For UI filtering
	tags?: string[]; // User organization
}

/**
 * Device Type - template definition in library
 * NetBox-compatible with Rackarr extensions
 */
export interface DeviceTypeV02 {
	// Required fields
	slug: string; // Unique identifier, kebab-case
	u_height: number; // Height in rack units

	// Optional NetBox fields
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnitV02;
	airflow?: AirflowV02;
	comments?: string;

	// Rackarr extensions
	rackarr: RackarrDeviceTypeExtensionsV02;
}

/**
 * Device - placed instance in rack
 */
export interface DeviceV02 {
	device_type: string; // Slug reference to DeviceType
	name?: string; // Optional display name override
	position: number; // U position (bottom of device)
	face: DeviceFaceV02;
}

/**
 * Rack definition
 */
export interface RackV02 {
	name: string;
	height: number; // Total U height
	width: 10 | 19; // Rack width in inches
	desc_units: boolean; // True = number from top down
	form_factor: import('./index').FormFactor;
	starting_unit: number; // First U number (usually 1)
	position: number; // Order in layout (persisted)
	devices: DeviceV02[];

	// Runtime only (not persisted) - added at load time
	view?: import('./index').RackView;
}

/**
 * Display mode for device rendering
 */
export type DisplayModeV02 = 'label' | 'image';

/**
 * Layout settings
 */
export interface LayoutSettingsV02 {
	display_mode: DisplayModeV02;
	show_labels_on_images: boolean;
}

/**
 * Complete layout/project
 */
export interface LayoutV02 {
	version: string;
	name: string;
	rack: RackV02; // Single rack (v0.2)
	device_types: DeviceTypeV02[];
	settings: LayoutSettingsV02;
}

/**
 * Helper type for creating a DeviceType without requiring all fields
 */
export interface CreateDeviceTypeDataV02 {
	name: string;
	u_height: number;
	category: import('./index').DeviceCategory;
	colour: string;
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnitV02;
	airflow?: AirflowV02;
	comments?: string;
	tags?: string[];
}

/**
 * Helper type for creating a rack
 */
export interface CreateRackDataV02 {
	name: string;
	height: number;
	width?: 10 | 19;
	form_factor?: import('./index').FormFactor;
	desc_units?: boolean;
	starting_unit?: number;
}
