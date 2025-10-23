# OBJECTIVE TEUI Calculator

**Simple Energy and Carbon Modelling for Canadian Buildings**

OBJECTIVE is a web-based Total Energy Use Intensity (TEUI) and Thermal Energy Demand Intensity (TEDI) calculator designed for early-stage building design in Canada.

🌐 **Live Demo:** [objective.openbuilding.ca](https://objective.openbuilding.ca)

---

## Overview

OBJECTIVE helps architects and engineers:
- Calculate TEUI and TEDI for building designs
- Compare target designs against code reference models
- Model energy performance across Canadian climate zones
- Export results for code compliance documentation

### Key Features

- **Dual-State Architecture** - Calculate both Target and Reference models simultaneously
- **18 Calculation Sections** - From climate data to mechanical loads
- **Canadian Climate Data** - Built-in data for cities across Canada
- **Import/Export** - Save and share calculations via Excel or CSV
- **Interactive Visualizations** - Sankey diagrams and dependency graphs
- **OBC Matrix Tool** - Ontario Building Code compliance matrix (included)

---

## Quick Start

### Online Use

Visit [objective.openbuilding.ca](https://objective.openbuilding.ca) to use the calculator immediately - no installation required.

### Local Development

```bash
# Clone the repository
git clone https://github.com/openbuilding-ca/objective.git
cd objective

# Open in browser
open index.html
```

Or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# Then visit http://localhost:8000
```

---

## Documentation

- **[Technical Documentation](docs/TECHNICAL.md)** - Architecture, calculations, and development guide
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[License](LICENSE)** - CC BY-NC-ND 4.0

---

## Project Status

**Current Version:** 4.012 (Beta)

⚠️ **This is beta software** - OBJECTIVE 4.012 is under active development. For production work, please download the stable v3 release from [openbuilding.ca](https://openbuilding.ca/product/objective-v3/).

---

## Architecture

OBJECTIVE is built with vanilla JavaScript and runs entirely in the browser:

```
objective/
├── index.html              # Main calculator
├── src/
│   ├── core/              # State management, calculations
│   ├── sections/          # 18 calculator sections
│   ├── assets/            # Images, icons
│   ├── data/              # Climate data, reference values
│   └── obc/               # OBC Matrix tool
└── docs/                  # Technical documentation
```

Key architectural features:
- **No build step necessary** - Direct HTML/JS/CSS
- **Pure functional calculations** - Tuple-based dual-state logic
- **Modular sections** - Each section is independent
- **Local state persistence** - Browser localStorage

See [docs/TECHNICAL.md](docs/TECHNICAL.md) for detailed architecture information.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Testing guidelines
- Pull request process

---

## License

**Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International**
(CC BY-NC-ND 4.0)

© OpenBuilding, Inc., 2025

This work is licensed for **non-commercial use only**. See [LICENSE](LICENSE) for full terms.

Supported by the Ontario Association of Architects (OAA).

---

## Credits

**Created by:** Andy Thomson, OpenBuilding, Inc., OAA

**Contributors:** Mark H Pavlidis

**Mentors & Advisors:**
- Dr. Ted Kesik, P.Eng
- Evelyne Bouchard, OAQ, CPHD

**Peer Review:**
- INVISIJ Architects
- Tandem Architecture
- Pamela DeMelo, P.Eng.
- Stephen Pope, OAA, FRAIC

---

## Disclaimer

OpenBuilding, including its directors, advisors, and volunteers, makes no guarantees and assumes no legal responsibility for the accuracy, completeness, or usefulness of this tool.

**Use at Your Own Risk**

This tool is designed to assist with evaluating energy and carbon targets during early-stage design only. It is not a substitute for professional engineering or architectural services. Always consult a licensed professional before using this tool to inform decisions.

Energy simulation cannot guarantee that a finished building will meet proposed targets due to factors beyond software control, including user behavior, construction methods, site conditions, and climate variability.

See [LICENSE](LICENSE) for complete disclaimer.

---

## Contact

- **Website:** [openbuilding.ca](https://openbuilding.ca)
- **Issues:** [GitHub Issues](https://github.com/openbuilding-ca/objective/issues)
- **Email:** Contact via [openbuilding.ca](https://openbuilding.ca)

---

**Made with 🩸😅😢 in Canada 🇨🇦**
