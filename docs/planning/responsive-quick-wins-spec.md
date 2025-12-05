# Responsive Quick Wins Specification

**Status:** Draft
**Created:** 2025-12-05
**Target:** v0.3.x patch

---

## Overview

Implement quick responsive improvements to make Rackarr more tolerant of smaller screens (tablets, narrow browser windows) without a full mobile redesign.

---

## Goals

1. Toolbar buttons collapse to icon-only at narrow widths
2. Device library sidebar narrows at medium breakpoints
3. Canvas overflow is properly contained
4. No functionality loss - all features remain accessible

---

## Non-Goals

- Full mobile phone support (future roadmap item)
- Bottom sheet UI patterns
- Tab-based navigation
- PWA features

---

## Breakpoints

| Name    | Width            | Behaviour                              |
| ------- | ---------------- | -------------------------------------- |
| Desktop | `>1200px`        | Current layout unchanged               |
| Medium  | `768px - 1200px` | Narrower sidebar, icon-only toolbar    |
| Small   | `<768px`         | Same as medium (full mobile in future) |

---

## Implementation Details

### 1. Icon-Only Toolbar Buttons

**Trigger:** `max-width: 1000px`

**Changes:**

- Hide text labels inside `.toolbar-action-btn span`
- Buttons show icon only
- Tooltip remains for discoverability
- Button padding adjusts for icon-only appearance

**CSS:**

```css
@media (max-width: 1000px) {
	.toolbar-action-btn span {
		display: none;
	}
	.toolbar-action-btn {
		padding: var(--space-2);
	}
}
```

**Exceptions:**

- Brand name and tagline hide at narrower breakpoint (`max-width: 900px`)

### 2. Narrow Device Library Sidebar

**Trigger:** `max-width: 1000px`

**Changes:**

- Sidebar width reduces from 280px to 200px
- Device names may truncate with ellipsis
- Category headers remain visible
- Scrolling behaviour unchanged

**CSS Variable Override:**

```css
@media (max-width: 1000px) {
	:root {
		--sidebar-width: 200px;
	}
}
```

### 3. Canvas Overflow Handling

**Changes:**

- Ensure `.canvas-container` has `overflow: hidden`
- Verify panzoom works correctly in constrained viewport
- No horizontal page scrolling on narrow screens

**CSS:**

```css
.canvas-container {
	overflow: hidden;
}

body,
html {
	overflow-x: hidden;
}
```

### 4. Brand Collapse

**Trigger:** `max-width: 900px`

**Changes:**

- Hide tagline completely
- Brand name remains visible

**Trigger:** `max-width: 600px`

**Changes:**

- Hide brand name, show icon only

---

## Test Cases

### Toolbar Tests

1. At 1200px: buttons show icon + text
2. At 1000px: buttons show icon only, no text
3. At 900px: tagline hidden, brand name visible
4. At 600px: brand name hidden, logo visible
5. Button functionality unchanged at all widths

### Sidebar Tests

1. At 1200px: sidebar is 280px wide
2. At 1000px: sidebar is 200px wide
3. Device palette content remains usable at 200px

### Canvas Tests

1. No horizontal scroll on body at 800px viewport
2. Panzoom works correctly in narrow viewport
3. Canvas container has overflow hidden

---

## Acceptance Criteria

- [ ] Toolbar buttons are icon-only at <=1000px
- [ ] Sidebar narrows to 200px at <=1000px
- [ ] No horizontal page scroll at 800px viewport
- [ ] All functionality accessible via tooltips
- [ ] Tests pass for responsive behaviour
