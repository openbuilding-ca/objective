# Claude Code Instructions for OBJECTIVE Project

**Quick Start Guide for Future Claude Code Sessions**

## 🏗️ Project Structure

```
TEUI 4.0/
├── OBJECTIVE WORKSPACE/                    ← YOU ARE HERE (git repo root)
│   ├── README.md                          ← 166KB main project documentation
│   ├── OBJECTIVE 4011RF/                  ← Active codebase (focus area)
│   │   ├── sections/                      ← 18 section files (S01-S18)
│   │   ├── documentation/                 ← Key docs & workplans
│   │   │   ├── S13-ENDGAME.md            ← Current priority workplan
│   │   │   └── Logs.md                    ← Debug logs/See Logs.md Workflow below
│   │   ├── 4011-StateManager.js           ← Central state management
│   │   ├── 4011-Calculator.js             ← Main calculation engine
│   │   └── index.html                     ← Entry point
│   ├── ARCHIVE/                           ← Legacy code resources
│   └── gh-pages-local/                    ← Deployment files
```

## 🎯 Key Facts

- **Project**: Dual-model building energy calculator (Target vs Reference models)
- **Current Branch**: `IRONING` (local git branch)
- **Priority**: ExcelMapper Import Completion, Clean Code
- **Excel Parity Goal**: h_10 = 93.7 ✅ (major breakthrough Sept 23, 2025, subsequently drifted to 93.0 - probably related to convergent code wrt ventilation calculation and/or h_10 easing animation race condition)

## 📋 Essential Documents

1. **README.md** (166KB) - Complete project history & architecture
2. **Logs.md** - Console logs for forensic analysis (manually updated by human)
3. **4012-CHEATSHEET.md** - Architectural patterns

### 🔍 Logs.md Workflow

- **Manual Process**: Human copies/pastes console logs from browser into `Logs.md`
- **Not Automatic**: Agents cannot access browser console directly
- **Agent Action**: Request logs from human, then analyze `Logs.md` content
- **Use Case**: Forensic debugging, calculation sequence analysis, error tracking, QC Audit reports

## 🔧 Git Workflow

**Working Directory**: Already in git repo root (`OBJECTIVE WORKSPACE`)

```bash
# Check status
git status

# Stage specific file
git add "OBJECTIVE 4011RF/path/to/file.js"

# Commit with detailed message
git commit -m "$(cat <<'EOF'
🎯 SECTION: Brief description

Detailed explanation of changes made.

Key points:
- Point 1
- Point 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Check result
git status
```

## 🚨 Critical Guidelines

### Focus Areas

- **Timing/sequencing fixes** over architectural changes
- **Surgical precision** - minimal code changes
- **Deep debugging** before any modifications

## 🔍 Quick Orientation Commands

```bash
# List main codebase
ls -la "OBJECTIVE 4011RF"

# Check current Section variants
ls -la "OBJECTIVE 4011RF/sections/

# Read current workplan
head -50 "OBJECTIVE 4011RF/documentation/Master-Reference-Roadmap.md"

# Check recent commits
git log --oneline -10
```

## 🗂️ Repository Structure Rules (CRITICAL)

**OBJECTIVE WORKSPACE is the git repository root. ALL development work lives in the OBJECTIVE 4011RF subdirectory.**

### Directory Structure MUST BE:
```
OBJECTIVE WORKSPACE/                    ← Git repo root
├── .git/                              ← Git metadata
├── README.md                          ← Project documentation (root level)
├── deploy-to-gh-pages.sh             ← Deployment script (root level)
├── OBJECTIVE 4011RF/                  ← ALL SOURCE CODE HERE
│   ├── index.html
│   ├── sections/
│   ├── documentation/
│   ├── 4011-*.js (core modules)
│   ├── 4012-*.js (section modules)
│   └── ... (all application files)
└── gh-pages-local/                    ← Deployment worktree (git worktree)
```

### Branch Structure:
- **Feature branches** (S10-S11-PURITY, C-RF, etc.): Full workspace structure with OBJECTIVE 4011RF/
- **gh-pages branch**: Deployed site ONLY (flat structure, just app files - managed via deploy script)
- **DO NOT manually mix structures**: Development branches keep everything in OBJECTIVE 4011RF/

### When Pushing to Remote:
**Remote GitHub branches are EXACT mirrors of local branches.**

When you push a development branch:
```bash
git push origin S10-S11-PURITY
```
GitHub will store an exact copy including:
- ✅ README.md at root
- ✅ OBJECTIVE 4011RF/ with all subdirectories
- ✅ All documentation in OBJECTIVE 4011RF/documentation/
- ✅ All code in OBJECTIVE 4011RF/sections/

**What this means**: If you clone the repository from GitHub, it will look EXACTLY like your local OBJECTIVE WORKSPACE directory.

### Deployment Workflow:
**NEVER manually copy files between branches or structures.**

To deploy to gh-pages (live site):
```bash
# From any development branch with OBJECTIVE 4011RF/ structure
./deploy-to-gh-pages.sh "Commit message describing changes"
```

This script:
1. Syncs OBJECTIVE 4011RF/ contents to gh-pages-local/ (flat structure)
2. Commits to gh-pages-local's main branch
3. Force pushes to remote gh-pages branch
4. Live site updates at https://arossti.github.io/OBJECTIVE/

**DO NOT**: Try to "merge" development branches to gh-pages or manually restructure files.

### Common Pitfalls to AVOID:

❌ **Creating root-level duplicates**: Files like `sections/`, `obc/` at root (outside OBJECTIVE 4011RF/)
- These are leftovers from branch switching or deployment artifacts
- Safe to delete: `rm -rf sections/ obc/` (if they exist outside OBJECTIVE 4011RF/)

❌ **iCloud " 2" suffix duplicates**: macOS/iCloud sync conflicts
- Pattern: `filename 2.js`, `filename 2.md`
- Safe to delete if original exists: `find . -name "* 2.*" -delete`

❌ **Trying to merge incompatible structures**
- Development branches (OBJECTIVE 4011RF/) and gh-pages (flat) have different structures
- Use deploy script, not git merge

### Sanity Check Commands:
```bash
# Verify clean development branch structure
ls -la                          # Should see: README.md, OBJECTIVE 4011RF/, gh-pages-local/
ls -la OBJECTIVE 4011RF/       # Should see: index.html, sections/, documentation/, etc.

# Check for unwanted root-level duplicates
ls -la | grep -v "OBJECTIVE\|README\|gh-pages\|\.git"  # Should be minimal

# Find iCloud duplicates
find . -name "* 2.*" -o -name "* 2"

# Verify remote branch structure matches local
git fetch origin
git diff origin/CURRENT_BRANCH --name-only  # Should be minimal/none
```

### If Structure Gets Messed Up:
1. Don't panic - your work is saved in commits
2. Switch to known-good branch: `git checkout S10-S11-PURITY` (or other feature branch)
3. Verify structure: `ls -la` and `ls OBJECTIVE 4011RF/`
4. Clean up root-level artifacts: Remove any directories that shouldn't be at root
5. Check git status: `git status` - untracked files at root are safe to delete

# Git Note

When running terminal commands, especially git commands, if they fail, check if you are prepending the command with cd to the project's absolute root directory. This must be done for every command in a sequence, as the shell's working directory may not persist between commands.

## 🎯 Session Workflow

1. **Start**: Review Master-Reference-Roadmap.md workplan
2. **Analyze**: Read current ReferenceToggle/ReferenceValues/ReferenceManager files (are they working harmoniously or at cross purposes?)
3. **Debug**: Issue 1: After import of excel file values, inputs appear as if they are defaults, not user-modified (blue styling) making it difficult to determine if values were correctly imported. Issue 2: After valus import, calculations are stale, consider how re-calculation of all sections after import cycle can be best triggered to capture all changed/imported values in the correct sequence (Calculator.js)
4. **Fix**: Commit working code before mods to establish safe restore point.
5. **Test**: Verify Excel import parity, state isolation, correct calcilations (excel calculation parity) all maintained
6. **Commit**: Document changes with uppdated documentation (.md files) and git message referring to document.

## 💡 Pro Tips

- **Path Issues**: Use quotes for paths with spaces: `"OBJECTIVE 4011RF/file.js"`
- **Context Loading**: Read key files in parallel for efficiency
- **Excel Coordinates**: DOM uses Excel cell references (b_18 = B18)
- **State Isolation**: Target/Reference models must remain 100% isolated
- **Conservative Approach**: This is the final pre-production refactor/cleanup after 12 months of development - preserve what works!

---

_Updated: Oct 4, 2025 - For efficient Claude Code sessions on OBJECTIVE TEUI project_
