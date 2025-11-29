import { describe, it, expect } from 'vitest';
import { screenToSVG, svgToScreen } from '$lib/utils/coordinates';

// Helper to create a mock SVG element with a specified CTM
function createMockSVG(matrix: {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
}): SVGSVGElement {
	const mockPoint = {
		x: 0,
		y: 0,
		matrixTransform(m: DOMMatrix) {
			// Apply matrix transformation: [a c e] [x]   [ax + cy + e]
			//                              [b d f] [y] = [bx + dy + f]
			//                              [0 0 1] [1]   [1]
			return {
				x: m.a * this.x + m.c * this.y + m.e,
				y: m.b * this.x + m.d * this.y + m.f
			};
		}
	};

	const ctm = {
		a: matrix.a,
		b: matrix.b,
		c: matrix.c,
		d: matrix.d,
		e: matrix.e,
		f: matrix.f,
		inverse() {
			// For simple scale + translate matrices (no rotation/skew):
			// inverse of [a 0 e]   is   [1/a  0   -e/a]
			//            [0 d f]        [0   1/d  -f/d]
			//            [0 0 1]        [0    0    1  ]
			const det = this.a * this.d - this.b * this.c;
			return {
				a: this.d / det,
				b: -this.b / det,
				c: -this.c / det,
				d: this.a / det,
				e: (this.c * this.f - this.d * this.e) / det,
				f: (this.b * this.e - this.a * this.f) / det
			};
		}
	};

	return {
		createSVGPoint() {
			return { ...mockPoint };
		},
		getScreenCTM() {
			return ctm;
		}
	} as unknown as SVGSVGElement;
}

describe('screenToSVG', () => {
	it('converts screen coordinates to SVG user space (identity matrix)', () => {
		// Identity matrix: no transform
		const mockSvg = createMockSVG({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		const result = screenToSVG(mockSvg, 100, 200);
		expect(result.x).toBeCloseTo(100);
		expect(result.y).toBeCloseTo(200);
	});

	it('accounts for zoom transform (2x scale)', () => {
		// 2x zoom: screen coords are 2x the SVG coords
		const mockSvg = createMockSVG({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 });
		const result = screenToSVG(mockSvg, 200, 400);
		expect(result.x).toBeCloseTo(100);
		expect(result.y).toBeCloseTo(200);
	});

	it('accounts for pan transform (translation)', () => {
		// Panned 50px in both directions
		const mockSvg = createMockSVG({ a: 1, b: 0, c: 0, d: 1, e: 50, f: 50 });
		const result = screenToSVG(mockSvg, 150, 150);
		expect(result.x).toBeCloseTo(100);
		expect(result.y).toBeCloseTo(100);
	});

	it('accounts for combined zoom and pan', () => {
		// 2x zoom + 100px pan: screen (300,300) should map to SVG (100,100)
		// Forward: SVG (100,100) * 2 + 100 = screen (300,300)
		// Inverse: (screen - pan) / zoom = (300-100)/2 = 100
		const mockSvg = createMockSVG({ a: 2, b: 0, c: 0, d: 2, e: 100, f: 100 });
		const result = screenToSVG(mockSvg, 300, 300);
		expect(result.x).toBeCloseTo(100);
		expect(result.y).toBeCloseTo(100);
	});

	it('handles 0.5x zoom (zoom out)', () => {
		const mockSvg = createMockSVG({ a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0 });
		const result = screenToSVG(mockSvg, 50, 100);
		expect(result.x).toBeCloseTo(100);
		expect(result.y).toBeCloseTo(200);
	});

	it('returns original coordinates when CTM is null', () => {
		const mockSvg = {
			createSVGPoint() {
				return { x: 0, y: 0 };
			},
			getScreenCTM() {
				return null;
			}
		} as unknown as SVGSVGElement;

		const result = screenToSVG(mockSvg, 100, 200);
		expect(result.x).toBe(100);
		expect(result.y).toBe(200);
	});
});

describe('svgToScreen', () => {
	it('converts SVG coordinates to screen space (identity matrix)', () => {
		const mockSvg = createMockSVG({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		const result = svgToScreen(mockSvg, 100, 200);
		expect(result.clientX).toBeCloseTo(100);
		expect(result.clientY).toBeCloseTo(200);
	});

	it('accounts for zoom transform (2x scale)', () => {
		const mockSvg = createMockSVG({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 });
		const result = svgToScreen(mockSvg, 100, 200);
		expect(result.clientX).toBeCloseTo(200);
		expect(result.clientY).toBeCloseTo(400);
	});

	it('accounts for pan transform', () => {
		const mockSvg = createMockSVG({ a: 1, b: 0, c: 0, d: 1, e: 50, f: 50 });
		const result = svgToScreen(mockSvg, 100, 100);
		expect(result.clientX).toBeCloseTo(150);
		expect(result.clientY).toBeCloseTo(150);
	});

	it('accounts for combined zoom and pan', () => {
		// SVG (100,100) at 2x zoom with 100px pan = screen (300,300)
		const mockSvg = createMockSVG({ a: 2, b: 0, c: 0, d: 2, e: 100, f: 100 });
		const result = svgToScreen(mockSvg, 100, 100);
		expect(result.clientX).toBeCloseTo(300);
		expect(result.clientY).toBeCloseTo(300);
	});

	it('returns original coordinates when CTM is null', () => {
		const mockSvg = {
			createSVGPoint() {
				return { x: 0, y: 0 };
			},
			getScreenCTM() {
				return null;
			}
		} as unknown as SVGSVGElement;

		const result = svgToScreen(mockSvg, 100, 200);
		expect(result.clientX).toBe(100);
		expect(result.clientY).toBe(200);
	});
});

describe('round-trip conversion', () => {
	it('screenToSVG then svgToScreen returns original coordinates', () => {
		const mockSvg = createMockSVG({ a: 1.5, b: 0, c: 0, d: 1.5, e: 75, f: 50 });

		const screenX = 250;
		const screenY = 300;

		const svg = screenToSVG(mockSvg, screenX, screenY);
		const back = svgToScreen(mockSvg, svg.x, svg.y);

		expect(back.clientX).toBeCloseTo(screenX);
		expect(back.clientY).toBeCloseTo(screenY);
	});

	it('svgToScreen then screenToSVG returns original coordinates', () => {
		const mockSvg = createMockSVG({ a: 0.75, b: 0, c: 0, d: 0.75, e: 30, f: 20 });

		const svgX = 150;
		const svgY = 200;

		const screen = svgToScreen(mockSvg, svgX, svgY);
		const back = screenToSVG(mockSvg, screen.clientX, screen.clientY);

		expect(back.x).toBeCloseTo(svgX);
		expect(back.y).toBeCloseTo(svgY);
	});
});
