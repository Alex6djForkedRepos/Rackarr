# Device Image System - Implementation Prompts

**Created:** 2025-12-11
**Status:** Ready for Implementation

This document contains step-by-step prompts for implementing the Device Image System (Phases 2 & 3).

---

## Commit Strategy

**Pre-commit hooks run:**

- `lint-staged` (ESLint + Prettier)
- `npm run test:run` (all unit tests)

Each prompt section ends with a **COMMIT CHECKPOINT**. Commit after each checkpoint passes the pre-commit hooks. This ensures:

- Incremental, reviewable progress
- Tests pass at every commit
- Easy bisect if issues arise

**Commit message format:**

```
feat(images): <short description>

<details if needed>
```

---

## Overview

| Phase   | Description                    | Prompts | Commits |
| ------- | ------------------------------ | ------- | ------- |
| Phase 2 | Bundled Starter Library Images | 1-4     | 4       |
| Phase 3 | Placement Image Overrides      | 5-12    | 8       |

**Total: 12 commits** (each prompt = 1 commit)

**Prerequisites:**

- Starter library rationalization complete (26 device types)
- Lucide icons implemented
- Research documents reviewed (`docs/planning/research/device-images.md`)

---

## Phase 2: Bundled Starter Library Images

### Prompt 1: Directory Structure and Processing Script

````text
Create the directory structure and image processing script for bundled device images.

## Context
We're implementing Phase 2 of the Device Image System - bundling default images for ~15 active starter library devices. Images will be sourced from NetBox Device Type Library (CC0 licensed), processed to 400px max width WebP format.

## Requirements

1. Create directory structure:
   - `assets-source/device-images/` - Original images (git-tracked, not bundled)
   - `src/lib/assets/device-images/` - Optimized images (Vite-bundled)
   - Add `.gitkeep` files to track empty directories

2. Create `scripts/process-images.ts`:
   - Read PNG/JPEG/WebP files from `assets-source/device-images/`
   - Resize to 400px max width (preserve aspect ratio, skip if smaller)
   - Convert to WebP format
   - Output to `src/lib/assets/device-images/` preserving subdirectory structure
   - Log processing results

3. Add npm script: `"process-images": "tsx scripts/process-images.ts"`

4. Add `sharp` as a dev dependency for image processing

## TDD
- No automated tests needed for build script
- Manual verification: run script with sample image, verify output dimensions and format

## Files to create/modify
- `assets-source/device-images/.gitkeep` (new)
- `src/lib/assets/device-images/.gitkeep` (new)
- `scripts/process-images.ts` (new)
- `package.json` (add script and sharp dependency)

## COMMIT CHECKPOINT
```bash
# Verify
npm install  # Install sharp
npm run process-images  # Should complete (no images yet, but no errors)

# Commit
git add -A
git commit -m "feat(images): add directory structure and processing script"
````

````

---

### Prompt 2: Download and Process NetBox Images

```text
Download representative device images from NetBox Device Type Library and process them.

## Context
We need ~15 representative images for active starter library devices. Images are CC0 licensed from https://github.com/netbox-community/devicetype-library/tree/master/elevation-images

## Devices to get images for (front view only initially)

| Starter Device | NetBox Source Image | Category |
|----------------|---------------------|----------|
| 1U Server | Dell/dell-poweredge-r630.front.png | server |
| 2U Server | Dell/dell-poweredge-r730xd.front.png | server |
| 4U Server | Supermicro/supermicro-ssg-6049p-e1cr36h.front.png | server |
| 8-Port Switch | Ubiquiti/ubiquiti-unifi-switch-8.front.png | network |
| 24-Port Switch | Ubiquiti/ubiquiti-unifi-switch-24-pro.front.png | network |
| 48-Port Switch | Ubiquiti/ubiquiti-unifi-switch-48-pro.front.png | network |
| 1U Router/Firewall | Ubiquiti/ubiquiti-udm-pro.front.png | network |
| 1U Storage | Synology/synology-rs819.front.png | storage |
| 2U Storage | Synology/synology-rs1221-plus.front.png | storage |
| 4U Storage | (use Synology RS3621xs+ or similar) | storage |
| 2U UPS | APC/apc-smt1500rmi2uc.front.png | power |
| 4U UPS | APC/apc-srt5krmxli.front.png | power |
| 1U Console Drawer | (generic KVM drawer if available) | kvm |

## Steps

1. Download images from NetBox repo to `assets-source/device-images/{category}/`
   - Use curl or wget with raw.githubusercontent.com URLs
   - Naming: `{slug}.front.png` (e.g., `1u-server.front.png`)

2. Run `npm run process-images` to generate optimized versions

3. Verify output in `src/lib/assets/device-images/`

## Notes
- If a specific image isn't available, skip it (device will use colored rectangle)
- Focus on front images first; rear images can be added later
- Total bundle size target: <500KB

## COMMIT CHECKPOINT
```bash
# Verify
npm run process-images  # Should process all images
ls -la src/lib/assets/device-images/  # Verify WebP files exist
du -sh src/lib/assets/device-images/  # Check total size <500KB

# Commit
git add -A
git commit -m "feat(images): add bundled device images from NetBox"
````

````

---

### Prompt 3: Create Bundled Image Manifest

```text
Create a bundled image manifest that maps device slugs to their bundled images.

## Context
We have processed WebP images in `src/lib/assets/device-images/`. Now we need a TypeScript module that imports these images and provides a lookup function.

## Requirements

1. Create `src/lib/data/bundledImages.ts`:
   - Import images using Vite's static asset imports
   - Export a `getBundledImage(slug: string, face: 'front' | 'rear'): string | undefined` function
   - Return the image URL or undefined if no bundled image exists

2. Use Vite's `import.meta.url` pattern for asset imports:
   ```typescript
   const images: Record<string, { front?: string; rear?: string }> = {
     '1u-server': {
       front: new URL('../assets/device-images/server/1u-server.front.webp', import.meta.url).href,
     },
     // ... more devices
   };
````

3. Only include devices that have actual image files

## TDD

Write tests first in `src/tests/bundledImages.test.ts`:

- Test `getBundledImage('1u-server', 'front')` returns a string URL
- Test `getBundledImage('nonexistent', 'front')` returns undefined
- Test `getBundledImage('1u-server', 'rear')` returns undefined if no rear image

## Files to create

- `src/lib/data/bundledImages.ts`
- `src/tests/bundledImages.test.ts`

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # Tests should pass (including new bundledImages tests)

# Commit
git add -A
git commit -m "feat(images): create bundled image manifest with lookup function"
```

````

---

### Prompt 4: Load Bundled Images into Image Store

```text
Integrate bundled images into the image store so they're available on app initialization.

## Context
We have bundled images in `bundledImages.ts`. Now we need to load them into the image store on app startup so they appear when users view starter library devices in image mode.

## Requirements

1. Add `loadBundledImages()` function to `src/lib/stores/images.svelte.ts`:
   - Import `getBundledImage` from `bundledImages.ts`
   - For each device that has a bundled image, fetch it and store as device type image
   - Convert URL to blob/dataUrl format expected by the store
   - Mark bundled images specially (optional: add `isBundled` flag to prevent re-saving)

2. Call `loadBundledImages()` during app initialization:
   - Update `src/App.svelte` or create an init module
   - Load before first render so images are available immediately

3. Handle the URL → ImageData conversion:
   - Bundled images are URLs, but the store expects `{ blob, dataUrl, filename }`
   - Fetch the image, create blob, generate dataUrl
   - Or: extend image store to support URL-only images (simpler)

## Design Decision
Consider adding a simpler path: allow image store to accept URLs directly for bundled images, falling back to blob storage for user uploads. This avoids fetching bundled images at runtime.

## TDD
Extend `src/tests/image-store.test.ts`:
- Test that after `loadBundledImages()`, store has images for bundled devices
- Test that `getDeviceImage('1u-server', 'front')` returns image data

## Files to modify
- `src/lib/stores/images.svelte.ts`
- `src/App.svelte` (or new init module)
- `src/tests/image-store.test.ts`

## COMMIT CHECKPOINT
```bash
# Verify
npm run test:run  # All tests pass
npm run dev  # Manual: create new rack, switch to image mode, verify images show

# Commit
git add -A
git commit -m "feat(images): load bundled images on app initialization"
````

**Phase 2 Complete!** Starter library devices now have default images.

---

## Phase 3: Placement Image Overrides

### Prompt 5: Add `id` Field to PlacedDevice Type

````text
Add a stable `id` field to the PlacedDevice type for placement-level image overrides.

## Context
Currently PlacedDevice is identified by its index in the rack.devices array. We need a stable UUID that survives reordering for placement-level image overrides.

## Requirements

1. Update `src/lib/types/index.ts`:
   ```typescript
   interface PlacedDevice {
     id: string;  // UUID for stable reference
     device_type: string;
     name?: string;
     position: number;
     face: DeviceFace;
   }
````

2. Update `src/lib/schemas/index.ts`:
   - Add `id: z.string().uuid()` to PlacedDeviceSchema
   - Make it optional for backward compatibility: `id: z.string().uuid().optional()`

3. Update YAML example in comments if present

## TDD

Write tests first:

- Test PlacedDevice with valid UUID passes schema validation
- Test PlacedDevice without id passes (backward compat)
- Test PlacedDevice with invalid id fails validation

## Files to modify

- `src/lib/types/index.ts`
- `src/lib/schemas/index.ts`
- `src/tests/schemas.test.ts` (add id validation tests)

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # Schema tests pass
npm run check  # TypeScript compiles

# Commit
git add -A
git commit -m "feat(images): add id field to PlacedDevice type and schema"
```

````

---

### Prompt 6: Generate UUID on Device Placement

```text
Generate a UUID when placing a device in the rack.

## Context
PlacedDevice now has an `id` field. We need to generate UUIDs when devices are placed.

## Requirements

1. Update `src/lib/stores/layout.svelte.ts`:
   - In `placeDeviceRaw()` or wherever PlacedDevice objects are created
   - Generate UUID using `crypto.randomUUID()`
   - Ensure ID is included when creating PlacedDevice

2. Update `src/lib/stores/layout-helpers.ts`:
   - Update `createDevice()` helper to generate ID if not provided
   - Allow passing an existing ID (for undo/redo restoration)

3. Ensure ID survives:
   - Move operations (ID should not change)
   - Undo/redo (restore same ID)

## TDD
Write tests first:
- Test that `placeDevice()` generates a UUID
- Test that placed device has valid UUID format
- Test that moving a device preserves its ID
- Test that undo/redo preserves device IDs

## Files to modify
- `src/lib/stores/layout.svelte.ts`
- `src/lib/stores/layout-helpers.ts`
- `src/tests/layout-store.test.ts` (add ID generation tests)

## COMMIT CHECKPOINT
```bash
# Verify
npm run test:run  # All tests pass including new UUID tests
npm run dev  # Manual: place device, inspect in console, verify id exists

# Commit
git add -A
git commit -m "feat(images): generate UUID on device placement"
````

````

---

### Prompt 7: Refactor Image Store for Two-Level Storage

```text
Refactor the image store to support device type images AND placement-level image overrides.

## Context
Current store has single map keyed by device slug. We need two maps: one for device type defaults, one for placement overrides.

## Requirements

1. Update `src/lib/stores/images.svelte.ts`:

   ```typescript
   // Two separate stores
   const deviceTypeImages = new SvelteMap<string, DeviceImageData>();
   const placementImages = new SvelteMap<string, DeviceImageData>();

   // Device type level API
   setDeviceTypeImage(slug: string, face: 'front' | 'rear', data: ImageData): void
   getDeviceTypeImage(slug: string, face: 'front' | 'rear'): ImageData | undefined
   removeDeviceTypeImage(slug: string, face: 'front' | 'rear'): void

   // Placement level API
   setPlacementImage(placementId: string, face: 'front' | 'rear', data: ImageData): void
   getPlacementImage(placementId: string, face: 'front' | 'rear'): ImageData | undefined
   removePlacementImage(placementId: string, face: 'front' | 'rear'): void
   clearPlacementImages(): void  // Called when loading new layout

   // Combined lookup with fallback
   getImageForPlacement(slug: string, placementId: string, face: 'front' | 'rear'): ImageData | undefined
````

2. Fallback logic in `getImageForPlacement`:
   - Check placementImages first (by placementId)
   - Fall back to deviceTypeImages (by slug)
   - Return undefined if neither exists

3. Keep backward compatibility:
   - Existing `setDeviceImage` → `setDeviceTypeImage`
   - Existing `getDeviceImage` → `getDeviceTypeImage`

## TDD

Write comprehensive tests:

- Test setDeviceTypeImage/getDeviceTypeImage
- Test setPlacementImage/getPlacementImage
- Test getImageForPlacement returns placement override when exists
- Test getImageForPlacement falls back to device type
- Test getImageForPlacement returns undefined when no image
- Test removePlacementImage clears override

## Files to modify

- `src/lib/stores/images.svelte.ts`
- `src/lib/types/images.ts` (if needed)
- `src/tests/image-store.test.ts` (major update)

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # All image store tests pass

# Commit
git add -A
git commit -m "feat(images): refactor image store for two-level storage"
```

````

---

### Prompt 8: Update Archive Format for Two-Level Images

```text
Update the archive save/load to handle device type images and placement override images separately.

## Context
Archive currently saves to `assets/{slug}/`. We need `assets/device-types/{slug}/` and `assets/placements/{id}/`.

## Requirements

1. Update `src/lib/utils/archive.ts`:

   **Save (`createFolderArchive`):**
   - Accept both deviceTypeImages and placementImages as parameters
   - Save device type images to `assets/device-types/{slug}/front.webp`
   - Save placement images to `assets/placements/{id}/front.webp`

   **Load (`extractFolderArchive`):**
   - Check for new format first (`assets/device-types/`, `assets/placements/`)
   - Fall back to old format (`assets/{slug}/`) for backward compatibility
   - Return separate maps for device type and placement images

2. Update function signatures:
   ```typescript
   export async function createFolderArchive(
     layout: Layout,
     deviceTypeImages: ImageStoreMap,
     placementImages: ImageStoreMap
   ): Promise<Blob>

   export async function extractFolderArchive(blob: Blob): Promise<{
     layout: Layout;
     deviceTypeImages: ImageStoreMap;
     placementImages: ImageStoreMap;
   }>
````

3. Update callers in App.svelte

## TDD

Write tests:

- Test saving archive with device type images creates correct structure
- Test saving archive with placement images creates correct structure
- Test loading new format archive extracts both image types
- Test loading old format archive (backward compat) extracts to device type images

## Files to modify

- `src/lib/utils/archive.ts`
- `src/App.svelte` (update save/load calls)
- `src/tests/archive.test.ts` (add two-level tests)

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # Archive tests pass
npm run dev  # Manual: save layout with images, reload, verify images persist

# Commit
git add -A
git commit -m "feat(images): update archive format for two-level image storage"
```

````

---

### Prompt 9: Update RackDevice to Use Placement ID for Image Lookup

```text
Update RackDevice component to look up images using the placement ID for proper fallback behavior.

## Context
RackDevice currently looks up images by device slug only. It needs to use the new `getImageForPlacement()` function with the placement ID.

## Requirements

1. Update `src/lib/components/RackDevice.svelte`:
   - Add `placementId: string` prop
   - Update image lookup:
     ```typescript
     const deviceImage = $derived.by(() => {
       if (displayMode !== 'image') return null;
       const face = rackView === 'rear' ? 'rear' : 'front';
       return imageStore.getImageForPlacement(device.slug, placementId, face);
     });
     ```

2. Update `src/lib/components/Rack.svelte`:
   - Pass `placementId={placedDevice.id}` to RackDevice

## TDD
Write/update tests:
- Test RackDevice receives and uses placementId prop
- E2E: Test device with placement override shows override image
- E2E: Test device without override shows device type image

## Files to modify
- `src/lib/components/RackDevice.svelte`
- `src/lib/components/Rack.svelte`
- `src/tests/RackDevice.test.ts` (if exists)
- `e2e/device-images.spec.ts` (add placement override test)

## COMMIT CHECKPOINT
```bash
# Verify
npm run test:run  # Unit tests pass
npm run check  # TypeScript compiles

# Commit
git add -A
git commit -m "feat(images): update RackDevice to use placement ID for image lookup"
````

````

---

### Prompt 10: Add Image Override UI to EditPanel

```text
Add UI to EditPanel for uploading placement-level image overrides.

## Context
When a device is selected, users should be able to upload a custom image for that specific placement, overriding the device type default.

## Requirements

1. Update `src/lib/components/EditPanel.svelte`:

   **When device is selected, add image section:**
   - Show current image (placement override or device type default)
   - Show status: "Using default image" or "Custom image"
   - ImageUpload component for uploading new image
   - "Reset to default" button when placement override exists

2. Wire up handlers:
   ```typescript
   function handlePlacementImageUpload(imageData: ImageData, face: 'front' | 'rear') {
     const placementId = selectedDeviceInfo.placedDevice.id;
     imageStore.setPlacementImage(placementId, face, imageData);
   }

   function handleResetToDefault(face: 'front' | 'rear') {
     const placementId = selectedDeviceInfo.placedDevice.id;
     imageStore.removePlacementImage(placementId, face);
   }
````

3. Show image preview in EditPanel (thumbnail of current image)

## TDD

- E2E test: Select device → upload image → verify image appears on device
- E2E test: Upload override → click "Reset to default" → verify default returns
- E2E test: Upload override → save archive → reload → verify override persists

## Files to modify

- `src/lib/components/EditPanel.svelte`
- `e2e/device-images.spec.ts` (add EditPanel image tests)

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # Unit tests pass
npm run check  # TypeScript compiles
npm run dev  # Manual: select device, upload image, verify in rack

# Commit
git add -A
git commit -m "feat(images): add image override UI to EditPanel"
```

````

---

### Prompt 11: Auto-Process User Uploads

```text
Auto-process user-uploaded images: resize to 400px max width and convert to WebP.

## Context
To keep archives consistent and lean, user uploads should be processed the same way bundled images are.

## Requirements

1. Update `src/lib/utils/imageUpload.ts`:

   **Add processing function:**
   ```typescript
   async function processImage(blob: Blob): Promise<Blob> {
     // Create image element
     const img = await createImageBitmap(blob);

     // Calculate new dimensions (400px max width)
     const maxWidth = 400;
     let { width, height } = img;
     if (width > maxWidth) {
       height = (height / width) * maxWidth;
       width = maxWidth;
     }

     // Draw to canvas
     const canvas = document.createElement('canvas');
     canvas.width = width;
     canvas.height = height;
     const ctx = canvas.getContext('2d')!;
     ctx.drawImage(img, 0, 0, width, height);

     // Convert to WebP blob
     return new Promise((resolve) => {
       canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.9);
     });
   }
````

2. Integrate into `fileToImageData()`:
   - Process the file blob before creating ImageData
   - Update filename to .webp extension

3. Skip processing for images already under 400px width

## TDD

Write tests:

- Test image >400px is resized to 400px width
- Test image <400px is not resized
- Test output format is WebP
- Test aspect ratio is preserved

## Files to modify

- `src/lib/utils/imageUpload.ts`
- `src/tests/imageUpload.test.ts` (add processing tests)

## COMMIT CHECKPOINT

```bash
# Verify
npm run test:run  # Image upload processing tests pass

# Commit
git add -A
git commit -m "feat(images): auto-process user uploads (resize + WebP)"
```

**Phase 3 Complete!** Full two-level image system is now functional.

---

### Prompt 12: E2E Tests and Final Polish

````text
Add comprehensive E2E tests and ensure the full image workflow is tested.

## Requirements

1. Create/update `e2e/device-images.spec.ts`:
   - Test bundled images appear on new layout in image mode
   - Test custom device type image upload via AddDeviceForm
   - Test placement override upload via EditPanel
   - Test "Reset to default" restores device type image
   - Test archive save/load round-trip preserves all images

2. Verify full workflow manually:
   - New rack → add starter device → switch to image mode → see bundled image
   - Upload custom image for device type → all instances show new image
   - Upload placement override → only that instance shows override
   - Save → reload → all images persist correctly

## COMMIT CHECKPOINT
```bash
# Verify
npm run test:run  # All unit tests pass
npm run test:e2e  # All E2E tests pass

# Commit
git add -A
git commit -m "test(images): add comprehensive E2E tests for image system"
````

**Implementation Complete!**

```

---

## Execution Order

```

Phase 2: Bundled Images (4 commits)
├── Prompt 1: Directory structure + processing script
├── Prompt 2: Download + process NetBox images
├── Prompt 3: Bundled image manifest
└── Prompt 4: Load bundled images on init

Phase 3: Placement Overrides (8 commits)
├── Prompt 5: Add id field to PlacedDevice type
├── Prompt 6: Generate UUID on placement
├── Prompt 7: Refactor image store for two-level
├── Prompt 8: Update archive format
├── Prompt 9: Update RackDevice for placement lookup
├── Prompt 10: EditPanel image override UI
├── Prompt 11: Auto-process user uploads
└── Prompt 12: E2E tests and final polish

```

**Total: 12 commits**

**Parallelization:** Prompts 5-6 (PlacedDevice id) can be done in parallel with 1-4 (bundled images) if desired, then merged before Prompt 7.

---

## Commit Summary

| # | Prompt | Commit Message |
|---|--------|----------------|
| 1 | 1 | `feat(images): add directory structure and processing script` |
| 2 | 2 | `feat(images): add bundled device images from NetBox` |
| 3 | 3 | `feat(images): create bundled image manifest with lookup function` |
| 4 | 4 | `feat(images): load bundled images on app initialization` |
| 5 | 5 | `feat(images): add id field to PlacedDevice type and schema` |
| 6 | 6 | `feat(images): generate UUID on device placement` |
| 7 | 7 | `feat(images): refactor image store for two-level storage` |
| 8 | 8 | `feat(images): update archive format for two-level image storage` |
| 9 | 9 | `feat(images): update RackDevice to use placement ID for image lookup` |
| 10 | 10 | `feat(images): add image override UI to EditPanel` |
| 11 | 11 | `feat(images): auto-process user uploads (resize + WebP)` |
| 12 | 12 | `test(images): add comprehensive E2E tests for image system` |

---

## Pre-commit Hook Verification

Each commit will automatically run:
1. `lint-staged` - ESLint + Prettier on changed files
2. `npm run test:run` - All unit tests

If either fails, the commit is blocked. Fix issues before retrying.

---

## Testing Checkpoints

| Prompt | Manual Verification |
|--------|---------------------|
| 1 | `npm run process-images` completes without errors |
| 2 | WebP files exist in `src/lib/assets/device-images/`, size <500KB |
| 3 | `getBundledImage('1u-server', 'front')` returns URL in tests |
| 4 | New rack in image mode shows device images |
| 5 | Schema validates PlacedDevice with/without id |
| 6 | Placed devices have UUID (check console/debugger) |
| 7 | Two-level store tests all pass |
| 8 | Save/load archive preserves both image types |
| 9 | Placement override shows instead of device type default |
| 10 | EditPanel image upload works, "Reset to default" works |
| 11 | Large uploaded images are resized to 400px max |
| 12 | All E2E tests pass |

---

_Generated from implementation plan. See SPEC.md Section 16 for specification._
```
