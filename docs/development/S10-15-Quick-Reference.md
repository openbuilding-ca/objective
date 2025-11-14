# Sections 10-15 Quick Reference Guide

**Date:** 2025-11-14  
**Branch:** dependency3

## At-A-Glance Status

```
┌─────────────────────────────────────────────────────────────────┐
│ SECTION HEALTH DASHBOARD                                        │
├─────────┬──────┬────────┬──────────┬───────┬──────────┬────────┤
│ Section │ Deps │ Labels │ M/N      │ X-Sec │ Status   │ Action │
├─────────┼──────┼────────┼──────────┼───────┼──────────┼────────┤
│ S10     │ ⚠️ 94% │ 26%    │ ✓ Dual   │ 95    │ MINOR    │ FIX 3  │
│ S11     │ ❌ 0%  │ 21%    │ ✓ Dual   │ 151   │ CRITICAL │ DO NOW │
│ S12     │ ✓ 100% │ 55%    │ ✓ Dual   │ 89    │ GOOD     │ POLISH │
│ S13     │ ✓ 100% │ 54%    │ ✓ Dual   │ 76    │ GOOD     │ POLISH │
│ S14     │ ✓ 100% │ 100%   │ ✓ Dual   │ 34    │ GOLD STD │ NONE   │
│ S15     │ ✓ 100% │ 92%    │ ✓ Dual   │ 80    │ EXCELLENT│ 2 FIX  │
└─────────┴──────┴────────┴──────────┴───────┴──────────┴────────┘
```

## Dependency Implementation Patterns

### Pattern 1: INLINE (S10, S12, S13)
```javascript
{
  fieldId: "d_101",
  type: "calculated",
  dependencies: ["d_85", "d_86", "h_15"],  // ← Dependencies here
  label: "Heat Loss Total"
}
```

### Pattern 2: CENTRALIZED (S14, S15)
```javascript
function registerDependencies() {
  ["i_97", "i_98", "i_103"].forEach(dep => 
    sm.registerDependency(dep, "d_127")
  );
}
```

## Critical Issues

### 🚨 Section 11: NO DEPENDENCY MAPPING
- **Impact:** 120 calculated fields won't update reactively
- **Priority:** IMMEDIATE
- **Effort:** 8-12 hours
- **Solution:** Create registerDependencies() function

### ⚠️ Section 10: Missing 3 Dependencies
- **Fields:** i_81, k_79, m_79
- **Priority:** HIGH
- **Effort:** 30 minutes
- **Solution:** Add dependencies: [] to field definitions

## Label Compliance Scores

```
S14: ████████████████████ 100% ✓ GOLD STANDARD
S15: ██████████████████░░  92%
S12: ███████████░░░░░░░░░  55%
S13: ███████████░░░░░░░░░  54%
S10: █████░░░░░░░░░░░░░░░  26%
S11: ████░░░░░░░░░░░░░░░░  21%
```

## Cross-Section Dependency Flow

```
Climate (S02)
    ↓
Envelope (S11) ←─ Occupancy (S07)
    ↓                   ↓
Below-Grade (S12)  Internal Gains (S10)
    ↓                   ↓
Cooling/Vent (S13) ←────┘
    ↓
TEDI/TELI (S14)
    ↓
Summary (S15)
```

## Work Priority Queue

1. **S11** - Add all 120 dependencies (CRITICAL, 8-12h)
2. **S10** - Fix 3 missing deps (HIGH, 30min)
3. **S10-13, S15** - Add labels (MEDIUM, 4-6h)
4. **Docs** - Document patterns (LOW, 1-2h)

## Testing Checklist

After implementing fixes:

- [ ] S11: Verify all 120 calculated fields update on dependency changes
- [ ] S10: Test i_81, k_79, m_79 reactive updates
- [ ] All: Verify Target/Reference mode switching
- [ ] All: Test cross-section dependency chains
- [ ] All: Verify labels appear in UI and are accessible

## Reference Files

- Full audit: `S10-15-Comprehensive-Audit.md`
- Architecture: `Zen-Observations.md`
- Dependency formulas: `FORMULAE-3037.csv` (if available)

---

**Last Updated:** 2025-11-14  
**Next Review:** After S11 dependency completion
