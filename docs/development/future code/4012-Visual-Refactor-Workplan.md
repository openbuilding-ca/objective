# TEUI Calculator 4.012 - Layout Modernization Workplan

## 1. Goal

To refactor the TEUI Calculator's front-end rendering logic to replace the current HTML `<table>`-based layout with a more modern and flexible layout system using `<div>` elements styled with CSS Grid or Flexbox.

**Primary Objectives:**

- Improve visual layout flexibility and control, addressing limitations encountered with table layouts (e.g., complex alignments, column spanning inconsistencies).
- Achieve a cleaner separation between data structure (JavaScript) and visual presentation (CSS).
- Enhance maintainability of layout-related code.
- Maintain compatibility with the existing JavaScript data structures (`sectionRows`), StateManager logic, calculation engine, and the core principle of mapping `fieldId` prefixes (e.g., `d_`) to logical data columns (e.g., `D`).
- Adhere to the project's constraints: vanilla JavaScript, no external UI frameworks (React, Vue, etc.), low bandwidth.

## 2. Scope

This workplan outlines an exploration, potentially starting with key sections (e.g., Section 01, Section 02) to prove the concept before applying it globally. The final output would be a parallel `4012` version or a decision to integrate into the main branch.

## 3. Key Refactoring Steps

### 3.1. `FieldManager.generateSectionContent` Modification

- **Current:** Generates `<table>`, `<tbody>`, `<tr>`, `<td>` elements.
- **Proposed (`4012`):**
  - Modify the function to generate `<div>` elements instead.
  - Each section row defined in `sectionRows` becomes a parent `div` (e.g., `<div class="section-row" data-id="B.1">...</div>`).
  - Each cell definition within a row becomes a child `div` (e.g., `<div class="section-cell col-c" data-field-id="c_12">...</div>`).
  - Retain essential data attributes (`data-id` for rows, `data-field-id`, `data-dropdown-id`, etc., for cells) on the generated `div` elements.
  - Map logical column letters (`a` through `n`) to CSS classes on the cell divs (e.g., `col-a`, `col-b`, ... `col-n`) to allow grid/flex targeting.
  - Implement `colspan` functionality using CSS Grid's `grid-column: span X;` property applied to the relevant cell div.

### 3.2. CSS Refactoring (`4012-styles.css` or adapted `4011-styles.css`)

- **Current:** Relies heavily on `table`, `tr`, `td` selectors and table-specific properties (`border-collapse`, `table-layout`).
- **Proposed (`4012`):**
  - Define a primary layout using CSS Grid (preferred for grid-like structures) or Flexbox for the main content area within each section.
  - **Grid Approach:**
    - Define grid columns (e.g., `grid-template-columns: repeat(14, auto);` or specific widths for columns A-N).
    - Use `grid-column` property on cell divs (e.g., `.col-c { grid-column: 3; }`, `.col-d { grid-column: 4; }`, etc.) to place them correctly.
    - Use `grid-column: span X;` for cells requiring `colspan`.
  - **Flexbox Approach (Alternative):**
    - Each row div (`.section-row`) would be a flex container (`display: flex`).
    - Cell divs (`.section-cell`) would be flex items. Control widths using `flex-basis`, `flex-grow`, `flex-shrink`. Less intuitive for strict grid alignment.
  - Adapt existing styling rules (colors, fonts, padding, borders) to target `div` elements and use Grid/Flexbox alignment properties (`align-items`, `justify-content`, `text-align` where appropriate) instead of table-specific ones.
  - Re-evaluate and potentially simplify alignment rules (like the `text-align: right !important` overrides) as Grid/Flexbox offers more direct control.
  - Ensure responsiveness is handled effectively using media queries with the new layout system.

### 3.3. Handling Specific UI Elements

- Ensure interactive elements (dropdowns (`<select>`), sliders (`<input type="range">`), editable content (`contenteditable` divs or `<input>`)) render and function correctly within the new `div`-based structure and Grid/Flexbox context.
- Adjust CSS for focus states, hover effects, etc., to work with the new elements/layout.

## 4. Testing and Validation

- Start by refactoring `generateSectionContent` and the CSS for one or two representative sections (e.g., Section 02 which has various element types, Section 01 for Key Values).
- Verify correct visual rendering against the `TEUI v3.037-VISUAL-STYLE.pdf` and the current `4011` version.
- Confirm data binding and StateManager interactions are unaffected.
- Test calculations that depend on fields within the refactored sections.
- Test responsiveness across different screen sizes.
- Validate `colspan` rendering.

## 5. Potential Challenges

- **CSS Complexity:** Defining and managing the Grid/Flexbox layout might require more complex CSS initially compared to basic table styles.
- **Specificity Conflicts:** During a gradual transition (if decided), CSS rules for tables and divs might conflict.
- **Cross-Browser Consistency:** While Grid/Flexbox are well-supported, minor inconsistencies might need addressing.
- **Performance:** Ensure the new rendering approach doesn't introduce performance regressions, although `div`-based layouts are generally considered performant.

## 6. Outcome

This exploration should result in:

- A working prototype of at least one section using the modernized layout.
- A clearer understanding of the effort and benefits involved.
- A decision on whether to proceed with fully refactoring to the `4012` layout system.
