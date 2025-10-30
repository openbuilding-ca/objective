## QC Report 10/27/2025

**Summary**: 1246 violations detected
**Types**: MIRROR_TARGET_DIVERGENCE(560), HIGH_TRAFFIC_STALE_VALUE(220), CRITICAL_STALE_VALUE(15), NORMAL_STALE_VALUE(414), UPSTREAM_STALE_VALUE(26), FALLBACK_READ(11)
**Sections**: All Sections
**Status**: QC monitoring active, Mirror Target enabled

### Violation Categories:
- **unknown (unknown category)**: 571 violations
- **💤 Normal Stale (low priority)**: 414 violations
- **⚠️ High Traffic Stale (calculation issues)**: 224 violations
- **📤 Upstream Stale (normal for input fields)**: 26 violations
- **🔥 Critical Integration Stale (affects data flow)**: 11 violations

### All Violations (1246 total):

#### 🔥 **CRITICAL STALE VALUE** (15 violations)
- **[S04]** `f_32`, `j_32`, `ref_f_32`, `ref_j_32` - Check calculation chain
- **[S02]** `ref_h_136`, `ref_d_144`, `h_136`, `d_144` - Check calculation chain
- **[S01]** `h_10`, `e_10`, `k_10` - Check calculation chain
- **[UNK]** `m_121` - Monitor calculation performance
- **[S02]** `d_117`, `h_130` - Monitor calculation performance
- **[S11]** `i_80` - Monitor calculation performance

#### ⚠️ **HIGH TRAFFIC STALE VALUE** (220 violations)
- **[S02]** `d_113`, `ref_h_124`, `ref_d_114`, `ref_h_115`, `ref_d_117`, `ref_d_129`, `ref_h_120`, `ref_d_122`, `ref_d_123`, `h_119`, `d_120`, `h_120`, `d_121`, `d_122`, `d_123`, `d_129`, `h_124`, `d_124`, `h_113`, `d_114`, `ref_d_136`, `d_135`, `d_136`, `d_115`, `h_115`, `d_116`, `ref_d_127`, `d_127`, `h_127`, `d_128`, `h_128`, `h_129`, `d_130`, `d_131`, `h_131`, `d_132`, `h_132` - Monitor calculation performance
- **[S01]** `h_27`, `k_27`, `h_28`, `k_28`, `h_29`, `k_29`, `h_30`, `k_30`, `h_31`, `k_31`, `k_32`, `h_33`, `h_34`, `ref_k_32`, `ref_k_98`, `ref_k_97`, `k_85`, `k_86`, `k_87`, `k_88`, `k_89`, `k_90`, `k_91`, `k_92`, `k_93`, `k_94`, `k_95`, `k_79`, `ref_k_73`, `ref_k_74`, `ref_k_75`, `ref_k_76`, `ref_k_77`, `ref_k_78`, `ref_k_79`, `k_97`, `k_98`, `h_22`, `ref_h_24`, `ref_h_22`, `ref_k_64`, `ref_h_70`, `ref_k_71`, `k_64`, `h_70`, `k_71` - Monitor calculation performance
- **[S04]** `f_27`, `g_27`, `f_28`, `g_28`, `f_29`, `g_29`, `f_30`, `g_30`, `j_30`, `f_31`, `g_31`, `j_31`, `g_32`, `d_33`, `d_34`, `f_34`, `j_34`, `d_35`, `f_35`, `d_38`, `g_38`, `ref_d_38`, `ref_g_38` - Monitor calculation performance
- **[S03]** `j_27`, `l_27`, `j_28`, `j_29`, `d_22`, `ref_d_22` - Monitor calculation performance
- **[UNK]** `ref_cooling_h_124`, `ref_m_129`, `ref_m_121`, `f_120`, `cooling_h_124`, `cooling_latentLoadFactor`, `m_124`, `m_129`, `d_40`, `d_41`, `l_39`, `l_40`, `l_41`, `n_39`, `n_40`, `n_41`, `m_38`, `ref_d_40`, `i_10`, `j_10`, `m_10`, `j_19`, `k_103`, `k_104`, `ref_j_19` - Monitor calculation performance
- **[S13]** `ref_f_115`, `f_119`, `j_116`, `l_116`, `l_114`, `f_117`, `j_117`, `m_116`, `m_117`, `j_113`, `j_114`, `l_113`, `f_115`, `l_115`, `m_115`, `f_114` - Monitor calculation performance
- **[S14]** `i_121`, `i_122` - Monitor calculation performance
- **[S05]** `i_39`, `i_38`, `i_40`, `ref_i_39`, `ref_i_40` - Monitor calculation performance
- **[SYS]** `j_8`, `m_8` - Monitor calculation performance
- **[S11]** `ref_i_98`, `ref_i_97`, `g_85`, `f_85`, `i_85`, `g_86`, `f_86`, `i_86`, `g_87`, `f_87`, `i_87`, `g_88`, `f_88`, `i_88`, `g_89`, `f_89`, `i_89`, `g_90`, `f_90`, `i_90`, `g_91`, `f_91`, `i_91`, `g_92`, `f_92`, `i_92`, `g_93`, `f_93`, `i_93`, `g_94`, `f_94`, `i_94`, `g_95`, `f_95`, `i_95`, `i_97`, `d_88`, `d_93`, `ref_i_80`, `d_98`, `i_98` - Monitor calculation performance
- **[S10]** `ref_i_73`, `ref_i_74`, `ref_i_75`, `ref_i_76`, `ref_i_77`, `ref_i_78`, `ref_i_79`, `ref_i_71`, `i_71` - Monitor calculation performance
- **[S12]** `i_103`, `i_104` - Monitor calculation performance
- **[S09]** `ref_i_63`, `ref_d_65`, `ref_d_67`, `i_63`, `d_65`, `d_67` - Monitor calculation performance

#### 🎯 **MIRROR TARGET DIVERGENCE** (560 violations)
- **[S03]** `d_20`: Reference vs Target divergence (4 instances)
- **[S11]** `d_85`: Reference vs Target divergence (56 instances)
- **[S11]** `d_86`: Reference vs Target divergence (56 instances)
- **[S11]** `d_89`: Reference vs Target divergence (92 instances)
- **[S11]** `d_90`: Reference vs Target divergence (92 instances)
- **[S11]** `d_91`: Reference vs Target divergence (92 instances)
- **[S11]** `d_92`: Reference vs Target divergence (92 instances)
- **[S11]** `d_95`: Reference vs Target divergence (56 instances)
- **[S03]** `d_21`: Reference vs Target divergence (4 instances)
- **[S03]** `d_23`: Reference vs Target divergence (4 instances)
- **[S03]** `d_24`: Reference vs Target divergence (4 instances)
- **[S12]** `i_103`: Reference vs Target divergence (2 instances)
- **[S12]** `i_101`: Reference vs Target divergence (2 instances)
- **[S12]** `i_104`: Reference vs Target divergence (2 instances)
- **[S09]** `d_63`: Reference vs Target divergence (2 instances)

#### 📤 **UPSTREAM STALE VALUE** (26 violations)
- **[S03]** `d_20`, `d_21`, `d_23`, `d_24`, `ref_d_20`, `ref_d_21`, `ref_d_23`, `ref_d_24`
- **[S11]** `ref_d_85`, `ref_d_86`, `ref_d_89`, `ref_d_90`, `ref_d_91`, `ref_d_92`, `ref_d_95`, `d_89`, `d_90`, `d_91` ... and 4 more
- **[S01]** `h_23`, `h_24`, `ref_h_23`
- **[S09]** `ref_d_63`

#### 💤 **NORMAL STALE VALUE** (414 violations)
- **[S01]** `ref_h_27`, `ref_k_27`, `ref_h_28`, `ref_k_28`, `ref_h_29`, `ref_k_29`, `ref_h_30`, `ref_k_30`, `ref_h_31`, `ref_k_31` ... and 79 more
- **[S04]** `ref_f_27`, `ref_g_27`, `ref_f_28`, `ref_g_28`, `ref_f_29`, `ref_g_29`, `ref_f_30`, `ref_g_30`, `ref_j_30`, `ref_f_31` ... and 9 more
- **[S03]** `ref_j_27`, `ref_l_27`, `ref_j_28`, `ref_j_29`, `l_22`, `m_24`, `ref_m_24`, `ref_l_22`
- **[S13]** `ref_f_119`, `ref_j_113`, `ref_j_114`, `ref_l_113`, `ref_l_115`, `ref_m_115`, `ref_f_114`, `ref_j_116`, `ref_l_116`, `ref_l_114` ... and 8 more
- **[S02]** `ref_h_119`, `ref_d_124`, `ref_h_113`, `ref_d_115`, `ref_d_120`, `ref_d_121`, `ref_d_135`, `ref_h_135`, `ref_d_137`, `ref_d_138` ... and 38 more
- **[UNK]** `ref_cooling_latentLoadFactor`, `ref_cooling_wetBulbTemperature`, `ref_cooling_atmosphericPressure`, `ref_cooling_partialPressure`, `ref_cooling_humidityRatio`, `ref_m_124`, `ref_f_120`, `ref_incoming`, `ref_recovered`, `cooling_wetBulbTemperature` ... and 117 more
- **[S14]** `ref_i_121`, `ref_i_122`
- **[S15]** `ref_l_137`, `ref_l_138`, `ref_l_139`, `l_137`, `l_138`, `l_139`
- **[S05]** `ref_i_41`, `ref_i_38`
- **[S11]** `ref_d_98`, `ref_i_85`, `ref_i_86`, `ref_i_87`, `ref_i_88`, `ref_i_89`, `ref_i_90`, `ref_i_91`, `ref_i_92`, `ref_i_93` ... and 41 more
- **[S10]** `m_73`, `i_73`, `m_74`, `i_74`, `m_75`, `i_75`, `m_76`, `i_76`, `m_77`, `i_77` ... and 17 more
- **[S12]** `i_101`
- **[S09]** `ref_i_64`, `ref_i_65`, `ref_i_66`, `ref_i_67`, `ref_i_69`, `ref_d_64`, `i_64`, `i_65`, `i_66`, `i_67` ... and 6 more

#### 🔍 **FALLBACK READ** (11 violations)
- **[S01]** `ref_e_51`, `ref_k_54`, `k_96`
- **[S09]** `ref_d_60`, `ref_j_63`, `j_63`
- **[UNK]** `ref_cooling_m_124`, `cooling_m_124`
- **[S11]** `i_96`, `g_96`, `f_96`
