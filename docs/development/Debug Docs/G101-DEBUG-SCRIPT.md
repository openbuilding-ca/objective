// ============================================================================
// S12 g_101 REFERENCE CALCULATION DIAGNOSTIC
// ============================================================================
// Excel formula: =(SUMPRODUCT(G85:G93,H85:H93)/SUM(H85:H93))\*(D97+1)
// Where: G = U-values (W/m²K), H = Areas (m²), D97 = TB% penalty
// ============================================================================

console.log("\n=== S12 g_101 REFERENCE DIAGNOSTIC ===\n");

// Get S11 module (where U-values and TB% come from)
const s11 = window.TEUI && window.TEUI.SectionModules && window.TEUI.SectionModules.sect11;
if (!s11) {
console.error("❌ S11 module not found!");
} else {
console.log("✅ S11 module found");
}

// Component rows for air-facing surfaces (85-93)
const components = [
{ row: 85, name: "Roof" },
{ row: 86, name: "Walls Above Grade" },
{ row: 87, name: "Floor Exposed" },
{ row: 88, name: "Doors" },
{ row: 89, name: "Windows North" },
{ row: 90, name: "Windows East" },
{ row: 91, name: "Windows South" },
{ row: 92, name: "Windows West" },
{ row: 93, name: "Skylights" }
];

console.log("\n📊 REFERENCE U-VALUES (Column G from S11):\n");
console.log("Row | Component | ref_g_XX | Source");
console.log("----|------------------------|----------|------------------");

const uValues = [];
components.forEach(function(comp) {
const row = comp.row;
const name = comp.name;
const fieldId = "g\_" + row;

// Try S11 ReferenceState first (sovereign state)
let uValue = null;
let source = "N/A";

if (s11 && s11.ReferenceState && s11.ReferenceState.getValue) {
const stateValue = s11.ReferenceState.getValue(fieldId);
if (stateValue !== null && stateValue !== undefined) {
uValue = parseFloat(stateValue);
source = "S11.ReferenceState";
}
}

// Fallback to StateManager (what S12 might be using)
if (uValue === null || isNaN(uValue)) {
const smValue = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue("ref*" + fieldId);
if (smValue !== null && smValue !== undefined) {
uValue = parseFloat(smValue);
source = "StateManager(ref*)";
}
}

// Last resort: unprefixed (would be WRONG for Reference)
if (uValue === null || isNaN(uValue)) {
const targetValue = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue(fieldId);
if (targetValue !== null && targetValue !== undefined) {
uValue = parseFloat(targetValue);
source = "WARNING Target(unprefixed)";
}
}

uValues.push(uValue || 0);
const rowStr = row.toString().padStart(3, " ");
const nameStr = name.padEnd(22, " ");
const valStr = (uValue || 0).toFixed(3).padStart(8, " ");
console.log(rowStr + " | " + nameStr + " | " + valStr + " | " + source);
});

console.log("\n📐 AREAS (Column H - % of Total Surface from S11):\n");
console.log("Row | Component | ref_d_XX | Source");
console.log("----|------------------------|----------|------------------");

const areas = [];
components.forEach(function(comp) {
const row = comp.row;
const name = comp.name;
const fieldId = "d\_" + row;

// Check StateManager for Reference area
let area = null;
let source = "N/A";

const refArea = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue("ref*" + fieldId);
if (refArea !== null && refArea !== undefined) {
area = parseFloat(refArea);
source = "StateManager(ref*)";
}

// Fallback to unprefixed
if (area === null || isNaN(area)) {
const targetArea = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue(fieldId);
if (targetArea !== null && targetArea !== undefined) {
area = parseFloat(targetArea);
source = "StateManager(unprefixed)";
}
}

areas.push(area || 0);
const rowStr = row.toString().padStart(3, " ");
const nameStr = name.padEnd(22, " ");
const areaStr = (area || 0).toFixed(2).padStart(8, " ");
console.log(rowStr + " | " + nameStr + " | " + areaStr + " | " + source);
});

console.log("\n🔧 THERMAL BRIDGE PENALTY (D97):\n");

// Check TB% from S11 Reference state
let tbPercent = null;
let tbSource = "N/A";

if (s11 && s11.ReferenceState && s11.ReferenceState.getValue) {
const stateValue = s11.ReferenceState.getValue("d_97");
if (stateValue !== null && stateValue !== undefined) {
tbPercent = parseFloat(stateValue);
tbSource = "S11.ReferenceState";
}
}

if (tbPercent === null || isNaN(tbPercent)) {
const smValue = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue("ref*d_97");
if (smValue !== null && smValue !== undefined) {
tbPercent = parseFloat(smValue);
tbSource = "StateManager(ref*)";
}
}

if (tbPercent === null || isNaN(tbPercent)) {
const targetValue = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue("d_97");
if (targetValue !== null && targetValue !== undefined) {
tbPercent = parseFloat(targetValue);
tbSource = "WARNING Target(unprefixed)";
}
}

console.log("TB% (d_97): " + tbPercent + "% | Source: " + tbSource);

console.log("\n🧮 CALCULATION BREAKDOWN:\n");

// Calculate SUMPRODUCT(G85:G93, H85:H93)
let sumProduct = 0;
for (let i = 0; i < components.length; i++) {
const product = uValues[i] \* areas[i];
sumProduct += product;
const compName = components[i].name.padEnd(22, " ");
const uStr = uValues[i].toFixed(3);
const aStr = areas[i].toFixed(2).padStart(8, " ");
const pStr = product.toFixed(2).padStart(10, " ");
console.log(" " + compName + ": " + uStr + " × " + aStr + " = " + pStr);
}

// Calculate SUM(H85:H93)
let sumAreas = 0;
for (let i = 0; i < areas.length; i++) {
sumAreas += areas[i];
}

// Calculate weighted average
const weightedAvg = sumAreas > 0 ? sumProduct / sumAreas : 0;

// Apply TB% penalty: (D97 + 1) where D97 is percentage as whole number
const tbFactor = 1 + (tbPercent || 0) / 100;
const g101_calculated = weightedAvg \* tbFactor;

console.log("\n SUMPRODUCT(G85:G93, H85:H93) = " + sumProduct.toFixed(2));
console.log(" SUM(H85:H93) = " + sumAreas.toFixed(2));
console.log(" Weighted Average = " + weightedAvg.toFixed(6));
console.log(" TB Factor (1 + " + tbPercent + "%/100) = " + tbFactor.toFixed(2));
console.log(" \n ✨ CALCULATED g_101 = " + g101_calculated.toFixed(6) + " W/m²K");

console.log("\n📋 COMPARISON:\n");

// Get what S12 actually shows
const s12_ref_g101 = window.TEUI && window.TEUI.StateManager && window.TEUI.StateManager.getValue("ref_g_101");
const s12_elem = document.querySelector('[data-field-id="g_101"]');
const s12_display = s12_elem ? s12_elem.textContent : 'N/A';

console.log(" Expected (Excel): 0.572 W/m²K");
console.log(" Our Calculation: " + g101_calculated.toFixed(3) + " W/m²K");
console.log(" S12 StateManager: " + (s12_ref_g101 ? parseFloat(s12_ref_g101).toFixed(3) : 'N/A') + " W/m²K");
console.log(" S12 DOM Display: " + s12_display);

// Diagnosis
console.log("\n🔍 DIAGNOSIS:\n");
if (Math.abs(g101_calculated - 0.572) < 0.001) {
console.log(" ✅ Calculation matches Excel! Issue may be in display/storage.");
} else if (s12_ref_g101 && Math.abs(parseFloat(s12_ref_g101) - 0.572) < 0.001) {
console.log(" ✅ StateManager value is correct! Issue is in our diagnostic calculation.");
} else {
console.log(" ❌ Values don't match Excel (0.572)");
console.log(" \n Possible causes:");
let hasZeroU = false;
let hasZeroA = false;
for (let i = 0; i < uValues.length; i++) {
if (uValues[i] === 0) hasZeroU = true;
}
for (let i = 0; i < areas.length; i++) {
if (areas[i] === 0) hasZeroA = true;
}
if (hasZeroU) {
console.log(" • Some U-values are 0 (check S11 Reference state)");
}
if (hasZeroA) {
console.log(" • Some areas are 0 (check S10 area publishing)");
}
if (tbPercent !== 50) {
console.log(" • TB% is " + tbPercent + "% (expected 50% for Reference)");
}
}

console.log("\n=== END DIAGNOSTIC ===\n");
