# PDF Export Specification

**Status:** Draft
**Created:** 2025-12-08
**Target:** v0.4.3

---

## Overview

Implement PDF export functionality using jspdf. The PDF option was listed as a feature but never fully implemented - only a stub exists showing "PDF export not yet implemented".

---

## Goals

1. Add PDF as a working export format option
2. Use jspdf library for PDF generation
3. Default to US Letter size (8.5x11") with rack centered
4. Support same options as other formats (view, legend, background)
5. Maintain consistency with existing export workflow

---

## Non-Goals

- Configurable page sizes (future enhancement)
- Multi-page PDFs for very tall racks
- PDF metadata editing
- PDF/A compliance

---

## Technical Approach

### Library

- **jspdf** - mature, widely-used PDF generation library
- Convert existing SVG export to PDF by rendering SVG to canvas, then canvas to PDF

### Export Flow

```
1. Generate SVG (existing generateExportSVG function)
2. Create canvas from SVG (existing approach for PNG/JPEG)
3. Create jsPDF document (Letter size: 8.5x11")
4. Add canvas image to PDF, centered on page
5. Save PDF file
```

---

## Implementation Details

### 1. Install jspdf

```bash
npm install jspdf
```

### 2. Add PDF Option to ExportDialog

Update `ExportDialog.svelte` to include PDF in format dropdown:

```svelte
<select id="export-format" bind:value={format}>
	<option value="png">PNG</option>
	<option value="jpeg">JPEG</option>
	<option value="svg">SVG</option>
	<option value="pdf">PDF</option>
</select>
```

### 3. Update Transparent Background Logic

PDF does not support transparency. Update the `canSelectTransparent` derived:

```typescript
const canSelectTransparent = $derived(format === 'svg' || format === 'png');
```

This already excludes PDF (and JPEG), so no change needed.

### 4. Create exportAsPDF Function

Add to `src/lib/utils/export.ts`:

```typescript
import { jsPDF } from 'jspdf';

/**
 * Export SVG as PDF (US Letter size, centered)
 */
export async function exportAsPDF(svgString: string, background: ExportBackground): Promise<Blob> {
	// Create canvas from SVG
	const canvas = await svgToCanvas(svgString, background);

	// US Letter dimensions in points (72 dpi)
	const letterWidth = 612; // 8.5 inches
	const letterHeight = 792; // 11 inches

	// Create PDF (landscape if image is wider than tall)
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;
	const isLandscape = imgWidth > imgHeight;

	const pdf = new jsPDF({
		orientation: isLandscape ? 'landscape' : 'portrait',
		unit: 'pt',
		format: 'letter'
	});

	// Calculate scaling to fit on page with margins
	const margin = 36; // 0.5 inch margins
	const pageWidth = isLandscape ? letterHeight : letterWidth;
	const pageHeight = isLandscape ? letterWidth : letterHeight;
	const availableWidth = pageWidth - margin * 2;
	const availableHeight = pageHeight - margin * 2;

	const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

	const scaledWidth = imgWidth * scale;
	const scaledHeight = imgHeight * scale;

	// Center on page
	const x = (pageWidth - scaledWidth) / 2;
	const y = (pageHeight - scaledHeight) / 2;

	// Add image to PDF
	const imgData = canvas.toDataURL('image/png');
	pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

	// Return as blob
	return pdf.output('blob');
}
```

### 5. Update App.svelte Export Handler

Replace the PDF stub with actual implementation:

```typescript
} else if (options.format === 'pdf') {
    const imageBlob = await exportAsPDF(svgString, options.background);
    const filename = generateExportFilename(layoutStore.layout.name, 'pdf');
    downloadBlob(imageBlob, filename);
    toastStore.showToast('PDF exported successfully', 'success');
}
```

---

## UI Changes

### ExportDialog Format Dropdown

Before:

```
[PNG] [JPEG] [SVG]
```

After:

```
[PNG] [JPEG] [SVG] [PDF]
```

### Transparent Background

- PDF option disabled when "Transparent background" is checked (same as JPEG)
- Alternatively, auto-uncheck transparent when PDF selected

---

## Test Cases

### Unit Tests (export.test.ts)

1. `exportAsPDF` function exists and is exported
2. `exportAsPDF` returns a Blob with correct MIME type (`application/pdf`)
3. `exportAsPDF` handles dark background
4. `exportAsPDF` handles light background
5. `generateExportFilename('test', 'pdf')` returns `'test.pdf'`

### Component Tests (ExportDialog.test.ts)

1. PDF option exists in format dropdown
2. Selecting PDF format sets format state correctly
3. Transparent checkbox not available when PDF selected

### Integration Tests

1. Full export flow with PDF format produces downloadable file
2. PDF contains image of rack (visual verification - manual)

---

## Acceptance Criteria

- [ ] jspdf installed and in dependencies
- [ ] PDF option visible in ExportDialog
- [ ] Selecting PDF and clicking Export produces a PDF file
- [ ] PDF is US Letter size
- [ ] Rack image is centered on page with margins
- [ ] Landscape orientation used for wide racks
- [ ] Portrait orientation used for tall racks
- [ ] Dark/light background options work
- [ ] Transparent background auto-unchecked or disabled for PDF
- [ ] All existing export tests still pass
- [ ] New PDF export tests pass

---

## Implementation Order

1. Install jspdf dependency
2. Write failing tests for exportAsPDF function
3. Implement exportAsPDF in export.ts
4. Run tests, verify pass
5. Add PDF option to ExportDialog
6. Write/update ExportDialog tests
7. Update App.svelte export handler
8. Run full test suite
9. Manual testing
10. Commit and release

---

## Files to Modify

| File                                     | Changes                                  |
| ---------------------------------------- | ---------------------------------------- |
| `package.json`                           | Add jspdf dependency                     |
| `src/lib/utils/export.ts`                | Add `exportAsPDF` function               |
| `src/lib/components/ExportDialog.svelte` | Add PDF option to format dropdown        |
| `src/App.svelte`                         | Replace PDF stub with actual export call |
| `src/tests/export.test.ts`               | Add PDF export tests                     |
| `src/tests/ExportDialog.test.ts`         | Add PDF option tests                     |

---

## Changelog

| Date       | Change             |
| ---------- | ------------------ |
| 2025-12-08 | Initial spec draft |
