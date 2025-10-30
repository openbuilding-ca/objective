# TEUI 4.011 Sankey Diagram Implementation (Section 16)

## Overview

The Sankey diagram in Section 16 successfully visualizes energy flows and emissions throughout the building, sourcing data directly from the TEUI StateManager. The diagram uses D3.js to create an interactive, animated visualization that illustrates relationships between energy inputs, the building, and energy outputs including losses and emissions.

## Key Features

### Interactive Visualization

- **Animated Energy Flows**: Links animate with a flowing effect from left to right
- **Interactive Tooltips**: Hovering over nodes and links displays detailed information
- **Fullscreen Mode**: Toggle between embedded and fullscreen views
- **Width Controls**: Adjustable node width via slider
- **Energy Balance/Sankey Toggle**: Switch between compact and expanded modes
- **Emissions Toggle**: Show or hide emissions flows in the diagram

### Data Integration

- **StateManager Sourcing**: All energy values pulled directly from TEUI StateManager
- **Isolated Emissions Calculations**: Dedicated emissions calculations from Section 7 (DHW/SHW emissions) and Section 13 (Space Heating emissions)
- **Dynamic Updates**: Manual refresh button triggers data updates from StateManager

### Visual Enhancements

- **Color-Coded Links**: Different types of energy flows use distinct colors
  - Regular energy flows in blue/teal
  - Gas exhaust in red
  - Scope 1 emissions (direct, from oil/gas) in red/brown
  - Scope 2 emissions (indirect, from electricity) in blue
- **Physically Accurate Emissions Flow**: Emissions from oil/gas combustion flow through the building node before reaching Scope 1 emissions node
- **Modern UI**: Consistent button styling with icons and text
- **Responsive Layout**: Adapts to different viewing sizes

## Technical Implementation

### Architecture

- **TEUI_SankeyDiagram Class**: Encapsulates all D3 Sankey functionality
- **Data Processing Pipeline**:
  1. Fetch values from StateManager using field IDs from 3037DOM.csv
  2. Convert data to D3 Sankey-compatible format with proper node/link references
  3. Apply diagram-specific calculations and transformations
  4. Render using D3 Sankey layout algorithm
- **Animation System**: Uses SVG dasharray/dashoffset techniques for flowing effect

### Core Methods

- **`render()`**: Main rendering function that handles all aspects of the visualization
- **`updateEmissionsFlows()`**: Adds/removes emissions-related nodes and links
- **`getLinkColor()`**: Determines link colors based on type and flow
- **`createNodeTooltip()`/`createLinkTooltip()`**: Generate detailed tooltips
- **`buildSankeyDataFromStateManager()`**: Constructs diagram data from TEUI state

### D3.js Integration

- Uses D3.js Sankey layout algorithm with customized parameters
- Custom node positioning and coloring
- Link styling with gradient effects
- Animation sequencing with easing functions

## Important Implementation Details

### Emissions Handling

- Emissions data sourced from dedicated calculation fields:
  - Section 7: `k_49` for DHW/SHW emissions
  - Section 13: `f_114` for Space Heating emissions
  - Other emissions calculated from electricity use with grid intensity factor
- Scope 1 emissions (direct, from on-site fuel combustion) are colored red/brown
- Scope 2 emissions (indirect, from electricity) are colored blue
- Physical flow accuracy: emissions from gas/oil combustion flow through Building node

### Reference Stability

- D3 Sankey requires stable object references between updates
- Careful handling of node/link references using helper methods:
  - `convertToIndices()`: Converts object references to indices
  - `convertToObjects()`: Converts indices to object references
  - `validateNodeReferences()`: Ensures consistency in references

### Performance Considerations

- Rendering triggered manually via "Refresh Sankey" button
- Maximum node width cap (300%) prevents layout issues
- Animation system optimized for smooth transitions
- Careful handling of style vs. attr properties in D3

## Future Enhancement Opportunities

- Automated updates using StateManager listeners for key values
- Additional visualization options (color schemes, alternative layouts)
- Additional data layers (cost information, carbon intensity indicators)
- Performance optimizations for smoother animations and transitions

---

This document summarizes the final implementation of the Sankey diagram in Section 16 of the TEUI 4.011 Calculator. The diagram provides an intuitive visualization of energy flows and emissions, helping users understand the relationships between different building systems and energy pathways.
