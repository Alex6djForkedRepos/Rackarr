/**
 * File utilities for saving and loading layouts
 */

import { serializeLayout, deserializeLayout } from './serialization';
import type { Layout } from '$lib/types';

/**
 * Generate a safe filename from the layout name
 */
export function generateFilename(layout: Layout): string {
	// Sanitize the layout name by replacing invalid filesystem characters
	const safeName = layout.name
		.replace(/[/\\:*?"<>|]/g, '-') // Replace invalid chars with dash
		.replace(/\s+/g, ' ') // Normalize whitespace
		.trim();

	// Use a default name if empty
	const baseName = safeName || 'untitled';

	return `${baseName}.rackarr.json`;
}

/**
 * Download a layout as a JSON file
 * Creates a Blob from the serialized layout and triggers a download
 */
export function downloadLayout(layout: Layout, filename?: string): void {
	// Serialize the layout (this also updates the modified timestamp)
	const json = serializeLayout(layout);

	// Create a Blob with JSON content
	const blob = new Blob([json], { type: 'application/json' });

	// Create object URL for the blob
	const url = URL.createObjectURL(blob);

	try {
		// Create a temporary anchor element
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename ?? generateFilename(layout);

		// Trigger the download
		anchor.click();
	} finally {
		// Clean up the object URL
		URL.revokeObjectURL(url);
	}
}

/**
 * Open a file picker dialog and return the selected file
 * Returns null if the user cancels or no file is selected
 */
export function openFilePicker(): Promise<File | null> {
	return new Promise((resolve) => {
		// Create a temporary file input
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,.rackarr.json';

		// Handle file selection
		input.addEventListener('change', () => {
			const file = input.files?.[0] ?? null;
			resolve(file);
		});

		// Handle cancel (when input loses focus without selecting)
		// Note: This is tricky because the cancel event isn't reliably fired
		// The change event handles both selection and empty cancellation

		// Trigger the file picker
		input.click();
	});
}

/**
 * Read file content as text using FileReader
 * (More compatible across environments than File.text())
 */
export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
}

/**
 * Read and parse a layout file
 * Throws an error if the file is invalid
 */
export async function readLayoutFile(file: File): Promise<Layout> {
	// Read the file as text
	const text = await readFileAsText(file);

	// Parse and validate using the existing deserialize function
	// This handles JSON parsing, structure validation, and version checking
	return deserializeLayout(text);
}

/**
 * Parse layout from JSON string (for testing and direct use)
 * Throws an error if the JSON is invalid
 */
export function parseLayoutJson(json: string): Layout {
	return deserializeLayout(json);
}
