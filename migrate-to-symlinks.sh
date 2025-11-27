#!/bin/bash
# migrate-to-symlinks.sh
# One-time migration: copy repo planning docs to Obsidian, then symlink back
#
# Run from rackarr repo root: ./migrate-to-symlinks.sh

set -e

REPO_ROOT="/Users/gevans/code/projects/personal/rackarr"
OBSIDIAN_PROJECT="$HOME/notes/gVault/01-PROJECTS/rackarr"
CLAUDE_CONTEXT=".claude/context"

echo "=== Rackarr Planning Docs Migration ==="
echo ""
echo "Repo:     $REPO_ROOT"
echo "Obsidian: $OBSIDIAN_PROJECT"
echo ""

# Verify we're in the right place
if [[ ! -f "package.json" ]] || ! grep -q "rackarr" package.json 2>/dev/null; then
    echo "❌ Error: Run this from the rackarr repo root"
    exit 1
fi

if [[ ! -d "$OBSIDIAN_PROJECT" ]]; then
    echo "❌ Error: Obsidian project folder not found at $OBSIDIAN_PROJECT"
    exit 1
fi

echo "Step 1: Backup Obsidian versions (just in case)"
echo "─────────────────────────────────────────────────"
for file in spec.md prompt_plan.md todo.md CLAUDE.md; do
    if [[ -f "$OBSIDIAN_PROJECT/$file" ]]; then
        cp "$OBSIDIAN_PROJECT/$file" "$OBSIDIAN_PROJECT/${file}.backup"
        echo "  ✓ Backed up $file"
    fi
done
echo ""

echo "Step 2: Copy repo versions to Obsidian (preserving progress)"
echo "─────────────────────────────────────────────────────────────"
for file in spec.md prompt_plan.md todo.md CLAUDE.md; do
    if [[ -f "$REPO_ROOT/$file" ]]; then
        cp "$REPO_ROOT/$file" "$OBSIDIAN_PROJECT/$file"
        echo "  ✓ Copied $file → Obsidian"
    else
        echo "  ⚠ $file not found in repo (skipping)"
    fi
done
echo ""

echo "Step 3: Remove planning docs from repo root"
echo "────────────────────────────────────────────"
for file in spec.md prompt_plan.md todo.md CLAUDE.md; do
    if [[ -f "$REPO_ROOT/$file" ]]; then
        rm "$REPO_ROOT/$file"
        echo "  ✓ Removed $file from repo"
    fi
done
echo ""

echo "Step 4: Create .claude/context directory"
echo "─────────────────────────────────────────"
mkdir -p "$CLAUDE_CONTEXT"
echo "  ✓ Created $CLAUDE_CONTEXT"
echo ""

echo "Step 5: Create symlinks"
echo "───────────────────────"
# Main planning docs
ln -sf "$OBSIDIAN_PROJECT/spec.md" "$CLAUDE_CONTEXT/spec.md"
echo "  ✓ spec.md"

ln -sf "$OBSIDIAN_PROJECT/prompt_plan.md" "$CLAUDE_CONTEXT/prompt_plan.md"
echo "  ✓ prompt_plan.md"

ln -sf "$OBSIDIAN_PROJECT/todo.md" "$CLAUDE_CONTEXT/todo.md"
echo "  ✓ todo.md"

ln -sf "$OBSIDIAN_PROJECT/roadmap.md" "$CLAUDE_CONTEXT/roadmap.md"
echo "  ✓ roadmap.md"

ln -sf "$OBSIDIAN_PROJECT/CLAUDE.md" "$CLAUDE_CONTEXT/CLAUDE-planning.md"
echo "  ✓ CLAUDE.md → CLAUDE-planning.md"
echo ""

echo "Step 6: Create public CLAUDE.md in repo root"
echo "─────────────────────────────────────────────"
cat > "$REPO_ROOT/CLAUDE.md" << 'EOF'
# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.1.0

---

## Planning Docs

Full planning documentation is symlinked in `.claude/context/`:

```
.claude/context/
├── spec.md              → Technical specification
├── prompt_plan.md       → Implementation prompts
├── todo.md              → Progress checklist
├── roadmap.md           → Version planning
└── CLAUDE-planning.md   → Full project instructions
```

**Read `.claude/context/CLAUDE-planning.md` for complete instructions including scope guard.**

---

## Quick Reference

### Tech Stack
- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript strict mode
- Vitest + @testing-library/svelte + Playwright
- CSS custom properties (no Tailwind)
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
```

---

## Repository

| Location | URL |
|----------|-----|
| Primary | https://git.falcon-wahoe.ts.net/ggfevans/rackarr |
| Mirror | https://github.com/ggfevans/rackarr |
EOF
echo "  ✓ Created public CLAUDE.md"
echo ""

echo "Step 7: Update .gitignore"
echo "─────────────────────────"
if ! grep -q ".claude/context/" "$REPO_ROOT/.gitignore" 2>/dev/null; then
    echo "" >> "$REPO_ROOT/.gitignore"
    echo "# Private planning docs (symlinked from Obsidian vault)" >> "$REPO_ROOT/.gitignore"
    echo ".claude/context/" >> "$REPO_ROOT/.gitignore"
    echo "  ✓ Added .claude/context/ to .gitignore"
else
    echo "  ✓ .gitignore already configured"
fi
echo ""

echo "Step 8: Verify symlinks"
echo "───────────────────────"
echo ""
ls -la "$CLAUDE_CONTEXT/"
echo ""

echo "=== Migration Complete ==="
echo ""
echo "Source of truth: $OBSIDIAN_PROJECT"
echo "Claude Code reads: $CLAUDE_CONTEXT (symlinks)"
echo "Public repo has: CLAUDE.md (slim version)"
echo ""
echo "Next steps:"
echo "  1. Verify symlinks work: cat .claude/context/spec.md"
echo "  2. Commit the changes: git add -A && git commit -m 'chore: migrate planning docs to symlinks'"
echo "  3. Delete backup files in Obsidian if all looks good"
echo ""
