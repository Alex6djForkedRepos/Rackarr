# Toolbar Responsiveness Specification

**Status:** Draft
**Created:** 2025-12-07
**Target:** v0.4.x patch

---

## Overview

Fix toolbar UI issues including text overlap, inconsistent spacing, and lack of responsive collapse behavior. Implements a hamburger menu pattern for narrow desktop viewports with the logo serving as the menu trigger.

---

## Goals

1. Eliminate tagline/button text overlap at all viewport widths
2. Implement hamburger menu for viewports below 1024px
3. Use logo as hamburger trigger with visual state change
4. Provide left drawer menu with grouped actions
5. Ensure consistent spacing throughout toolbar
6. Follow desktop UX best practices

---

## Non-Goals

- Mobile phone support (separate roadmap item)
- Bottom sheet patterns
- Touch gesture interactions
- PWA features

---

## Breakpoints

| Name          | Width         | Toolbar Behaviour                                    |
| ------------- | ------------- | ---------------------------------------------------- |
| Desktop Large | `>1200px`     | Full toolbar: logo, tagline, all buttons with labels |
| Desktop       | `1024-1200px` | Hide tagline, icon-only buttons                      |
| Compact       | `<1024px`     | Hamburger mode: logo triggers left drawer            |

---

## Implementation Details

### 1. Fix Text Overlap (1200px breakpoint)

**Problem:** Tagline collides with toolbar buttons due to absolute positioning of center section.

**Solution:** Hide tagline at 1200px instead of current 900px.

**CSS Change:**

```css
@media (max-width: 1200px) {
	.brand-tagline {
		display: none;
	}
}
```

**Rationale:** The current 900px threshold is too late; overlap occurs when toolbar buttons (absolutely centered) meet the brand section (left-aligned). Moving the threshold to 1200px provides adequate clearance.

---

### 2. Consistent Spacing

**Problem:** Insufficient spacing between brand area and action buttons; uneven gaps.

**Solution:** Use design tokens consistently and adjust toolbar layout.

**Changes:**

- Remove absolute positioning from `.toolbar-center`
- Use flexbox with `justify-content: space-between` for natural spacing
- Apply consistent `gap` using `--space-2` between button groups
- Use `--space-4` between major sections (brand, actions)

**CSS:**

```css
.toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-4);
	padding: 0 var(--space-4);
}

.toolbar-center {
	display: flex;
	align-items: center;
	gap: var(--space-1);
	flex: 1;
	justify-content: center;
}

.separator {
	width: 1px;
	height: var(--space-6);
	background: var(--colour-border);
	margin: 0 var(--space-1);
}
```

---

### 3. Hamburger Menu Mode (<1024px)

**Trigger:** `max-width: 1023px`

**Behaviour:**

- All toolbar action buttons hidden
- Logo visually changes to indicate menu functionality
- Clicking logo opens left drawer
- Theme toggle remains visible (quick access)

#### 3.1 Logo State Change

**Visual Indicator:** Logo transitions to a different visual state at hamburger breakpoint.

**Options (implement one):**

- **Option A:** Three horizontal lines appear beside/below the logo
- **Option B:** Logo opacity reduces slightly with hamburger overlay
- **Option C:** Logo gets a subtle border/background indicating clickability

**Recommended:** Option A - small hamburger icon (`--space-3` size) appears to the right of the logo, separated by `--space-1`.

**CSS:**

```css
.toolbar-brand {
	cursor: default;
}

@media (max-width: 1023px) {
	.toolbar-brand {
		cursor: pointer;
	}

	.toolbar-brand:hover {
		background: var(--colour-surface-hover);
		border-radius: var(--radius-md);
	}

	.brand-hamburger-icon {
		display: flex;
	}
}
```

#### 3.2 Left Drawer

**Dimensions:**

- Width: `var(--drawer-width)` (320px)
- Height: Full viewport height minus toolbar
- Position: Fixed, slides in from left edge

**Animation:**

- Duration: `var(--duration-normal)` (200ms)
- Easing: `var(--ease-out)`
- Transform: `translateX(-100%)` to `translateX(0)`

**Backdrop:**

- Semi-transparent overlay (`rgba(0, 0, 0, 0.5)`)
- Click to close
- Fade in/out with drawer

**Structure:**

```html
<aside class="toolbar-drawer" class:open="{drawerOpen}">
	<nav class="drawer-nav">
		<section class="drawer-group">
			<h3 class="drawer-group-title">File</h3>
			<button class="drawer-item">New Rack</button>
			<button class="drawer-item">Load Layout</button>
			<button class="drawer-item">Save</button>
			<button class="drawer-item">Export</button>
		</section>

		<section class="drawer-group">
			<h3 class="drawer-group-title">Edit</h3>
			<button class="drawer-item">Undo</button>
			<button class="drawer-item">Redo</button>
			<button class="drawer-item">Delete</button>
		</section>

		<section class="drawer-group">
			<h3 class="drawer-group-title">View</h3>
			<button class="drawer-item">Display Mode</button>
			<button class="drawer-item">Reset View</button>
			<button class="drawer-item">Help</button>
		</section>
	</nav>
</aside>
```

**Styling:**

```css
.toolbar-drawer {
	position: fixed;
	top: var(--toolbar-height);
	left: 0;
	width: var(--drawer-width);
	height: calc(100vh - var(--toolbar-height));
	background: var(--colour-surface);
	border-right: 1px solid var(--colour-border);
	transform: translateX(-100%);
	transition: transform var(--duration-normal) var(--ease-out);
	z-index: 100;
	overflow-y: auto;
}

.toolbar-drawer.open {
	transform: translateX(0);
}

.drawer-backdrop {
	position: fixed;
	inset: 0;
	top: var(--toolbar-height);
	background: rgba(0, 0, 0, 0.5);
	opacity: 0;
	visibility: hidden;
	transition:
		opacity var(--duration-normal) var(--ease-out),
		visibility var(--duration-normal);
}

.drawer-backdrop.visible {
	opacity: 1;
	visibility: visible;
}

.drawer-group {
	padding: var(--space-4);
	border-bottom: 1px solid var(--colour-border);
}

.drawer-group:last-child {
	border-bottom: none;
}

.drawer-group-title {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-semibold);
	color: var(--colour-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin-bottom: var(--space-2);
}

.drawer-item {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	width: 100%;
	padding: var(--space-3) var(--space-2);
	border: none;
	border-radius: var(--radius-md);
	background: transparent;
	color: var(--colour-text);
	font-size: var(--font-size-base);
	cursor: pointer;
	transition: background-color var(--duration-fast) var(--ease-out);
}

.drawer-item:hover {
	background: var(--colour-surface-hover);
}

.drawer-item:focus-visible {
	outline: none;
	box-shadow: 0 0 0 2px var(--colour-focus-ring);
}

.drawer-item:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.drawer-item svg {
	flex-shrink: 0;
}
```

---

### 4. Keyboard & Accessibility

**Requirements:**

- Drawer can be closed with `Escape` key
- Focus trapped within drawer when open
- First focusable item receives focus when drawer opens
- Focus returns to logo when drawer closes
- `aria-expanded` on logo reflects drawer state
- `aria-hidden` on drawer when closed
- Screen reader announcement when drawer opens/closes

**Implementation:**

```svelte
<div
    class="toolbar-brand"
    role="button"
    tabindex="0"
    aria-expanded={drawerOpen}
    aria-controls="toolbar-drawer"
    aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
    onclick={toggleDrawer}
    onkeydown={(e) => e.key === 'Enter' && toggleDrawer()}
>
```

---

### 5. Updated Breakpoint Summary

| Breakpoint    | Tagline | Button Labels  | Hamburger | Sidebar Width |
| ------------- | ------- | -------------- | --------- | ------------- |
| `>1200px`     | Visible | Visible        | Hidden    | 280px         |
| `1024-1200px` | Hidden  | Hidden (icons) | Hidden    | 280px         |
| `1000-1023px` | Hidden  | Hidden (icons) | Visible   | 200px         |
| `<1000px`     | Hidden  | N/A (drawer)   | Visible   | 200px         |

---

## Menu Action Groups

### File Group

| Action      | Icon       | Shortcut | Enabled When |
| ----------- | ---------- | -------- | ------------ |
| New Rack    | IconPlus   | N        | Always       |
| Load Layout | IconLoad   | Ctrl+O   | Always       |
| Save        | IconSave   | Ctrl+S   | Always       |
| Export      | IconExport | Ctrl+E   | Always       |

### Edit Group

| Action | Icon      | Shortcut     | Enabled When       |
| ------ | --------- | ------------ | ------------------ |
| Undo   | IconUndo  | Ctrl+Z       | `canUndo === true` |
| Redo   | IconRedo  | Ctrl+Shift+Z | `canRedo === true` |
| Delete | IconTrash | Delete       | `hasSelection`     |

### View Group

| Action       | Icon            | Shortcut | Notes                   |
| ------------ | --------------- | -------- | ----------------------- |
| Display Mode | IconLabel/Image | I        | Toggle label/image mode |
| Reset View   | IconFitAll      | F        | Reset pan/zoom          |
| Help         | IconHelp        | ?        | Show keyboard shortcuts |

**Note:** Theme toggle remains in toolbar header (not in drawer) for quick access.

---

## Test Cases

### Overlap Fix Tests

1. At 1200px+: tagline visible, no overlap with buttons
2. At 1199px: tagline hidden
3. No text truncation or wrapping at any width

### Hamburger Mode Tests

1. At 1024px+: full toolbar visible, no hamburger
2. At 1023px: hamburger icon appears next to logo
3. At 1023px: all action buttons hidden except theme toggle
4. Logo click opens drawer
5. Logo shows hover state when cursor over it

### Drawer Tests

1. Drawer slides in from left with animation
2. Backdrop appears behind drawer
3. Clicking backdrop closes drawer
4. Escape key closes drawer
5. Focus moves to first item when drawer opens
6. Focus returns to logo when drawer closes
7. All actions functional from drawer
8. Disabled actions (Undo when nothing to undo) show disabled state

### Accessibility Tests

1. `aria-expanded` updates when drawer toggles
2. Screen reader announces drawer open/close
3. Tab navigation works within drawer
4. Keyboard shortcuts still work when drawer is closed

### Visual Tests

1. Drawer uses correct design tokens
2. Group titles styled consistently
3. Hover states on drawer items
4. Focus rings visible on keyboard navigation
5. Theme toggle in toolbar works at all breakpoints

---

## Acceptance Criteria

- [ ] Tagline hidden at <=1200px (no overlap at any width)
- [ ] Hamburger icon appears at <=1023px
- [ ] Logo click opens left drawer at hamburger breakpoint
- [ ] Drawer contains all toolbar actions in grouped sections
- [ ] Drawer closes on backdrop click
- [ ] Drawer closes on Escape key
- [ ] Focus management correct (trap in drawer, restore on close)
- [ ] Theme toggle remains accessible outside drawer
- [ ] All keyboard shortcuts functional
- [ ] All design tokens used (no hardcoded values)
- [ ] Smooth animations using token durations
- [ ] Tests pass for all breakpoints

---

## Implementation Order

1. Fix tagline breakpoint (1200px)
2. Fix toolbar spacing (remove absolute positioning)
3. Add hamburger icon to logo area (hidden by default)
4. Create ToolbarDrawer component
5. Add drawer open/close state and toggle
6. Wire up drawer actions to existing handlers
7. Add keyboard handling (Escape, focus trap)
8. Add accessibility attributes
9. Write tests
10. Visual polish and animation tuning

---

## Files to Modify

| File                                       | Changes                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| `src/lib/components/Toolbar.svelte`        | Layout changes, hamburger state, drawer integration          |
| `src/lib/components/ToolbarDrawer.svelte`  | **New component** for drawer menu                            |
| `src/lib/components/icons/IconMenu.svelte` | **New component** - hamburger menu icon (3 horizontal lines) |
| `src/lib/components/icons/index.ts`        | Export new IconMenu                                          |
| `src/lib/styles/tokens.css`                | Add drawer-related tokens if needed                          |

---

## Changelog

| Date       | Change             |
| ---------- | ------------------ |
| 2025-12-07 | Initial spec draft |
