# Cooling.js Dependencies & StateManager Publication TODO
**Date:** November 14, 2025
**Branch:** dependency3
**Priority:** Medium (architectural improvement for dependency tracking)

## The Issue

Cooling.js is a standalone module (no DOM/FieldDefinitions) that calculates critical values used by other sections (especially S13). However, its internal calculated values are not properly:

1. **Published to StateManager** for downstream consumption
2. **Registered as dependencies** in the dependency graph
3. **Labeled/documented** as nodes in the system

This makes it easy to miss dependencies and creates "invisible" calculation chains that are hard to trace and debug.

## Evidence from Recent Investigation

During the NOV14-COOLFIX investigation, we found several Cooling.js values flagged by ZenMaster as "CHECK-SRC" dependencies (not found in FieldManager):

From Logs.md:
```
⚠️ i_122 (Incoming Cooling Season Ventil. Energy) [type: calculated]
  🔍 CHECK-SRC deps: cooling_latentLoadFactor

⚠️ h_124 (Ventilation Free Cooling/Vent Capacity) [type: calculated]
  🔍 CHECK-SRC deps: cooling_freeCoolingLimit

⚠️ m_124 (Ventilation Free Cooling/Vent Capacity) [type: calculated]
  🔍 CHECK-SRC deps: cooling_daysActiveCooling
```

These are **internal Cooling.js calculated values** that don't exist in StateManager!

## Current Cooling.js Architecture

**What Cooling.js Does:**
- Calculates psychrometric values (wet bulb temp, humidity ratios, latent load factor)
- Calculates free cooling capacity
- Calculates mechanical cooling demand
- Stores intermediate results in internal state objects (TargetState/ReferenceState)

**What Gets Published:**
- Some values ARE published to StateManager via `setFieldValue()` calls
- But many intermediate calculated values stay internal
- No formal dependency registration

**Example Internal Values (not in StateManager):**
- `wetBulbTemperature` - Stored in stateObj, not StateManager
- `latentLoadFactor` - Used by S13 calculations
- `freeCoolingLimit` - Used by S13 calculations
- `daysActiveCooling` - Used by S13 calculations
- `atmPressure` - Atmospheric pressure calculation
- `humidityRatioDifference` - Psychrometric calculation

## Required Actions

### 1. Audit Cooling.js Outputs

**Identify all calculated values that are:**
- Read by other sections (S13, S14, S15, etc.)
- Used in calculation chains
- Need to trigger recalculations when they change

**Questions to answer:**
- Which values are already published to StateManager? ✅
- Which values should be published but aren't? ❌
- Which values are purely internal (don't need publishing)? ⏭️

### 2. Publish Critical Values to StateManager

For each value that needs to be consumed by other sections:

```javascript
// Pattern for Target mode
window.TEUI.StateManager.setValue(
  "cooling_latentLoadFactor",
  stateObj.latentLoadFactor.toString(),
  "calculated"
);

// Pattern for Reference mode
window.TEUI.StateManager.setValue(
  "ref_cooling_latentLoadFactor",
  stateObj.latentLoadFactor.toString(),
  "calculated"
);
```

### 3. Register Dependencies

For each published value, register its dependencies:

```javascript
// Example: latentLoadFactor depends on climate data
sm.registerDependency("l_20", "cooling_latentLoadFactor"); // Night-time temp
sm.registerDependency("l_21", "cooling_latentLoadFactor"); // Cooling season RH
sm.registerDependency("h_24", "cooling_latentLoadFactor"); // Cooling setpoint

// Reference mode pairs
sm.registerDependency("ref_l_20", "ref_cooling_latentLoadFactor");
sm.registerDependency("ref_l_21", "ref_cooling_latentLoadFactor");
sm.registerDependency("ref_h_24", "ref_cooling_latentLoadFactor");
```

### 4. Add Field Definitions (Optional but Recommended)

Create pseudo-field definitions for Cooling.js outputs to make them visible in FieldManager:

```javascript
// In Cooling.js or a separate CoolingFields.js
window.TEUI.CoolingFields = {
  cooling_latentLoadFactor: {
    label: "Latent Load Factor (A6)",
    type: "calculated",
    format: "number-2dp",
    description: "Psychrometric latent load factor for cooling calculations",
    dependencies: ["l_20", "l_21", "h_24"],
  },
  cooling_freeCoolingLimit: {
    label: "Free Cooling Limit (h_124)",
    type: "calculated",
    format: "number-2dp-comma",
    description: "Maximum free cooling capacity from ventilation",
    dependencies: ["m_19", "g_118", "k_120"],
  },
  // ... etc
};
```

### 5. Update Downstream Sections

Sections that consume Cooling.js values need listeners:

**Example for S13:**
```javascript
// Add listeners for Cooling.js outputs
sm.addListener("cooling_latentLoadFactor", calculateAll);
sm.addListener("ref_cooling_latentLoadFactor", calculateAll);
sm.addListener("cooling_freeCoolingLimit", calculateAll);
sm.addListener("ref_cooling_freeCoolingLimit", calculateAll);
```

## Benefits

1. **Visibility:** All calculation chains visible in dependency graph
2. **Debugging:** Easier to trace where values come from
3. **Convergence:** Proper listener chains ensure calculations converge
4. **Documentation:** Self-documenting system via field definitions
5. **Tooling:** ZenMaster and other tools can trace complete dependency chains

## Pattern for Other Standalone Modules

This same pattern should be applied to any other standalone calculation modules:
- ✅ All outputs consumed by other sections MUST be published to StateManager
- ✅ All dependencies MUST be registered
- ✅ Both Target and Reference modes MUST be handled (unprefixed + ref_ prefixed)
- ✅ Field definitions SHOULD be created for documentation

## ✅ AUDIT COMPLETE (Nov 14, 2025)

### Current State: Already Implemented!

Cooling.js **already publishes** its critical calculated values to StateManager:

#### Published Values (via updateStateManagerStage1):
- ✅ `cooling_h_124` / `ref_cooling_h_124` - Free Cooling Capacity (kWh/yr)
- ✅ `cooling_latentLoadFactor` / `ref_cooling_latentLoadFactor` - Latent Load Factor
- ✅ `cooling_wetBulbTemperature` / `ref_cooling_wetBulbTemperature` - Wet Bulb Temp (°C)

#### Published Values (via updateStateManagerStage2):
- ✅ `cooling_m_124` / `ref_cooling_m_124` - Days Active Cooling
- ✅ `cooling_d_124` / `ref_cooling_d_124` - Free Cooling Percentage

#### Section 13 Integration:
- ✅ Field dependencies declared (lines 1503, 1574, 1592)
- ✅ Listeners registered (lines 2411-2416)
- ✅ Both Target and Reference modes handled

### Remaining Work

**NOT needed:**
- ~~Publish values to StateManager~~ - Already done ✅
- ~~Add listeners to S13~~ - Already done ✅
- ~~Handle dual-engine modes~~ - Already done ✅

**Future Enhancement (Low Priority):**
Consider creating formal field definitions in a `CoolingFields.js` file for:
- Better documentation
- IDE autocomplete support
- Consistent formatting rules
- Integration with FieldManager tools

This is **optional** - the current implementation works correctly.

### Verification

Code locations verified:
- **Cooling.js lines 714-800:** StateManager publication functions
- **Cooling.js lines 599, 673:** Publication calls in Stage 1 & 2
- **Section13.js lines 1503, 1574, 1592:** Field dependency declarations
- **Section13.js lines 2411-2416:** Listener registrations

**Status:** ✅ COMPLETE - No action required. System already properly architected.

---

## Related Documents
- [WET-BULB-CONVERGENCE-INVESTIGATION.md](WET-BULB-CONVERGENCE-INVESTIGATION.md) - Investigation that revealed this issue
- [NOV-12-IMPORT-EXPORT-FIX.md](NOV-12-IMPORT-EXPORT-FIX.md) - Pattern examples for dual-engine state management
