---
created: 2025-11-28T12:03
updated: 2025-11-28T12:08
---

# Rackarr Development Workflow

**Purpose:** Defines how Claude Desktop (strategy/oversight) and Claude Code (implementation) collaborate via Forgejo.

---

## File Architecture

### Source of Truth: Git Repository

The **git repo** is the single source of truth for all planning and implementation docs. This eliminates sync conflicts between Claude Code commits and Obsidian-git.

```
rackarr/                          # Git repo (Forgejo primary, GitHub mirror)
├── .claude/
│   └── context/                  # Planning docs (tracked in git)
│       ├── spec.md               # Technical specification
│       ├── prompt_plan.md        # Implementation prompts
│       ├── todo.md               # Progress checklist
│       ├── roadmap.md            # Version planning
│       ├── workflow.md           # This file
│       └── CLAUDE-planning.md    # Full project instructions
├── CLAUDE.md                     # Slim public reference
├── src/                          # Implementation
└── ...
```

### Obsidian Vault: Symlinks + Native Notes

Obsidian **symlinks to repo files** for visibility, plus keeps research notes native:

```
gVault/01-PROJECTS/rackarr/
├── spec.md              → symlink to repo/.claude/context/spec.md
├── prompt_plan.md       → symlink to repo/.claude/context/prompt_plan.md
├── todo.md              → symlink to repo/.claude/context/todo.md
├── roadmap.md           → symlink to repo/.claude/context/roadmap.md
├── workflow.md          → symlink to repo/.claude/context/workflow.md
├── CLAUDE.md            → symlink to repo/.claude/context/CLAUDE-planning.md
│
├── rackarr-summary.md   # Native: Bases dashboard integration
├── rackarr.md           # Native: Main project note
├── netbox-research.md   # Native: Research notes
├── data-format-decision.md    # Native: Decision records
├── design-methodology.md      # Native: Research notes
└── project-instructions.md    # Native: Claude Desktop system prompt
```

### Why This Architecture

| Concern                                 | Solution                                   |
| --------------------------------------- | ------------------------------------------ |
| Claude Code needs to edit planning docs | Docs live in repo, CC commits directly     |
| Obsidian-git sync conflicts             | Symlinks don't sync (they point elsewhere) |
| I want to see/edit docs in Obsidian     | Symlinks provide full access               |
| Research notes don't belong in repo     | Keep them Obsidian-native                  |
| Project dashboard (Bases)               | `rackarr-summary.md` stays native          |

---

## Migration Steps

### One-Time Setup (On Your Mac)

```bash
# 1. Ensure repo has the planning docs (move from Obsidian if needed)
cd ~/code/projects/personal/rackarr
mkdir -p .claude/context

# 2. If docs are currently in Obsidian, copy them to repo first
# (Check what's actually in each location first)

# 3. Create symlinks FROM Obsidian TO repo
cd ~/notes/gVault/01-PROJECTS/rackarr

# Remove existing files that will become symlinks
rm spec.md prompt_plan.md roadmap.md workflow.md
# Keep: rackarr-summary.md, rackarr.md, *-research.md, etc.

# Create symlinks
ln -s ~/code/projects/personal/rackarr/.claude/context/spec.md spec.md
ln -s ~/code/projects/personal/rackarr/.claude/context/prompt_plan.md prompt_plan.md
ln -s ~/code/projects/personal/rackarr/.claude/context/todo.md todo.md
ln -s ~/code/projects/personal/rackarr/.claude/context/roadmap.md roadmap.md
ln -s ~/code/projects/personal/rackarr/.claude/context/workflow.md workflow.md
ln -s ~/code/projects/personal/rackarr/.claude/context/CLAUDE-planning.md CLAUDE.md

# 4. Update .gitignore in Obsidian vault to ignore symlinks (optional)
# Or just let obsidian-git skip them naturally

# 5. Commit repo changes
cd ~/code/projects/personal/rackarr
git add .claude/context/
git commit -m "chore: establish planning docs as source of truth"
git push origin develop
```

### On Claude Code LXC

```bash
# Pull the changes
cd /path/to/rackarr
git pull origin develop

# Verify structure
ls -la .claude/context/
```

---

## Repository Structure

| Location    | URL                                        | Purpose                      |
| ----------- | ------------------------------------------ | ---------------------------- |
| **Primary** | `git.falcon-wahoo.ts.net/ggfevans/rackarr` | Source of truth, PRs, issues |
| **Mirror**  | `github.com/ggfevans/rackarr`              | Public visibility, backup    |

---

## Branch Strategy

```
main
 │
 └── develop (integration branch)
      │
      ├── prompt/4.1-collision-detection
      ├── prompt/4.2-device-properties
      └── prompt/X.Y-description
```

### Branch Types

| Branch         | Purpose                      | Who Creates | Merges To           |
| -------------- | ---------------------------- | ----------- | ------------------- |
| `main`         | Stable releases              | G-Money     | —                   |
| `develop`      | Integration, testing         | G-Money     | `main`              |
| `prompt/X.Y-*` | Single prompt implementation | Claude Code | `develop`           |
| `fix/*`        | Bug fixes                    | Either      | `develop`           |
| `experiment/*` | Exploratory work             | Either      | Delete or `develop` |

---

## Claude Code Session Protocol

### Starting a Session

1. **Pull latest:**

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch:**

   ```bash
   git checkout -b prompt/X.Y-short-description
   ```

3. **Read the prompt:**
   - Open `.claude/context/prompt_plan.md`
   - Find the target prompt (e.g., Prompt 4.2)
   - Note dependencies and acceptance criteria

### During Implementation

Follow TDD protocol:

1. Write tests first
2. Run tests (should fail)
3. Implement to pass
4. Commit with descriptive message

**Commit message format:**

```
prompt X.Y: Brief description

- Detail 1
- Detail 2

🤖 Generated with Claude Code
```

### Ending a Session

1. **Ensure clean state:**

   ```bash
   npm run test:run
   npm run build
   npm run lint
   ```

2. **Update planning docs:**

   ```bash
   # Update todo.md with progress
   # Update prompt_plan.md if approach changed
   git add .claude/context/
   git commit -m "docs: update progress for prompt X.Y"
   ```

3. **Push branch:**

   ```bash
   git push -u origin prompt/X.Y-short-description
   ```

4. **Create PR in Forgejo:**
   - Title: `Prompt X.Y: Description`
   - Description: What was implemented, any deviations from spec
   - Label: `claude-code`

---

## Session Handoff Template

After each Claude Code session, update in daily note or session note:

```markdown
## Claude Code Session: YYYY-MM-DD

**Prompt:** X.Y - Description
**Branch:** `prompt/X.Y-description`
**PR:** [Forgejo PR link]
**Status:** 🟡 In Progress | 🔵 Ready for Review | 🟢 Merged | 🔴 Blocked

### Work Completed

- [x] Tests written for [feature]
- [x] Implementation complete
- [ ] Build passes
- [ ] E2E tests pass

### Commits

- `abc1234` - prompt X.Y: initial test scaffolding
- `def5678` - prompt X.Y: implement feature

### Notes for Review

- [Any deviations from spec]
- [Questions for Claude Desktop]
- [Blockers encountered]

### Next Session

- [ ] Address review feedback
- [ ] Continue with Prompt X.Z
```

---

## Claude Desktop Review Process

When reviewing Claude Code's work:

1. **Fetch PR content:**
   - Share Forgejo PR URL in conversation
   - Claude Desktop will fetch and analyse the diff

2. **Review against spec:**
   - Does implementation match `spec.md` requirements?
   - Are there scope creep additions?
   - Does it follow Svelte 5 runes (not Svelte 4 stores)?

3. **Provide feedback:**
   - Approve: "LGTM, merge to develop"
   - Request changes: Specific feedback for next CC session
   - Discuss: Architectural questions to resolve here first

4. **Document decisions:**
   - Update spec.md if requirements clarified
   - Update prompt_plan.md if approach changed
   - Note in session log

---

## Sync Points

### Code → Documentation

When Claude Code makes architectural discoveries:

1. Update `.claude/context/` docs directly
2. Commit with the implementation
3. G-Money pulls, sees changes in Obsidian via symlinks

### Documentation → Code

When Claude Desktop makes planning decisions:

1. G-Money edits via Obsidian (symlink to repo)
2. Commits and pushes from Mac
3. Claude Code pulls before next session

---

## Quick Reference

### For Claude Code

```bash
# Start session
git checkout develop && git pull
git checkout -b prompt/X.Y-description

# End session
npm run test:run && npm run build
git add -A
git commit -m "prompt X.Y: description"
git push -u origin prompt/X.Y-description
# Create PR in Forgejo
```

### For Claude Desktop

- Review PRs when G-Money shares links
- Check implementations against spec sections
- Flag scope creep or architectural issues
- Update docs when decisions are made (via this conversation)

### For G-Money

- Edit planning docs via Obsidian (symlinks to repo)
- Commit and push doc changes
- Shuttle context between Desktop and Code sessions
- Merge PRs after review approval

---

## Known Issues to Fix

- [ ] **Typo:** `falcon-wahoe` should be `falcon-wahoo` in:
  - `src/lib/components/HelpPanel.svelte`
  - `CLAUDE.md`
  - `migrate-to-symlinks.sh`

---

_Last Updated: 2025-11-28_
_Version: 1.1_
