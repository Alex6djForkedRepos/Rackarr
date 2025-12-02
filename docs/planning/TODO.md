# Rackarr v0.3.0 Implementation Checklist

**Target Version:** 0.3.0 (Core Enhancements)
**Started:** \_**\_-**-**
**Completed:** \_\_**-**-**

---

## Pre-Implementation

- [ ] Read PROMPT_PLAN.md thoroughly
- [ ] Read SPEC.md for full context
- [ ] Ensure all v0.2.1 tests pass: `npm run test:run`
- [ ] Create feature branch: `git checkout -b feature/v0.3.0-core-enhancements`
- [ ] Create initial tag: `git tag v0.2.1-baseline`

---

## Phase 1: Data Model Foundation

### Prompt 1.1: Add Shelf Category

- [ ] Write tests in `src/tests/types.test.ts`
  - [ ] Test DeviceCategory includes 'shelf'
  - [ ] Test CATEGORY_COLOURS has 'shelf' with '#8B4513'
  - [ ] Test ALL_CATEGORIES includes 'shelf'
- [ ] Update `src/lib/types/index.ts` - add 'shelf' to DeviceCategory
- [ ] Update `src/lib/types/constants.ts` - add shelf to CATEGORY_COLOURS
- [ ] Update `src/lib/types/constants.ts` - add 'shelf' to ALL_CATEGORIES
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add shelf category"`

### Prompt 1.2: Add Optional Device Fields

- [ ] Write tests for new device fields
  - [ ] Test Device accepts all optional fields
  - [ ] Test Device works without optional fields
  - [ ] Test Airflow enum values
  - [ ] Test weight/weight_unit relationship
- [ ] Create Airflow type in `src/lib/types/index.ts`
- [ ] Create WeightUnit type
- [ ] Create DeviceImages interface
- [ ] Update Device interface with optional fields
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add optional device fields"`

### Prompt 1.3: Add Rack Configuration Fields

- [ ] Write tests for new rack fields
  - [ ] Test Rack accepts form_factor, desc_units, starting_unit
  - [ ] Test Rack works with defaults
  - [ ] Test FormFactor enum values
  - [ ] Test starting_unit minimum of 1
- [ ] Create FormFactor type
- [ ] Update Rack interface
- [ ] Update `src/lib/utils/rack.ts` createRack with defaults
- [ ] Write tests for rack.ts defaults
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add rack configuration fields"`

### Prompt 1.4: Add Layout Settings Fields

- [ ] Write tests for new settings fields
  - [ ] Test LayoutSettings accepts view, displayMode, showLabelsOnImages
  - [ ] Test backwards compatibility with theme-only settings
- [ ] Update LayoutSettings interface
- [ ] Add DisplayMode type
- [ ] Update `src/lib/utils/serialization.ts` createLayout defaults
- [ ] Write tests for createLayout defaults
- [ ] Update validateLayoutStructure for new settings
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add layout display settings"`

### Phase 1 Checkpoint

- [ ] All Phase 1 tests pass
- [ ] Create tag: `git tag v0.3.0-phase1`

---

## Phase 2: Zod Schema Implementation

### Prompt 2.1: Install Zod and Create Device Schema

- [ ] Install Zod: `npm install zod`
- [ ] Create `src/lib/schemas/device.ts`
  - [ ] AirflowSchema
  - [ ] WeightUnitSchema
  - [ ] DeviceFaceSchema
  - [ ] CategorySchema (with 'shelf')
  - [ ] DeviceImagesSchema
  - [ ] DeviceSchema with all fields
  - [ ] Add weight/weight_unit refinement
- [ ] Create `src/tests/schemas/device.test.ts`
  - [ ] Test valid device passes
  - [ ] Test invalid device fails
  - [ ] Test each enum value
  - [ ] Test slug pattern validation
  - [ ] Test u_height range
  - [ ] Test colour hex pattern
  - [ ] Test weight without weight_unit fails
  - [ ] Test optional fields are optional
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(schemas): add Zod device schema"`

### Prompt 2.2: Create Rack Schema

- [ ] Create `src/lib/schemas/rack.ts`
  - [ ] FormFactorSchema
  - [ ] PlacedDeviceSchema
  - [ ] RackSchema
- [ ] Create `src/tests/schemas/rack.test.ts`
  - [ ] Test valid rack passes
  - [ ] Test invalid rack fails
  - [ ] Test form_factor enum values
  - [ ] Test height range (1-100, integer)
  - [ ] Test width values (10, 19)
  - [ ] Test UUID format
  - [ ] Test devices array validation
  - [ ] Test PlacedDevice with/without face
  - [ ] Test default values
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(schemas): add Zod rack schema"`

### Prompt 2.3: Create Project Schema

- [ ] Create `src/lib/schemas/project.ts`
  - [ ] SettingsSchema
  - [ ] ProjectSchema / LayoutSchema
- [ ] Create `src/tests/schemas/project.test.ts`
  - [ ] Test valid project passes
  - [ ] Test invalid project fails
  - [ ] Test version string required
  - [ ] Test name min 1 char
  - [ ] Test datetime format
  - [ ] Test settings validation
  - [ ] Test deviceLibrary array
  - [ ] Test rack validation
  - [ ] Test default settings values
- [ ] Create `src/lib/schemas/index.ts` re-exports
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(schemas): add Zod project schema"`

### Prompt 2.4: Integrate Zod with Serialization

- [ ] Update `src/lib/utils/serialization.ts`
  - [ ] Import LayoutSchema
  - [ ] Create validateLayoutWithZod function
  - [ ] Create user-friendly error message converter
  - [ ] Update deserializeLayout to use Zod
- [ ] Write tests in `src/tests/serialization.test.ts`
  - [ ] Test validateLayoutWithZod success case
  - [ ] Test validateLayoutWithZod error case
  - [ ] Test user-friendly error messages
- [ ] Run ALL tests: `npm run test:run`
- [ ] Fix any regressions
- [ ] Commit: `git commit -m "feat(serialization): integrate Zod validation"`

### Phase 2 Checkpoint

- [ ] All Phase 2 tests pass
- [ ] Create tag: `git tag v0.3.0-phase2`

---

## Phase 3: Shelf Category & Starter Library

### Prompt 3.1: Create Shelf Category Icon

- [ ] Write tests in `src/tests/CategoryIcons.test.ts`
  - [ ] Test CategoryIcon renders for shelf
  - [ ] Test aria-label
  - [ ] Test visual distinction
- [ ] Update `src/lib/components/CategoryIcon.svelte`
  - [ ] Add shelf case
  - [ ] Create shelf SVG (horizontal shelf with brackets)
- [ ] Run tests: `npm run test:run`
- [ ] Visually verify shelf icon
- [ ] Commit: `git commit -m "feat(ui): add shelf category icon"`

### Prompt 3.2: Add Shelf Devices to Starter Library

- [ ] Write tests in `src/tests/starterLibrary.test.ts`
  - [ ] Test 1U Shelf exists
  - [ ] Test 2U Shelf exists
  - [ ] Test 4U Shelf exists
  - [ ] Test shelf colour #8B4513
- [ ] Update `src/lib/data/starterLibrary.ts`
  - [ ] Add 1U Shelf
  - [ ] Add 2U Shelf
  - [ ] Add 4U Shelf
- [ ] Verify 25 total starter devices
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(data): add shelf starter devices"`

### Prompt 3.3: Add 0.5U Devices

- [ ] Update `src/lib/types/constants.ts` MIN_DEVICE_HEIGHT to 0.5
- [ ] Write tests for MIN_DEVICE_HEIGHT
- [ ] Write tests for 0.5U Blanking Fan
- [ ] Write tests for 0.5U Blank
- [ ] Update `src/lib/data/starterLibrary.ts`
  - [ ] Add 0.5U Blanking Fan (cooling)
  - [ ] Add 0.5U Blank (blank)
- [ ] Verify 27 total starter devices
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(data): add half-U devices"`

### Phase 3 Checkpoint

- [ ] All Phase 3 tests pass
- [ ] Create tag: `git tag v0.3.0-phase3`

---

## Phase 4: Rack Configuration Options

### Prompt 4.1: Add 10-Inch Rack Width Support

- [ ] Add constants to `src/lib/types/constants.ts`
  - [ ] ALLOWED_RACK_WIDTHS
  - [ ] NARROW_RACK_WIDTH
- [ ] Write tests in `src/tests/rack.test.ts`
  - [ ] Test createRack with width 10
  - [ ] Test createRack with width 19
  - [ ] Test invalid width handling
- [ ] Update `src/lib/utils/rack.ts` createRack
- [ ] Write tests in `src/tests/Rack-component.test.ts`
  - [ ] Test Rack.svelte renders with width=10
  - [ ] Test Rack.svelte renders with width=19
  - [ ] Test visual width difference
- [ ] Update `src/lib/components/Rack.svelte` for width
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(rack): add 10-inch width support"`

### Prompt 4.2: Add Rack Width to NewRackForm

- [ ] Write tests in `src/tests/NewRackForm.test.ts`
  - [ ] Test width selection exists
  - [ ] Test default width is 19
  - [ ] Test width 10 selectable
  - [ ] Test form submits with width
- [ ] Update `src/lib/components/NewRackForm.svelte`
  - [ ] Add width state
  - [ ] Add width selection UI
  - [ ] Include width in create event
- [ ] Update `src/App.svelte` handleNewRackCreate
- [ ] Update layout store addRack for width
- [ ] Write layout store test
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add rack width selection"`

### Prompt 4.3: Add Form Factor Selection

- [ ] Write tests in `src/tests/NewRackForm.test.ts`
  - [ ] Test form factor dropdown exists
  - [ ] Test default is '4-post-cabinet'
  - [ ] Test all 7 options available
  - [ ] Test form submits with form factor
- [ ] Update `src/lib/components/NewRackForm.svelte`
  - [ ] Add form_factor state
  - [ ] Add select with user-friendly labels
  - [ ] Include in create event
- [ ] Update data flow through App and store
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add form factor selection"`

### Prompt 4.4: Add Descending Units and Starting Unit

- [ ] Write tests in `src/tests/NewRackForm.test.ts`
  - [ ] Test descending units checkbox
  - [ ] Test default unchecked
  - [ ] Test starting unit input
  - [ ] Test default is 1
  - [ ] Test minimum is 1
- [ ] Update `src/lib/components/NewRackForm.svelte`
  - [ ] Add desc_units state
  - [ ] Add starting_unit state
  - [ ] Add checkbox UI
  - [ ] Add number input UI
- [ ] Write tests in `src/tests/Rack-component.test.ts`
  - [ ] Test U labels reversed when desc_units=true
  - [ ] Test U labels start from starting_unit
- [ ] Update `src/lib/components/Rack.svelte` U label rendering
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add rack unit numbering options"`

### Phase 4 Checkpoint

- [ ] All Phase 4 tests pass
- [ ] Create tag: `git tag v0.3.0-phase4`

---

## Phase 5: Fixed Device Library Sidebar

### Prompt 5.1: Create Sidebar Component

- [ ] Write tests in `src/tests/Sidebar.test.ts`
  - [ ] Test renders children
  - [ ] Test 300px width
  - [ ] Test always visible
  - [ ] Test accessibility attributes
  - [ ] Test optional title
- [ ] Create `src/lib/components/Sidebar.svelte`
  - [ ] Props: side, title, children
  - [ ] Fixed position
  - [ ] 300px width
  - [ ] Proper accessibility
- [ ] Style to match design tokens
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): create fixed Sidebar component"`

### Prompt 5.2: Replace Device Library Drawer with Sidebar

- [ ] Write tests in `src/tests/App.test.ts`
  - [ ] Test sidebar always visible
  - [ ] Test no toggle button
  - [ ] Test contains DevicePalette
- [ ] Update `src/App.svelte`
  - [ ] Replace Drawer with Sidebar
  - [ ] Remove leftDrawerOpen usage
  - [ ] Remove handleTogglePalette
  - [ ] Remove handleClosePalette
- [ ] Update `src/lib/components/Toolbar.svelte`
  - [ ] Remove palette toggle button
  - [ ] Remove paletteOpen prop
- [ ] Write tests in `src/tests/Toolbar.test.ts`
- [ ] Update `src/lib/stores/ui.svelte.ts`
  - [ ] Remove leftDrawer state and functions
- [ ] Run ALL tests: `npm run test:run`
- [ ] Fix tests that assumed drawer behavior
- [ ] Commit: `git commit -m "feat(ui): replace drawer with fixed sidebar"`

### Prompt 5.3: Adjust Canvas Layout for Fixed Sidebar

- [ ] Write tests in `src/tests/Canvas.test.ts`
  - [ ] Test canvas has proper offset
  - [ ] Test canvas fills remaining width
- [ ] Update `src/App.svelte` layout CSS
  - [ ] Use grid/flex for sidebar + canvas + edit panel
- [ ] Update `src/lib/components/Canvas.svelte`
  - [ ] Ensure panzoom bounds correct
  - [ ] Verify fitAll calculation
- [ ] Write fitAll tests with new layout
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): adjust layout for fixed sidebar"`

### Phase 5 Checkpoint

- [ ] All Phase 5 tests pass
- [ ] Create tag: `git tag v0.3.0-phase5`

---

## Phase 6: Device Images Foundation

### Prompt 6.1: Create Image Storage Types

- [ ] Create `src/lib/types/images.ts`
  - [ ] ImageData interface
  - [ ] ImageStore interface
  - [ ] ImageUploadResult interface
  - [ ] Supported format types
- [ ] Write tests in `src/tests/types.test.ts`
- [ ] Add constants to `src/lib/types/constants.ts`
  - [ ] SUPPORTED_IMAGE_FORMATS
  - [ ] MAX_IMAGE_SIZE_MB
  - [ ] MAX_IMAGE_SIZE_BYTES
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add image storage types"`

### Prompt 6.2: Create Image Store

- [ ] Create `src/lib/stores/images.svelte.ts`
  - [ ] images Map state
  - [ ] setDeviceImage()
  - [ ] getDeviceImage()
  - [ ] removeDeviceImage()
  - [ ] removeAllDeviceImages()
  - [ ] clearAllImages()
  - [ ] getAllImages()
  - [ ] hasImage()
  - [ ] getImageStore() export
- [ ] Create `src/tests/image-store.test.ts`
  - [ ] Test setDeviceImage
  - [ ] Test getDeviceImage
  - [ ] Test removeDeviceImage
  - [ ] Test removeAllDeviceImages
  - [ ] Test clearAllImages
  - [ ] Test hasImage
  - [ ] Test getAllImages
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(stores): create image store"`

### Prompt 6.3: Create Image Upload Utility

- [ ] Create `src/lib/utils/imageUpload.ts`
  - [ ] validateImageFile()
  - [ ] resizeImage()
  - [ ] fileToImageData()
  - [ ] generateImageFilename()
- [ ] Create `src/tests/imageUpload.test.ts`
  - [ ] Test validateImageFile accepts PNG
  - [ ] Test validateImageFile accepts JPEG
  - [ ] Test validateImageFile accepts WebP
  - [ ] Test validateImageFile rejects GIF
  - [ ] Test validateImageFile rejects oversized
  - [ ] Test generateImageFilename format
  - [ ] Test resizeImage aspect ratio
  - [ ] Test fileToImageData structure
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(utils): create image upload utilities"`

### Prompt 6.4: Create ImageUpload Component

- [ ] Create `src/tests/ImageUpload.test.ts`
  - [ ] Test renders file input
  - [ ] Test accepts only images
  - [ ] Test shows preview
  - [ ] Test can remove image
  - [ ] Test emits upload event
  - [ ] Test shows error for invalid
  - [ ] Test face labels
  - [ ] Test accessibility
- [ ] Create `src/lib/components/ImageUpload.svelte`
  - [ ] Props: face, currentImage
  - [ ] Events: onupload, onremove
  - [ ] File input UI
  - [ ] Preview thumbnail
  - [ ] Remove button
  - [ ] Error messages
- [ ] Style to match forms
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): create ImageUpload component"`

### Prompt 6.5: Add Image Upload to AddDeviceForm

- [ ] Write tests in `src/tests/AddDeviceForm.test.ts`
  - [ ] Test front image upload shown
  - [ ] Test rear image upload shown
  - [ ] Test images optional
  - [ ] Test images in submit data
  - [ ] Test form resets images
- [ ] Update `src/lib/components/AddDeviceForm.svelte`
  - [ ] Import ImageUpload
  - [ ] Add image state
  - [ ] Add two ImageUpload components
  - [ ] Include images in onadd event
- [ ] Update `src/App.svelte` handleAddDeviceCreate
  - [ ] Store images in image store
- [ ] Update layoutStore.addDeviceToLibrary to return ID
- [ ] Write test for returned device ID
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add image upload to device form"`

### Phase 6 Checkpoint

- [ ] All Phase 6 tests pass
- [ ] Create tag: `git tag v0.3.0-phase6`

---

## Phase 7: ZIP Archive Format

### Prompt 7.1: Install JSZip and Create Archive Utilities

- [ ] Install JSZip: `npm install jszip`
- [ ] Install types: `npm install --save-dev @types/jszip`
- [ ] Create `src/lib/utils/archive.ts`
  - [ ] createArchive()
  - [ ] extractArchive()
  - [ ] isRackarrArchive()
- [ ] Create `src/tests/archive.test.ts`
  - [ ] Test createArchive produces ZIP
  - [ ] Test extractArchive reads layout
  - [ ] Test extractArchive reads images
  - [ ] Test round-trip integrity
  - [ ] Test archive with no images
  - [ ] Test corrupted archive throws
  - [ ] Test isRackarrArchive detection
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(utils): create archive utilities"`

### Prompt 7.2: Update File Extension Constants

- [ ] Add constants to `src/lib/types/constants.ts`
  - [ ] ARCHIVE_EXTENSION
  - [ ] LEGACY_JSON_EXTENSION
  - [ ] LAYOUT_FILENAME
  - [ ] IMAGES_FOLDER
- [ ] Update `src/lib/utils/file.ts`
  - [ ] detectFileFormat()
  - [ ] Update openFilePicker for both extensions
  - [ ] Rename downloadLayout to downloadLayoutJson
  - [ ] Add downloadArchive()
- [ ] Write tests in `src/tests/file.test.ts`
  - [ ] Test detectFileFormat ZIP
  - [ ] Test detectFileFormat JSON
  - [ ] Test openFilePicker accepts both
  - [ ] Test downloadArchive filename
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(utils): update file handling for archives"`

### Prompt 7.3: Update Save to Use Archive Format

- [ ] Update `src/App.svelte` handleSave
  - [ ] Import archive utilities
  - [ ] Get images from store
  - [ ] Call createArchive
  - [ ] Download blob
- [ ] Write tests in `src/tests/App.test.ts`
  - [ ] Test save creates .rackarr.zip
  - [ ] Test save includes images
  - [ ] Test save shows toast
- [ ] Update download utility if needed
- [ ] Run tests: `npm run test:run`
- [ ] Manual test: verify ZIP structure
- [ ] Commit: `git commit -m "feat(persistence): save as ZIP archive"`

### Prompt 7.4: Update Load to Handle Archive Format

- [ ] Update `src/App.svelte` handleLoad
  - [ ] Use detectFileFormat
  - [ ] Handle ZIP with extractArchive
  - [ ] Handle JSON with readLayoutFile
  - [ ] Store images in image store
- [ ] Write tests in `src/tests/App.test.ts`
  - [ ] Test loading .rackarr.zip
  - [ ] Test images extracted
  - [ ] Test legacy .rackarr.json works
  - [ ] Test error handling
- [ ] Create loadLayoutFile helper in file.ts
- [ ] Run tests: `npm run test:run`
- [ ] Manual test: round-trip save/load
- [ ] Commit: `git commit -m "feat(persistence): load ZIP and legacy JSON"`

### Prompt 7.5: Update Migration for v0.3.0

- [ ] Update CURRENT_VERSION to '0.3.0'
- [ ] Update `src/lib/utils/migration.ts`
  - [ ] Support 0.1.0 → 0.3.0
  - [ ] Support 0.2.0 → 0.3.0
  - [ ] Add new settings defaults
  - [ ] Add new rack field defaults
- [ ] Write tests in `src/tests/migration.test.ts`
  - [ ] Test 0.1.0 → 0.3.0
  - [ ] Test 0.2.0 → 0.3.0
  - [ ] Test 0.3.0 unchanged
  - [ ] Test default values correct
- [ ] Update `src/lib/utils/serialization.ts`
  - [ ] Handle 0.2.0 version
  - [ ] createLayout uses 0.3.0
- [ ] Run ALL tests: `npm run test:run`
- [ ] Verify test fixtures work
- [ ] Commit: `git commit -m "feat(migration): support v0.3.0 migration"`

### Phase 7 Checkpoint

- [ ] All Phase 7 tests pass
- [ ] Create tag: `git tag v0.3.0-phase7`

---

## Phase 8: Device Image Display

### Prompt 8.1: Add Display Mode State

- [ ] Update `src/lib/stores/ui.svelte.ts`
  - [ ] Add displayMode state
  - [ ] Add toggleDisplayMode()
  - [ ] Add setDisplayMode()
- [ ] Write tests in `src/tests/ui-store.test.ts`
  - [ ] Test initial displayMode is 'label'
  - [ ] Test toggleDisplayMode
  - [ ] Test setDisplayMode
- [ ] Sync with layout settings
- [ ] Update `src/lib/stores/layout.svelte.ts`
  - [ ] Add updateDisplayMode()
- [ ] Write integration test for persistence
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(stores): add display mode state"`

### Prompt 8.2: Add Display Mode Toggle to Toolbar

- [ ] Create `src/lib/components/icons/IconLabel.svelte`
- [ ] Create `src/lib/components/icons/IconImage.svelte`
- [ ] Write tests in `src/tests/Toolbar.test.ts`
  - [ ] Test toggle button exists
  - [ ] Test shows current mode
  - [ ] Test clicking toggles
  - [ ] Test aria-label
- [ ] Update `src/lib/components/Toolbar.svelte`
  - [ ] Add displayMode prop
  - [ ] Add toggle event
  - [ ] Add toggle button
- [ ] Update `src/App.svelte`
  - [ ] Pass displayMode
  - [ ] Handle toggle event
- [ ] Add 'I' keyboard shortcut in KeyboardHandler
- [ ] Write keyboard shortcut test
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add display mode toggle"`

### Prompt 8.3: Render Device Images in RackDevice

- [ ] Update `src/lib/components/RackDevice.svelte`
  - [ ] Import image store
  - [ ] Accept displayMode prop
  - [ ] Render image when displayMode='image' and image exists
  - [ ] Fallback to label when no image
  - [ ] Render label when displayMode='label'
- [ ] Write tests in `src/tests/RackDevice.test.ts`
  - [ ] Test label in label mode
  - [ ] Test image in image mode
  - [ ] Test fallback to label
  - [ ] Test image scaling
  - [ ] Test correct image for view
- [ ] Update `src/lib/components/Rack.svelte` to pass displayMode
- [ ] Run tests: `npm run test:run`
- [ ] Manual test: toggle display mode
- [ ] Commit: `git commit -m "feat(ui): render device images"`

### Prompt 8.4: Add Label Overlay Option

- [ ] Update `src/lib/stores/ui.svelte.ts`
  - [ ] Add showLabelsOnImages state
  - [ ] Add toggleShowLabelsOnImages()
- [ ] Write tests in `src/tests/ui-store.test.ts`
- [ ] Sync with layout settings
- [ ] Update `src/lib/components/RackDevice.svelte`
  - [ ] Accept showLabelsOnImages prop
  - [ ] Render label overlay when true and image mode
  - [ ] Style overlay for readability
- [ ] Write tests in `src/tests/RackDevice.test.ts`
  - [ ] Test no overlay when false
  - [ ] Test overlay when true
  - [ ] Test only in image mode
- [ ] Add UI toggle (EditPanel or toolbar)
- [ ] Write UI toggle test
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(ui): add label overlay option"`

### Phase 8 Checkpoint

- [ ] All Phase 8 tests pass
- [ ] Create tag: `git tag v0.3.0-phase8`

---

## Phase 9: Bundled Export

### Prompt 9.1: Create Export Metadata Types

- [ ] Create/update `src/lib/types/export.ts`
  - [ ] ExportMetadata interface
  - [ ] BundledExportOptions interface
- [ ] Add exportMode to ExportOptions
- [ ] Write tests in `src/tests/types.test.ts`
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(types): add export metadata types"`

### Prompt 9.2: Create Bundled Export Utility

- [ ] Update `src/lib/utils/export.ts`
  - [ ] createBundledExport()
  - [ ] generateExportMetadata()
- [ ] Write tests in `src/tests/export.test.ts`
  - [ ] Test produces ZIP
  - [ ] Test contains image
  - [ ] Test contains metadata.json
  - [ ] Test metadata structure
  - [ ] Test source included when true
  - [ ] Test source excluded when false
- [ ] Run tests: `npm run test:run`
- [ ] Commit: `git commit -m "feat(utils): create bundled export utility"`

### Prompt 9.3: Update Export Dialog

- [ ] Write tests in `src/tests/ExportDialog.test.ts`
  - [ ] Test export mode toggle
  - [ ] Test include source checkbox
  - [ ] Test include source hidden in quick mode
  - [ ] Test bundled export options
  - [ ] Test default is quick
- [ ] Update `src/lib/components/ExportDialog.svelte`
  - [ ] Add exportMode state
  - [ ] Add includeSource state
  - [ ] Add mode radio buttons
  - [ ] Conditional include source checkbox
- [ ] Update `src/App.svelte` handleExportSubmit
  - [ ] Check exportMode
  - [ ] Use createBundledExport for bundled
- [ ] Run tests: `npm run test:run`
- [ ] Manual test: bundled export
- [ ] Commit: `git commit -m "feat(ui): add bundled export option"`

### Phase 9 Checkpoint

- [ ] All Phase 9 tests pass
- [ ] Create tag: `git tag v0.3.0-phase9`

---

## Phase 10: Integration & Polish

### Prompt 10.1: End-to-End Tests

- [ ] Create `tests/e2e/shelf-category.spec.ts`
  - [ ] Add shelf device
  - [ ] Verify icon
  - [ ] Verify colour
- [ ] Create `tests/e2e/rack-configuration.spec.ts`
  - [ ] Create 10" rack
  - [ ] Descending units
  - [ ] Starting unit
- [ ] Create `tests/e2e/device-images.spec.ts`
  - [ ] Upload image
  - [ ] Toggle display mode
  - [ ] Label overlay
- [ ] Create `tests/e2e/archive-format.spec.ts`
  - [ ] Save ZIP
  - [ ] Load ZIP
  - [ ] Load legacy JSON
- [ ] Create `tests/e2e/bundled-export.spec.ts`
  - [ ] Export bundled
  - [ ] Verify contents
- [ ] Run E2E: `npm run test:e2e`
- [ ] Fix any failures
- [ ] Commit: `git commit -m "test(e2e): add v0.3.0 feature tests"`

### Prompt 10.2: Update Documentation

- [ ] Update CLAUDE.md
  - [ ] Version 0.3.0
  - [ ] New features
  - [ ] New keyboard shortcuts
- [ ] Update `src/lib/components/HelpPanel.svelte`
  - [ ] 'I' shortcut
  - [ ] Rack options
  - [ ] Image upload
- [ ] Add JSDoc to new utilities
  - [ ] archive.ts
  - [ ] imageUpload.ts
  - [ ] Export bundled functions
- [ ] Update type comments
- [ ] Run: `npm run check`
- [ ] Commit: `git commit -m "docs: update for v0.3.0"`

### Prompt 10.3: Final Test Suite and Cleanup

- [ ] Run all unit tests: `npm run test:run`
- [ ] All tests pass
- [ ] Check coverage: `npm run test:coverage`
- [ ] Add tests for gaps (< 80%)
- [ ] Run lint: `npm run lint`
- [ ] Fix lint errors
- [ ] Run type check: `npm run check`
- [ ] Fix type errors
- [ ] Run E2E: `npm run test:e2e`
- [ ] Run build: `npm run build`
- [ ] Build succeeds
- [ ] Test preview: `npm run preview`
- [ ] Manual verification of key features
- [ ] Cleanup:
  - [ ] Remove console.log
  - [ ] Remove addressed TODOs
  - [ ] Remove unused imports
  - [ ] Consistent formatting
- [ ] Commit: `git commit -m "chore: final cleanup for v0.3.0"`

### Phase 10 Checkpoint

- [ ] All Phase 10 tasks complete
- [ ] Create tag: `git tag v0.3.0-phase10`

---

## Release

- [ ] Merge to main: `git checkout main && git merge feature/v0.3.0-core-enhancements`
- [ ] Update package.json version to 0.3.0
- [ ] Update ROADMAP.md - move "Next" to "Released"
- [ ] Final commit: `git commit -m "release: v0.3.0"`
- [ ] Create release tag: `git tag v0.3.0`
- [ ] Push: `git push origin main --tags`
- [ ] Build Docker image
- [ ] Deploy to production

---

## Notes

### Blockers Encountered

_Record any blockers that required human input_

| Date | Phase | Prompt | Issue | Resolution |
| ---- | ----- | ------ | ----- | ---------- |
|      |       |        |       |            |

### Test Failures (> 2 attempts)

_Record persistent test failures_

| Date | Test File | Test Name | Attempts | Resolution |
| ---- | --------- | --------- | -------- | ---------- |
|      |           |           |          |            |

### Deviations from Plan

_Record any changes to the plan_

| Date | Original | Change | Reason |
| ---- | -------- | ------ | ------ |
|      |          |        |        |

---

## Time Tracking (Optional)

| Phase     | Started | Completed | Duration |
| --------- | ------- | --------- | -------- |
| 1         |         |           |          |
| 2         |         |           |          |
| 3         |         |           |          |
| 4         |         |           |          |
| 5         |         |           |          |
| 6         |         |           |          |
| 7         |         |           |          |
| 8         |         |           |          |
| 9         |         |           |          |
| 10        |         |           |          |
| **Total** |         |           |          |

---

_Checklist generated from PROMPT_PLAN.md_
