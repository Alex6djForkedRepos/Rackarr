---
created: 2025-11-27
updated: 2025-12-02
status: active
---

# Rackarr — Product Roadmap

Single source of truth for version planning.

---

## Version Philosophy

- **Incremental releases** — Each version is usable and complete
- **Scope discipline** — Features stay in their designated version
- **Spec-driven** — No implementation without spec
- **User value** — Each release solves real problems

---

## Released

### v0.1.0 — MVP

**Status:** ✅ Released
**Released:** 2025-11-28

**Delivered:**

- [x] Single-page rack layout designer
- [x] Create/edit racks (1-100U)
- [x] Device palette with starter library
- [x] Drag-and-drop placement with collision detection
- [x] Single-rack focus (multi-rack deferred to v0.3)
- [x] Save/load JSON layouts
- [x] Export PNG/JPEG/SVG/PDF
- [x] Dark/light theme
- [x] Full keyboard navigation
- [x] Docker deployment

---

### v0.2.0 — Multi-View & Polish

**Status:** ✅ Released
**Released:** 2025-11-30

**Delivered:**

- [x] Front/rear rack view toggle
- [x] Device face assignment (front/rear/both)
- [x] "Fit All" zoom button (F shortcut)
- [x] Rack duplication (Ctrl/Cmd+D)
- [x] Import device library from JSON
- [x] Panzoom library integration
- [x] Device Library toggle in toolbar
- [x] Layout migration (v0.1 → v0.2)

---

### v0.2.1 — Design Polish

**Status:** ✅ Released
**Released:** 2025-12-01

**Delivered:**

- [x] WCAG AA accessibility compliance (ARIA audit)
- [x] Color contrast verification utilities
- [x] Animation keyframes system
- [x] Reduced motion support (CSS + JS)
- [x] 5th U number highlighting
- [x] Design tokens consolidation
- [x] 1059 tests passing

---

## Planned

### v0.3.0 — Mobile & PWA

**Status:** 📋 Planned
**Spec:** docs/planning/v0.3-spec.md

**Scope:**

- [ ] Full mobile phone support (create/edit layouts)
- [ ] Multi-rack support restored
- [ ] Two-tap device placement (tap library → tap rack)
- [ ] Bottom sheet UI for Device Library and Edit Panel
- [ ] Swipe navigation between racks
- [ ] Pinch-to-zoom on canvas (Hammer.js)
- [ ] Progressive Web App (installable, offline)
- [ ] Service worker for offline capability
- [ ] Touch-friendly targets (48px minimum)

**Primary Targets:**

- iPhone SE, iPhone 14, Pixel 7

---

### v0.3.1 — History & Undo

**Status:** 📋 Planned

**Planned Scope:**

- [ ] Undo/redo (command pattern)
- [ ] History stack with configurable depth
- [ ] Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)

---

### v1.0.0 — Stable Release

**Status:** 📋 Planned

**Planned Scope:**

- [ ] Documentation site
- [ ] Performance optimization
- [ ] Public launch

---

## Backlog (Unscheduled)

Features explicitly deferred with no version assigned:

| Feature                     | Notes                                       | Status   |
| --------------------------- | ------------------------------------------- | -------- |
| Custom device categories    | Allow user-defined categories               | —        |
| Custom device images        | Upload icons for devices                    | —        |
| Weight/depth metadata       | Physical specs for devices                  | —        |
| Cable routing visualization | Show cable paths                            | —        |
| 3D visualization            | Three.js rack view                          | —        |
| Cloud sync / accounts       | User accounts, cloud storage                | —        |
| Collaborative editing       | Real-time multi-user                        | —        |
| Tablet-optimised layout     | Enhanced tablet experience                  | —        |
| Device templates/presets    | Common device configurations                | —        |
| Import from CSV/spreadsheet | Bulk device import                          | —        |
| NetBox device type import   | Import from community library               | —        |
| Export both rack views      | Front + rear in single export               | —        |
| Device library export       | Save library to file                        | —        |
| 0U vertical PDU support     | Rail-mounted PDUs (left/right rails)        | Research |
| Screen reader improvements  | Live region announcements for state changes | —        |

---

## Process

### Adding Features to Roadmap

1. Add to **Backlog** with brief description
2. When prioritizing for a version, move to that version's section
3. Before implementation, create version spec
4. Generate prompt_plan and todo for that version
5. Implement following TDD methodology

### Version Graduation

```
Backlog → Planned (assigned to version) → In Progress → Released
```

---

## Changelog

| Date       | Change                                          |
| ---------- | ----------------------------------------------- |
| 2025-11-27 | Initial roadmap created                         |
| 2025-11-27 | v0.1 development started                        |
| 2025-11-28 | v0.1 released                                   |
| 2025-11-28 | v0.2 spec created                               |
| 2025-11-29 | Added panzoom library to v0.2 scope             |
| 2025-11-30 | v0.2.0 released                                 |
| 2025-12-01 | v0.2.1 released (accessibility & design polish) |
| 2025-12-02 | Roadmap simplified after v0.2.1 audit           |

---

_This file is the source of truth for Rackarr versioning._
