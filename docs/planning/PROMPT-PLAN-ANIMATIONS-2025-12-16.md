# Animation Implementation Prompt Plan

**Date:** 2025-12-16
**Scope:** Rainbow Wave, Loading State, Shimmer, Party Mode animations

---

## Overview

This prompt plan implements the animation tokens and UX feedback documented in:

- `BRAND.md` (Section: Semantic Animation Tokens)
- `SPEC.md` (Sections: 19.8.4–19.8.8)

---

## Phase 1: Animation Token Foundation

### Prompt 1.1: Create animations.css

Create `src/lib/styles/animations.css` with:

1. Semantic animation duration tokens:

   ```css
   :root {
   	--anim-rainbow: 6s;
   	--anim-loading: 2s;
   	--anim-shimmer: 2s;
   	--anim-party: 0.5s;
   	--anim-party-duration: 5s;
   }
   ```

2. Core keyframe animations:
   - `shimmer` — background-position sweep
   - `breathe` — opacity pulse (0.6–1)
   - `pulse-scale` — scale pulse (1–1.05)
   - `success-glow` — green glow expansion
   - `slideOut` — exit animation for toasts
   - `wobble` — subtle rotation for party mode

3. Reduced motion overrides

4. Import in `src/app.css`

**Tests:** `src/tests/animations.test.ts`

- Verify all tokens exist in CSS
- Verify keyframes defined
- Verify reduced motion media query present

---

### Prompt 1.2: Create AnimationDefs.svelte

Create `src/lib/components/AnimationDefs.svelte` with shared SVG gradient definitions:

1. `#rainbow-wave` — Full Dracula palette cycling (6s):
   - Colours: purple → pink → cyan → green → orange → red → yellow → purple
   - Three stops at 0%, 50%, 100% with offset animation

2. `#party-grad` — Fast celebration (0.5s):
   - Same colours, faster cycle

3. `#loading-grad` — Purple breathe effect (2s)

4. Mount in App.svelte (hidden SVG for global access)

**Tests:** `src/tests/AnimationDefs.test.ts`

- Verify gradient IDs rendered
- Verify animate elements have correct durations

---

## Phase 2: Loading State Animation

### Prompt 2.1: Create LogoLoader Component

Create `src/lib/components/LogoLoader.svelte`:

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | 48 | Logo size in pixels |
| `message` | `string` | `''` | Optional status message |

**Behaviour:**

- Logo mark (same path as LogoLockup)
- Three slots fill sequentially with stagger animation
- Slots use `--anim-loading` (2s) cycle
- Message text below in muted colour

**Animation:**

```css
@keyframes slot-fill {
	0%,
	100% {
		transform: scaleX(0);
	}
	50% {
		transform: scaleX(1);
	}
}

.slot-1 {
	animation-delay: 0s;
}
.slot-2 {
	animation-delay: 0.3s;
}
.slot-3 {
	animation-delay: 0.6s;
}
```

**Tests:** `src/tests/LogoLoader.test.ts`

- Renders logo SVG
- Displays message when provided
- Has animation classes on slots

---

### Prompt 2.2: Integrate LogoLoader into ExportDialog

Modify `src/lib/components/ExportDialog.svelte`:

1. Add `isExporting` state tracking
2. Show LogoLoader when `isExporting === true`
3. Update message during export phases:
   - "Rendering preview..."
   - "Generating file..."
   - "Preparing download..."
4. Hide preview area during export, show loader instead

**Tests:** Update `src/tests/ExportDialog.test.ts`

- Loader visible during export state
- Preview hidden during export
- Message updates correctly

---

## Phase 3: Shimmer Effect

### Prompt 3.1: Create Shimmer Component

Create `src/lib/components/Shimmer.svelte`:

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Whether to show shimmer |

**Behaviour:**

- Wraps content in container with relative positioning
- Overlay div with shimmer gradient when `loading`
- CSS-based animation (no JS)

```css
.shimmer-overlay {
	background: linear-gradient(
		90deg,
		transparent 0%,
		rgba(255, 255, 255, 0.1) 50%,
		transparent 100%
	);
	background-size: 200% 100%;
	animation: shimmer var(--anim-shimmer) infinite;
}
```

**Tests:** `src/tests/Shimmer.test.ts`

- Overlay visible when loading=true
- Overlay hidden when loading=false
- Children always rendered

---

### Prompt 3.2: Apply Shimmer to Export Preview

Modify `src/lib/components/ExportDialog.svelte`:

1. Wrap preview area in Shimmer component
2. Set `loading={previewGenerating}`
3. Preview shows with shimmer overlay while rendering

---

## Phase 4: Success Celebrations

### Prompt 4.1: Enhance Toast Component

Modify `src/lib/components/Toast.svelte`:

1. Add exit animation:

   ```css
   .toast.exiting {
   	animation: slideOut 0.3s ease-out forwards;
   }
   ```

2. Add success glow for success type:

   ```css
   .toast.success {
   	animation: success-glow 0.5s ease-out;
   }
   ```

3. Trigger exit animation before removal

**Tests:** Update `src/tests/Toast.test.ts`

- Success toast has glow animation class
- Exit animation triggered on dismiss

---

### Prompt 4.2: Add Celebrate Prop to LogoLockup

Modify `src/lib/components/LogoLockup.svelte`:

**New Prop:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `celebrate` | `boolean` | `false` | Trigger celebration animation |

**Behaviour:**

- When `celebrate` becomes true, logo uses rainbow-wave gradient
- After 3 seconds, automatically reverts to static purple
- Uses `$effect` to manage timeout

```svelte
$effect(() => {
  if (celebrate) {
    celebrating = true;
    const timer = setTimeout(() => celebrating = false, 3000);
    return () => clearTimeout(timer);
  }
});
```

**Tests:** Update `src/tests/LogoLockup.test.ts`

- celebrate=true applies rainbow gradient
- Reverts after timeout

---

### Prompt 4.3: Trigger Celebration on Success

Modify `src/lib/components/App.svelte`:

1. Add `celebrateLogo` state
2. Set `celebrateLogo = true` after:
   - Successful export
   - Successful save
   - Successful load
3. Pass to LogoLockup in Toolbar

---

## Phase 5: Interactive Drag Feedback

### Prompt 5.1: Enhance RackDevice Drag States

Modify `src/lib/components/RackDevice.svelte`:

1. Add `dragging` class when device is being dragged
2. Apply scale and shadow transforms:

   ```css
   .device-rect.dragging {
   	transform: scale(1.02);
   	filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
   }
   ```

3. Add settle animation on drop:
   ```css
   .device-rect {
   	transition:
   		transform 0.15s ease-out,
   		filter 0.15s ease-out;
   }
   ```

**Tests:** Update `src/tests/RackDevice.test.ts`

- dragging class applied during drag
- Styles include transform and filter

---

### Prompt 5.2: Add Drop Zone Feedback

Modify `src/lib/components/Rack.svelte`:

1. Add visual feedback for valid/invalid drop zones
2. Valid zone: green border pulse
3. Invalid zone: red flash (brief)

```css
.drop-zone.valid {
	border-color: var(--colour-success);
	animation: pulse-border 0.5s ease-out;
}

.drop-zone.invalid {
	border-color: var(--colour-error);
	animation: flash-red 0.2s ease-out;
}
```

---

## Phase 6: Party Mode Easter Egg

### Prompt 6.1: Create Konami Detector

Create `src/lib/utils/konami.ts`:

```typescript
const KONAMI = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'KeyB',
	'KeyA'
];

export function createKonamiDetector(onActivate: () => void) {
	let position = 0;

	return (event: KeyboardEvent) => {
		if (event.code === KONAMI[position]) {
			position++;
			if (position === KONAMI.length) {
				onActivate();
				position = 0;
			}
		} else {
			position = 0;
		}
	};
}
```

**Tests:** `src/tests/konami.test.ts`

- Callback fires on complete sequence
- Resets on wrong key
- Case insensitive handling

---

### Prompt 6.2: Implement Party Mode in App

Modify `src/lib/components/App.svelte`:

1. Add `partyMode` state
2. Set up Konami detector on mount
3. When activated:
   - Set `partyMode = true`
   - Show toast: "🎉 Party Mode!"
   - After 5 seconds, set `partyMode = false`

4. Pass `partyMode` to LogoLockup and Rack

---

### Prompt 6.3: Party Mode Visual Effects

1. **LogoLockup** — When `partyMode`:
   - Use `#party-grad` gradient (fast 0.5s cycle)
   - Add wobble animation

2. **Rack.svelte** — When `partyMode`:
   - Rack frame border cycles rainbow colours

```css
.rack-frame.party-mode {
	animation: rainbow-border var(--anim-party) infinite;
}

@keyframes rainbow-border {
	0% {
		border-color: var(--dracula-purple);
	}
	14% {
		border-color: var(--dracula-pink);
	}
	28% {
		border-color: var(--dracula-cyan);
	}
	42% {
		border-color: var(--dracula-green);
	}
	57% {
		border-color: var(--dracula-orange);
	}
	71% {
		border-color: var(--dracula-red);
	}
	85% {
		border-color: var(--dracula-yellow);
	}
	100% {
		border-color: var(--dracula-purple);
	}
}
```

**Accessibility:** All party mode animations must check `prefers-reduced-motion`.

---

## Implementation Order

| Priority | Phase        | Prompt        | Reason                       |
| -------- | ------------ | ------------- | ---------------------------- |
| 1        | Foundation   | 1.1, 1.2      | Required for all animations  |
| 2        | Loading      | 2.1, 2.2      | Highest UX impact            |
| 3        | Celebrations | 4.1, 4.2, 4.3 | Success feedback             |
| 4        | Shimmer      | 3.1, 3.2      | Loading polish               |
| 5        | Drag         | 5.1, 5.2      | Interactive enhancement      |
| 6        | Party Mode   | 6.1, 6.2, 6.3 | Easter egg (lowest priority) |

---

## Files Summary

### New Files

| File                                      | Purpose                        |
| ----------------------------------------- | ------------------------------ |
| `src/lib/styles/animations.css`           | Animation keyframes and tokens |
| `src/lib/components/AnimationDefs.svelte` | SVG gradient definitions       |
| `src/lib/components/LogoLoader.svelte`    | Loading state with slot reveal |
| `src/lib/components/Shimmer.svelte`       | Shimmer overlay component      |
| `src/lib/utils/konami.ts`                 | Konami code detector           |
| `src/tests/animations.test.ts`            | Animation token tests          |
| `src/tests/AnimationDefs.test.ts`         | Gradient definition tests      |
| `src/tests/LogoLoader.test.ts`            | LogoLoader tests               |
| `src/tests/Shimmer.test.ts`               | Shimmer component tests        |
| `src/tests/konami.test.ts`                | Konami detector tests          |

### Modified Files

| File                                     | Changes                                    |
| ---------------------------------------- | ------------------------------------------ |
| `src/app.css`                            | Import animations.css                      |
| `src/lib/components/App.svelte`          | Loading state, konami listener, party mode |
| `src/lib/components/Toast.svelte`        | Exit animation, success glow               |
| `src/lib/components/LogoLockup.svelte`   | Add `celebrate` and `partyMode` props      |
| `src/lib/components/ExportDialog.svelte` | Show loader + shimmer during export        |
| `src/lib/components/RackDevice.svelte`   | Drag scale feedback                        |
| `src/lib/components/Rack.svelte`         | Party mode border, drop zone feedback      |
| `src/lib/components/Toolbar.svelte`      | Pass celebrate/partyMode to LogoLockup     |

---

## Testing Checklist

- [ ] Animation tokens defined in CSS
- [ ] LogoLoader displays during PNG/JPEG/PDF export
- [ ] Shimmer visible on export preview while rendering
- [ ] Toast has smooth exit animation
- [ ] Success toast has glow effect
- [ ] Rainbow wave plays on export/save/load success
- [ ] Drag feedback visible on device pickup
- [ ] Drop zone shows valid/invalid feedback
- [ ] Konami code triggers party mode
- [ ] Party mode auto-disables after 5s
- [ ] All animations respect reduced motion
- [ ] Animations work in both dark/light themes
