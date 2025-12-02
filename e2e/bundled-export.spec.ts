import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

/**
 * Helper to create a rack
 */
async function createRack(page: Page, name: string, height: number = 24) {
	await page.click('.btn-primary:has-text("New Rack")');
	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}

	await page.click('button:has-text("Create")');
	await expect(page.locator('.rack-container')).toBeVisible();
}

test.describe('Bundled Export', () => {
	const downloadsPath = path.join(process.cwd(), 'e2e', 'downloads');

	test.beforeAll(async () => {
		if (!fs.existsSync(downloadsPath)) {
			fs.mkdirSync(downloadsPath, { recursive: true });
		}
	});

	test.afterAll(async () => {
		if (fs.existsSync(downloadsPath)) {
			const files = fs.readdirSync(downloadsPath);
			files.forEach((file) => {
				fs.unlinkSync(path.join(downloadsPath, file));
			});
			fs.rmdirSync(downloadsPath);
		}
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('export dialog shows export mode options', async ({ page }) => {
		await createRack(page, 'Export Test Rack', 24);

		// Open export dialog
		await page.click('button[aria-label="Export"]');

		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Check for export mode selector
		const exportModeSelect = dialog.locator('#export-mode, select:has(option:has-text("Quick"))');
		await expect(exportModeSelect).toBeVisible();

		// Check options exist (options in select aren't visible, use toBeAttached)
		await expect(dialog.locator('option:has-text("Quick")')).toBeAttached();
		await expect(dialog.locator('option:has-text("Bundled")')).toBeAttached();
	});

	test('bundled mode shows include source option', async ({ page }) => {
		await createRack(page, 'Export Test Rack', 24);

		await page.click('button[aria-label="Export"]');

		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Switch to bundled mode
		const exportModeSelect = dialog.locator('#export-mode, select:has(option:has-text("Quick"))');
		await exportModeSelect.selectOption('bundled');

		// Source option should now be visible
		await expect(dialog.locator('label:has-text("source")')).toBeVisible();
	});

	test('quick export produces single image file', async ({ page }) => {
		await createRack(page, 'Quick Export Rack', 24);

		const downloadPromise = page.waitForEvent('download');

		await page.click('button[aria-label="Export"]');
		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Default is quick mode, just click export
		await dialog.locator('button:has-text("Export")').click();

		const download = await downloadPromise;

		// Should be a PNG file, not a ZIP
		expect(download.suggestedFilename()).toMatch(/\.png$/);
	});

	test('bundled export produces ZIP with image and metadata', async ({ page }) => {
		await createRack(page, 'Bundled Export Rack', 24);

		const downloadPromise = page.waitForEvent('download');

		await page.click('button[aria-label="Export"]');
		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Switch to bundled mode
		const exportModeSelect = dialog.locator('#export-mode, select:has(option:has-text("Quick"))');
		await exportModeSelect.selectOption('bundled');

		// Uncheck include source for simpler test
		const sourceCheckbox = dialog.locator('input[type="checkbox"]').first();
		if (await sourceCheckbox.isChecked()) {
			await sourceCheckbox.uncheck();
		}

		await dialog.locator('button:has-text("Export")').click();

		const download = await downloadPromise;

		// Should be a ZIP file
		expect(download.suggestedFilename()).toMatch(/\.zip$/);

		// Save and verify contents
		const downloadPath = path.join(downloadsPath, download.suggestedFilename());
		await download.saveAs(downloadPath);

		const zipBuffer = fs.readFileSync(downloadPath);
		const zip = await JSZip.loadAsync(zipBuffer);

		// Should contain the image
		const files = Object.keys(zip.files);
		expect(files.some((f) => f.match(/rack\.(png|jpeg|jpg)$/))).toBe(true);

		// Should contain metadata.json
		expect(zip.file('metadata.json')).not.toBeNull();

		// Verify metadata structure
		const metadataJson = await zip.file('metadata.json')?.async('text');
		expect(metadataJson).toBeDefined();

		const metadata = JSON.parse(metadataJson!);
		expect(metadata.version).toBeDefined();
		expect(metadata.exportedAt).toBeDefined();
		expect(metadata.rackName).toBe('Bundled Export Rack');
		expect(metadata.exportOptions).toBeDefined();
	});

	test('bundled export with source includes .rackarr.zip', async ({ page }) => {
		await createRack(page, 'Source Export Rack', 24);

		const downloadPromise = page.waitForEvent('download');

		await page.click('button[aria-label="Export"]');
		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Switch to bundled mode
		const exportModeSelect = dialog.locator('#export-mode, select:has(option:has-text("Quick"))');
		await exportModeSelect.selectOption('bundled');

		// Ensure include source is checked
		const sourceCheckbox = dialog.locator('label:has-text("source") input[type="checkbox"]');
		if (!(await sourceCheckbox.isChecked())) {
			await sourceCheckbox.check();
		}

		await dialog.locator('button:has-text("Export")').click();

		const download = await downloadPromise;

		// Save and verify contents
		const downloadPath = path.join(downloadsPath, download.suggestedFilename());
		await download.saveAs(downloadPath);

		const zipBuffer = fs.readFileSync(downloadPath);
		const zip = await JSZip.loadAsync(zipBuffer);

		// Should contain source.rackarr.zip
		expect(zip.file('source.rackarr.zip')).not.toBeNull();

		// Verify the source is a valid archive
		const sourceBuffer = await zip.file('source.rackarr.zip')?.async('uint8array');
		expect(sourceBuffer).toBeDefined();

		const sourceZip = await JSZip.loadAsync(sourceBuffer!);
		expect(sourceZip.file('layout.json')).not.toBeNull();
	});

	test('bundled export not available for SVG format', async ({ page }) => {
		await createRack(page, 'SVG Test Rack', 24);

		await page.click('button[aria-label="Export"]');
		const dialog = page.locator('.dialog');
		await expect(dialog).toBeVisible();

		// Change format to SVG
		const formatSelect = dialog.locator('#export-format, select:has(option:has-text("PNG"))');
		await formatSelect.selectOption('svg');

		// Export mode should be disabled or reset to quick
		const exportModeSelect = dialog.locator('#export-mode, select:has(option:has-text("Quick"))');

		const isDisabled = await exportModeSelect.isDisabled();
		if (!isDisabled) {
			// If not disabled, bundled should have been reset to quick
			const selectedValue = await exportModeSelect.inputValue();
			expect(selectedValue).toBe('quick');
		}
	});
});
