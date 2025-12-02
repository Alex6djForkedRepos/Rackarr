# Rackarr — Implementation Prompt Plan

**Created:** 2025-12-02
**Target Version:** 0.3.0 (Core Enhancements)
**Methodology:** Test-Driven Development (TDD)

---

## Executive Summary

This document contains a series of prompts for implementing the next release of Rackarr. Each prompt is designed to be executed by a code-generation LLM in sequence, following TDD principles.

### Current State (v0.2.1)

- Single-rack layout designer with 10 device categories
- Save/load as JSON (`.rackarr.json`)
- Export as PNG/JPEG/SVG
- Front/rear view toggle
- Device library in slide-out drawer
- 19" rack width only
- No device images
- TypeScript types (no Zod validation)

### Target State (v0.3.0)

- 11 device categories (+ shelf)
- Save/load as ZIP archive (`.rackarr.zip`)
- Device images (front/rear) stored in archive
- Label/image display mode toggle
- Fixed device library sidebar (always visible)
- 10" rack width option
- Bundled export with metadata
- Zod schema validation

---

## Gap Analysis: Spec vs Current Implementation

| Feature         | Spec                         | Current          | Gap                                                                                                     |
| --------------- | ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| Categories      | 11 (includes shelf)          | 10               | Add shelf                                                                                               |
| Device fields   | 12 (with optionals)          | 6                | Add is_full_depth, manufacturer, model, part_number, airflow, weight, weight_unit, images, face default |
| Rack fields     | 7 (with optionals)           | 6                | Add form_factor, desc_units, starting_unit                                                              |
| Layout settings | 4                            | 1                | Add view, displayMode, showLabelsOnImages                                                               |
| Validation      | Zod schemas                  | TypeScript types | Implement Zod                                                                                           |
| File format     | .rackarr.zip (YAML + images) | .rackarr.json    | Implement ZIP                                                                                           |
| Device images   | Front/rear per device        | None             | Implement                                                                                               |
| Display mode    | Label/Image toggle           | Label only       | Implement toggle                                                                                        |
| Device library  | Fixed sidebar (300px)        | Drawer (toggle)  | Convert to fixed                                                                                        |
| Rack width      | 10" or 19"                   | 19" only         | Add 10" option                                                                                          |
| Export          | Quick + Bundled              | Quick only       | Add bundled                                                                                             |

---

## Phase Overview

| Phase | Description                      | Prompts | Builds On     |
| ----- | -------------------------------- | ------- | ------------- |
| 1     | Data Model Foundation            | 1.1-1.4 | -             |
| 2     | Zod Schema Implementation        | 2.1-2.4 | Phase 1       |
| 3     | Shelf Category & Starter Library | 3.1-3.3 | Phase 1       |
| 4     | Rack Configuration Options       | 4.1-4.4 | Phases 1-2    |
| 5     | Fixed Device Library Sidebar     | 5.1-5.3 | -             |
| 6     | Device Images Foundation         | 6.1-6.5 | Phases 1-2    |
| 7     | ZIP Archive Format               | 7.1-7.5 | Phases 1-2, 6 |
| 8     | Device Image Display             | 8.1-8.4 | Phases 6-7    |
| 9     | Bundled Export                   | 9.1-9.3 | Phase 7       |

---

# Phase 1: Data Model Foundation

Extend the TypeScript types to align with the full spec. These are non-breaking additions that prepare the codebase for future features.

---

## Prompt 1.1: Add Shelf Category

```text
Add the 'shelf' category to Rackarr's device category system following TDD methodology.

CONTEXT:
- Current file: src/lib/types/index.ts defines DeviceCategory with 10 values
- Current file: src/lib/types/constants.ts defines CATEGORY_COLOURS and ALL_CATEGORIES
- The spec defines 11 categories, we're missing 'shelf'
- Shelf default colour: #8B4513

REQUIREMENTS:
1. Write tests first in src/tests/types.test.ts:
   - Test that DeviceCategory includes 'shelf'
   - Test that CATEGORY_COLOURS has 'shelf' key with value '#8B4513'
   - Test that ALL_CATEGORIES includes 'shelf'

2. Update src/lib/types/index.ts:
   - Add 'shelf' to DeviceCategory union type

3. Update src/lib/types/constants.ts:
   - Add shelf colour to CATEGORY_COLOURS: '#8B4513'
   - Add 'shelf' to ALL_CATEGORIES array (before 'blank')

4. Run tests to confirm passing

DO NOT:
- Add shelf to starter library yet (separate prompt)
- Create shelf icon yet (separate prompt)
- Modify any components
```

---

## Prompt 1.2: Add Optional Device Fields

```text
Add optional device fields to the Device interface following TDD methodology.

CONTEXT:
- Current Device interface in src/lib/types/index.ts has: id, name, height, colour, category, notes
- Spec Section 3.3.2 defines additional optional fields

NEW OPTIONAL FIELDS TO ADD:
- manufacturer: string (max 100 chars, for NetBox imports)
- model: string (max 100 chars, for NetBox imports)
- part_number: string (max 50 chars, SKU/alternative ID)
- airflow: enum (see below)
- weight: number (min 0, multiples of 0.01)
- weight_unit: enum 'kg' | 'g' | 'lb' | 'oz' (required if weight provided)
- is_full_depth: boolean (default true)
- face: DeviceFace default 'both' (move from PlacedDevice as device-level default)
- images: { front?: string; rear?: string } (paths to images)

AIRFLOW VALUES:
'front-to-rear' | 'rear-to-front' | 'left-to-right' | 'right-to-left' |
'side-to-rear' | 'rear-to-side' | 'bottom-to-top' | 'top-to-bottom' |
'passive' | 'mixed'

REQUIREMENTS:
1. Write tests first in src/tests/types.test.ts:
   - Test Device interface accepts all optional fields
   - Test Device interface works without optional fields
   - Test airflow enum values
   - Test weight/weight_unit relationship

2. Create new type definitions:
   - Add Airflow type to src/lib/types/index.ts
   - Add WeightUnit type to src/lib/types/index.ts
   - Add DeviceImages interface

3. Update Device interface with all optional fields

4. Run all existing tests to ensure backwards compatibility

DO NOT:
- Update any forms or UI yet
- Update serialization yet
- Modify PlacedDevice
```

---

## Prompt 1.3: Add Rack Configuration Fields

```text
Add rack configuration fields to the Rack interface following TDD methodology.

CONTEXT:
- Current Rack interface in src/lib/types/index.ts has: id, name, height, width, position, view, devices
- Spec Section 3.4 defines additional configuration fields

NEW FIELDS TO ADD:
- form_factor: enum (with default '4-post-cabinet')
- desc_units: boolean (default false, if true U1 at top)
- starting_unit: number (default 1, min 1)

FORM FACTOR VALUES:
'4-post-cabinet' | '4-post-frame' | '2-post-frame' |
'wall-cabinet' | 'wall-frame' | 'wall-frame-vertical' | 'wall-cabinet-vertical'

REQUIREMENTS:
1. Write tests first in src/tests/types.test.ts:
   - Test Rack interface accepts all new fields
   - Test Rack interface works with defaults
   - Test form_factor enum values
   - Test starting_unit minimum of 1

2. Create new type definitions:
   - Add FormFactor type to src/lib/types/index.ts

3. Update Rack interface with new optional fields

4. Update src/lib/utils/rack.ts createRack function to set defaults:
   - form_factor: '4-post-cabinet'
   - desc_units: false
   - starting_unit: 1

5. Update tests for rack.ts to verify defaults

6. Run all existing tests to ensure backwards compatibility

DO NOT:
- Update the UI yet
- Change rendering logic yet
```

---

## Prompt 1.4: Add Layout Settings Fields

```text
Add layout settings fields for display mode following TDD methodology.

CONTEXT:
- Current LayoutSettings interface in src/lib/types/index.ts has only: theme
- Spec Section 3.2 defines additional settings

NEW FIELDS TO ADD:
- view: 'front' | 'rear' (default 'front') - global view state
- displayMode: 'label' | 'image' (default 'label')
- showLabelsOnImages: boolean (default false)

REQUIREMENTS:
1. Write tests first in src/tests/types.test.ts:
   - Test LayoutSettings accepts all new fields
   - Test LayoutSettings works with just theme (backwards compat)

2. Update LayoutSettings interface in src/lib/types/index.ts

3. Add new type for DisplayMode: 'label' | 'image'

4. Update src/lib/utils/serialization.ts createLayout function:
   - Add default values for new settings fields

5. Write tests in src/tests/serialization.test.ts:
   - Test createLayout includes new default settings
   - Test deserializeLayout handles layouts without new fields (migration)

6. Update validateLayoutStructure to accept new settings (optional for migration)

7. Run all tests

DO NOT:
- Update UI components yet
- Wire settings to actual behavior yet
```

---

# Phase 2: Zod Schema Implementation

Add Zod validation schemas that match the spec exactly, then integrate with serialization.

---

## Prompt 2.1: Install Zod and Create Device Schema

```text
Install Zod and create the device validation schema following TDD methodology.

CONTEXT:
- Zod is specified in the tech stack but not yet installed
- Spec Section 3.6 provides exact Zod schema definitions
- Device has required fields (slug, name, u_height, category, colour, is_full_depth) and optional fields

NOTE ON NAMING:
The spec uses 'slug' and 'u_height' but current code uses 'id' and 'height'.
Create schemas that validate both conventions for backwards compatibility:
- Accept 'id' OR 'slug' (transform slug to id internally)
- Accept 'height' OR 'u_height' (transform u_height to height internally)

REQUIREMENTS:
1. Install Zod:
   npm install zod

2. Create src/lib/schemas/device.ts:
   - AirflowSchema enum
   - WeightUnitSchema enum
   - DeviceFaceSchema enum
   - CategorySchema enum (include 'shelf')
   - DeviceImagesSchema object
   - DeviceSchema object with all fields per spec
   - Add .refine() for weight/weight_unit relationship
   - Export Device type from schema

3. Write tests in src/tests/schemas/device.test.ts:
   - Test valid device passes
   - Test invalid device fails (missing required fields)
   - Test each enum value
   - Test slug pattern validation (^[-a-z0-9_]+$)
   - Test u_height range (0.5-100, multiples of 0.5)
   - Test colour hex pattern (#RRGGBB)
   - Test weight without weight_unit fails
   - Test optional fields are truly optional

4. Run tests

DO NOT:
- Integrate with serialization yet
- Create other schemas yet
```

---

## Prompt 2.2: Create Rack Schema

```text
Create the rack validation schema following TDD methodology.

CONTEXT:
- Device schema exists in src/lib/schemas/device.ts
- Spec Section 3.6 provides RackSchema definition

REQUIREMENTS:
1. Create src/lib/schemas/rack.ts:
   - FormFactorSchema enum
   - PlacedDeviceSchema object (slug reference, position, optional face)
   - RackSchema object with all fields
   - Export Rack and PlacedDevice types from schemas

2. Write tests in src/tests/schemas/rack.test.ts:
   - Test valid rack passes
   - Test invalid rack fails
   - Test form_factor enum values
   - Test height range (1-100, integer)
   - Test width values (10, 19)
   - Test id is UUID format
   - Test devices array validation
   - Test PlacedDevice with and without face override
   - Test default values (width=19, form_factor='4-post-cabinet', etc.)

3. Run tests

DO NOT:
- Integrate with serialization yet
- Create project schema yet
```

---

## Prompt 2.3: Create Project Schema

```text
Create the project/layout validation schema following TDD methodology.

CONTEXT:
- Device schema exists in src/lib/schemas/device.ts
- Rack schema exists in src/lib/schemas/rack.ts
- Spec Section 3.6 provides ProjectSchema definition

NOTE:
The spec calls it "Project" but current code uses "Layout".
Create ProjectSchema but also export as LayoutSchema for compatibility.

REQUIREMENTS:
1. Create src/lib/schemas/project.ts:
   - Import DeviceSchema and RackSchema
   - SettingsSchema object (theme, view, displayMode, showLabelsOnImages)
   - ProjectSchema object with all fields
   - Export as both ProjectSchema and LayoutSchema
   - Export Project and Layout types

2. Write tests in src/tests/schemas/project.test.ts:
   - Test valid project passes
   - Test invalid project fails
   - Test version string required
   - Test name min 1 char
   - Test created/modified datetime format
   - Test settings validation
   - Test deviceLibrary array validation
   - Test rack validation (single rack)
   - Test default settings values

3. Create src/lib/schemas/index.ts to re-export all schemas

4. Run tests

DO NOT:
- Integrate with serialization yet
```

---

## Prompt 2.4: Integrate Zod with Serialization

```text
Integrate Zod schemas with the serialization utilities following TDD methodology.

CONTEXT:
- All Zod schemas exist in src/lib/schemas/
- Current serialization uses manual validation in src/lib/utils/serialization.ts
- Current validateLayoutStructure is a manual type guard

REQUIREMENTS:
1. Update src/lib/utils/serialization.ts:
   - Import LayoutSchema from schemas
   - Create validateLayoutWithZod function using LayoutSchema.safeParse()
   - Keep validateLayoutStructure for backwards compatibility
   - Add new function to convert validation errors to user-friendly messages

2. Write tests in src/tests/serialization.test.ts:
   - Test validateLayoutWithZod returns success for valid layout
   - Test validateLayoutWithZod returns errors for invalid layout
   - Test error messages are user-friendly
   - Test Zod validation catches issues manual validation might miss

3. Update deserializeLayout to use Zod validation:
   - Try Zod validation first
   - Fall back to manual validation for better error messages if needed
   - Throw with combined error info

4. Run ALL existing tests to ensure no regressions

5. Fix any breaking changes discovered

DO NOT:
- Remove manual validation entirely (keep as fallback)
- Change the public API of deserializeLayout
```

---

# Phase 3: Shelf Category & Starter Library

Add the shelf category icon and starter devices.

---

## Prompt 3.1: Create Shelf Category Icon

```text
Create the shelf category icon following TDD methodology.

CONTEXT:
- Category icons are in src/lib/components/CategoryIcon.svelte
- Each category has a dedicated SVG icon
- Shelf icon should represent a rack shelf (horizontal lines/surface)

REQUIREMENTS:
1. Write tests in src/tests/CategoryIcons.test.ts:
   - Test CategoryIcon renders for category='shelf'
   - Test shelf icon has appropriate aria-label
   - Test shelf icon is visually distinct

2. Update src/lib/components/CategoryIcon.svelte:
   - Add case for 'shelf' category
   - Create SVG: horizontal shelf with side brackets
   - Suggested design: horizontal line with small angled supports on each end

3. Run tests

4. Manual verification: visually inspect shelf icon matches category purpose

DO NOT:
- Modify other icons
- Add shelf to starter library yet
```

---

## Prompt 3.2: Add Shelf Devices to Starter Library

```text
Add shelf starter devices to the device library following TDD methodology.

CONTEXT:
- Starter library defined in src/lib/data/starterLibrary.ts
- Spec Section 3.5 lists starter devices for shelf: 1U Shelf, 2U Shelf, 4U Shelf
- Shelf category now exists with colour #8B4513

REQUIREMENTS:
1. Write tests in src/tests/starterLibrary.test.ts:
   - Test getStarterLibrary includes shelf category devices
   - Test '1U Shelf' exists with height 1, category 'shelf'
   - Test '2U Shelf' exists with height 2, category 'shelf'
   - Test '4U Shelf' exists with height 4, category 'shelf'
   - Test shelf devices have correct colour #8B4513

2. Update src/lib/data/starterLibrary.ts:
   - Add shelf devices to STARTER_DEVICES array:
     - { name: '1U Shelf', height: 1, category: 'shelf' }
     - { name: '2U Shelf', height: 2, category: 'shelf' }
     - { name: '4U Shelf', height: 4, category: 'shelf' }
   - Add after 'blank' category devices

3. Run tests

4. Verify total starter library now has 25 devices (was 22)

DO NOT:
- Modify existing devices
- Change starter device ID generation
```

---

## Prompt 3.3: Add 0.5U Blanking Fan to Starter Library

```text
Add the 0.5U blanking fan device following TDD methodology.

CONTEXT:
- Spec Section 3.5 lists '0.5U Blanking Fan' in cooling category
- Current starter library has '1U Fan Panel' only
- u_height supports 0.5 increments per spec

NOTE:
Current code uses 'height' not 'u_height', and current MIN_DEVICE_HEIGHT is 1.
This prompt also updates the minimum to support half-U devices.

REQUIREMENTS:
1. Update src/lib/types/constants.ts:
   - Change MIN_DEVICE_HEIGHT from 1 to 0.5

2. Write tests in src/tests/starterLibrary.test.ts:
   - Test '0.5U Blanking Fan' exists with height 0.5, category 'cooling'

3. Write tests in src/tests/types.test.ts:
   - Test MIN_DEVICE_HEIGHT is 0.5

4. Update src/lib/data/starterLibrary.ts:
   - Add to cooling section:
     - { name: '0.5U Blanking Fan', height: 0.5, category: 'cooling' }

5. Also add spec's '0.5U Blank' to blank category:
   - { name: '0.5U Blank', height: 0.5, category: 'blank' }

6. Run all tests

7. Verify total starter library now has 27 devices

DO NOT:
- Modify collision detection yet (will need updates for half-U)
- Change device form validation yet
```

---

# Phase 4: Rack Configuration Options

Add UI for rack form factor, width, and numbering options.

---

## Prompt 4.1: Add 10-Inch Rack Width Support

```text
Add 10-inch rack width support following TDD methodology.

CONTEXT:
- Current STANDARD_RACK_WIDTH is 19 (fixed)
- Spec allows width of 10 or 19
- Rack interface already has width field

REQUIREMENTS:
1. Add constant in src/lib/types/constants.ts:
   - ALLOWED_RACK_WIDTHS: readonly number[] = [10, 19] as const
   - NARROW_RACK_WIDTH = 10

2. Write tests in src/tests/rack.test.ts:
   - Test createRack with width 10 succeeds
   - Test createRack with width 19 succeeds
   - Test createRack with invalid width (e.g., 15) is handled

3. Update src/lib/utils/rack.ts:
   - Allow width parameter in createRack
   - Default to 19 if not specified
   - Validate width is 10 or 19

4. Write tests in src/tests/Rack-component.test.ts:
   - Test Rack.svelte renders correctly with width=10
   - Test Rack.svelte renders correctly with width=19
   - Test visual width is proportionally different

5. Update src/lib/components/Rack.svelte:
   - Calculate SVG width based on rack.width
   - 10" rack should be visually narrower (proportional scaling)

6. Run all tests

DO NOT:
- Update NewRackForm yet (next prompt)
- Change device placement logic (devices fit both widths)
```

---

## Prompt 4.2: Add Rack Width to NewRackForm

```text
Add rack width selection to NewRackForm following TDD methodology.

CONTEXT:
- NewRackForm is in src/lib/components/NewRackForm.svelte
- Currently only collects name and height
- Need to add width selection (10" or 19")

REQUIREMENTS:
1. Write tests in src/tests/NewRackForm.test.ts:
   - Test form shows width selection
   - Test default width is 19
   - Test width 10 can be selected
   - Test form submits with selected width
   - Test width is included in create event data

2. Update src/lib/components/NewRackForm.svelte:
   - Add width state (default 19)
   - Add radio buttons or select for width:
     - Label: "Rack Width"
     - Options: '10"' and '19"' with 19 as default
   - Include width in oncreate event data

3. Update src/App.svelte handleNewRackCreate:
   - Extract width from create data
   - Pass width to layoutStore.addRack()

4. Update src/lib/stores/layout.svelte.ts addRack():
   - Accept optional width parameter
   - Pass to createRack utility

5. Write test in src/tests/layout-store.test.ts:
   - Test addRack with width parameter

6. Run all tests

DO NOT:
- Add form_factor selection yet
- Add other rack options yet
```

---

## Prompt 4.3: Add Form Factor Selection

```text
Add form factor selection to rack configuration following TDD methodology.

CONTEXT:
- Rack now has form_factor field (Phase 1.3)
- FormFactor type exists with 7 options
- Need UI to select form factor when creating rack

REQUIREMENTS:
1. Write tests in src/tests/NewRackForm.test.ts:
   - Test form shows form factor dropdown
   - Test default is '4-post-cabinet'
   - Test all 7 options are available
   - Test selection updates state
   - Test form submits with selected form factor

2. Update src/lib/components/NewRackForm.svelte:
   - Add form_factor state (default '4-post-cabinet')
   - Add select dropdown with all FormFactor options
   - Label: "Form Factor"
   - Use user-friendly display names:
     - '4-post-cabinet' → "4-Post Cabinet"
     - '4-post-frame' → "4-Post Open Frame"
     - '2-post-frame' → "2-Post Frame"
     - 'wall-cabinet' → "Wall Cabinet"
     - 'wall-frame' → "Wall Frame"
     - 'wall-frame-vertical' → "Wall Frame (Vertical)"
     - 'wall-cabinet-vertical' → "Wall Cabinet (Vertical)"
   - Include in create event data

3. Update data flow through App.svelte and layout store:
   - Pass form_factor to addRack
   - Store in rack data

4. Run all tests

NOTE: Form factor is metadata only for now - visual differentiation is future work.

DO NOT:
- Change rack rendering based on form factor
- Add icons for form factors
```

---

## Prompt 4.4: Add Descending Units and Starting Unit

```text
Add descending units and starting unit options following TDD methodology.

CONTEXT:
- Rack has desc_units (boolean) and starting_unit (number) fields
- desc_units: if true, U1 is at TOP (reversed from default)
- starting_unit: what number to start from (usually 1)

REQUIREMENTS:
1. Write tests in src/tests/NewRackForm.test.ts:
   - Test form shows "Descending Units" checkbox
   - Test default is unchecked (false)
   - Test form shows "Starting Unit" input
   - Test default starting unit is 1
   - Test starting unit minimum is 1
   - Test form submits with both values

2. Update src/lib/components/NewRackForm.svelte:
   - Add desc_units state (default false)
   - Add starting_unit state (default 1)
   - Add checkbox: "Descending units (U1 at top)"
   - Add number input: "Starting unit number" (min 1)
   - Include both in create event data

3. Update data flow to store these in rack

4. Write tests in src/tests/Rack-component.test.ts:
   - Test U labels are reversed when desc_units=true
   - Test U labels start from starting_unit value

5. Update src/lib/components/Rack.svelte:
   - Modify U label rendering to respect desc_units
   - Modify U label rendering to use starting_unit
   - If desc_units=true: U{starting_unit} at top, incrementing down
   - If desc_units=false: U{starting_unit} at bottom, incrementing up

6. Run all tests

DO NOT:
- Change device position calculations (position is still 1-indexed from bottom internally)
- This only affects DISPLAY of U numbers
```

---

# Phase 5: Fixed Device Library Sidebar

Convert the drawer to a fixed sidebar that's always visible.

---

## Prompt 5.1: Create Sidebar Component

```text
Create a fixed Sidebar component following TDD methodology.

CONTEXT:
- Current device library uses Drawer component (slide in/out)
- Spec says device library should be "Fixed left sidebar (300px, always visible)"
- Need new component that's always visible, no toggle

REQUIREMENTS:
1. Write tests in src/tests/Sidebar.test.ts:
   - Test Sidebar renders children
   - Test Sidebar has correct width (300px)
   - Test Sidebar is always visible (no hidden state)
   - Test Sidebar has proper accessibility attributes
   - Test Sidebar can have optional title

2. Create src/lib/components/Sidebar.svelte:
   - Props: side ('left' | 'right'), title (optional), children (snippet)
   - Fixed position below toolbar
   - Width: 300px (use CSS variable)
   - No toggle/close functionality
   - Proper accessibility: role="complementary", aria-label

3. Style the sidebar:
   - Use existing design tokens for colours
   - Match Drawer styling but without animation
   - Scrollable content area

4. Run tests

DO NOT:
- Remove Drawer component (may still be used for Edit Panel)
- Modify DevicePalette yet
- Update App.svelte yet
```

---

## Prompt 5.2: Replace Device Library Drawer with Sidebar

```text
Replace the device library Drawer with fixed Sidebar following TDD methodology.

CONTEXT:
- Sidebar component created in previous prompt
- Currently App.svelte uses Drawer for DevicePalette
- Need to switch to always-visible Sidebar

REQUIREMENTS:
1. Write tests in src/tests/App.test.ts:
   - Test device library sidebar is always visible
   - Test there's no toggle button for device library
   - Test sidebar contains DevicePalette

2. Update src/App.svelte:
   - Replace Drawer wrapping DevicePalette with Sidebar
   - Remove leftDrawerOpen state usage for device library
   - Remove handleTogglePalette function
   - Remove handleClosePalette function

3. Update src/lib/components/Toolbar.svelte:
   - Remove "Toggle Palette" button entirely
   - Remove paletteOpen prop

4. Write tests in src/tests/Toolbar.test.ts:
   - Test no palette toggle button exists
   - Verify ontogglepalette event is no longer emitted

5. Update src/lib/stores/ui.svelte.ts:
   - Remove leftDrawerOpen state (or keep for potential future use)
   - Remove toggleLeftDrawer, openLeftDrawer, closeLeftDrawer

6. Run ALL tests - fix any that assumed drawer behavior

DO NOT:
- Remove Drawer component file (still used for other purposes potentially)
- Change DevicePalette component
- Modify the Canvas component
```

---

## Prompt 5.3: Adjust Canvas Layout for Fixed Sidebar

````text
Adjust the main layout to account for fixed sidebar following TDD methodology.

CONTEXT:
- Sidebar is now fixed at 300px on left
- Canvas needs to not overlap with sidebar
- Edit panel may appear on right

REQUIREMENTS:
1. Write tests in src/tests/Canvas.test.ts:
   - Test canvas has proper left margin/offset for sidebar
   - Test canvas fills remaining width

2. Update src/App.svelte layout:
   - Use CSS Grid or Flexbox for main layout
   - Sidebar: fixed 300px left
   - Canvas: flex 1 (fills remaining)
   - Edit panel: 300px right when visible

3. Update CSS in App.svelte:
   ```css
   .app-main {
     display: grid;
     grid-template-columns: 300px 1fr auto;
     /* or flexbox equivalent */
   }
````

4. Update src/lib/components/Canvas.svelte:
   - Ensure panzoom bounds account for new layout
   - Fit All calculation should work with new dimensions

5. Write tests for fitAll with new layout:
   - Test fitAll centers rack in available canvas space (not full viewport)

6. Run all tests

DO NOT:

- Change panzoom library or initialization approach
- Modify rack rendering

````

---

# Phase 6: Device Images Foundation

Set up infrastructure for storing and managing device images.

---

## Prompt 6.1: Create Image Storage Types

```text
Create types and interfaces for device image storage following TDD methodology.

CONTEXT:
- Device interface has images field: { front?: string; rear?: string }
- Images will be stored in memory during session, in ZIP on save
- Need types for image data, upload state, etc.

REQUIREMENTS:
1. Create src/lib/types/images.ts:
   - ImageData interface: { blob: Blob, dataUrl: string, filename: string }
   - ImageStore interface: Map<deviceId, { front?: ImageData, rear?: ImageData }>
   - ImageUploadResult: { success: boolean, error?: string, data?: ImageData }
   - Supported formats: 'image/png' | 'image/jpeg' | 'image/webp'

2. Write tests in src/tests/types.test.ts:
   - Test ImageData structure
   - Test supported format types

3. Add constants in src/lib/types/constants.ts:
   - SUPPORTED_IMAGE_FORMATS: ['image/png', 'image/jpeg', 'image/webp']
   - MAX_IMAGE_SIZE_MB = 5
   - MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

4. Run tests

DO NOT:
- Create image store yet
- Handle actual upload yet
````

---

## Prompt 6.2: Create Image Store

```text
Create a Svelte 5 store for device images following TDD methodology.

CONTEXT:
- Image types exist from previous prompt
- Need to store images in memory during session
- Images linked to device IDs

REQUIREMENTS:
1. Create src/lib/stores/images.svelte.ts:
   - Use Svelte 5 runes ($state)
   - images: Map<string, { front?: ImageData, rear?: ImageData }>
   - Exported functions:
     - setDeviceImage(deviceId: string, face: 'front' | 'rear', data: ImageData)
     - getDeviceImage(deviceId: string, face: 'front' | 'rear'): ImageData | undefined
     - removeDeviceImage(deviceId: string, face: 'front' | 'rear')
     - removeAllDeviceImages(deviceId: string)
     - clearAllImages()
     - getAllImages(): Map (for serialization)
     - hasImage(deviceId: string, face: 'front' | 'rear'): boolean

2. Write tests in src/tests/image-store.test.ts:
   - Test setDeviceImage stores data
   - Test getDeviceImage retrieves data
   - Test removeDeviceImage removes specific face
   - Test removeAllDeviceImages removes both faces
   - Test clearAllImages empties store
   - Test hasImage returns correct boolean
   - Test getAllImages returns full map

3. Add getImageStore() export function (following project pattern)

4. Run tests

DO NOT:
- Persist to IndexedDB yet
- Handle file uploads yet
```

---

## Prompt 6.3: Create Image Upload Utility

```text
Create utility functions for image upload and processing following TDD methodology.

CONTEXT:
- Image store exists
- Need utilities to:
  - Validate uploaded files
  - Resize images to fit device dimensions
  - Convert to data URL for display
  - Generate appropriate filenames

REQUIREMENTS:
1. Create src/lib/utils/imageUpload.ts:
   - validateImageFile(file: File): { valid: boolean, error?: string }
     - Check file type is in SUPPORTED_IMAGE_FORMATS
     - Check file size <= MAX_IMAGE_SIZE_BYTES
   - resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob>
     - Use canvas to resize while maintaining aspect ratio
   - fileToImageData(file: File, deviceSlug: string, face: 'front' | 'rear'): Promise<ImageData>
     - Read file, create data URL, generate filename
   - generateImageFilename(deviceSlug: string, face: 'front' | 'rear', extension: string): string
     - Format: {deviceSlug}-{face}.{extension}

2. Write tests in src/tests/imageUpload.test.ts:
   - Test validateImageFile accepts valid PNG
   - Test validateImageFile accepts valid JPEG
   - Test validateImageFile accepts valid WebP
   - Test validateImageFile rejects GIF
   - Test validateImageFile rejects oversized file
   - Test generateImageFilename format
   - Test resizeImage maintains aspect ratio
   - Test fileToImageData creates correct structure

3. Run tests

NOTE: Use jsdom and mock canvas for testing. If canvas mocking is complex,
mark resize tests as integration tests or skip with explanation.

DO NOT:
- Hook into UI yet
- Create upload component yet
```

---

## Prompt 6.4: Create ImageUpload Component

```text
Create an ImageUpload component for device forms following TDD methodology.

CONTEXT:
- Image utilities exist
- Need UI for uploading front/rear images
- Will be used in AddDeviceForm and EditPanel

REQUIREMENTS:
1. Write tests in src/tests/ImageUpload.test.ts:
   - Test component renders file input
   - Test accepts only image files
   - Test shows preview when image selected
   - Test can remove selected image
   - Test emits upload event with ImageData
   - Test shows error for invalid files
   - Test shows "Front" and "Rear" labels for face prop
   - Test accessibility: labels, buttons

2. Create src/lib/components/ImageUpload.svelte:
   - Props: face ('front' | 'rear'), currentImage (ImageData | undefined)
   - Events: onupload (ImageData), onremove ()
   - UI:
     - Label showing face ("Front Image" or "Rear Image")
     - File input (hidden, triggered by button)
     - "Choose File" button
     - Preview thumbnail when image exists
     - "Remove" button when image exists
     - Error message area
   - Use imageUpload utilities for validation

3. Style to match existing form components

4. Run tests

DO NOT:
- Integrate into forms yet
- Handle auto-resize yet (just validate size)
```

---

## Prompt 6.5: Add Image Upload to AddDeviceForm

````text
Integrate ImageUpload into AddDeviceForm following TDD methodology.

CONTEXT:
- ImageUpload component exists
- AddDeviceForm collects: name, height, category, colour, notes
- Need to add optional front/rear image uploads

REQUIREMENTS:
1. Write tests in src/tests/AddDeviceForm.test.ts:
   - Test form shows image upload for front
   - Test form shows image upload for rear
   - Test images are optional (form submits without them)
   - Test images are included in submit data when provided
   - Test form resets images on cancel

2. Update src/lib/components/AddDeviceForm.svelte:
   - Import ImageUpload component
   - Add state for frontImage and rearImage
   - Add two ImageUpload components (one for each face)
   - Include images in onadd event data: { ..., frontImage?, rearImage? }
   - Clear images on cancel

3. Update src/App.svelte handleAddDeviceCreate:
   - Extract images from data
   - After adding device to library, store images in image store:
     ```ts
     if (data.frontImage) {
       imageStore.setDeviceImage(newDeviceId, 'front', data.frontImage);
     }
     ```
   - Need to get the new device ID from addDeviceToLibrary (modify return)

4. Update layoutStore.addDeviceToLibrary() to return the new device ID

5. Write test for layout store returning device ID

6. Run all tests

DO NOT:
- Add to EditPanel yet
- Display images in rack yet
````

---

# Phase 7: ZIP Archive Format

Switch from JSON to ZIP archive with embedded images.

---

## Prompt 7.1: Install JSZip and Create Archive Utilities

```text
Install JSZip and create archive read/write utilities following TDD methodology.

CONTEXT:
- Currently saving as .rackarr.json (JSON)
- Need to switch to .rackarr.zip containing:
  - layout.yaml (or layout.json for now - YAML can be added later)
  - images/ folder with device images

DECISION: Use JSON inside ZIP for now (simpler). YAML migration is optional future work.

REQUIREMENTS:
1. Install JSZip:
   npm install jszip
   npm install --save-dev @types/jszip

2. Create src/lib/utils/archive.ts:
   - createArchive(layout: Layout, images: Map<string, ImageData>): Promise<Blob>
     - Creates ZIP with layout.json and images/
     - Images named: images/{deviceId}-{face}.{ext}
   - extractArchive(file: File): Promise<{ layout: Layout, images: Map }>
     - Reads ZIP, parses layout.json, extracts images
   - isRackarrArchive(file: File): boolean
     - Check file extension is .rackarr.zip

3. Write tests in src/tests/archive.test.ts:
   - Test createArchive produces valid ZIP
   - Test extractArchive reads layout correctly
   - Test extractArchive reads images correctly
   - Test round-trip: create then extract matches original
   - Test extractArchive handles archive with no images
   - Test extractArchive handles corrupted archive (throws)
   - Test isRackarrArchive detects correct extension

4. Run tests

NOTE: For testing, may need to mock JSZip or use actual library.

DO NOT:
- Switch file.ts to use archives yet
- Update save/load in App yet
```

---

## Prompt 7.2: Create Archive Constants and Update File Extension

```text
Update file handling constants for archive format following TDD methodology.

CONTEXT:
- Archive utilities exist
- Need to update file extension from .rackarr.json to .rackarr.zip
- Need to support loading both old JSON and new ZIP

REQUIREMENTS:
1. Add constants in src/lib/types/constants.ts:
   - ARCHIVE_EXTENSION = '.rackarr.zip'
   - LEGACY_JSON_EXTENSION = '.rackarr.json'
   - LAYOUT_FILENAME = 'layout.json'
   - IMAGES_FOLDER = 'images'

2. Update src/lib/utils/file.ts:
   - detectFileFormat(file: File): 'archive' | 'json'
     - Check extension to determine format
   - Update openFilePicker to accept both extensions
   - Keep existing downloadLayout for backwards compat (rename to downloadLayoutJson)
   - Add downloadArchive(layout, images): downloads .rackarr.zip

3. Write tests in src/tests/file.test.ts:
   - Test detectFileFormat identifies ZIP
   - Test detectFileFormat identifies JSON
   - Test openFilePicker accepts both extensions
   - Test downloadArchive creates correct filename

4. Run tests

DO NOT:
- Update App.svelte yet
- Remove JSON support (need backwards compat)
```

---

## Prompt 7.3: Update Save to Use Archive Format

```text
Update save functionality to use archive format following TDD methodology.

CONTEXT:
- Archive utilities and constants exist
- Need to change default save to create .rackarr.zip
- Include device images from image store

REQUIREMENTS:
1. Update src/App.svelte handleSave:
   - Import archive utilities
   - Get images from image store
   - Call createArchive instead of downloadLayout
   - Download the resulting blob
   - Show toast on success/failure

2. Write tests in src/tests/App.test.ts:
   - Test save creates .rackarr.zip file
   - Test save includes images from store
   - Test save shows success toast

3. Update the file download utility if needed:
   - downloadBlob should work for any blob/filename

4. Run all tests

5. Manual test: save a layout, verify ZIP contains:
   - layout.json with correct structure
   - images/ folder (empty if no images)

DO NOT:
- Update load yet (next prompt)
- Remove JSON save capability entirely (could be useful for debug)
```

---

## Prompt 7.4: Update Load to Handle Archive Format

```text
Update load functionality to handle archive format following TDD methodology.

CONTEXT:
- Can save as .rackarr.zip
- Need to load both .rackarr.zip and legacy .rackarr.json

REQUIREMENTS:
1. Update src/App.svelte handleLoad:
   - Use detectFileFormat to check file type
   - If ZIP: use extractArchive, then load layout and images
   - If JSON: use existing readLayoutFile (legacy support)
   - Store extracted images in image store

2. Write tests in src/tests/App.test.ts:
   - Test loading .rackarr.zip extracts layout
   - Test loading .rackarr.zip extracts images into store
   - Test loading .rackarr.json still works (legacy)
   - Test error handling for invalid archive

3. Create helper in file.ts:
   - loadLayoutFile(file: File): Promise<{ layout: Layout, images: Map }>
     - Handles both formats transparently

4. Run all tests

5. Manual test round-trip:
   - Create layout with device
   - Add image to device
   - Save as .rackarr.zip
   - Close/reload
   - Load the .rackarr.zip
   - Verify device and image present

DO NOT:
- Auto-migrate JSON to ZIP on load (just load it)
- Remove JSON support
```

---

## Prompt 7.5: Update Layout Migration for Archive Format

```text
Update migration utilities for archive format following TDD methodology.

CONTEXT:
- Currently migrate v0.1.0 JSON to v0.2.0 JSON
- Need to handle:
  - v0.1.0 JSON → v0.3.0 (current version)
  - v0.2.0 JSON → v0.3.0
  - v0.3.0 ZIP (no migration needed, just validate)

REQUIREMENTS:
1. Update src/lib/types/constants.ts:
   - Change CURRENT_VERSION to '0.3.0'

2. Update src/lib/utils/migration.ts:
   - Support migration from 0.1.0, 0.2.0, and 1.0 to 0.3.0
   - Add new settings fields with defaults (displayMode, showLabelsOnImages, view)
   - Add new rack fields with defaults (form_factor, desc_units, starting_unit)
   - Preserve existing data

3. Write tests in src/tests/migration.test.ts:
   - Test migration from 0.1.0 to 0.3.0
   - Test migration from 0.2.0 to 0.3.0
   - Test 0.3.0 layouts pass through unchanged
   - Test new fields have correct defaults after migration

4. Update src/lib/utils/serialization.ts:
   - Handle 0.2.0 version in deserializeLayout
   - createLayout should use version 0.3.0

5. Run ALL tests - migration is critical path

6. Verify existing test fixtures still work after version bump

DO NOT:
- Change any behavior for current-version layouts
- Remove support for any existing version
```

---

# Phase 8: Device Image Display

Render device images in the rack visualization.

---

## Prompt 8.1: Add Display Mode State

```text
Add display mode state management following TDD methodology.

CONTEXT:
- LayoutSettings has displayMode field ('label' | 'image')
- Need to expose this in UI store for easy access
- Need to wire to actual UI behavior

REQUIREMENTS:
1. Update src/lib/stores/ui.svelte.ts:
   - Add displayMode state: 'label' | 'image' (default 'label')
   - Add toggleDisplayMode() function
   - Add setDisplayMode(mode) function

2. Write tests in src/tests/ui-store.test.ts:
   - Test initial displayMode is 'label'
   - Test toggleDisplayMode switches between 'label' and 'image'
   - Test setDisplayMode sets specific mode

3. Sync displayMode with layout settings:
   - When layout loads, set UI displayMode from layout.settings.displayMode
   - When displayMode changes, update layout.settings.displayMode

4. Update src/lib/stores/layout.svelte.ts:
   - Add updateDisplayMode(mode) function that updates settings

5. Write integration test:
   - Change display mode, save, reload, verify mode persisted

6. Run all tests

DO NOT:
- Add UI toggle yet (next prompt)
- Change rack rendering yet
```

---

## Prompt 8.2: Add Display Mode Toggle to Toolbar

```text
Add display mode toggle button to toolbar following TDD methodology.

CONTEXT:
- Display mode state exists in UI store
- Toolbar needs Label/Image toggle
- Spec: "Display: Label/Image" button in toolbar

REQUIREMENTS:
1. Create icon components:
   - src/lib/components/icons/IconLabel.svelte (text/label icon)
   - src/lib/components/icons/IconImage.svelte (image/picture icon)

2. Write tests in src/tests/Toolbar.test.ts:
   - Test display mode toggle button exists
   - Test button shows current mode
   - Test clicking toggles mode
   - Test button has correct aria-label

3. Update src/lib/components/Toolbar.svelte:
   - Add displayMode prop
   - Add ontoggle event for display mode
   - Add toggle button with icon based on current mode
   - Tooltip: "Display Mode: {mode}" with shortcut hint

4. Update src/App.svelte:
   - Pass displayMode to Toolbar
   - Handle toggle event by calling uiStore.toggleDisplayMode()

5. Add keyboard shortcut in KeyboardHandler:
   - 'I' key toggles display mode (per spec)

6. Write test for keyboard shortcut

7. Run all tests

DO NOT:
- Change rack device rendering yet
```

---

## Prompt 8.3: Render Device Images in RackDevice

```text
Render device images in RackDevice component following TDD methodology.

CONTEXT:
- Display mode toggle exists
- Image store has device images
- RackDevice currently renders category icon + name label

REQUIREMENTS:
1. Update src/lib/components/RackDevice.svelte:
   - Import image store
   - Accept displayMode prop
   - When displayMode='image' AND device has image for current view:
     - Render <image> SVG element with data URL
     - Scale to fit device rectangle
   - When displayMode='image' but no image:
     - Fall back to label display
   - When displayMode='label':
     - Render existing icon + name

2. Write tests in src/tests/RackDevice.test.ts:
   - Test renders label when displayMode='label'
   - Test renders image when displayMode='image' and image exists
   - Test falls back to label when displayMode='image' but no image
   - Test image scales to device size
   - Test correct image shown for front vs rear view

3. Pass displayMode from Rack to RackDevice:
   - Update src/lib/components/Rack.svelte to pass displayMode
   - Get displayMode from UI store or prop

4. Run all tests

5. Manual test:
   - Add device with front image
   - Toggle display mode
   - Verify image appears in image mode
   - Verify label appears in label mode

DO NOT:
- Add label overlay option yet (next prompt)
```

---

## Prompt 8.4: Add Label Overlay Option

```text
Add label overlay option for image mode following TDD methodology.

CONTEXT:
- Display mode toggles between label and image
- Spec: "User-controlled label overlay in image mode"
- LayoutSettings has showLabelsOnImages field

REQUIREMENTS:
1. Update src/lib/stores/ui.svelte.ts:
   - Add showLabelsOnImages state (default false)
   - Add toggleShowLabelsOnImages() function

2. Write tests in src/tests/ui-store.test.ts:
   - Test showLabelsOnImages default is false
   - Test toggleShowLabelsOnImages toggles value

3. Sync with layout settings (like displayMode)

4. Update src/lib/components/RackDevice.svelte:
   - Accept showLabelsOnImages prop
   - When displayMode='image' AND showLabelsOnImages=true:
     - Render image with name label overlay
     - Label should have semi-transparent background for readability
   - Position label at bottom of device

5. Write tests in src/tests/RackDevice.test.ts:
   - Test no label overlay when showLabelsOnImages=false
   - Test label overlay appears when showLabelsOnImages=true
   - Test overlay only in image mode

6. Add UI toggle for showLabelsOnImages:
   - In EditPanel or as secondary option near display mode toggle
   - Only visible/enabled when displayMode='image'

7. Write test for UI toggle

8. Run all tests

DO NOT:
- Make this per-device (it's a global setting)
```

---

# Phase 9: Bundled Export

Add bundled export option with metadata.

---

## Prompt 9.1: Create Export Metadata Types

````text
Create types for bundled export metadata following TDD methodology.

CONTEXT:
- Quick export: single image file (existing)
- Bundled export: ZIP with image + metadata + optional source
- Need types for metadata manifest

REQUIREMENTS:
1. Create src/lib/types/export.ts (or add to existing types):
   - ExportMetadata interface:
     ```ts
     interface ExportMetadata {
       version: string;
       exportedAt: string;
       layoutName: string;
       rackName: string;
       rackHeight: number;
       deviceCount: number;
       exportOptions: ExportOptions;
       sourceIncluded: boolean;
     }
     ```
   - BundledExportOptions extends ExportOptions:
     - includeSource: boolean (include .rackarr.zip)

2. Add to ExportOptions type:
   - exportMode: 'quick' | 'bundled'

3. Write tests in src/tests/types.test.ts:
   - Test ExportMetadata structure
   - Test BundledExportOptions structure

4. Run tests

DO NOT:
- Create the export logic yet
- Update export dialog yet
````

---

## Prompt 9.2: Create Bundled Export Utility

```text
Create utility for bundled export following TDD methodology.

CONTEXT:
- Export metadata types exist
- Need to create ZIP with:
  - Exported image (PNG/JPEG/SVG)
  - metadata.json
  - Optionally: source .rackarr.zip

REQUIREMENTS:
1. Create function in src/lib/utils/export.ts:
   - createBundledExport(options: BundledExportOptions, ...): Promise<Blob>
     - Accept: image blob, layout, export options
     - Create ZIP containing:
       - {layout-name}-export.{format} (the image)
       - metadata.json (ExportMetadata)
       - source/ folder with {layout-name}.rackarr.zip (if includeSource)

2. Create generateExportMetadata function:
   - Build ExportMetadata from layout and options

3. Write tests in src/tests/export.test.ts:
   - Test createBundledExport produces ZIP
   - Test ZIP contains image with correct name
   - Test ZIP contains metadata.json
   - Test metadata has correct structure
   - Test source included when includeSource=true
   - Test source not included when includeSource=false

4. Run tests

DO NOT:
- Update export dialog yet
- Change existing quick export
```

---

## Prompt 9.3: Update Export Dialog for Bundled Export

```text
Update export dialog with bundled export option following TDD methodology.

CONTEXT:
- Bundled export utility exists
- Export dialog currently has: format, scope, includeNames, includeLegend, background

REQUIREMENTS:
1. Write tests in src/tests/ExportDialog.test.ts:
   - Test export mode toggle exists (Quick/Bundled)
   - Test bundled mode shows "Include Source" checkbox
   - Test "Include Source" hidden in quick mode
   - Test bundled export submits with bundled options
   - Test default is quick export

2. Update src/lib/components/ExportDialog.svelte:
   - Add exportMode state ('quick' | 'bundled', default 'quick')
   - Add includeSource state (default true)
   - Add radio buttons for export mode
   - Show "Include source layout" checkbox when bundled selected
   - Include new options in export event

3. Update src/App.svelte handleExportSubmit:
   - Check exportMode
   - If 'quick': use existing export flow
   - If 'bundled': use createBundledExport, download as ZIP

4. Generate bundled filename:
   - {layout-name}-export-bundle.zip

5. Run all tests

6. Manual test:
   - Create layout, add devices
   - Export as bundled with source
   - Verify ZIP contains image, metadata, and source archive

DO NOT:
- Change quick export behavior
- Make bundled the default
```

---

# Integration & Polish

Final integration and cleanup prompts.

---

## Prompt 10.1: End-to-End Integration Test

```text
Create comprehensive E2E tests for new features following TDD methodology.

CONTEXT:
- All features implemented
- Need E2E tests covering full workflows

REQUIREMENTS:
1. Create Playwright tests in tests/e2e/:
   - shelf-category.spec.ts:
     - Add shelf device from library
     - Verify shelf icon renders
     - Verify shelf colour

   - rack-configuration.spec.ts:
     - Create 10" rack, verify narrow render
     - Create rack with descending units, verify U labels
     - Create rack with starting unit 5, verify labels

   - device-images.spec.ts:
     - Upload front image to device
     - Toggle display mode
     - Verify image renders
     - Toggle label overlay
     - Verify label appears over image

   - archive-format.spec.ts:
     - Save layout as .rackarr.zip
     - Load saved .rackarr.zip
     - Verify data integrity
     - Load legacy .rackarr.json
     - Verify migration works

   - bundled-export.spec.ts:
     - Export as bundled
     - Verify ZIP contents

2. Run E2E tests: npm run test:e2e

3. Fix any failures

DO NOT:
- Skip any test scenarios
- Use mocks in E2E tests (test real behavior)
```

---

## Prompt 10.2: Update Documentation

```text
Update CLAUDE.md and inline documentation following TDD methodology.

CONTEXT:
- New features implemented
- Documentation needs updating

REQUIREMENTS:
1. Update CLAUDE.md:
   - Update version to 0.3.0
   - Document new features in Quick Reference
   - Add new keyboard shortcuts (I for display mode)

2. Update src/lib/components/HelpPanel.svelte:
   - Add display mode shortcut (I)
   - Document new rack options
   - Document image upload

3. Add JSDoc comments to new utilities:
   - archive.ts functions
   - imageUpload.ts functions
   - Export bundled functions

4. Update type comments in:
   - src/lib/types/index.ts
   - src/lib/types/images.ts
   - src/lib/types/export.ts

5. Verify all new components have proper comments

Run: npm run check (svelte-check) to verify no TypeScript issues

DO NOT:
- Create new documentation files
- Update SPEC.md (that's the source of truth)
- Update ROADMAP.md (separate task)
```

---

## Prompt 10.3: Final Test Suite and Cleanup

```text
Run full test suite and cleanup following TDD methodology.

REQUIREMENTS:
1. Run all tests:
   npm run test:run

2. Ensure all tests pass

3. Check test coverage:
   npm run test:coverage

4. Identify any gaps in coverage (< 80%) and add tests

5. Run linting:
   npm run lint

6. Fix any lint errors

7. Run type checking:
   npm run check

8. Fix any type errors

9. Run E2E tests:
   npm run test:e2e

10. Run build:
    npm run build

11. Verify build succeeds

12. Test production build:
    npm run preview
    - Manually verify key features work

CLEANUP TASKS:
- Remove any console.log statements
- Remove any TODO comments that were addressed
- Remove unused imports
- Ensure consistent formatting

DO NOT:
- Add new features
- Change any behavior
- Skip failing tests
```

---

# Execution Notes

## Order of Execution

Execute prompts in order: 1.1 → 1.2 → 1.3 → ... → 10.3

Some prompts can be parallelized:

- Phase 3 (3.1-3.3) can run parallel to Phase 2
- Phase 5 is independent of Phases 2-4

## Commit Strategy

After each prompt:

1. Run tests
2. If passing, commit with message: `feat(scope): description`
3. If failing, fix before proceeding

## Rollback Points

Create git tags at phase boundaries:

- `git tag v0.3.0-phase1` after prompt 1.4
- `git tag v0.3.0-phase2` after prompt 2.4
- etc.

## Stopping Conditions

Stop and seek human input if:

1. Tests fail after 2 fix attempts
2. A prompt requires clarification
3. Discovered issue contradicts spec
4. Breaking change to existing behavior

---

# Appendix: File Reference

## New Files to Create

- src/lib/schemas/device.ts
- src/lib/schemas/rack.ts
- src/lib/schemas/project.ts
- src/lib/schemas/index.ts
- src/lib/types/images.ts
- src/lib/types/export.ts
- src/lib/stores/images.svelte.ts
- src/lib/utils/archive.ts
- src/lib/utils/imageUpload.ts
- src/lib/components/Sidebar.svelte
- src/lib/components/ImageUpload.svelte
- src/lib/components/icons/IconLabel.svelte
- src/lib/components/icons/IconImage.svelte
- src/tests/schemas/\*.test.ts
- src/tests/image-store.test.ts
- src/tests/archive.test.ts
- src/tests/imageUpload.test.ts
- src/tests/Sidebar.test.ts
- src/tests/ImageUpload.test.ts
- tests/e2e/\*.spec.ts

## Files to Modify

- src/lib/types/index.ts (multiple prompts)
- src/lib/types/constants.ts (multiple prompts)
- src/lib/data/starterLibrary.ts
- src/lib/components/CategoryIcon.svelte
- src/lib/components/NewRackForm.svelte
- src/lib/components/AddDeviceForm.svelte
- src/lib/components/Toolbar.svelte
- src/lib/components/RackDevice.svelte
- src/lib/components/Rack.svelte
- src/lib/components/ExportDialog.svelte
- src/lib/components/HelpPanel.svelte
- src/lib/components/KeyboardHandler.svelte
- src/lib/stores/ui.svelte.ts
- src/lib/stores/layout.svelte.ts
- src/lib/utils/serialization.ts
- src/lib/utils/migration.ts
- src/lib/utils/file.ts
- src/lib/utils/export.ts
- src/lib/utils/rack.ts
- src/App.svelte
- package.json (dependencies)
- CLAUDE.md

---

_End of Prompt Plan_
