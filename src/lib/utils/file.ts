/**
 * File utilities for saving and loading layouts
 */

/**
 * Open a file picker dialog and return the selected file
 * Returns null if the user cancels or no file is selected
 * Only accepts archive (.rackarr.zip) format
 */
export function openFilePicker(): Promise<File | null> {
	return new Promise((resolve) => {
		// Create a temporary file input
		const input = document.createElement('input');
		input.type = 'file';
		// Accept only archive format
		input.accept = '.rackarr.zip,.zip';

		// Handle file selection
		input.addEventListener('change', () => {
			const file = input.files?.[0] ?? null;
			resolve(file);
		});

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
