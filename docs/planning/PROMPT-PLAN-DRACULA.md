# PROMPT-PLAN-DRACULA.md

## Rackarr Design System Implementation — Dracula/Alucard Migration

**Version:** 1.0.0
**Status:** Ready for Implementation
**Spec Reference:** SPEC.md Section 19

---

## Executive Summary

This document contains step-by-step prompts for implementing the Dracula/Alucard design system migration in Rackarr. Each prompt is designed for TDD execution by a code-generation LLM.

### Current State Analysis

| Aspect                     | Current                 | Target                  |
| -------------------------- | ----------------------- | ----------------------- |
| Color Palette              | Tailwind neutrals       | Dracula/Alucard         |
| Fonts                      | system-ui               | JetBrains Mono + Inter  |
| Category Colors            | 12 arbitrary hex values | Dracula accent mapping  |
| Test Coverage              | 70+ tests               | Updated for new palette |
| Components Needing Updates | 5                       | 0                       |

### Files to Modify

| File                                         | Lines | Changes                       |
| -------------------------------------------- | ----- | ----------------------------- |
| `src/lib/styles/tokens.css`                  | 328   | Replace primitives, add glows |
| `src/lib/types/constants.ts`                 | 25    | Update CATEGORY_COLOURS       |
| `src/lib/utils/contrast.ts`                  | 65    | Update color definitions      |
| `src/tests/contrast.test.ts`                 | 270   | Update expected values        |
| `src/tests/tokens.test.ts`                   | 151   | Add Dracula token tests       |
| `src/app.css`                                | 10    | Add @font-face declarations   |
| `src/lib/components/AirflowIndicator.svelte` | 5     | Use tokens for colors         |
| `src/lib/components/RackDevice.svelte`       | 10    | Use tokens for SVG colors     |

---

## Implementation Phases

| Phase | Description              | Prompts | Risk   |
| ----- | ------------------------ | ------- | ------ |
| 1     | Font Setup               | 1-2     | Low    |
| 2     | Color Primitives         | 3-5     | Medium |
| 3     | Semantic Token Migration | 6-8     | Medium |
| 4     | Category Colors          | 9-10    | Low    |
| 5     | Contrast Verification    | 11-13   | High   |
| 6     | Component Fixes          | 14-17   | Low    |
| 7     | Glow Effects             | 18-19   | Low    |
| 8     | Integration & Cleanup    | 20-21   | Low    |

---

# Phase 1: Font Setup

## Context

Self-hosted fonts for performance and privacy. We need JetBrains Mono (monospace for UI) and Inter (sans-serif for body text).

**Target font weights:** 400, 500, 600, 700 for both families.

---

## Prompt 1: Download and Add Font Files

```text
You are implementing the Dracula design system for Rackarr. This is step 1: adding self-hosted fonts.

**Task:** Create the font directory structure and add placeholder instructions for font files.

**Requirements:**
1. Create directory: `static/fonts/`
2. Create a README.md inside `static/fonts/` documenting:
   - Required font files (JetBrains Mono woff2: 400, 500, 600, 700)
   - Required font files (Inter woff2: 400, 500, 600, 700)
   - Download sources (JetBrains GitHub releases, Google Fonts/rsms Inter)
   - File naming convention

**Expected structure:**
static/fonts/
├── README.md
├── JetBrainsMono-Regular.woff2
├── JetBrainsMono-Medium.woff2
├── JetBrainsMono-SemiBold.woff2
├── JetBrainsMono-Bold.woff2
├── Inter-Regular.woff2
├── Inter-Medium.woff2
├── Inter-SemiBold.woff2
└── Inter-Bold.woff2

**Note:** For now, just create the README.md with instructions. Font files will be downloaded separately.

**Verification:** Directory exists with README.md explaining the font requirements.
```

---

## Prompt 2: Add @font-face Declarations and Update Font Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 2: adding @font-face declarations.

**Context:**
- Font files location: `/fonts/` (SvelteKit serves from static/)
- Current font tokens in `src/lib/styles/tokens.css` lines 66-73 use system fonts
- Brand guide specifies JetBrains Mono for UI/headings, Inter for body

**Task:**
1. Add @font-face declarations to `src/app.css` (at the top, before existing styles)
2. Update font-family tokens in `src/lib/styles/tokens.css`

**Verification:**
- Run `npm run build` — should succeed (fonts not required for build)
- Font tokens are updated with new custom fonts as primary, system fonts as fallback
```

---

# Phase 2: Color Primitives

## Context

Replace Tailwind-style neutral grays with official Dracula palette. The Dracula theme has specific hex values that must be used exactly.

**Key Dracula Colors:**

- Background: #282A36
- Foreground: #F8F8F2
- Selection: #44475A
- Comment: #6272A4
- Accents: purple, pink, cyan, green, orange, red, yellow

---

## Prompt 3: Write Tests for Dracula Primitive Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 3: writing tests for Dracula primitives (TDD - tests first).

**Context:**
- Current tests in `src/tests/tokens.test.ts` verify neutral palette exists
- We need to add tests for Dracula-specific tokens BEFORE implementing them
- Tests should fail initially, then pass after implementation

**Task:** Add new test cases to `src/tests/tokens.test.ts` for Dracula primitives.

**Verification:**
- Run `npm run test:run` — new Dracula tests should FAIL (tokens don't exist yet)
- This is expected TDD behavior — red phase
```

---

## Prompt 4: Implement Dracula Primitive Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 4: implementing Dracula primitives to make tests pass.

**Context:**
- Tests from Prompt 3 are failing (expected)
- tokens.css currently defines neutral-* colors (lines 24-35)
- We need to ADD Dracula primitives alongside existing neutrals (neutrals still used for rack)

**Task:** Add Dracula primitive tokens to `src/lib/styles/tokens.css`

**Important:** Do NOT remove the existing neutral-* tokens yet. They are still used by rack tokens which intentionally stay dark.

**Verification:**
- Run `npm run test:run` — Dracula primitive tests should now PASS
- Existing tests should still pass (we only added, didn't remove)
```

---

## Prompt 5: Add Alucard (Light Mode) Primitives

```text
You are implementing the Dracula design system for Rackarr. This is step 5: adding Alucard light mode primitives.

**Context:**
- Dracula (dark) primitives are now in tokens.css
- Alucard is the official Dracula light mode variant
- Light mode is activated via `[data-theme="light"]` selector

**Task:**
1. Add Alucard primitive tests to `src/tests/tokens.test.ts`
2. Add Alucard primitives to `src/lib/styles/tokens.css` in the light mode section

**Verification:**
- Run `npm run test:run` — all tests should PASS including new Alucard tests
```

---

# Phase 3: Semantic Token Migration

## Context

Now we rewire the semantic tokens (--colour-bg, --colour-text, etc.) to use Dracula/Alucard primitives instead of the old neutral/blue palette.

---

## Prompt 6: Update Dark Mode Semantic Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 6: rewiring semantic tokens to Dracula primitives.

**Context:**
- Dracula primitives are now defined in tokens.css
- Semantic tokens (lines 120-161) currently reference neutral-* and blue-*
- We need to update them to reference dracula-* primitives
- This is the "wiring" step that makes the visual change happen

**Task:** Update the semantic token layer in `src/lib/styles/tokens.css` to use Dracula primitives.

**Important:** The rack tokens should KEEP using neutral-* (they stay dark in both themes).

**Verification:**
- Run `npm run dev` — app should now display with Dracula colors
- Run `npm run test:run` — all tests should pass
```

---

## Prompt 7: Update Light Mode Semantic Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 7: rewiring light mode semantic tokens to Alucard primitives.

**Context:**
- Dark mode semantic tokens now use Dracula primitives
- Light mode section (data-theme="light") needs to use Alucard primitives
- Existing light mode overrides in tokens.css around line 241+

**Task:** Update the light mode semantic token overrides in `src/lib/styles/tokens.css`.

**Verification:**
- Run `npm run dev` — toggle theme, both modes should display correctly
- Dark mode: Dracula purple/pink/cyan accents on dark gray
- Light mode: Alucard variants on cream background
- Rack should stay dark in both modes
```

---

## Prompt 8: Update Semantic Token Tests

```text
You are implementing the Dracula design system for Rackarr. This is step 8: updating semantic token tests.

**Context:**
- Semantic tokens now use Dracula/Alucard primitives
- Existing tests in tokens.test.ts may have hardcoded expected values
- Need to update tests to verify new mappings

**Task:** Update the semantic token tests in `src/tests/tokens.test.ts` to verify Dracula mapping.

**Verification:**
- Run `npm run test:run` — all semantic token tests should pass
```

---

# Phase 4: Category Colors

## Context

Update the device category colors in constants.ts to use Dracula palette with hybrid mapping (active = accents, passive = neutrals).

---

## Prompt 9: Write Tests for New Category Colors

```text
You are implementing the Dracula design system for Rackarr. This is step 9: testing new category colors (TDD).

**Context:**
- Current CATEGORY_COLOURS in constants.ts uses arbitrary hex values
- New mapping uses Dracula accents for active devices, comment/selection for passive
- Need to write tests FIRST

**Task:** Add/update tests for CATEGORY_COLOURS in `src/tests/starterLibrary.test.ts` or create a new `src/tests/categoryColors.test.ts`.

**Verification:**
- Run `npm run test:run` — new category color tests should FAIL (old values in constants.ts)
```

---

## Prompt 10: Update CATEGORY_COLOURS Constants

```text
You are implementing the Dracula design system for Rackarr. This is step 10: updating category colors to pass tests.

**Context:**
- Tests from Prompt 9 are failing (expected TDD red phase)
- CATEGORY_COLOURS is in `src/lib/types/constants.ts` lines 12-25
- New values use Dracula palette with hybrid active/passive mapping

**Task:** Update CATEGORY_COLOURS in `src/lib/types/constants.ts`.

**Verification:**
- Run `npm run test:run` — category color tests should now PASS
- Run `npm run dev` — device palette should show new Dracula colors
```

---

# Phase 5: Contrast Verification

## Context

Update the contrast utility and tests to verify Dracula/Alucard colors meet WCAG AA requirements.

---

## Prompt 11: Update Contrast Utility Color Definitions

```text
You are implementing the Dracula design system for Rackarr. This is step 11: updating contrast utility colors.

**Context:**
- `src/lib/utils/contrast.ts` contains color definitions used for WCAG testing
- Lines 93-157 define tokenColors, darkThemeColors, lightThemeColors
- These need to reflect Dracula/Alucard values

**Task:** Update the color definitions in `src/lib/utils/contrast.ts`.

**Also export the draculaColors and alucardColors from the module.**

**Verification:**
- File should compile without TypeScript errors
- Run `npm run check` — should pass type checking
```

---

## Prompt 12: Update Contrast Tests for Dracula

```text
You are implementing the Dracula design system for Rackarr. This is step 12: updating contrast tests for Dracula colors.

**Context:**
- Contrast tests in `src/tests/contrast.test.ts` verify WCAG AA compliance
- Tests need to verify Dracula colors meet contrast requirements
- Key requirement: 4.5:1 for normal text, 3:1 for large text/UI components

**Task:** Update the theme contrast tests in `src/tests/contrast.test.ts`.

**Verification:**
- Run `npm run test:run` — contrast tests should pass
- Review console output for actual contrast ratios
```

---

## Prompt 13: Add Category Color Contrast Tests

```text
You are implementing the Dracula design system for Rackarr. This is step 13: testing category color contrast.

**Context:**
- Category colors appear on dark rack background
- Rack bg stays dark (#18181b / neutral-900) in both themes
- Category colors must be readable on this dark background

**Task:** Add category color contrast tests to `src/tests/categoryColors.test.ts`.

**Verification:**
- Run `npm run test:run` — all contrast tests should pass
- Review console output to see actual contrast ratios
- Ensure active categories have high contrast, passive have acceptable contrast
```

---

# Phase 6: Component Fixes

## Context

Fix the 5 components with hardcoded colors to use design tokens.

---

## Prompt 14: Fix AirflowIndicator Component

```text
You are implementing the Dracula design system for Rackarr. This is step 14: fixing hardcoded colors in AirflowIndicator.

**Context:**
- `src/lib/components/AirflowIndicator.svelte` has hardcoded hex colors
- Lines with issues: stroke colors '#60a5fa', '#f87171', '#9ca3af'
- Should use semantic tokens: --colour-airflow-intake, --colour-airflow-exhaust, --colour-airflow-passive

**Task:** Update AirflowIndicator.svelte to use CSS custom properties.

**Verification:**
- Run `npm run dev` — airflow indicators should display with Dracula colors
- Toggle airflow mode (A key) to verify all states render correctly
- Colors should match: cyan for intake, red for exhaust, comment gray for passive
```

---

## Prompt 15: Fix RackDevice SVG Colors

```text
You are implementing the Dracula design system for Rackarr. This is step 15: fixing hardcoded colors in RackDevice.

**Context:**
- `src/lib/components/RackDevice.svelte` has hardcoded rgba values for SVG effects
- Issues found at lines ~293, 317, 331, 373-374
- Hardcoded: `rgba(0, 0, 0, 0.2)` stroke, `rgba(255, 255, 255, 0.8)` text

**Task:** Update RackDevice.svelte to use semantic colors or appropriate tokens.

**Note:** Some rgba values for shadows/overlays may be intentionally hardcoded for visual effects. Only update colors that should change with theme.

**Verification:**
- Run `npm run dev` — device labels should be readable
- Select a device — selection border should use purple
- In light mode, verify device labels are still readable on rack (rack stays dark)
```

---

## Prompt 16: Fix ImageUpload Fallback Color

```text
You are implementing the Dracula design system for Rackarr. This is step 16: fixing ImageUpload fallback color.

**Context:**
- `src/lib/components/ImageUpload.svelte` has a hardcoded fallback color
- Line ~148: `var(--colour-button-bg, #3a3a3a)`
- The fallback should match the token default or be removed

**Task:** Update ImageUpload.svelte to remove hardcoded fallback.

**Verification:**
- Run `npm run dev` — ImageUpload buttons should render with correct colors
- No visual change expected (token already provides the value)
```

---

## Prompt 17: Fix ExportDialog Checkerboard Pattern

```text
You are implementing the Dracula design system for Rackarr. This is step 17: fixing ExportDialog checkerboard pattern.

**Context:**
- `src/lib/components/ExportDialog.svelte` uses hardcoded colors for transparency preview
- Line ~312: checkerboard pattern uses `#808080` gray
- This is for the "transparent background" preview thumbnail

**Task:** Evaluate and optionally update the checkerboard pattern.

**Recommendation:** Leave the checkerboard color hardcoded. It's a UI convention that shouldn't change with theme. Document this decision in a comment.

**Verification:**
- Run `npm run dev` — export dialog transparency preview should render correctly
- This is a documentation/clarity change, no visual change expected
```

---

# Phase 7: Glow Effects

## Context

Add Dracula-style glow effects for focus states and interactive elements.

---

## Prompt 18: Add Glow Effect Tokens

```text
You are implementing the Dracula design system for Rackarr. This is step 18: adding glow effect tokens.

**Context:**
- Dracula theme uses subtle glow effects for interactive elements
- Currently no glow tokens in tokens.css
- SPEC.md Section 19.7.2 defines the glow system

**Task:** Add glow effect tokens to `src/lib/styles/tokens.css`.

**Verification:**
- Run `npm run build` — should compile without errors
- Glow tokens are now available for use in components
```

---

## Prompt 19: Apply Glow to Focus States

```text
You are implementing the Dracula design system for Rackarr. This is step 19: applying glow to focus states.

**Context:**
- Glow tokens now exist in tokens.css
- Focus states in app.css (line ~31) use outline only
- Add subtle glow to focus-visible for Dracula aesthetic

**Task:** Update focus-visible styles in `src/app.css`.

**Verification:**
- Run `npm run dev` — tab through interactive elements
- Focus ring should have subtle purple glow in dark mode
- Light mode glow should be softer
```

---

# Phase 8: Integration & Cleanup

## Context

Final integration testing and cleanup of any remaining issues.

---

## Prompt 20: Run Full Test Suite and Fix Failures

```text
You are implementing the Dracula design system for Rackarr. This is step 20: integration testing.

**Context:**
- All individual changes have been made
- Need to run full test suite and fix any failures
- Some tests may have hardcoded color expectations

**Task:** Run the full test suite and fix any failing tests.

**Verification:**
- `npm run test:run` — 100% pass rate
- `npm run test:e2e` — all E2E tests pass
- `npm run build` — production build succeeds
- `npm run check` — TypeScript type checking passes
```

---

## Prompt 21: Visual Verification and Documentation

```text
You are implementing the Dracula design system for Rackarr. This is step 21: visual verification and final cleanup.

**Context:**
- All code changes complete
- Need to visually verify the implementation matches the spec
- Update any remaining documentation

**Task:** Perform visual verification and documentation updates.

**Visual Verification Checklist:**

**Dark Mode (Dracula):**
- [ ] Background is #282A36 (dark purple-gray)
- [ ] Text is #F8F8F2 (off-white)
- [ ] Muted text is #6272A4 (purple-gray)
- [ ] Selection/focus is #BD93F9 (purple)
- [ ] Interactive elements are #8BE9FD (cyan)
- [ ] Success is #50FA7B (green)
- [ ] Error is #FF5555 (red)
- [ ] Toolbar has subtle glow on focus

**Light Mode (Alucard):**
- [ ] Background is #FFFBEB (warm cream)
- [ ] Text is #1F1F1F (near black)
- [ ] Accents are darkened for contrast
- [ ] Rack stays dark (intentional)

**Device Categories:**
- [ ] Server = Cyan
- [ ] Network = Purple
- [ ] Storage = Green
- [ ] Power = Red
- [ ] KVM = Orange
- [ ] AV/Media = Pink
- [ ] Cooling = Yellow
- [ ] Passive items = muted gray

**Verification:**
- All visual checks pass
- Documentation is current
- Ready for PR/merge
```

---

# Appendix

## File Change Summary

| File                                         | Lines Changed | Type                                 |
| -------------------------------------------- | ------------- | ------------------------------------ |
| `static/fonts/README.md`                     | +30           | New file                             |
| `src/app.css`                                | +80, ~5       | Font-face + focus glow               |
| `src/lib/styles/tokens.css`                  | +60, ~40      | Dracula primitives + semantic rewire |
| `src/lib/types/constants.ts`                 | ~15           | Category colors                      |
| `src/lib/utils/contrast.ts`                  | ~65           | Color definitions                    |
| `src/tests/tokens.test.ts`                   | +80           | Dracula/Alucard tests                |
| `src/tests/contrast.test.ts`                 | ~100          | Updated expectations                 |
| `src/tests/categoryColors.test.ts`           | +70           | New test file                        |
| `src/lib/components/AirflowIndicator.svelte` | ~10           | Use tokens                           |
| `src/lib/components/RackDevice.svelte`       | ~10           | Use tokens                           |
| `src/lib/components/ImageUpload.svelte`      | ~2            | Remove fallback                      |
| `src/lib/components/ExportDialog.svelte`     | ~2            | Add comment                          |

**Total estimated changes:** ~450 lines added/modified

## Rollback Plan

If issues arise, the migration can be rolled back by:

1. Reverting tokens.css to previous version
2. Reverting constants.ts CATEGORY_COLOURS
3. Reverting contrast.ts color definitions

The change is contained to styling — no data model or logic changes.

## Success Criteria

- [ ] All 70+ existing tests pass
- [ ] New Dracula/Alucard tests pass
- [ ] WCAG AA contrast requirements met
- [ ] Visual match to SPEC.md Section 19
- [ ] Both themes functional
- [ ] Rack stays dark in light mode
- [ ] No TypeScript errors
- [ ] Production build succeeds
