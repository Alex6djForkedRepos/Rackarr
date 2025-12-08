# Prompt Plan: PDF Export

**Spec:** `docs/planning/spec-pdf-export.md`
**Target:** v0.4.3

---

## Prompt 1: Install jspdf Dependency

**Goal:** Add jspdf library to project dependencies.

**Steps:**

1. Run `npm install jspdf`
2. Verify package.json updated
3. Verify package-lock.json updated

**Files:** `package.json`, `package-lock.json`

---

## Prompt 2: Write Failing Tests for exportAsPDF

**Goal:** Write unit tests for the exportAsPDF function before implementation.

**TDD Steps:**

1. Add test: `exportAsPDF` function exists and is exported
2. Add test: `exportAsPDF` returns a Blob
3. Add test: returned Blob has correct MIME type (application/pdf)
4. Add test: handles dark background
5. Add test: handles light background
6. Run tests - should fail (function doesn't exist yet)

**Files:** `src/tests/export.test.ts`

---

## Prompt 3: Implement exportAsPDF Function

**Goal:** Create the exportAsPDF function in export.ts.

**TDD Steps:**

1. Import jsPDF from jspdf
2. Implement exportAsPDF function:
   - Convert SVG to canvas (reuse existing svgToCanvas)
   - Create jsPDF document (Letter size)
   - Determine orientation based on image aspect ratio
   - Calculate scaling and centering
   - Add image to PDF
   - Return as Blob
3. Export function from module
4. Run tests - should pass

**Files:** `src/lib/utils/export.ts`

---

## Prompt 4: Write Tests for ExportDialog PDF Option

**Goal:** Write tests for PDF option in ExportDialog before updating component.

**TDD Steps:**

1. Add test: PDF option exists in format dropdown
2. Add test: selecting PDF sets format state to 'pdf'
3. Add test: transparent checkbox behavior with PDF
4. Run tests - should fail (PDF option not in component yet)

**Files:** `src/tests/ExportDialog.test.ts`

---

## Prompt 5: Add PDF Option to ExportDialog

**Goal:** Add PDF as a format option in the export dialog.

**TDD Steps:**

1. Add PDF option to format select element
2. Run tests - should pass

**Files:** `src/lib/components/ExportDialog.svelte`

---

## Prompt 6: Update App.svelte Export Handler

**Goal:** Replace PDF stub with actual export implementation.

**Steps:**

1. Import exportAsPDF from utils/export
2. Replace stub code with actual PDF export call
3. Add success toast message

**Files:** `src/App.svelte`

---

## Prompt 7: Integration Test & Polish

**Goal:** Run full test suite, verify build, fix any issues.

**Steps:**

1. Run `npm run test:run` - fix any failures
2. Run `npm run build` - verify no build errors
3. Run `npm run check` - verify no type errors
4. Run `npm run lint` - fix any lint issues

---

## Prompt 8: Release v0.4.3

**Goal:** Commit changes, tag release, push.

**Steps:**

1. Update version in package.json to 0.4.3
2. Update CLAUDE.md version and changelog
3. Update ROADMAP.md changelog
4. Git add, commit with descriptive message
5. Git tag v0.4.3
6. Push to remote

---

## Completion Checklist

- [x] Prompt 1: Install jspdf Dependency
- [x] Prompt 2: Write Failing Tests for exportAsPDF
- [x] Prompt 3: Implement exportAsPDF Function
- [x] Prompt 4: Write Tests for ExportDialog PDF Option
- [x] Prompt 5: Add PDF Option to ExportDialog
- [x] Prompt 6: Update App.svelte Export Handler
- [x] Prompt 7: Integration Test & Polish
- [x] Prompt 8: Release v0.4.3
