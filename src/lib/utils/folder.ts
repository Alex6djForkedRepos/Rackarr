/**
 * Folder Archive Utilities
 * For v0.2 folder-based ZIP archives with YAML and nested image structure
 */

import JSZip from 'jszip';
import type { LayoutV02 } from '$lib/types/v02';
import type { ImageData, ImageStoreMap } from '$lib/types/images';
import { slugify } from './slug';
import { serializeLayoutToYaml, parseLayoutYaml } from './yaml';

/**
 * MIME type to file extension mapping
 */
const MIME_TO_EXTENSION: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp'
};

/**
 * File extension to MIME type mapping
 */
const EXTENSION_TO_MIME: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp'
};

/**
 * Get file extension from MIME type
 */
export function getImageExtension(mimeType: string): string {
	return MIME_TO_EXTENSION[mimeType] ?? 'png';
}

/**
 * Get MIME type from filename
 */
export function getMimeType(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? '';
	return EXTENSION_TO_MIME[ext] ?? 'image/png';
}

/**
 * Create a folder-based ZIP archive from layout and images
 * Structure: [name]/[name].yaml + [name]/assets/[slug]/[face].[ext]
 */
export async function createFolderArchive(layout: LayoutV02, images: ImageStoreMap): Promise<Blob> {
	const zip = new JSZip();

	// Sanitize folder name using slugify
	const folderName = slugify(layout.name) || 'layout';

	// Create main folder
	const folder = zip.folder(folderName);
	if (!folder) {
		throw new Error('Failed to create folder in ZIP');
	}

	// Serialize layout to YAML (excludes runtime fields)
	const yamlContent = serializeLayoutToYaml(layout);
	folder.file(`${folderName}.yaml`, yamlContent);

	// Add images if present
	if (images.size > 0) {
		const assetsFolder = folder.folder('assets');
		if (!assetsFolder) {
			throw new Error('Failed to create assets folder');
		}

		for (const [deviceSlug, deviceImages] of images) {
			const deviceFolder = assetsFolder.folder(deviceSlug);
			if (!deviceFolder) continue;

			if (deviceImages.front) {
				const ext = getImageExtension(deviceImages.front.blob.type);
				deviceFolder.file(`front.${ext}`, deviceImages.front.blob);
			}

			if (deviceImages.rear) {
				const ext = getImageExtension(deviceImages.rear.blob.type);
				deviceFolder.file(`rear.${ext}`, deviceImages.rear.blob);
			}
		}
	}

	// Generate ZIP blob
	return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}

/**
 * Extract a folder-based ZIP archive
 * Returns layout and images map
 */
export async function extractFolderArchive(
	blob: Blob
): Promise<{ layout: LayoutV02; images: ImageStoreMap }> {
	const zip = await JSZip.loadAsync(blob);

	// Find the YAML file (should be [name]/[name].yaml)
	const yamlFiles = Object.keys(zip.files).filter(
		(name) => name.endsWith('.yaml') && !name.endsWith('/')
	);

	if (yamlFiles.length === 0) {
		throw new Error('No YAML file found in archive');
	}

	// Get the first YAML file
	const yamlPath = yamlFiles[0];
	const yamlFile = zip.file(yamlPath);
	if (!yamlFile) {
		throw new Error('Could not read YAML file from archive');
	}

	// Parse YAML content
	const yamlContent = await yamlFile.async('string');
	const layout = parseLayoutYaml(yamlContent);

	// Find the folder name (parent of the YAML file)
	const folderName = yamlPath.split('/')[0];

	// Extract images from assets folder
	const images: ImageStoreMap = new Map();
	const assetsPrefix = `${folderName}/assets/`;

	const imageFiles = Object.keys(zip.files).filter(
		(name) =>
			name.startsWith(assetsPrefix) &&
			!name.endsWith('/') &&
			(name.endsWith('.png') ||
				name.endsWith('.jpg') ||
				name.endsWith('.jpeg') ||
				name.endsWith('.webp'))
	);

	for (const imagePath of imageFiles) {
		// Parse path: folder/assets/[slug]/[face].[ext]
		const relativePath = imagePath.substring(assetsPrefix.length);
		const parts = relativePath.split('/');

		if (parts.length !== 2) continue;

		const deviceSlug = parts[0];
		const filename = parts[1];
		const faceMatch = filename.match(/^(front|rear)\.\w+$/);

		if (!faceMatch || !deviceSlug) continue;

		const face = faceMatch[1] as 'front' | 'rear';
		const imageFile = zip.file(imagePath);

		if (!imageFile) continue;

		const imageBlob = await imageFile.async('blob');
		const dataUrl = await blobToDataUrl(imageBlob);

		const imageData: ImageData = {
			blob: imageBlob,
			dataUrl,
			filename
		};

		const existing = images.get(deviceSlug) ?? {};
		images.set(deviceSlug, {
			...existing,
			[face]: imageData
		});
	}

	return { layout, images };
}

/**
 * Convert a Blob to a data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read blob'));
		reader.readAsDataURL(blob);
	});
}
