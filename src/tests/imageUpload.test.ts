import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import {
	validateImageFile,
	generateImageFilename,
	resizeImage,
	fileToImageData
} from '$lib/utils/imageUpload';
import { MAX_IMAGE_SIZE_BYTES } from '$lib/types/constants';

// Setup URL mocks for jsdom (which doesn't implement these)
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

// Helper to create mock File objects
function createMockFile(name: string, type: string, size: number = 1024): File {
	const content = new Array(size).fill('a').join('');
	return new File([content], name, { type });
}

describe('Image Upload Utilities', () => {
	describe('validateImageFile', () => {
		it('accepts valid PNG file', () => {
			const file = createMockFile('test.png', 'image/png', 1024);
			const result = validateImageFile(file);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('accepts valid JPEG file', () => {
			const file = createMockFile('test.jpg', 'image/jpeg', 1024);
			const result = validateImageFile(file);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('accepts valid WebP file', () => {
			const file = createMockFile('test.webp', 'image/webp', 1024);
			const result = validateImageFile(file);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('rejects GIF file', () => {
			const file = createMockFile('test.gif', 'image/gif', 1024);
			const result = validateImageFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('Unsupported');
		});

		it('rejects BMP file', () => {
			const file = createMockFile('test.bmp', 'image/bmp', 1024);
			const result = validateImageFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('Unsupported');
		});

		it('rejects oversized file', () => {
			const file = createMockFile('test.png', 'image/png', MAX_IMAGE_SIZE_BYTES + 1);
			const result = validateImageFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('too large');
		});

		it('accepts file at exactly max size', () => {
			const file = createMockFile('test.png', 'image/png', MAX_IMAGE_SIZE_BYTES);
			const result = validateImageFile(file);
			expect(result.valid).toBe(true);
		});
	});

	describe('generateImageFilename', () => {
		it('generates correct filename format for front face', () => {
			const filename = generateImageFilename('server-1u', 'front', 'png');
			expect(filename).toBe('server-1u-front.png');
		});

		it('generates correct filename format for rear face', () => {
			const filename = generateImageFilename('router-2u', 'rear', 'jpeg');
			expect(filename).toBe('router-2u-rear.jpeg');
		});

		it('handles device slug with special characters', () => {
			const filename = generateImageFilename('my-device-123', 'front', 'webp');
			expect(filename).toBe('my-device-123-front.webp');
		});

		it('handles different extensions', () => {
			expect(generateImageFilename('dev', 'front', 'jpg')).toBe('dev-front.jpg');
			expect(generateImageFilename('dev', 'front', 'png')).toBe('dev-front.png');
			expect(generateImageFilename('dev', 'front', 'webp')).toBe('dev-front.webp');
		});
	});

	describe('resizeImage', () => {
		// Note: Canvas API testing is limited in jsdom
		// These tests verify the function signature and basic error handling

		it('returns a Blob', async () => {
			const file = createMockFile('test.png', 'image/png', 100);

			// Mock canvas methods for jsdom
			const mockCanvas = {
				getContext: vi.fn(() => ({
					drawImage: vi.fn()
				})),
				toBlob: vi.fn((callback) => {
					callback(new Blob(['test'], { type: 'image/png' }));
				}),
				width: 0,
				height: 0
			};

			// Save original createElement
			const originalCreateElement = document.createElement.bind(document);
			vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
				if (tag === 'canvas') {
					return mockCanvas as unknown as HTMLCanvasElement;
				}
				return originalCreateElement(tag);
			});

			// Mock Image
			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
				width: 100,
				height: 100
			};

			vi.spyOn(globalThis, 'Image').mockImplementation(() => {
				setTimeout(() => {
					if (mockImage.onload) mockImage.onload();
				}, 0);
				return mockImage as unknown as HTMLImageElement;
			});

			const result = await resizeImage(file, 200, 200);
			expect(result).toBeInstanceOf(Blob);

			vi.restoreAllMocks();
		});

		it('handles images smaller than max dimensions', async () => {
			const file = createMockFile('small.png', 'image/png', 100);

			const mockCanvas = {
				getContext: vi.fn(() => ({
					drawImage: vi.fn()
				})),
				toBlob: vi.fn((callback) => {
					callback(new Blob(['test'], { type: 'image/png' }));
				}),
				width: 0,
				height: 0
			};

			const originalCreateElement = document.createElement.bind(document);
			vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
				if (tag === 'canvas') {
					return mockCanvas as unknown as HTMLCanvasElement;
				}
				return originalCreateElement(tag);
			});

			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
				width: 50,
				height: 50
			};

			vi.spyOn(globalThis, 'Image').mockImplementation(() => {
				setTimeout(() => {
					if (mockImage.onload) mockImage.onload();
				}, 0);
				return mockImage as unknown as HTMLImageElement;
			});

			const result = await resizeImage(file, 200, 200);
			expect(result).toBeInstanceOf(Blob);

			// Canvas size should match original image (smaller than max)
			expect(mockCanvas.width).toBe(50);
			expect(mockCanvas.height).toBe(50);

			vi.restoreAllMocks();
		});

		it('maintains aspect ratio for wide images', async () => {
			const file = createMockFile('wide.png', 'image/png', 100);

			const mockCanvas = {
				getContext: vi.fn(() => ({
					drawImage: vi.fn()
				})),
				toBlob: vi.fn((callback) => {
					callback(new Blob(['test'], { type: 'image/png' }));
				}),
				width: 0,
				height: 0
			};

			const originalCreateElement = document.createElement.bind(document);
			vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
				if (tag === 'canvas') {
					return mockCanvas as unknown as HTMLCanvasElement;
				}
				return originalCreateElement(tag);
			});

			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
				width: 400, // Wide image
				height: 200
			};

			vi.spyOn(globalThis, 'Image').mockImplementation(() => {
				setTimeout(() => {
					if (mockImage.onload) mockImage.onload();
				}, 0);
				return mockImage as unknown as HTMLImageElement;
			});

			await resizeImage(file, 200, 200);

			// Aspect ratio 2:1 should be maintained
			// Width limited to 200, so height should be 100
			expect(mockCanvas.width).toBe(200);
			expect(mockCanvas.height).toBe(100);

			vi.restoreAllMocks();
		});

		it('maintains aspect ratio for tall images', async () => {
			const file = createMockFile('tall.png', 'image/png', 100);

			const mockCanvas = {
				getContext: vi.fn(() => ({
					drawImage: vi.fn()
				})),
				toBlob: vi.fn((callback) => {
					callback(new Blob(['test'], { type: 'image/png' }));
				}),
				width: 0,
				height: 0
			};

			const originalCreateElement = document.createElement.bind(document);
			vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
				if (tag === 'canvas') {
					return mockCanvas as unknown as HTMLCanvasElement;
				}
				return originalCreateElement(tag);
			});

			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
				width: 200, // Tall image
				height: 400
			};

			vi.spyOn(globalThis, 'Image').mockImplementation(() => {
				setTimeout(() => {
					if (mockImage.onload) mockImage.onload();
				}, 0);
				return mockImage as unknown as HTMLImageElement;
			});

			await resizeImage(file, 200, 200);

			// Aspect ratio 1:2 should be maintained
			// Height limited to 200, so width should be 100
			expect(mockCanvas.width).toBe(100);
			expect(mockCanvas.height).toBe(200);

			vi.restoreAllMocks();
		});
	});

	describe('fileToImageData', () => {
		beforeEach(() => {
			vi.restoreAllMocks();
		});

		it('creates correct ImageData structure', async () => {
			const file = createMockFile('test.png', 'image/png', 100);
			Object.defineProperty(file, 'name', { value: 'test.png', writable: false });

			// Mock FileReader
			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/png;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/png;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			const result = await fileToImageData(file, 'server-1u', 'front');

			expect(result.blob).toBe(file);
			expect(result.dataUrl).toBe('data:image/png;base64,test');
			expect(result.filename).toBe('server-1u-front.png');
		});

		it('generates correct filename for JPEG', async () => {
			const file = createMockFile('photo.jpg', 'image/jpeg', 100);
			Object.defineProperty(file, 'name', { value: 'photo.jpg', writable: false });

			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/jpeg;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/jpeg;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			const result = await fileToImageData(file, 'router', 'rear');

			expect(result.filename).toBe('router-rear.jpg');
		});

		it('generates correct filename for WebP', async () => {
			const file = createMockFile('image.webp', 'image/webp', 100);
			Object.defineProperty(file, 'name', { value: 'image.webp', writable: false });

			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/webp;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/webp;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			const result = await fileToImageData(file, 'switch', 'front');

			expect(result.filename).toBe('switch-front.webp');
		});
	});
});
