# Responsive Quick Wins - Prompt Plan

**Spec:** `responsive-quick-wins-spec.md`
**Branch:** `feature/responsive-quick-wins`

---

## Prompt 1: Toolbar Responsive Tests

Write unit tests for toolbar responsive behaviour:

1. Test that toolbar buttons contain both icon and text span elements
2. Test that text spans have a CSS class that can be targeted for hiding
3. Test that brand tagline has a CSS class for responsive hiding
4. Test that brand name has a CSS class for responsive hiding

These are structural tests - CSS media query behaviour will be verified in E2E tests.

**Files:** `src/tests/ToolbarResponsive.test.ts`

---

## Prompt 2: Toolbar Responsive CSS

Implement responsive CSS for toolbar:

1. Add media query at `max-width: 1000px`:
   - Hide `.toolbar-action-btn span` (button text)
   - Adjust button padding for icon-only

2. Add media query at `max-width: 900px`:
   - Hide `.brand-tagline`

3. Add media query at `max-width: 600px`:
   - Hide `.brand-name`

**Files:** `src/lib/components/Toolbar.svelte`

---

## Prompt 3: Sidebar Responsive Tests

Write unit tests for sidebar responsive structure:

1. Test that sidebar uses CSS variable `--sidebar-width`
2. Test that DevicePalette renders correctly in narrow container
3. Test device names can truncate with ellipsis

**Files:** `src/tests/SidebarResponsive.test.ts`

---

## Prompt 4: Sidebar Responsive CSS

Implement responsive CSS for sidebar:

1. Add CSS variable `--sidebar-width: 280px` in tokens
2. Update sidebar to use `width: var(--sidebar-width)`
3. Add media query at `max-width: 1000px`:
   - Override `--sidebar-width: 200px`
4. Add text truncation styles for device names

**Files:**

- `src/lib/styles/tokens.css`
- `src/App.svelte` (sidebar styles)

---

## Prompt 5: Canvas Overflow Tests

Write tests for canvas overflow handling:

1. Test that canvas container has overflow hidden
2. Test that body/html don't allow horizontal scroll

**Files:** `src/tests/CanvasOverflow.test.ts`

---

## Prompt 6: Canvas Overflow CSS

Implement overflow containment:

1. Ensure `.canvas-container` has `overflow: hidden`
2. Add global style to prevent horizontal page scroll

**Files:**

- `src/lib/components/Canvas.svelte`
- `src/app.css`

---

## Prompt 7: E2E Responsive Tests

Write Playwright E2E tests for responsive behaviour:

1. Test at 1200px viewport - full layout
2. Test at 900px viewport - icon-only buttons, narrow sidebar
3. Test at 600px viewport - minimal branding
4. Verify no horizontal scroll at each size
5. Verify panzoom works at narrow viewport

**Files:** `src/tests/e2e/responsive.spec.ts`

---

## Prompt 8: Update ROADMAP

1. Mark responsive quick-wins issue as complete
2. Add new "Medium-Term Responsive" section with:
   - Tab-based mobile layout approach
   - Bottom sheet patterns for mobile
   - Min-width warning for unsupported sizes

**Files:** `docs/planning/ROADMAP.md`

---

## Completion Checklist

- [ ] Prompt 1: Toolbar tests written
- [ ] Prompt 2: Toolbar CSS implemented
- [ ] Prompt 3: Sidebar tests written
- [ ] Prompt 4: Sidebar CSS implemented
- [ ] Prompt 5: Canvas overflow tests written
- [ ] Prompt 6: Canvas overflow CSS implemented
- [ ] Prompt 7: E2E tests written and passing
- [ ] Prompt 8: ROADMAP updated
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] PR created and merged
