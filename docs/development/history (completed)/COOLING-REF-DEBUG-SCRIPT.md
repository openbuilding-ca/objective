// Paste into browser console to diagnose Reference mode cooling issues
console.log("\n=== REFERENCE MODE COOLING DIAGNOSTIC ===\n");

const sm = window.TEUI?.StateManager;
const s03 = window.TEUI?.SectionModules?.sect03;
const s08 = window.TEUI?.SectionModules?.sect08;
const s11 = window.TEUI?.SectionModules?.sect11;
const s13 = window.TEUI?.SectionModules?.sect13;
const cooling = window.TEUI?.CoolingCalculations;

if (!sm) console.error("❌ StateManager not found!");
if (!s03) console.error("❌ S03 module not found!");
if (!s08) console.error("❌ S08 module not found!");
if (!s11) console.error("❌ S11 module not found!");
if (!s13) console.error("❌ S13 module not found!");
if (!cooling) console.error("❌ Cooling module not found!");

console.log("\n🎯 MODE MANAGER STATUS\n");
console.log(`S03 ModeManager.currentMode: ${s03?.ModeManager?.currentMode}`);
console.log(`S08 ModeManager.currentMode: ${s08?.ModeManager?.currentMode}`);
console.log(`Global reference mode active: ${document.body.classList.contains('reference-mode')}`);

console.log("\n🔬 CAPACITANCE DATA FLOW SNAPSHOT\n");
console.log("ref_h_21 (capacitance toggle):", sm?.getValue("ref_h_21"));
console.log("ref_i_21 (capacitance %):", sm?.getValue("ref_i_21"));
console.log("ref_h_22 (Ground-Facing CDD - S03 output):", sm?.getValue("ref_h_22"));
console.log("ref_k_94 (S11 ground heat gain):", sm?.getValue("ref_k_94"));
console.log("ref_k_95 (S11 ground cooling gain):", sm?.getValue("ref_k_95"));
console.log("\nNOW CHANGE THE CAPACITANCE SLIDER AND RUN AGAIN TO SEE IF THESE VALUES UPDATE");

console.log("\n📊 PART 1: CAPACITANCE (h_21) DATA FLOW\n");
const h_21_target = sm?.getValue("h_21");
const h_21_ref = sm?.getValue("ref_h_21");
const h_21_s03_target = s03?.TargetState?.getValue("h_21");
const h_21_s03_ref = s03?.ReferenceState?.getValue("h_21");
const h_22_target = sm?.getValue("h_22");
const h_22_ref = sm?.getValue("ref_h_22");
const i_21_target = sm?.getValue("i_21");
const i_21_ref = sm?.getValue("ref_i_21");

console.log(`Target h_21:              ${h_21_target} (StateManager)`);
console.log(`Reference h_21:           ${h_21_ref} (StateManager)`);
console.log(`Target h_21:              ${h_21_s03_target} (S03.TargetState)`);
console.log(`Reference h_21:           ${h_21_s03_ref} (S03.ReferenceState)`);
console.log(`Target h_22:              ${h_22_target} CDD`);
console.log(`Reference h_22:           ${h_22_ref} CDD`);
console.log(`Target i_21:              ${i_21_target}%`);
console.log(`Reference i_21:           ${i_21_ref}%`);

const k_94_target = sm?.getValue("k_94");
const k_94_ref = sm?.getValue("ref_k_94");
const k_95_target = sm?.getValue("k_95");
const k_95_ref = sm?.getValue("ref_k_95");

console.log(`Target k_94:              ${k_94_target} kWh (Ground heat gain)`);
console.log(`Reference k_94:           ${k_94_ref} kWh (Ground heat gain)`);
console.log(`Target k_95:              ${k_95_target} kWh (Ground cooling gain)`);
console.log(`Reference k_95:           ${k_95_ref} kWh (Ground cooling gain)`);

console.log("\n📊 PART 2: INDOOR RH% (i_59) DATA FLOW\n");
const i_59_target = sm?.getValue("i_59");
const i_59_ref = sm?.getValue("ref_i_59");
const i_59_s08_target = s08?.TargetState?.getValue("i_59");
const i_59_s08_ref = s08?.ReferenceState?.getValue("i_59");

console.log(`Target i_59:              ${i_59_target}% (StateManager)`);
console.log(`Reference i_59:           ${i_59_ref}% (StateManager)`);
console.log(`Target i_59:              ${i_59_s08_target}% (S08.TargetState)`);
console.log(`Reference i_59:           ${i_59_s08_ref}% (S08.ReferenceState)`);

const latent_target = sm?.getValue("cooling_latentLoadFactor");
const latent_ref = sm?.getValue("ref_cooling_latentLoadFactor");

console.log(`Target latent load:       ${latent_target} (factor)`);
console.log(`Reference latent load:    ${latent_ref} (factor)`);

console.log("\n📊 PART 3: FINAL COOLING OUTPUTS\n");
const d_129_target = sm?.getValue("d_129");
const d_129_ref = sm?.getValue("ref_d_129");
const m_129_target = sm?.getValue("m_129");
const m_129_ref = sm?.getValue("ref_m_129");
const d_117_target = sm?.getValue("d_117");
const d_117_ref = sm?.getValue("ref_d_117");

console.log(`Target d_129:             ${d_129_target} kWh (Unmitigated)`);
console.log(`Reference d_129:          ${d_129_ref} kWh (Unmitigated)`);
console.log(`Target m_129:             ${m_129_target} kWh (Mitigated)`);
console.log(`Reference m_129:          ${m_129_ref} kWh (Mitigated)`);
console.log(`Target d_117:             ${d_117_target} kWh (Cooling load)`);
console.log(`Reference d_117:          ${d_117_ref} kWh (Cooling load)`);

console.log("\n🔍 DIAGNOSTIC SUMMARY\n");
if (h_21_ref === null || h_21_ref === undefined) {
console.log("❌ ISSUE: ref_h_21 not in StateManager");
}
if (i_21_ref === null || i_21_ref === undefined) {
console.log("❌ ISSUE: ref_i_21 not in StateManager");
}
if (i_59_ref === null || i_59_ref === undefined) {
console.log("❌ ISSUE: ref_i_59 not in StateManager");
}
if (latent_ref === latent_target && i_59_ref !== i_59_target) {
console.log("❌ ISSUE: Different RH% but identical latent load");
}

console.log("\n=== END DIAGNOSTIC ===\n");
