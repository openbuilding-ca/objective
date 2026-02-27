# Launch Sequence Improvements - Post-Mortem

**Status**: ❌ REVERTED - Not Implemented

**Date**: 2025-12-01
**Branch**: M-N-COMPLIANCE
**Commits Reverted**: 1fc1a60, a64d020

---

## What We Tried

Attempted to improve first-load UX by:
1. Defaulting to horizontal (tabbed) layout instead of vertical
2. Pre-selecting Section 18 (Optimize) as the active tab
3. Auto-activating the parallel coordinates graph on first load
4. Using localStorage flag to prevent re-activation

**Goal**: Showcase the tool's graphically rich optimization interface immediately.

---

## Why It Failed

### Critical Issue: Browser-Specific Calculation Timing

**Problem**: The auto-activation relied on arbitrary delays (800ms → 1800ms) to wait for calculations to complete.

**Results**:
- ✅ **Chrome**: Worked well, all 14 axes rendered correctly
- ❌ **Safari**: Calculations didn't complete in time, causing:
  - Missing axes (Ae, Ag)
  - **Wrong values displayed in Section 01** (critical regression)
  - Unreliable calculation chain completion

### Fundamental Architecture Issue

The TEUI calculator uses a **convergence-based calculation engine** that:
- Runs multiple passes until values stabilize
- Has variable completion time depending on:
  - Browser JavaScript engine speed
  - Device performance
  - Calculation complexity
  - Current state values

**Timing-dependent initialization is incompatible with this architecture.**

---

## What We Learned

### 1. Don't Fight the Architecture

The app was designed for **vertical scrolling** because:
- Users need to see all sections at once for comprehensive modeling
- Full button row at top provides all controls without mode switching
- Sections are interconnected - seeing multiple sections helps understanding
- No arbitrary activation delays needed

**Lesson**: The original design was correct. Don't "improve" UX by hiding functionality.

### 2. Arbitrary Delays Are a Code Smell

Any code using `setTimeout()` with fixed delays to "wait for calculations" is fragile:
- Browser-dependent
- Device-dependent
- State-dependent
- Impossible to test reliably

**Proper solutions require**:
- Event-driven architecture (Calculator fires `calculations-complete` event)
- Explicit dependency tracking (know when all deps are ready)
- Progressive enhancement (render what's available, update when ready)

### 3. First Impressions ≠ Hidden Features

Trying to "showcase" features by auto-activating them:
- Removes user control (unexpected behavior)
- Creates false first-load performance (looks slow)
- Hides the tool's complexity instead of helping users understand it

**Better approach**: Clear documentation, guided tours, example projects.

---

## Why Vertical Layout Is Correct

### Benefits of Vertical Layout (Original Design)

1. **Full Visibility**: All sections visible with scrolling - no tab hunting
2. **Complete Controls**: Full button row always accessible at top
3. **Natural Flow**: Scrolling is intuitive for reviewing comprehensive data
4. **No Timing Issues**: Sections render as calculations complete, progressively
5. **Debug Friendly**: Can see all calculations update in real-time
6. **Cross-Browser**: No JS-dependent layout initialization

### Downsides of Horizontal (Tabbed) Layout

1. **Hidden Content**: Can only see one section at a time
2. **Navigation Overhead**: Must click tabs to explore
3. **Lost Context**: Hard to compare across sections
4. **Initialization Complexity**: Requires JS to activate tabs
5. **Responsive Challenges**: Tab overflow on mobile devices
6. **Auto-Activation Fragility**: Leads to timing-dependent bugs (as demonstrated)

---

## Recommendation

**DO**:
- Keep vertical layout as default
- Let users scroll to explore all sections
- Ensure full button row is always visible at top
- Allow users to manually switch to horizontal layout if preferred (existing toggle)
- Document the optimization features in help/guide

**DON'T**:
- Auto-activate sections on page load
- Use arbitrary timing delays for initialization
- Hide sections behind tabs by default
- Remove user control in favor of "showcasing" features

---

## Future Improvements (If Needed)

If we ever want to improve first-load experience:

### Option 1: Sticky Header with Feature Highlights
- Add a dismissible banner: "New: Interactive optimization graph in Section 18 →"
- Clicking banner scrolls to S18 smoothly
- No auto-activation, user maintains control

### Option 2: Progressive Enhancement
- Render placeholder graphs immediately
- Show "Loading..." state while calculations run
- Update graphs when data becomes available
- No timing dependencies, event-driven updates

### Option 3: Guided Tour (User-Initiated)
- Add "Take a Tour" button in disclaimer modal
- User clicks to start guided walkthrough
- Highlights key features (S18, S16, S17, etc.)
- User-controlled, no surprises

### Option 4: Example Project Pre-Loading
- Include a "Demo: Community Centre" example project
- Pre-calculated values, instant visualization
- "Try the calculator with real data" CTA
- Shows capabilities without timing issues

---

## Technical Debt Avoided

By reverting these changes, we avoided:
- Browser-specific conditional code paths
- Hard-to-debug timing issues in production
- User confusion from unexpected auto-activations
- Performance regression from duplicate calculation passes
- Maintenance burden of fragile initialization code

---

## Conclusion

**The original vertical layout design was correct.**

The impulse to "showcase features" by hiding other sections and auto-activating graphs introduced:
- Browser-specific bugs (Safari calculation errors)
- Timing fragility (arbitrary delays)
- User experience regression (removed control)

**Simpler is better.** Let users scroll, explore, and activate features when ready.

---

**Commits Reverted**:
- `1fc1a60` - Feat: Improve launch sequence to showcase Section 18 Optimize graph
- `a64d020` - Fix: Increase S18 auto-activation delay to resolve missing Ae/Ag axes

**Files Restored**:
- [src/core/init.js](src/core/init.js) - Back to vertical layout default
- [src/core/ParallelCoordinates.js](src/core/ParallelCoordinates.js) - Removed auto-activation

**Lesson**: Trust the original design. Don't introduce complexity to hide it.
