import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { resetLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore, getUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore } from '$lib/stores/canvas.svelte';
import { resetHistoryStore } from '$lib/stores/history.svelte';

describe('Canvas Overflow Handling', () => {
	beforeEach(() => {
		resetHistoryStore();
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
	});

	describe('Container structure', () => {
		it('canvas renders with canvas class', () => {
			const uiStore = getUIStore();

			const { container } = render(Canvas, {
				props: {
					displayMode: uiStore.displayMode
				}
			});

			// Canvas component should render with .canvas class
			const canvasElement = container.querySelector('.canvas');
			expect(canvasElement).toBeInTheDocument();
		});

		it('canvas element has proper class for overflow CSS', () => {
			const uiStore = getUIStore();

			const { container } = render(Canvas, {
				props: {
					displayMode: uiStore.displayMode
				}
			});

			// Canvas class exists for CSS targeting (has overflow: hidden)
			const canvasElement = container.querySelector('.canvas');
			expect(canvasElement).toBeInTheDocument();
			expect(canvasElement).toHaveClass('canvas');
		});

		it('canvas has application role for accessibility', () => {
			const uiStore = getUIStore();

			const { container } = render(Canvas, {
				props: {
					displayMode: uiStore.displayMode
				}
			});

			const canvasElement = container.querySelector('.canvas');
			expect(canvasElement).toHaveAttribute('role', 'application');
		});

		it('canvas has aria-label for accessibility', () => {
			const uiStore = getUIStore();

			const { container } = render(Canvas, {
				props: {
					displayMode: uiStore.displayMode
				}
			});

			const canvasElement = container.querySelector('.canvas');
			expect(canvasElement).toHaveAttribute('aria-label', 'Rack layout canvas');
		});
	});
});
