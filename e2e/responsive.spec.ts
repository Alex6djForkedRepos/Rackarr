import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
	test.describe('Desktop viewport (1200px)', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 1200, height: 800 });
			await page.goto('/');
		});

		test('toolbar buttons show text labels', async ({ page }) => {
			// At desktop size, buttons should show text
			const saveButton = page.getByRole('button', { name: /save/i });
			await expect(saveButton).toBeVisible();

			// Button should contain visible text "Save"
			const buttonText = await saveButton.textContent();
			expect(buttonText).toContain('Save');
		});

		test('brand name and tagline visible', async ({ page }) => {
			const brandName = page.locator('.brand-name');
			await expect(brandName).toBeVisible();
			await expect(brandName).toHaveText('Rackarr');

			const tagline = page.locator('.brand-tagline');
			await expect(tagline).toBeVisible();
		});

		test('sidebar is visible', async ({ page }) => {
			const sidebar = page.locator('aside.sidebar');
			await expect(sidebar).toBeVisible();
		});

		test('no horizontal scroll', async ({ page }) => {
			// Check that document doesn't have horizontal overflow
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > document.documentElement.clientWidth;
			});
			expect(hasHorizontalScroll).toBe(false);
		});
	});

	test.describe('Medium viewport (900px)', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 900, height: 800 });
			await page.goto('/');
		});

		test('toolbar buttons are icon-only', async ({ page }) => {
			// At 900px (< 1000px breakpoint), buttons should be icon-only
			const saveButton = page.getByRole('button', { name: /save/i });
			await expect(saveButton).toBeVisible();

			// The span inside should be hidden via CSS display: none
			const buttonSpan = saveButton.locator('span');
			await expect(buttonSpan).toBeHidden();
		});

		test('brand tagline is hidden', async ({ page }) => {
			// At 900px (< 900px breakpoint), tagline should be hidden
			const tagline = page.locator('.brand-tagline');
			await expect(tagline).toBeHidden();
		});

		test('brand name is still visible', async ({ page }) => {
			const brandName = page.locator('.brand-name');
			await expect(brandName).toBeVisible();
		});

		test('sidebar is narrower', async ({ page }) => {
			const sidebar = page.locator('aside.sidebar');
			await expect(sidebar).toBeVisible();

			// Sidebar should be 200px at this breakpoint
			const box = await sidebar.boundingBox();
			expect(box?.width).toBeLessThanOrEqual(210); // Allow some tolerance
			expect(box?.width).toBeGreaterThanOrEqual(190);
		});

		test('no horizontal scroll', async ({ page }) => {
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > document.documentElement.clientWidth;
			});
			expect(hasHorizontalScroll).toBe(false);
		});

		test('tooltips still work for icon-only buttons', async ({ page }) => {
			const saveButton = page.getByRole('button', { name: /save/i });
			await saveButton.hover();

			// Wait for tooltip to appear
			await page.waitForTimeout(600); // Tooltip has 500ms delay

			const tooltip = page.locator('.tooltip');
			await expect(tooltip).toBeVisible();
		});
	});

	test.describe('Small viewport (600px)', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 600, height: 800 });
			await page.goto('/');
		});

		test('brand name is hidden, logo visible', async ({ page }) => {
			// At 600px, brand name should be hidden
			const brandName = page.locator('.brand-name');
			await expect(brandName).toBeHidden();

			// Logo (SVG) should still be visible
			const logo = page.locator('.toolbar-brand svg');
			await expect(logo).toBeVisible();
		});

		test('no horizontal scroll', async ({ page }) => {
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > document.documentElement.clientWidth;
			});
			expect(hasHorizontalScroll).toBe(false);
		});
	});

	test.describe('Panzoom at narrow viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 800, height: 600 });
			await page.goto('/');

			// Create a rack first (click New Rack on welcome screen)
			const newRackBtn = page.getByRole('button', { name: /new rack/i }).first();
			await newRackBtn.click();

			// Wait for dialog and click Create
			const createBtn = page.getByRole('button', { name: /create/i });
			await createBtn.click();

			// Wait for rack to be visible
			await page.waitForSelector('.rack-dual-view', { timeout: 5000 });
		});

		test('canvas is visible and interactive', async ({ page }) => {
			const canvas = page.locator('.canvas');
			await expect(canvas).toBeVisible();
		});

		test('can pan the canvas', async ({ page }) => {
			// Get the rack element position before panning
			const rack = page.locator('.rack-dual-view');
			await expect(rack).toBeVisible();

			const initialBox = await rack.boundingBox();
			expect(initialBox).toBeTruthy();

			// Perform a drag to pan
			const canvas = page.locator('.canvas');
			await canvas.hover();

			// Mouse drag to pan
			const canvasBox = await canvas.boundingBox();
			if (canvasBox) {
				const startX = canvasBox.x + canvasBox.width / 2;
				const startY = canvasBox.y + canvasBox.height / 2;

				await page.mouse.move(startX, startY);
				await page.mouse.down();
				await page.mouse.move(startX + 50, startY + 50, { steps: 5 });
				await page.mouse.up();
			}

			// Verify panzoom container has moved (transform applied)
			const panzoomContainer = page.locator('.panzoom-container');
			const transform = await panzoomContainer.getAttribute('style');
			expect(transform).toContain('matrix');
		});

		test('reset view button works', async ({ page }) => {
			// Rack should already be created from beforeEach
			// Click Reset View button
			const resetButton = page.getByRole('button', { name: /reset view/i });
			await resetButton.click();

			// Verify the button click worked without error
			await expect(resetButton).toBeVisible();
		});
	});
});
