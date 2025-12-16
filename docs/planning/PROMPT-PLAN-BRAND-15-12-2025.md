# Brand Guide Implementation Plan

**Date:** 2025-12-15
**Plan File:** PROMPT-PLAN-BRAND-15-12-2025.md
**Scope:** Implement BRAND.md v0.6.0 changes across codebase

---

## Overview

Bring the Rackarr codebase into compliance with the updated brand guide (docs/planning/BRAND.md). Three key changes:

1. **Muted device colours** - Replace bright Dracula accents with WCAG AA compliant muted variants (7 active categories)
2. **Selection/focus → Pink** - Change from purple to pink (resolves network device conflict)
3. **Muted text contrast** - Improve `#6272A4` (3.3:1) to `#8A8A9A` (5.2:1) for WCAG AA

---

## Files to Modify

### Source Files

| File                         | Line(s)                                | Changes                                |
| ---------------------------- | -------------------------------------- | -------------------------------------- |
| `src/lib/types/constants.ts` | 17-23                                  | Update 7 active category colours       |
| `src/lib/styles/tokens.css`  | 162, 168, 172, 174, 207, 345, 349, 351 | Selection→pink, focus→pink, muted text |
| `src/lib/utils/contrast.ts`  | 171, 173-174, 192-193                  | Update theme colour definitions        |

### Test Files

| File                               | Line(s) | Changes                                        |
| ---------------------------------- | ------- | ---------------------------------------------- |
| `src/tests/categoryColors.test.ts` | 6-33    | Update test descriptions & 7 colour assertions |
| `src/tests/contrast.test.ts`       | -       | Add muted text 5:1 contrast test               |
| `src/tests/tokens.test.ts`         | 223     | Update selection token expectation             |

---

## Step-by-Step Implementation

### Step 1: Commit BRAND.md + Plan

```bash
git add docs/planning/BRAND.md docs/planning/PROMPT-PLAN-BRAND-15-12-2025.md
git commit -m "docs: Add BRAND.md v0.6.0 and implementation plan"
git push origin main
```

---

### Step 2: Update Category Colour Tests (TDD Red)

**File:** `src/tests/categoryColors.test.ts`

Update test descriptions and assertions:

```typescript
// Line 6: Change describe block
describe('Active Categories - Muted Dracula', () => {

// Line 7-8: server
test('server should use muted cyan', () => {
  expect(CATEGORY_COLOURS.server).toBe('#4A7A8A');
});

// Line 11-12: network
test('network should use muted purple', () => {
  expect(CATEGORY_COLOURS.network).toBe('#7B6BA8');
});

// Line 15-16: storage
test('storage should use muted green', () => {
  expect(CATEGORY_COLOURS.storage).toBe('#3D7A4A');
});

// Line 19-20: power
test('power should use muted red', () => {
  expect(CATEGORY_COLOURS.power).toBe('#A84A4A');
});

// Line 23-24: kvm
test('kvm should use muted orange', () => {
  expect(CATEGORY_COLOURS.kvm).toBe('#A87A4A');
});

// Line 27-28: av-media
test('av-media should use muted pink', () => {
  expect(CATEGORY_COLOURS['av-media']).toBe('#A85A7A');
});

// Line 31-32: cooling
test('cooling should use muted yellow', () => {
  expect(CATEGORY_COLOURS.cooling).toBe('#8A8A4A');
});
```

**Verify:** `npm run test:run -- categoryColors` → 7 FAILURES expected

---

### Step 3: Update Token Test (TDD Red)

**File:** `src/tests/tokens.test.ts`

```typescript
// Line 223: Change purple to pink
expect(tokensCSS).toContain('--colour-selection: var(--dracula-pink)');
```

**Verify:** `npm run test:run -- tokens` → 1 FAILURE expected

---

### Step 4: Add Muted Text Contrast Test (TDD Red)

**File:** `src/tests/contrast.test.ts`

Add new test for improved muted text contrast:

```typescript
describe('Muted Text WCAG AA Compliance', () => {
	it('dark theme muted text meets 5:1 for improved readability', () => {
		// BRAND.md requires #8A8A9A (5.2:1) instead of #6272A4 (3.3:1)
		const ratio = getContrastRatio(darkThemeColors.textMuted, darkThemeColors.bg);
		expect(ratio).toBeGreaterThanOrEqual(5);
	});
});
```

**Verify:** `npm run test:run -- contrast` → 1 FAILURE expected (current is 3.3:1)

---

### Step 5: Update Category Colours Source (TDD Green)

**File:** `src/lib/types/constants.ts`

```typescript
// Lines 15-31: Update active categories, keep passive unchanged
export const CATEGORY_COLOURS: Record<DeviceCategory, string> = {
	// Active categories - Muted Dracula (WCAG AA compliant)
	server: '#4A7A8A', // muted cyan (4.8:1)
	network: '#7B6BA8', // muted purple (4.6:1)
	storage: '#3D7A4A', // muted green (5.2:1)
	power: '#A84A4A', // muted red (5.1:1)
	kvm: '#A87A4A', // muted orange (4.5:1)
	'av-media': '#A85A7A', // muted pink (4.7:1)
	cooling: '#8A8A4A', // muted yellow (4.6:1)

	// Passive categories - Dracula neutrals (unchanged)
	shelf: '#6272A4',
	blank: '#44475A',
	'cable-management': '#6272A4',
	'patch-panel': '#6272A4',
	other: '#6272A4'
} as const;
```

**Verify:** `npm run test:run -- categoryColors` → PASS

---

### Step 6: Update CSS Semantic Tokens (TDD Green)

**File:** `src/lib/styles/tokens.css`

**Dark theme (lines 162, 168, 172, 174, 207):**

```css
/* Line 162: Muted text - improved contrast */
--colour-text-muted: #8a8a9a;

/* Line 168: Border focus */
--colour-border-focus: var(--dracula-pink);

/* Lines 172-174: Selection and focus */
--colour-selection: var(--dracula-pink);
--colour-selection-hover: var(--dracula-pink);
--colour-focus-ring: var(--dracula-pink);

/* Line 207: Focus ring glow - use pink */
--focus-ring-glow:
	0 0 0 2px var(--colour-bg), 0 0 0 4px var(--colour-focus-ring), var(--glow-pink-sm);
```

**Add pink glow tokens (after line 204):**

```css
--glow-pink-sm: 0 0 12px rgba(255, 121, 198, 0.3);
--glow-pink-md: 0 0 20px rgba(255, 121, 198, 0.3);
```

**Light theme (lines 345, 349, 351):**

```css
/* Line 345: Border focus */
--colour-border-focus: var(--alucard-pink);

/* Lines 349-351: Selection and focus */
--colour-selection: var(--alucard-pink);
--colour-selection-hover: var(--alucard-pink);
--colour-focus-ring: var(--alucard-pink);
```

**Add pink glow tokens for light theme (after line 379):**

```css
--glow-pink-sm: 0 0 8px rgba(163, 20, 77, 0.2);
--glow-pink-md: 0 0 16px rgba(163, 20, 77, 0.2);
```

**Verify:** `npm run test:run -- tokens` → PASS

---

### Step 7: Update Contrast Utility (TDD Green)

**File:** `src/lib/utils/contrast.ts`

```typescript
// Lines 166-180: darkThemeColors
export const darkThemeColors = {
	bg: draculaColors.bg,
	surface: draculaColors.bgLight,
	surfaceRaised: draculaColors.bgLighter,
	text: draculaColors.foreground,
	textMuted: '#8A8A9A', // CHANGED: improved contrast
	textDisabled: draculaColors.comment,
	selection: draculaColors.pink, // CHANGED: was purple
	focusRing: draculaColors.pink, // CHANGED: was purple
	primary: draculaColors.cyan,
	error: draculaColors.red,
	success: draculaColors.green,
	warning: draculaColors.orange,
	border: draculaColors.selection
} as const;

// Lines 185-199: lightThemeColors
export const lightThemeColors = {
	bg: alucardColors.bg,
	surface: alucardColors.bgLight,
	surfaceRaised: alucardColors.bgLighter,
	text: alucardColors.foreground,
	textMuted: alucardColors.comment, // unchanged - already 6.8:1
	textDisabled: alucardColors.comment,
	selection: alucardColors.pink, // CHANGED: was purple
	focusRing: alucardColors.pink, // CHANGED: was purple
	primary: alucardColors.cyan,
	error: alucardColors.red,
	success: alucardColors.green,
	warning: alucardColors.orange,
	border: alucardColors.bgLight
} as const;
```

**Verify:** `npm run test:run -- contrast` → PASS

---

### Step 8: Update Component Glow References

**Files to update** (change `--glow-purple-sm` to `--glow-pink-sm` for focus/selection):

| File                                      | Line | Context                     |
| ----------------------------------------- | ---- | --------------------------- |
| `src/app.css`                             | 104  | `:focus-visible` box-shadow |
| `src/lib/components/NewRackForm.svelte`   | 238  | Input focus                 |
| `src/lib/components/EditPanel.svelte`     | 629  | Input focus                 |
| `src/lib/components/AddDeviceForm.svelte` | 324  | Input focus                 |

---

### Step 9: Final Verification

```bash
npm run test:run      # All unit tests
npm run build         # Production build
npm run check         # Svelte check
```

**Visual checklist:**

- [ ] Device colours are muted (not neon bright)
- [ ] Selection/focus rings are pink
- [ ] Muted text is more readable
- [ ] Network devices (purple) distinct from selection (pink)

---

### Step 10: Commit All Changes

```bash
git add -A
git commit -m "feat(brand): Implement BRAND.md v0.6.0

- Muted device colours for WCAG AA compliance (7 active categories)
- Selection/focus changed from purple to pink
- Improved muted text contrast (#8A8A9A at 5.2:1)
- Added pink glow tokens for dark/light themes
- Updated all tests to match new brand spec

🤖 Generated with Claude Code"
git push origin main
```

---

## Colour Reference

### Active Categories (Changed)

| Category | Old (Bright) | New (Muted) | Contrast |
| -------- | ------------ | ----------- | -------- |
| server   | `#8BE9FD`    | `#4A7A8A`   | 4.8:1    |
| network  | `#BD93F9`    | `#7B6BA8`   | 4.6:1    |
| storage  | `#2ECC71`    | `#3D7A4A`   | 5.2:1    |
| power    | `#FF5555`    | `#A84A4A`   | 5.1:1    |
| kvm      | `#FFB86C`    | `#A87A4A`   | 4.5:1    |
| av-media | `#FF79C6`    | `#A85A7A`   | 4.7:1    |
| cooling  | `#F1FA8C`    | `#8A8A4A`   | 4.6:1    |

### Semantic Tokens (Changed)

| Token                   | Old                      | New                   |
| ----------------------- | ------------------------ | --------------------- |
| `--colour-selection`    | `var(--dracula-purple)`  | `var(--dracula-pink)` |
| `--colour-focus-ring`   | `var(--dracula-purple)`  | `var(--dracula-pink)` |
| `--colour-border-focus` | `var(--dracula-purple)`  | `var(--dracula-pink)` |
| `--colour-text-muted`   | `var(--dracula-comment)` | `#8A8A9A`             |
