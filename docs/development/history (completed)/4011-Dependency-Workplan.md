# Dependency Graph Integration Work Plan (TEUI v4.011)

This document outlines the steps to integrate an interactive dependency graph visualization into the TEUI Calculator v4.011, based on the structure of `4007-dependency-graph.js`.

**Goal:** Provide a visual representation of how calculator fields depend on each other, aiding understanding and debugging.

## 1. Core Component (`4011-Dependency.js`)

- **Create File:** Create `4011-Dependency.js` in the root directory.
- **Adapt Structure:** Copy the class structure (`DependencyGraph`) and D3.js logic from `4007-dependency-graph.js`.
  - Update namespace to `window.TEUI.DependencyGraph`.
  - Modify initialization logic to integrate with the current application lifecycle.
- **Data Source:** The graph will expect data (nodes and links) from `window.TEUI.StateManager.exportDependencyGraph()`. Define the expected data format:
  - `nodes`: Array of objects, e.g., `{ id: "d_119", group: "Mechanical", type: "editable", ... }`
  - `links`: Array of objects, e.g., `{ source: "d_119", target: "f_119" }`
- **Features:** Retain and adapt features from the 4007 version:
  - D3.js force-directed layout (and potentially hierarchical via Dagre).
  - Node/link rendering with color-coding by group.
  - Filtering (Search box, Group dropdown).
  - Zooming and panning.
  - Node highlighting on hover/click.
  - Info panel displaying node details (value, dependencies, dependents).
- **D3.js Dependency:** Handle D3.js loading (either assume it's included globally via `index.html` or retain the dynamic loading check from 4007). _Decision: Retain dynamic loading for now for simplicity._

## 2. Data Preparation (`4011-StateManager.js`)

- **Add Method:** Implement the `exportDependencyGraph()` method within `StateManager`.
- **Logic:** This method needs to iterate through the internal `this.dependencies` map (which stores `sourceId -> Set<targetId>`).
  - **Nodes:** Generate the `nodes` array. Each node needs an `id`. Infer `group` (e.g., based on section or field prefix) and `type` (using `FieldManager.getField(id).type`).
  - **Links:** Generate the `links` array by iterating through the `this.dependencies` map, creating `{ source: sourceId, target: targetId }` objects for each dependency relationship.
- **Return Value:** The method should return an object `{ nodes: [...], links: [...] }`.

## 3. UI Integration (`index.html`)

- **Script Tag:** Add `<script src="4011-Dependency.js"></script>` towards the end of the `<body>`, after other core scripts like `StateManager` and `FieldManager`.
- **Container:** Add a container `div` inside the `id="dependencyDiagram"` section's `.section-content` div. This div will host the SVG graph (e.g., `<div class="dependency-graph-container" style="height: 600px; width: 100%;"></div>`).

## 4. Initialization (`4011-Dependency.js`)

- Adapt the initialization logic (currently `initializeDependencyGraph` called on `DOMContentLoaded` or tab click in 4007).
- Ensure initialization happens _after_ `StateManager` and `FieldManager` are ready.
- Consider triggering initialization when the "Dependency Diagram" tab (Section 17) becomes visible to avoid unnecessary processing on page load.

## 5. Styling (`4011-styles.css`)

- Add basic CSS rules for the graph controls (filters, buttons), info panel, and potentially link/node styles if needed beyond D3 defaults.

## 6. Cleanup (`4011-SectionIntegrator.js`)

- Remove the outdated comments in section 11 regarding dependency graph implementation plans, as this work plan supersedes them.

## 7. Refinement (Future)

- Improve node grouping logic.
- Enhance info panel details.
  - **(Deferred)** Investigate feasibility of showing calculation formula/logic in info panel.
- Optimize layout performance for large graphs.
- Integrate Sankey diagram logic (separate task).
