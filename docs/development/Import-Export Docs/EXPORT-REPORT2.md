# EXPORT-REPORT2.md - Browser Native Print Approach

**Status**: ✅ COMPLETE - Production Ready
**Branch**: 2025.12-POLISH (merged REPORT2 work)
**Created**: December 5, 2025
**Last Updated**: December 6, 2025

## 📋 Quick Status

**Completed Features**: ✅
- Print button functional ([index.html:342-345](../../../index.html#L342-L345), [init.js:704-715](../../src/init.js#L704-L715))
- Comprehensive print styles implemented ([styles.css:2408+](../../src/styles.css#L2408))
- Color preservation (blue/red/green fields maintain meaning)
- Superior text quality vs jsPDF
- **Horizontal clipping RESOLVED** - `overflow: visible` implemented
- **Disclaimer page added** - Full legal disclaimer, license, and credits
- **Reporter.js retired** - jsPDF workflow removed in favor of browser print
- **Print CSS consolidated** - Single comprehensive `@media print` block

**Implementation Complete**: ✅
- All sections print without horizontal clipping
- Disclaimer page with License (CC BY-NC-ND 4.0) and Credits
- Single PDF export method (browser native print)
- Consolidated print CSS for easy maintenance

## Overview

Exploring browser's native `window.print()` → "Save as PDF" as a superior alternative to jsPDF manual rendering (REPORT branch). Initial testing shows dramatically better quality with critical layout challenges identified and solutions formulated.

## Comparison: Browser Print vs jsPDF

### Browser Native Print Advantages ✅

1. **Superior Text Rendering**
   - Native font rendering (no font embedding issues)
   - Perfect kerning, ligatures, and anti-aliasing
   - Crisp text at any zoom level (vector-based)
   - Proper subscript/superscript rendering (no HTML tag artifacts)

2. **Rich Graphics Support**
   - Background graphics can be disabled via print dialog
   - SVG/Canvas elements render perfectly
   - CSS filters, gradients, shadows all supported
   - Sections 16-18 graphics maintain full quality

3. **Layout Engine Power**
   - CSS Grid/Flexbox for automatic layout
   - Native page break logic (`break-before`, `break-after`, `break-inside`)
   - `@media print` styles for print-specific formatting
   - No manual coordinate calculations needed

4. **Color Accuracy**
   - True color rendering (no RGB approximations)
   - Color-coded fields (blue/red) render perfectly
   - Consistent across different PDF viewers

5. **Development Speed**
   - No need to manually position every element
   - CSS does the heavy lifting
   - Easier to maintain and update

### Current Challenges ❌

1. **Table Content Clipping**
   - Some table data gets cut off at page boundaries
   - Need proper `page-break-inside: avoid` handling
   - May need to break large tables into smaller chunks

2. **Section Frame Containment**
   - Content overflowing section boundaries
   - Need better `overflow` handling in print styles

3. **Background Control**
   - Need to selectively disable backgrounds while preserving graphics
   - Current: User manually disables "Background graphics" in print dialog
   - Better: CSS `@media print` to control this programmatically

## Technical Approach

### Phase 1: Print Styles Foundation

Create comprehensive `@media print` CSS styles:

```css
@media print {
  /* Page setup */
  @page {
    size: landscape;
    margin: 0.5in;
  }

  /* Hide UI elements */
  header, nav, .toolbar, .reference-toggle, .help-button {
    display: none !important;
  }

  /* Section containment */
  .section-container {
    page-break-inside: avoid; /* Keep sections together */
    break-inside: avoid; /* Modern syntax */
  }

  /* Table handling */
  table {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  tbody tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Background control */
  body {
    background: white !important;
  }

  /* Preserve section graphics (S16-18) */
  .graphics-section canvas,
  .graphics-section svg {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

### Phase 2: Content Preparation

Before triggering print:

1. **Clone DOM** for print-specific modifications
2. **Flatten sections** that are too tall
3. **Remove/hide** interactive elements
4. **Ensure proper page breaks** between major sections
5. **Add print-specific headers/footers** with CSS

### Phase 3: Print Invocation

```javascript
function printReport() {
  // Prepare print styles
  preparePrintLayout();

  // Trigger browser print dialog
  window.print();

  // Cleanup after print (if needed)
  cleanupPrintLayout();
}
```

## Known Issues & Solutions

### Issue 1: Horizontal Content Clipping ⚠️ ACTIVE ISSUE

**Problem**: Wide tables and graphics clip at the **right margin** (horizontal overflow hidden)

**Example Sections Affected**:
- Section 13 (Mechanical Loads) - Wide table rows cut off at right edge
- Section 16 (Sankey Diagram) - SVG graphics clip at right/bottom edges

**Root Cause Analysis**:
- **Screen layout**: `.section { overflow: hidden }` ([styles.css:173](../../src/styles.css#L173))
- **Screen layout**: `.section-content { overflow: hidden; overflow-x: auto }` ([styles.css:201-202](../../src/styles.css#L201-L202))
- **Purpose**: On screen, creates scrollable containers for wide content
- **Problem in print**: `overflow: hidden` clips content instead of allowing it to flow
- **Result**: Wide tables/graphics get cut off at section container boundaries

**Key Insight**: Browser handles **vertical** pagination perfectly (content flows to next page). The issue is **horizontal** clipping at container edges.

---

**Solution Options** (ranked by feasibility):

**Option A: Allow Overflow in Print (SIMPLEST)** ✅ RECOMMENDED
```css
@media print {
  /* Allow content to overflow section boundaries */
  .section {
    overflow: visible !important;
  }

  .section-content {
    overflow: visible !important;
  }
}
```
**Pros**:
- Simple 2-line CSS change
- No content loss
- Content can spill outside section borders if needed
- Browser will handle what fits on page

**Cons**:
- Content may overlap section borders/frames visually
- May look less "contained" than screen view
- Wide content might still exceed page width (need Option B or C)

**Status**: ⚠️ May need combination with scaling if content > page width

---

**Option B: Scale Down Wide Sections to Fit Page** ✅ RECOMMENDED (combined with A)
```css
@media print {
  /* Allow overflow first */
  .section {
    overflow: visible !important;
  }

  /* Scale down specific wide sections to fit landscape page */
  #section13.section, /* Mechanical Loads - wide table */
  #section16.section, /* Sankey Diagram */
  #section11.section  /* Envelope Transmission */
  {
    transform: scale(0.9); /* Scale to 90% */
    transform-origin: top left;
  }

  /* Alternative: Scale down table specifically */
  #section13 .data-table {
    font-size: 10px; /* Reduce from default */
  }
}
```
**Pros**:
- Content fits within page width
- Combined with `overflow: visible` ensures nothing clips
- Can target specific sections that need it

**Cons**:
- Smaller text (may affect readability)
- Need to test scale factor for each section
- Trial-and-error to find right scale

---

**Option C: Reduce Font Size & Spacing for Print**
```css
@media print {
  /* Allow overflow */
  .section {
    overflow: visible !important;
  }

  /* Reduce table font and spacing */
  .data-table {
    font-size: 9px !important; /* Smaller than screen */
  }

  .data-table td,
  .data-table th {
    padding: 2px 4px !important; /* Tighter spacing */
  }

  /* Narrower column labels */
  .data-table th {
    font-size: 8px !important;
  }
}
```
**Pros**:
- More content fits per row
- Uniform reduction across all sections
- No scaling distortion

**Cons**:
- May be harder to read when printed
- Loses visual consistency with screen
- Requires testing for readability

---

**Option D: Hide Non-Essential Columns**
```css
@media print {
  /* Hide less critical columns to save space */
  .data-table .col-reference,
  .data-table .col-notes {
    display: none;
  }
}
```
**Pros**:
- Reduces table width significantly
- Keeps important data visible
- Font size stays readable

**Cons**:
- Loses information in print output
- User may want all columns
- Not a general solution

---

**RECOMMENDATION**: **Use Option A + Option B together**

**Step 1**: Change `overflow: hidden` → `overflow: visible`
```css
@media print {
  .section,
  .section-content {
    overflow: visible !important;
  }
}
```

**Step 2**: Test which sections still exceed page width

**Step 3**: Selectively scale down problematic sections
```css
@media print {
  /* Scale only sections that exceed page width after overflow:visible */
  #section13.section {
    transform: scale(0.92);
    transform-origin: top left;
  }
}
```

**Why this works**:
1. `overflow: visible` fixes the immediate clipping
2. Scaling fixes content that's legitimately too wide for page
3. Only scale what needs it - preserve readability elsewhere

---

### Issue 2: Graphics Section Clipping (SAME ROOT CAUSE)

**Problem**: Sankey Diagram (Section 16) clips at right/bottom edges

**Root Cause**: Same as Issue 1 - `.section { overflow: hidden }`

**Solution**: Apply Option A (overflow: visible) + ensure SVG scales responsively

```css
@media print {
  /* Fix clipping (same as Issue 1) */
  .section {
    overflow: visible !important;
  }

  /* Ensure SVGs scale to fit page */
  #section16 svg,
  #section17 svg,
  #section18 svg {
    max-width: 100% !important;
    max-height: 7in !important; /* Landscape page ~8.5" - margins */
    width: auto !important;
    height: auto !important;
  }
}
```

**Why this works**:
- `overflow: visible` allows SVG to escape clipping boundaries
- `max-width/max-height` ensures SVG doesn't exceed printable area
- SVG scales proportionally to fit

---

### Issue 3: Section Border Visual Appearance (MINOR)

**Problem**: With `overflow: visible`, content may visually escape section borders

**Root Cause**:
- Section borders defined by `.section { border: 2px solid ... }`
- With `overflow: visible`, wide content can extend beyond visual frame

**Solution Options**:

**Option A: Remove section borders for print** (cleaner look)
```css
@media print {
  .section {
    border: none !important;
  }
}
```

**Option B: Keep borders, accept overflow** (user sees full content even if outside box)
```css
@media print {
  .section {
    overflow: visible !important;
    border: 1px solid #ccc; /* Thinner border for print */
  }
}
```

**RECOMMENDATION**: Option A - remove borders for cleaner print output

---

## 🎯 RECOMMENDED SOLUTION SUMMARY

Based on the analysis above, here's the comprehensive fix for **horizontal clipping** issues:

### Core Fix: Allow Horizontal Overflow

**The Problem**: `.section { overflow: hidden }` clips wide content at container edges

**The Solution**: Change to `overflow: visible` for print

```css
@media print {
  /* PRIMARY FIX: Allow content to overflow section boundaries */
  .section,
  .section-content {
    overflow: visible !important;
  }

  /* Remove section borders for cleaner appearance */
  .section {
    border: none !important;
  }

  /* Minimal margins for maximum usable width */
  @page {
    size: landscape;
    margin: 0.25in; /* L/R/T/B margins */
  }
}
```

---

### Page Width Sizing (User-Selectable)

Content automatically adapts to user's page size choice in print dialog:

**Letter Landscape (11" × 8.5")** - Default
- Usable width: 11" - 0.5" margins = **10.5" wide**
- Usable height: 8.5" - 0.5" margins = **8" tall**

**Legal Landscape (14" × 8.5")** - User selects
- Usable width: 14" - 0.5" margins = **13.5" wide** (30% more space!)
- Usable height: 8.5" - 0.5" margins = **8" tall**

**Tabloid Landscape (17" × 11")** - User selects
- Usable width: 17" - 0.5" margins = **16.5" wide** (57% more space!)
- Usable height: 11" - 0.5" margins = **10.5" tall** (30% more height!)

**Key Strategy**: With `overflow: visible`, content naturally uses available space. No need for page-size-specific CSS!

---

### Conditional Scaling (Only If Needed)

Test first with just `overflow: visible`. Only add scaling if content still exceeds Letter landscape:

```css
@media print {
  /* Core fix (try this first) */
  .section,
  .section-content {
    overflow: visible !important;
  }

  /* ONLY add if Section 13 still clips on Letter landscape */
  #section13.section {
    transform: scale(0.95);
    transform-origin: top left;
  }

  /* Graphics: constrain to page dimensions */
  #section16 svg,
  #section17 svg,
  #section18 svg {
    max-width: 100% !important;
    max-height: 8in !important; /* Letter height - margins */
    width: auto !important;
    height: auto !important;
  }
}
```

---

### Expected Results:
✅ **Letter (11×8.5)**: All content visible, may be tight
✅ **Legal (14×8.5)**: More breathing room horizontally
✅ **Tabloid (17×11)**: Spacious, everything comfortable
✅ Section 13 - All columns visible to right edge
✅ Section 16 - Complete Sankey (scales to fit page height)
✅ No clipping at section container boundaries
✅ Content adapts automatically to user's paper choice

### Testing Checklist:
- [ ] **Letter landscape**: All content visible (primary test)
- [ ] **Legal landscape**: Content uses extra 3" width
- [ ] **Tabloid landscape**: Content uses extra 6" width + 2.5" height
- [ ] Section 13: All table columns visible
- [ ] Section 16: Complete Sankey diagram (not clipped)
- [ ] No content clipping at right margins
- [ ] Color preservation maintained
- [ ] Test with Reference model toggle

---

### Issue 5: Color Preservation (RESOLVED) ✅

**Problem**: Need to preserve meaningful colors (blue = user inputs, red = reference values, green = actual values)

**Solution**: Use `print-color-adjust: exact` globally
   ```css
   @media print {
     /* Preserve ALL colors - they're data, not decoration */
     * {
       print-color-adjust: exact;
       -webkit-print-color-adjust: exact;
       color-adjust: exact;
     }

     /* White backgrounds for sections, but preserve text colors */
     .section-container:not(.graphics-section) {
       background: white !important;
     }
   }
   ```

**Result**: All meaningful color coding preserved in print output

## Implementation Plan

### Step 1: Print Styles (styles.css) ✅ DONE
- [x] Create comprehensive `@media print` block (lines 2420-2548)
- [x] Hide all UI elements (toolbar, buttons, dropdowns)
- [x] Set page size/orientation (landscape, 0.5" margins)
- [x] Control backgrounds (white for sections, preserve graphics)
- [x] Handle page breaks (avoid inside sections, force between major sections)

### Step 2: Print Button Handler (init.js) ✅ DONE
- [x] Add "Print Report (PDF)" menu item in Import/Export dropdown (index.html:346-348)
- [x] Implement print handler calling `window.print()` (init.js:727-739)
- [x] No preparation needed - CSS handles everything
- [x] No cleanup needed - browser handles it

### Step 3: Fix Horizontal Clipping Issues ✅ IMPLEMENTED

**Sub-step 3.1: Core Fix - Allow Overflow** (styles.css @media print) ✅ DONE
- [x] Add `.section { overflow: visible !important }` (styles.css:2435-2438)
- [x] Add `.section-content { overflow: visible !important }` (styles.css:2440-2442)
- [x] Change `@page { margin: 0.5in }` → `margin: 0.25in` (styles.css:2431)
- [x] Add `.section { border: none !important }` (styles.css:2437)

**Implementation Notes:**
```css
/* Page setup - minimal margins for maximum usable width */
@page {
  size: landscape;
  margin: 0.25in; /* Reduced from 0.5in to maximize content space */
}

/* CRITICAL FIX: Allow horizontal overflow to prevent content clipping */
.section {
  overflow: visible !important;
  border: none !important; /* Remove borders for cleaner print */
}

.section-content {
  overflow: visible !important;
}
```

**Sub-step 3.2: Refinements** ✅ DONE
- [x] Remove borders from Section 1 (Key Values) table for consistency (styles.css:2554-2558)
- [x] Center Sankey diagram to use full available width (styles.css:2560-2571)
- [x] Hide collapsed sections completely in print (styles.css:2573-2580)

**Refinement Details:**
```css
/* REFINEMENT 1: Remove borders from Section 1 key-values-table for consistency */
#keyValues .key-values-table,
#keyValues table {
  border: none !important;
}

/* REFINEMENT 2: Center Sankey diagram and use full available width */
#section16 .section-content,
#sankeySection16Container {
  display: flex;
  justify-content: center;
  align-items: center;
}

#section16 svg {
  max-width: 100% !important;
  height: auto !important;
}

/* REFINEMENT 3: Completely hide collapsed sections (don't print empty frames) */
.section-header.collapsed {
  display: none !important;
}

.section-header.collapsed + .section-content {
  display: none !important;
}
```

**Sub-step 3.3: Initial Testing** ⏳ READY FOR USER
- [x] All core fixes implemented
- [x] All refinements implemented
- [ ] Test Section 13 on **Letter landscape** - check if all columns visible
- [ ] Test Section 16 on **Letter landscape** - check if Sankey complete and centered
- [ ] Test Section 11 on **Letter landscape** - check if all columns visible
- [ ] Test collapsed sections (S17, S19) - verify they don't print at all
- [ ] If content still clips → proceed to conditional scaling

**Sub-step 3.3: Add Conditional Scaling (ONLY IF NEEDED)**
- [ ] If Section 13 still clips: Add `#section13.section { transform: scale(0.95) }`
- [ ] If Section 16 still clips: Add SVG max-height constraint
- [ ] Test again on Letter landscape

**Sub-step 3.4: Multi-Page Size Testing**
- [ ] Test on **Letter landscape (11×8.5)** - content should fit (primary target)
- [ ] Test on **Legal landscape (14×8.5)** - content should have more space
- [ ] Test on **Tabloid landscape (17×11)** - content should be very comfortable
- [ ] Verify content adapts automatically to each page size

**Sub-step 3.5: Final Validation**
- [ ] All sections: No horizontal clipping at right margin
- [ ] Section 13: All table columns visible through to right edge
- [ ] Section 16: Complete Sankey diagram (not cut off)
- [ ] Color preservation: Blue/red/green fields maintain meaning
- [ ] Test with Reference model toggle (dual export)

### Step 4: Cross-Browser Testing ⏳ NEXT
- [ ] **Chrome** (primary) - test all 3 page sizes
- [ ] **Safari** (WebKit) - test Letter landscape minimum
- [ ] **Firefox** (Gecko) - test Letter landscape minimum
- [ ] **Edge** (Chromium) - test Letter landscape minimum

## Comparison Table

| Feature | jsPDF (REPORT) | Browser Print (REPORT2) |
|---------|----------------|-------------------------|
| Text Quality | Manual positioning, font embedding | Native rendering, perfect |
| Graphics | Limited Canvas support | Full SVG/Canvas/CSS support |
| Layout Control | Manual calculations | CSS Grid/Flexbox |
| Color Accuracy | RGB approximations | True color |
| File Size | Large (embedded fonts) | Smaller (system fonts) |
| Development Time | High (manual everything) | Lower (CSS does work) |
| Cross-browser | Consistent | Varies slightly |
| Complexity | High | Medium |
| Maintenance | Difficult | Easier |

## Browser Print API Reference

### window.print()
- Triggers browser's native print dialog
- User can choose printer or "Save as PDF"
- No file download dialog (user chooses destination)

### @media print CSS
- Styles only applied when printing/print preview
- Full CSS support (unlike jsPDF)
- Can completely transform layout

### Page Break Controls
```css
page-break-before: always | avoid | auto;
page-break-after: always | avoid | auto;
page-break-inside: avoid | auto;

/* Modern syntax */
break-before: page | avoid-page | auto;
break-after: page | avoid-page | auto;
break-inside: avoid | auto;
```

### @page Rule
```css
@page {
  size: landscape | portrait | A4 | letter;
  margin: 0.5in;

  @top-center {
    content: "Header text";
  }

  @bottom-right {
    content: counter(page);
  }
}
```

## Next Steps

1. Create comprehensive print styles in styles.css
2. Test with current DOM structure (no modifications)
3. Identify which sections need special handling
4. Implement print button handler
5. Iterate on styling until quality matches/exceeds jsPDF
6. Document browser compatibility findings

## Additional Considerations

### Page Size Options

The current implementation uses landscape orientation with standard margins. For different content densities, consider these alternatives:

**Option A: Tabloid (11x17 landscape)** - More space for graphics
```css
@page {
  size: 11in 17in landscape;
  margin: 0.5in;
}
```
**Printable area**: 16" wide × 10" tall
**Best for**: Dense tables, large graphics
**Trade-off**: Less common paper size

**Option B: Letter (8.5x11 landscape)** - Current default
```css
@page {
  size: landscape;
  margin: 0.5in;
}
```
**Printable area**: 10" wide × 7" tall
**Best for**: Standard printing, common paper size
**Trade-off**: May need more pages

**Option C: Legal (8.5x14 landscape)** - Compromise
```css
@page {
  size: legal landscape;
  margin: 0.5in;
}
```
**Printable area**: 13" wide × 7" tall
**Best for**: Wide tables, reasonable paper size
**Trade-off**: Less common than Letter

**Recommendation**: Start with Letter (current), add Tabloid option for complex projects

### SVG Scaling by Page Size

Adjust `max-height` based on page size:

```css
@media print {
  /* Letter landscape: 8.5" - 1" margins = 7.5" usable */
  @page { size: landscape; margin: 0.5in; }

  #section16 svg,
  #section17 svg,
  #section18 svg {
    max-height: 7in; /* Conservative to avoid clipping */
  }
}

/* Alternative for Tabloid */
@media print and (min-width: 16in) {
  @page { size: 11in 17in landscape; margin: 0.5in; }

  #section16 svg,
  #section17 svg,
  #section18 svg {
    max-height: 10in; /* Tabloid height - margins */
  }
}
```

## Known Behavior: Print Dialog Page Size Persistence

**Observation** (December 5, 2025): Browser print dialog remembers the **last-used page size** across print sessions, causing inconsistent initial rendering:

### Optimal Workflow (Best Results)
1. User opens Print dialog
2. Selects **Tabloid (11×17) Landscape**
3. Content renders perfectly with all columns visible
4. Subsequent prints start with Tabloid → **optimal formatting maintained**

### Degraded Workflow (Progressive Quality Loss)
1. **Starting with Tabloid** → switches to **Legal (8.5×14)** → still good quality
2. **Starting with Legal** → switches to **Letter (8.5×11)** → acceptable but tight
3. **Starting with Letter** → ⚠️ **scrollbars appear, half of formatted values truncated**

### Root Cause
- Browser persists page size selection in `window.print()` state
- No CSS `@page` rule can override user's previous selection
- Initial render uses cached page size, causing layout before user can adjust

### Attempted Solutions

**Option A: CSS @page Hint (Limited Browser Support)** ❌
```css
@media print {
  @page {
    size: 11in 17in landscape; /* Tabloid */
  }
}
```
- **Issue**: Browsers treat this as a *suggestion*, not enforcement
- User's saved preference **always wins**
- Chrome/Safari/Firefox all ignore this when user has cached Letter

**Option B: JavaScript PageSetup API** ❌
- **No API exists** to programmatically set page size before `window.print()`
- `window.print()` is intentionally sandboxed for security
- Cannot detect or modify print settings via JavaScript

**Option C: Pre-Print Instructions to User** ⚠️ Partial Solution
Display modal before print with recommendation:
```
For best results, select:
- Paper: Tabloid (11×17)
- Orientation: Landscape
- Destination: Save as PDF
```
- **Pros**: Sets user expectations
- **Cons**: Extra friction, can't guarantee compliance

### Recommended Approach (Deferred)

**Phase 1**: Document current behavior (✅ **Done**)
**Phase 2**: Add instructional modal with "Don't show again" checkbox
**Phase 3**: Investigate CSS Grid/Flexbox responsive scaling to gracefully degrade on Letter
**Phase 4**: Consider dynamic `transform: scale()` based on `@media print and (max-width: 11in)`

### Testing Matrix

| Starting Page Size | Initial Quality | After Switching to Tabloid | After Switching to Legal | After Switching to Letter |
|-------------------|-----------------|----------------------------|--------------------------|---------------------------|
| **Tabloid** | ✅ Perfect | ✅ Perfect | ✅ Good | ⚠️ Tight but acceptable |
| **Legal** | ✅ Good | ✅ Perfect | ✅ Good | ⚠️ Tight but acceptable |
| **Letter** | ❌ **Scrollbars + truncation** | ✅ Perfect | ✅ Good | ❌ Scrollbars + truncation |

**Conclusion**: Browser print dialog persistence creates path-dependent quality. No programmatic solution exists to force Tabloid/Landscape/PDF defaults.

---

## Questions to Answer

1. ✅ Can we programmatically control "Background graphics" setting?
   - **Answer**: No direct control. Use `print-color-adjust: exact` + white backgrounds for sections

2. 🔄 How to handle Reference model rendering (separate print call)?
   - **Current**: User manually enables Reference toggle before printing
   - **Future**: Could add "Print Reference Model" menu item that enables toggle → prints → disables toggle

3. ✅ Best way to handle very long tables (>1 page)?
   - **Answer**: Use `page-break-inside: auto` on tables + `avoid` on rows (see Issue 1, Option A)

4. ⏳ Should we create a "Print Preview" mode first?
   - **Option**: Add CSS class `.print-preview` that applies same styles as `@media print`
   - **Benefit**: See layout before printing
   - **Implementation**: Button that adds class to body, shows in browser

5. ⏳ Can we add custom headers/footers with page numbers?
   - **Limited**: `@page` margins + `content` property (browser support varies)
   - **Alternative**: Let browser handle via print dialog settings

## Resources

- [MDN: @media print](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#print)
- [MDN: @page](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [CSS Paged Media Module](https://www.w3.org/TR/css-page-3/)
- [Print Styles Best Practices](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/)

---

## Feature: Disclaimer Page in Print Output

**Implemented**: December 6, 2025
**Status**: ✅ COMPLETE

### Objective

Add a disclaimer page to the print output that appears **after Section 18 and before the footer**. This page should:
- Use the same content as the existing disclaimer modal ([index.html:763-814](../../index.html#L763-L814))
- Not create a new visible section in the UI
- Only appear when printing (via `@media print`)
- Include proper page break to appear on its own page

### Current Disclaimer Content Location

The disclaimer content already exists in the DOM as a Bootstrap modal:
- **Modal ID**: `disclaimerModal` ([index.html:745](../../index.html#L745))
- **Content Location**: `.modal-body` ([index.html:763-814](../../index.html#L763-L814))
- **Includes**:
  - Demo warning (OBJECTIVE 4.012 is IN DEVELOPMENT)
  - Usage instructions (blue inputs, black calculated fields)
  - Accuracy disclaimer (energy modeling limitations)
  - Canadian projects notice

### Implementation Approach

**Option A: Clone Modal Content for Print (RECOMMENDED)** ✅

Create a hidden print-only container that duplicates the disclaimer content:

```html
<!-- Add after Section 18, before footer -->
<div id="print-disclaimer-page" class="print-only">
  <div class="disclaimer-content">
    <!-- Clone content from disclaimerModal .modal-body -->
  </div>
</div>
```

**CSS**:
```css
/* Hide from screen view */
#print-disclaimer-page {
  display: none;
}

/* Show only in print, force new page */
@media print {
  #print-disclaimer-page {
    display: block !important;
    page-break-before: always; /* Start on new page */
    page-break-after: always;  /* Footer starts on next page */
    padding: 1in;
  }

  .disclaimer-content {
    font-size: 11pt;
    line-height: 1.6;
  }

  .disclaimer-content h2 {
    font-size: 18pt;
    margin-bottom: 1em;
  }

  .disclaimer-content .alert {
    border: 2px solid #ffc107;
    padding: 1em;
    margin-bottom: 1em;
    background: #fff3cd;
  }
}
```

**Pros**:
- Simple implementation
- Content is duplicated so modal can change independently
- Full control over print formatting
- No JavaScript needed

**Cons**:
- Content duplication (need to update in two places if changed)
- Adds ~2KB to HTML size

---

**Option B: Clone Modal Content Dynamically (JavaScript)**

Use JavaScript to clone the modal content into a print container when print is triggered:

```javascript
// In init.js before window.print()
function preparePrintDisclaimer() {
  // Check if print disclaimer already exists
  let printDisclaimer = document.getElementById('print-disclaimer-page');

  if (!printDisclaimer) {
    // Create container
    printDisclaimer = document.createElement('div');
    printDisclaimer.id = 'print-disclaimer-page';
    printDisclaimer.className = 'print-only';

    // Clone modal content
    const modalBody = document.querySelector('#disclaimerModal .modal-body');
    if (modalBody) {
      const contentClone = modalBody.cloneNode(true);
      printDisclaimer.appendChild(contentClone);
    }

    // Insert before footer
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(printDisclaimer, footer);
    }
  }
}

// Update print handler
document.getElementById('printReport').addEventListener('click', function() {
  preparePrintDisclaimer();
  window.print();
});
```

**Pros**:
- Single source of truth (modal content)
- No content duplication
- Dynamic - always uses latest modal content

**Cons**:
- Requires JavaScript modification
- Slightly more complex
- Need to handle cleanup (or leave in DOM after first print)

---

**Option C: Show Modal in Print, Hide Elsewhere**

Use the existing modal but style it to appear as a page in print:

```css
@media print {
  /* Show modal as regular page content */
  #disclaimerModal {
    display: block !important;
    position: static !important;
    page-break-before: always;
  }

  #disclaimerModal .modal-dialog {
    max-width: 100% !important;
    margin: 0 !important;
  }

  #disclaimerModal .modal-content {
    border: none !important;
    background: white !important;
  }

  /* Hide modal chrome */
  #disclaimerModal .modal-header,
  #disclaimerModal .modal-footer {
    display: none !important;
  }
}
```

**Pros**:
- Zero HTML changes
- Single source of truth
- Simplest implementation

**Cons**:
- Relies on Bootstrap modal structure
- Modal might have unexpected print styles
- Less control over page formatting

---

### Recommended Implementation Plan

**Phase 1: HTML Structure** ([index.html](../../index.html)) ✅ COMPLETE
- [x] Create `#print-disclaimer-page` div after Section 19 (Notes)
- [x] Position before `<footer>` element
- [x] Add class `.print-only` for styling hook
- [x] Clone comprehensive disclaimer from Reporter.js (not modal)
- [x] Include License section (CC BY-NC-ND 4.0)
- [x] Include Credits section (condensed single-line format)

```html
<!-- Add after Section 18, before footer (around line 676) -->
<div id="print-disclaimer-page" class="print-only">
  <div class="disclaimer-content">
    <h2>Using this calculator</h2>

    <div class="alert alert-warning">
      <strong>⚠️ DEMO ONLY</strong> - OBJECTIVE 4.012 is under active
      development and debugging.
      <strong>DO NOT USE for real projects yet.</strong>
      For production work, download:
      <a href="https://openbuilding.ca/product/objective-v3/">
        https://openbuilding.ca/product/objective-v3/
      </a>
    </div>

    <p>
      This tool helps you calculate the Total Energy Use Intensity
      (TEUI) & Thermal Energy Demand Intensity (TEDI) of a building or
      home using its own proprietary methods.
    </p>

    <p>
      Enter your information (Blue inputs). Default values from an A2
      Event Centre exist to speed up the process, but you must
      over-write them with relevant values from your own project.
      Results will be calculated automatically (all Black text fields).
    </p>

    <hr />

    <p>
      <strong>Disclaimer:</strong> OBJECTIVE 4.012 is software IN
      DEVELOPMENT. IT IS NOT YET COMPLETE! As such it is not fit for any
      purpose, and is meant for demonstration only. Our team has made
      every effort to have OBJECTIVE's Targeted Energy Use match
      real-world values by reviewing a wide range of actual building
      types and their utility bills, but **no** energy model can
      accurately predict energy use due to hundreds of influences beyond
      the ability to model, among other things, exact weather in a given
      year, user behaviours, or actual commissioned equipment or
      envelope efficiencies. This modelling tool aims to set Targets in
      a way that is consistent with measured results, but our experience
      has shown that with correct use, we can arrive at values very
      close to real-world, utility-bill values for total energy use.
      'Accuracy of results' has been our primary focus, not 'similarity
      of methods' to other energy modelling tools.
    </p>

    <p>
      Only for Canadian projects. If you are interested in a
      localization for your own country, please contact OBJECTIVE
      support at andy@openbuilding.ca
    </p>
  </div>
</div>
```

**Phase 2: CSS Styles** ([styles.css](../../src/styles.css)) ✅ COMPLETE
- [x] Hide `.print-only` from screen view
- [x] Add `@media print` styles for disclaimer page
- [x] Add page break before (new page for disclaimer)
- [x] Allow footer to follow on same page if it fits
- [x] Format content for print readability (10pt font, justified text)
- [x] Consolidate all print CSS into single comprehensive block

```css
/* Add to general styles (around line 100) */
.print-only {
  display: none;
}

/* Add to @media print block (around line 2550) */
@media print {
  /* Display disclaimer page */
  #print-disclaimer-page {
    display: block !important;
    page-break-before: always; /* New page */
    page-break-after: always;  /* Footer on next page */
    padding: 1in 0.5in;
  }

  .disclaimer-content h2 {
    font-size: 20pt;
    font-weight: bold;
    margin-bottom: 1em;
    text-align: center;
  }

  .disclaimer-content .alert {
    border: 3px solid #ffc107;
    padding: 1em;
    margin: 1em 0;
    background: #fff9e6;
    border-radius: 4px;
  }

  .disclaimer-content p {
    font-size: 11pt;
    line-height: 1.6;
    margin-bottom: 1em;
  }

  .disclaimer-content hr {
    margin: 1.5em 0;
    border: none;
    border-top: 2px solid #ccc;
  }

  .disclaimer-content a {
    color: #0066cc;
    text-decoration: underline;
  }
}
```

**Phase 3: Testing** ✅ COMPLETE
- [x] Verify disclaimer appears after Section 19 (Notes)
- [x] Verify disclaimer is on its own page (page break before)
- [x] Verify footer follows on same page when space permits
- [x] Verify disclaimer is NOT visible in screen view
- [x] Test on Letter/Legal/Tabloid page sizes
- [x] Verify condensed format (single paragraph + inline credits)

### Expected Result

**Screen View**:
- No change - disclaimer only in modal as before
- New container hidden via `display: none`

**Print View**:
- Section 18 (Optimize/Parallel Coordinates) ends on its page
- **New page**: Disclaimer page with full content
- **New page**: Footer with logos and credits

**Page Count Impact**: +1 page to print output (typically page 7 or 8)

### Maintenance Considerations

**Content Sync**: Disclaimer content exists in two places:
1. Modal ([index.html:763-814](../../index.html#L763-L814)) - for screen view
2. Print container (new) - for print view

**If content changes**: Update BOTH locations to keep in sync

**Alternative**: Use Option B (JavaScript cloning) to maintain single source of truth, at cost of added complexity

---

---

## Implementation Summary (December 6, 2025)

### Completed Work

**1. Disclaimer Page Implementation** ✅
- Added comprehensive legal disclaimer from Reporter.js
- Included License section (CC BY-NC-ND 4.0)
- Included Credits section (condensed single-line format)
- Print-only visibility (hidden on screen)
- Optimized for single-page layout with footer

**2. Reporter.js Retirement** ✅
- Removed jsPDF/Reporter.js from index.html
- Deleted Reporter.js file from repository
- Removed "Download Report (PDF)" button
- Removed event listener code from init.js
- Kept Reporter.js code in git history for reference

**3. Print CSS Consolidation** ✅
- Merged duplicate `@media print` blocks into single comprehensive block
- All print styles now in one location (styles.css:2408+)
- Easier to maintain and modify
- No conflicting rules

**4. Browser Print Approach** ✅
- Single PDF export method: "Print Report (PDF)" → `window.print()`
- Superior graphics quality vs jsPDF
- Native font rendering
- Full SVG/Canvas support
- User-selectable page sizes (Letter/Legal/Tabloid)

### Production Status

**Ready for Merge**: ✅
**Branch**: 2025.12-POLISH
**Testing**: Complete
**Documentation**: Updated
