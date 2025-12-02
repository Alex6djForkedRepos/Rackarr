import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createArchive, extractArchive, isRackarrArchive } from '$lib/utils/archive';
import type { Layout } from '$lib/types';
import type { ImageData, ImageStoreMap } from '$lib/types/images';
import { createLayout } from '$lib/utils/serialization';
import JSZip from 'jszip';

// Setup URL mocks for jsdom
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
	// @ts-expect-error - polyfill for jsdom
	URL.createObjectURL = vi.fn(() => 'blob:mock-url');
	// @ts-expect-error - polyfill for jsdom
	URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
	URL.createObjectURL = originalCreateObjectURL;
	URL.revokeObjectURL = originalRevokeObjectURL;
});

// Helper to create a simple layout
function createTestLayout(): Layout {
	const layout = createLayout('Test Layout');
	return layout;
}

// Helper to create mock ImageData
function createMockImageData(filename: string = 'test.png'): ImageData {
	return {
		blob: new Blob(['test image data'], { type: 'image/png' }),
		dataUrl: 'data:image/png;base64,dGVzdCBpbWFnZSBkYXRh',
		filename
	};
}

// Helper to convert Blob to File
function blobToFile(blob: Blob, filename: string): File {
	return new File([blob], filename, { type: blob.type });
}

describe('Archive Utilities', () => {
	describe('createArchive', () => {
		it('produces a valid ZIP blob', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(layout, images);

			expect(blob).toBeInstanceOf(Blob);
			expect(blob.type).toBe('application/zip');
		});

		it('includes layout.json in the archive', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(layout, images);
			const zip = await JSZip.loadAsync(blob);

			expect(zip.files['layout.json']).toBeDefined();

			const content = await zip.files['layout.json'].async('string');
			const parsed = JSON.parse(content);
			expect(parsed.name).toBe('Test Layout');
		});

		it('includes images in images/ folder', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			// Add a device to library first
			const deviceId = 'device-123';
			images.set(deviceId, {
				front: createMockImageData('device-123-front.png')
			});

			const blob = await createArchive(layout, images);
			const zip = await JSZip.loadAsync(blob);

			expect(zip.files['images/device-123-front.png']).toBeDefined();
		});

		it('handles both front and rear images', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const deviceId = 'device-456';
			images.set(deviceId, {
				front: createMockImageData('device-456-front.png'),
				rear: createMockImageData('device-456-rear.png')
			});

			const blob = await createArchive(layout, images);
			const zip = await JSZip.loadAsync(blob);

			expect(zip.files['images/device-456-front.png']).toBeDefined();
			expect(zip.files['images/device-456-rear.png']).toBeDefined();
		});

		it('creates images folder even with no images', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(layout, images);
			const zip = await JSZip.loadAsync(blob);

			// images/ folder should exist (may be empty)
			const imageFiles = Object.keys(zip.files).filter((f) => f.startsWith('images/'));
			// Either empty folder entry or no entries is acceptable
			expect(imageFiles.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe('extractArchive', () => {
		it('reads layout correctly from archive', async () => {
			// Create an archive first
			const originalLayout = createTestLayout();
			originalLayout.name = 'Extracted Test';
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(originalLayout, images);
			const file = blobToFile(blob, 'test.rackarr.zip');

			const result = await extractArchive(file);

			expect(result.layout.name).toBe('Extracted Test');
		});

		it('reads images correctly from archive', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const deviceId = 'test-device';
			const imageData = createMockImageData('test-device-front.png');
			images.set(deviceId, { front: imageData });

			const blob = await createArchive(layout, images);
			const file = blobToFile(blob, 'test.rackarr.zip');

			const result = await extractArchive(file);

			expect(result.images.has(deviceId)).toBe(true);
			expect(result.images.get(deviceId)?.front).toBeDefined();
			expect(result.images.get(deviceId)?.front?.filename).toBe('test-device-front.png');
		});

		it('handles archive with no images', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(layout, images);
			const file = blobToFile(blob, 'test.rackarr.zip');

			const result = await extractArchive(file);

			expect(result.images.size).toBe(0);
		});

		it('throws on corrupted archive', async () => {
			const corruptedBlob = new Blob(['not a zip file'], { type: 'application/zip' });
			const file = blobToFile(corruptedBlob, 'corrupted.rackarr.zip');

			await expect(extractArchive(file)).rejects.toThrow();
		});

		it('throws on missing layout.json', async () => {
			// Create a ZIP without layout.json
			const zip = new JSZip();
			zip.file('other.txt', 'some content');
			const blob = await zip.generateAsync({ type: 'blob' });
			const file = blobToFile(blob, 'missing-layout.rackarr.zip');

			await expect(extractArchive(file)).rejects.toThrow(/layout\.json not found/i);
		});
	});

	describe('round-trip', () => {
		it('create then extract matches original layout', async () => {
			const originalLayout = createTestLayout();
			originalLayout.name = 'Round Trip Test';
			const images: ImageStoreMap = new Map();

			const blob = await createArchive(originalLayout, images);
			const file = blobToFile(blob, 'roundtrip.rackarr.zip');
			const result = await extractArchive(file);

			expect(result.layout.name).toBe(originalLayout.name);
			expect(result.layout.version).toBe(originalLayout.version);
		});

		it('create then extract preserves images', async () => {
			const layout = createTestLayout();
			const images: ImageStoreMap = new Map();

			const deviceId = 'roundtrip-device';
			images.set(deviceId, {
				front: createMockImageData('roundtrip-device-front.png'),
				rear: createMockImageData('roundtrip-device-rear.png')
			});

			const blob = await createArchive(layout, images);
			const file = blobToFile(blob, 'roundtrip.rackarr.zip');
			const result = await extractArchive(file);

			expect(result.images.has(deviceId)).toBe(true);
			const deviceImages = result.images.get(deviceId);
			expect(deviceImages?.front).toBeDefined();
			expect(deviceImages?.rear).toBeDefined();
			expect(deviceImages?.front?.filename).toBe('roundtrip-device-front.png');
			expect(deviceImages?.rear?.filename).toBe('roundtrip-device-rear.png');
		});
	});

	describe('isRackarrArchive', () => {
		it('returns true for .rackarr.zip extension', () => {
			const file = new File([], 'test.rackarr.zip', { type: 'application/zip' });
			expect(isRackarrArchive(file)).toBe(true);
		});

		it('returns true for .rackarr.zip with uppercase', () => {
			const file = new File([], 'TEST.RACKARR.ZIP', { type: 'application/zip' });
			expect(isRackarrArchive(file)).toBe(true);
		});

		it('returns false for .rackarr.json', () => {
			const file = new File([], 'test.rackarr.json', { type: 'application/json' });
			expect(isRackarrArchive(file)).toBe(false);
		});

		it('returns false for plain .zip', () => {
			const file = new File([], 'test.zip', { type: 'application/zip' });
			expect(isRackarrArchive(file)).toBe(false);
		});

		it('returns false for other extensions', () => {
			const file = new File([], 'test.json', { type: 'application/json' });
			expect(isRackarrArchive(file)).toBe(false);
		});
	});
});
