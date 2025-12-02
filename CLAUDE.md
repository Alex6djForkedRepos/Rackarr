# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.2.1

---

## Planning Docs

Full planning documentation is in `docs/planning/`:

```
docs/planning/
├── spec.md              → Technical specification (v0.2)
├── roadmap.md           → Version planning
├── v0.3-spec.md         → Next version specification
└── CLAUDE-planning.md   → Full project instructions
```

**Read `docs/planning/CLAUDE-planning.md` for complete instructions including scope guard.**

## Autonomous Mode

When given an overnight execution prompt:

- You have explicit permission to work without pausing between prompts
- Do NOT ask for review or confirmation mid-session
- Do NOT pause to summarise progress until complete
- Continue until: all prompts done, test failure after 2 attempts, or genuine ambiguity requiring human decision
- I will review asynchronously via git commits and session-report.md

**Stopping conditions (ONLY these):**

1. All prompts in current `prompt_plan.md` marked complete
2. Test failure you cannot resolve after 2 attempts
3. Ambiguity that genuinely requires human input (document in `blockers.md`)

If none of those conditions are met, proceed immediately to the next prompt.

---

## Quick Reference

### Tech Stack

- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript strict mode
- Vitest + @testing-library/svelte + Playwright
- CSS custom properties (design tokens in `src/lib/styles/tokens.css`)
- SVG rendering

### Svelte 5 Runes (Required)

```svelte
<!-- ✅ CORRECT -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- ❌ WRONG: Svelte 4 stores -->
<script lang="ts">
  import { writable } from 'svelte/store';
</script>
```

### TDD Protocol

1. Write tests FIRST
2. Run tests (should fail)
3. Implement to pass
4. Commit

### Commands

```bash
npm run dev          # Dev server
npm run test         # Unit tests (watch)
npm run test:run     # Unit tests (CI)
npm run test:e2e     # Playwright E2E
npm run build        # Production build
npm run lint         # ESLint check
```

---

## Repository

| Location | URL                                              |
| -------- | ------------------------------------------------ |
| Primary  | https://git.falcon-wahoe.ts.net/ggfevans/rackarr |
| Mirror   | https://github.com/ggfevans/rackarr              |
