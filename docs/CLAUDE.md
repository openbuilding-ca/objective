# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The OBJECTIVE TEUI (Total Energy Use Intensity) Calculator is a web-based energy modeling tool for buildings in Canada. The codebase has two components:

1. **4012** (pre-production deployment) - Next-gen architecture using functional programming and modern CSS
2. **OBC Matrix** - Ontario Building Code compliance matrix tool for future integration pending regulator approval

## Commands

```bash
# Linting and formatting
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format:write # Auto-format with Prettier

# Open calculators locally
open "OBJECTIVE/index.html"     # Main calculator
open "OBJECTIVE/src/obc/index.html" # OBC Matrix
```

## Architecture

### OBJECTIVE 4.012 (Current Pre-Production)
- **Entry**: `OBJECTIVE/index.html`
- **Core**: StateManager handles dual-state (Target/Reference) calculations
- **Sections**: 18 calculator sections in `sections/Section*.js`
- **State Flow**: Input → StateManager → Calculator → UI Update
- **Key Pattern**: Every field has Target and Reference variants (e.g., `d_12`, `ref_d_12`)

### 4.012 Framework (Next Generation)
- **Goal**: 50% code reduction, sub-100ms recalculation
- **Pattern**: Tuple-based calculations returning `{target, reference}` pairs
- **Structure**: 
  - `core/` - State management, calculations, UI rendering
  - `sections/` - Individual calculator sections (S01, S02, S03 complete)
- **No ES6 modules** - Uses IIFE pattern for browser compatibility

### Critical Files
- `StateManager.js` - Central state management for dual calculations
- `Calculator.js` - Core calculation engine
- `ReferenceValues.js` - Building code minimum values
- `FieldManager.js` - UI component creation and management
- `Dependency.js` - Complete dependency graph for all fields (visualized in Section 17)
  - Future use: Topological sort for optimized calculation order
  - Future use: Directed graph traversal for reactive calculations
  - Current: Visualization and debugging tool

## Git Workflow & GitHub Etiquette

### The Correct Workflow (CTO-Approved)

**Standard feature branch workflow with PR review:**

```bash
# 1. START: Pull latest main
git checkout main
git pull origin main

# 2. CREATE: New feature branch from main
git checkout -b FEATURE-NAME

# 3. WORK: Make changes and test locally
# ... edit files ...
# ... test in browser ...

# 4. COMMIT: Only after local testing passes
git add .
git commit -m "$(cat <<'EOF'
Type: Brief description

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
EOF
)"

# 5. PUSH: Backup work to remote (creates backup + enables PR)
git push -u origin FEATURE-NAME

# 6. PR: Create pull request via GitHub UI
# - Wait for CTO review
# - NEVER merge your own PR
# - CTO merges when approved

# 7. AFTER MERGE: Start next feature
git checkout main
git pull origin main  # Gets your merged changes
git checkout -b NEXT-FEATURE  # Fresh branch from updated main
```

### Critical Rules

1. **⚠️ ALWAYS push before switching branches**:
   ```bash
   # ✅ SAFE - Work backed up to remote
   git push -u origin FEATURE-BRANCH
   git checkout main  # Safe to switch

   # ❌ DANGER - Unpushed work can be lost!
   git checkout main  # Abandons unpushed commits
   ```

2. **Before switching branches, verify safety**:
   ```bash
   # Check for unpushed commits
   git log origin/BRANCH-NAME..HEAD
   # If output shows commits → PUSH FIRST!

   # Check tracking status
   git branch -vv | grep "*"
   # Should show [origin/BRANCH-NAME]
   ```

3. **Branch from main, not from other feature branches**:
   ```bash
   # ✅ CORRECT
   git checkout main
   git checkout -b NEW-FEATURE

   # ❌ WRONG - Creates dependency chain
   git checkout FEATURE-A
   git checkout -b FEATURE-B  # Don't do this!
   ```

4. **Commit timing**:
   - **Commit ONLY when explicitly directed by user**
   - User prefers to test locally before commits
   - **Do NOT auto-commit** after making code changes
   - **Push ONLY when explicitly directed by user**

5. **Commit message format**:
   - Always use HEREDOC syntax for proper formatting
   - Types: `Feat`, `Fix`, `Refactor`, `Docs`, `Improve`, `Clean`
   - Skip `Logs.md` in commits (working file, not version-controlled)

### When Rebase Is Needed

**Only rebase if your feature branch is stale:**

```bash
# Your branch is stale if main has new commits since you branched
git checkout main
git pull origin main
git checkout YOUR-BRANCH

# Check if rebase needed
git log main..HEAD  # Shows your commits
git log HEAD..main  # Shows main's new commits

# If main has new commits, rebase
git rebase main
git push --force-with-lease origin YOUR-BRANCH
```

**You do NOT need to rebase if:**
- Your branch is fresh from main
- No one else has committed to main since you branched
- You're ready to create PR immediately after pushing

### PR Queue Etiquette

- **Respect the queue**: If PR#35 is open, wait for CTO review before creating PR#36
- **NEVER merge your own PRs** - CTO approval required
- After your PR is merged by CTO:
  - Pull main to get your changes
  - Start fresh branch from main
  - Previous feature branch can be deleted locally

### Emergency: Recovering Lost Work

If you switched branches without pushing:

```bash
# 1. Find orphaned commits
git reflog  # Shows all HEAD movements

# 2. View the commit
git show COMMIT-HASH

# 3. Recover work (choose one):
git cherry-pick COMMIT-HASH  # Add to current branch
git checkout -b recovery-branch COMMIT-HASH  # New branch from commit
```

**Git keeps orphaned commits for ~90 days, but don't rely on this!**

### Branch Lifecycle

- Keep feature branches small (< 10 commits ideal)
- Focus on single feature or fix per branch
- After CTO merges: delete local branch, remote preserved automatically
- Fresh branch from main for each new feature

## Development Guidelines

### Critical Architecture Principle

**Before making changes**: Review existing code patterns and architecture documents. **Don't reinvent** - the codebase has 8 months of careful architectural decisions. When in doubt about approach, ask the user or check existing implementations rather than creating new methods that may violate established patterns.

### When modifying calculations:
1. **DO NOT invent new calculation methods** - Use existing patterns only
2. **Both engines ALWAYS run on value changes** - This is by design, not a bug
3. **If wrong values appear**: The issue is reading from wrong state (fallback contamination), NOT both engines running
4. **Never disable an engine** to "fix" calculation issues - Fix the state read/write instead
5. Check both Target and Reference modes work correctly
6. Verify downstream dependencies using `Dependency.js`
7. Test with Reference toggle on/off
8. Ensure UI/DOM maintains all expected values and Target/Reference Model isolation

### Field ID Convention:
- Format: `[column]_[row]` (e.g., `d_12` for column D, row 12)
- Target variant: `d_12`
- Reference variant: `ref_d_10`

### State Management:
```javascript
// Always use StateManager for values
TEUI.StateManager.setValue('d_12', value);
const value = TEUI.StateManager.getValue('d_12');

// For dual-state fields
// Target fields use base field ID (e.g., 'd_12')
TEUI.StateManager.setValue('d_12', targetValue);

// Reference fields use 'ref_' prefix (e.g., 'ref_d_12')
TEUI.StateManager.setValue('ref_d_12', referenceValue);
const refValue = TEUI.StateManager.getValue('ref_d_12');
```

### Adding New Sections:
1. Follow naming: `Section[XX].js` or `S[XX].js`
2. Register with StateManager and SectionIntegrator
3. Define field mappings in section's `fields` object
4. Implement `calculate()` and `updateUI()` functions

## Common Issues & Solutions

### Reference Values Not Updating:
- Check `ReferenceValues.js` for field mappings
- Verify dual-state architecture in section implementation
- Ensure `updateReferenceIndicators()` is called after calculations

### Excel Import/Export Issues:
- Field mappings in `ExcelMapper.js`
- Check cell references match Excel template
- Verify data types (numeric vs string)

### Calculation Dependencies:
- Use `Dependency.js` to track field relationships (complete dependency graph)
- Ensure proper calculation order in `Calculator.js`
- Check for circular dependencies
- Note: Convergence calculation loop currently handles stale values and calculation drift
- Future: Replace with topological sort/directed graph for reactive calculations

## Testing Approach

Automated testing with Playwright is configured (`playwright.config.cjs`). Testing includes:
1. Automated: Playwright test suite in `tests/` directory
2. Manual: Compare calculations with Excel reference files (`docs/source of truth/TEUIv3043.xlsx`)
3. Manual: Test Reference mode toggle functionality
4. Manual: Verify CSV/Excel import/export round-trip (confirmed working)
5. Manual: Check responsive design on mobile devices (partial implementation)

## Data Sources
- Climate data: `src/core/ClimateValues.js`
- Excel formulas (CSV export): `docs/sources of truth 3037/TEUIv3043.csv`
- Building code values: Embedded in `src/core/ReferenceValues.js`

## Repository Structure & File Organization

### Directory Structure
```
objective/                              ← Git repo root
├── .git/                              ← Git metadata
├── docs/
│   ├── CLAUDE.md                      ← This file (primary AI guidance)
│   ├── development/
│   │   ├── Logs.md                    ← Debug logs & console output
│   │   └── SEPT15-RACE-MITIGATION.md  ← Technical documentation
│   └── sources of truth 3037/
│       └── TEUIv3043.csv              ← Excel formulas (CSV export)
├── src/
│   ├── core/                          ← Core modules
│   │   ├── StateManager.js           ← Central state management
│   │   ├── Calculator.js             ← Main calculation engine
│   │   ├── Dependency.js             ← Complete dependency graph
│   │   ├── FieldManager.js           ← UI component management
│   │   ├── FileHandler.js            ← CSV/Excel import/export
│   │   ├── ExcelMapper.js            ← Excel cell mapping
│   │   ├── ReferenceValues.js        ← Building code minimums
│   │   ├── ReferenceManager.js       ← Reference mode coordination
│   │   ├── ReferenceToggle.js        ← Toggle UI control
│   │   ├── SectionIntegrator.js      ← Section coordination
│   │   ├── Cooling.js                ← Cooling calculations module
│   │   ├── ClimateValues.js          ← Climate data
│   │   ├── Orchestrator.js           ← Module initialization
│   │   ├── ZenMaster.js              ← Calculation monitoring
│   │   ├── QCMonitor.js              ← Quality control checks
│   │   ├── TooltipManager.js         ← Tooltip system
│   │   └── init.js                   ← Application initialization
│   ├── sections/                      ← Section modules (S01-S18)
│   │   ├── Section01.js through Section18.js
│   │   ├── Section16C.js             ← Sankey chart variant
│   │   └── SectionXX.js              ← Template
│   ├── styles/                        ← CSS files
│   └── obc/                           ← OBC Matrix tool
├── tests/                             ← Playwright test suite
├── index.html                         ← Application entry point
├── playwright.config.cjs              ← Test configuration
└── package.json
```

### Logs.md Workflow

**Manual Process for Debugging**:
- Human copies/pastes browser console logs into `docs/development/Logs.md`
- This is a pasteboard file for console output review and analysis
- **IMPORTANT**: Claude NEVER writes to Logs.md - it's user-maintained only
- **IMPORTANT**: Skip Logs.md in commits - it's a working file, not version-controlled content
- Agents cannot access browser console directly
- When debugging, request logs from human, then analyze `Logs.md` content
- Use cases: Forensic debugging, calculation sequence analysis, error tracking

### Debugging Best Practices

**Prefer Console Scripts Over Inline Logging**:
- **DO**: Provide console scripts for user to run in browser console
- **DON'T**: Add `console.log()` statements to source files (requires commit → test → revert cycle)
- Console scripts are faster: user pastes → runs → copies output to Logs.md
- Inline logging requires: code change → commit → push → refresh → test → revert → commit again
- Exception: Permanent debug logging for critical production issues only

**Example Console Script Pattern**:
```javascript
// Check module state
console.log('Module loaded:', !!window.TEUI?.ModuleName);
console.log('Field value:', window.TEUI.StateManager?.getValue('field_id'));

// Test function
if (window.TEUI?.ModuleName?.functionName) {
  const result = window.TEUI.ModuleName.functionName('test');
  console.log('Result:', result);
}
```

### Common Path Issues

When running commands:
- Use quotes for paths with spaces: `"src/sections/Section10.js"`
- Working directory may not persist between commands - verify with `pwd`
- For git operations, ensure you're in repo root

### Common Git Issues

**Staged deletion conflicts**:
- If a file is already staged for deletion (via `git rm`), don't include it in subsequent `git add` commands
- Check staging status with `git status` before committing

**Commit message formatting**:
- Always use HEREDOC syntax for multi-line commit messages
- Single quotes in `<<'EOF'` prevent variable expansion
- Ensures co-author footer formats correctly

**Force push safety**:
- Use `--force-with-lease` instead of `--force`
- Prevents accidentally overwriting others' work
- Safe for rebasing your own feature branches

## Quick Orientation Commands

```bash
# List main codebase
ls -la src/

# Check current sections
ls -la src/sections/

# View recent git activity
git log --oneline -10

# Check current branch and status
git branch
git status
```