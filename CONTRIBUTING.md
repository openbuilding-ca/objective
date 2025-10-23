# Contributing to OBJECTIVE

Thank you for your interest in contributing to OBJECTIVE! This document provides guidelines and information for contributors.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or identity.

### Expected Behavior

- Be respectful and professional
- Provide constructive feedback
- Focus on what is best for the project and community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discrimination, or inappropriate comments
- Trolling or insulting/derogatory comments
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate in a professional setting

## How to Contribute

### Reporting Issues

**Found a bug?**
1. Check [existing issues](https://github.com/openbuilding-ca/objective/issues) to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs. actual behavior
   - Screenshots if applicable
   - Browser and OS information

**Have a feature request?**
1. Check existing issues first
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered

### Submitting Changes

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/objective.git
   cd objective
   git remote add upstream https://github.com/openbuilding-ca/objective.git
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the coding standards below
   - Test your changes thoroughly
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add new calculation for..."
   # or
   git commit -m "fix: Resolve issue with..."
   ```

   Commit message format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a PR on GitHub with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots/videos if applicable

## Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local web server (optional but recommended)

### Running Locally

```bash
# Option 1: Direct file access
open index.html

# Option 2: Python server
python -m http.server 8000

# Option 3: Node.js server
npx serve

# Then visit http://localhost:8000
```

### Project Structure

```
objective/
├── index.html              # Main calculator entry point
├── src/
│   ├── core/              # Core managers and utilities
│   │   ├── StateManager.js      # State management
│   │   ├── Calculator.js        # Calculation engine
│   │   ├── FieldManager.js      # UI field management
│   │   └── ...
│   ├── sections/          # Calculator sections (S01-S18)
│   │   ├── Section01.js         # Key Values
│   │   ├── Section03.js         # Climate Calculations
│   │   └── ...
│   ├── assets/            # Images, icons
│   ├── data/              # Climate data, reference values
│   └── obc/               # OBC Matrix tool
└── docs/                  # Documentation
```

## Coding Standards

### JavaScript

- **No build tools** - Write browser-compatible ES5/ES6
- **IIFE pattern** - Wrap modules in immediately-invoked function expressions
- **Functional style** - Prefer pure functions over stateful objects
- **Clear naming** - Use descriptive variable and function names
- **Comments** - Document complex logic and calculation formulas

Example:
```javascript
(function () {
  'use strict';

  // Calculate heat loss through building envelope
  function calculateHeatLoss(area, rValue, hdd) {
    // Formula: Q = (A × HDD × 24) / (RSI × 1000)
    return (area * hdd * 24) / (rValue * 1000);
  }

  // Expose to global namespace
  window.TEUI = window.TEUI || {};
  window.TEUI.calculateHeatLoss = calculateHeatLoss;
})();
```

### HTML/CSS

- **Semantic HTML** - Use appropriate HTML5 elements
- **Bootstrap 5** - Use existing Bootstrap classes when possible
- **Responsive design** - Test on mobile and desktop
- **Accessibility** - Include proper ARIA labels and alt text

### File Naming

- **Core files:** `DescriptiveName.js` (e.g., `StateManager.js`)
- **Section files:** `Section##.js` (e.g., `Section03.js`)
- **No version prefixes** - Don't use `4011-` or `4012-` prefixes

## Testing

### Manual Testing

Before submitting a PR, test:

1. **Calculations** - Verify math is correct
   - Compare with Excel reference files in `src/data/`
   - Test edge cases (zero values, negatives, very large numbers)

2. **UI/UX** - Check user interface
   - All buttons and inputs work
   - Responsive design on mobile
   - No console errors

3. **Browser Compatibility**
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **State Management**
   - Values persist after page reload
   - Import/export works correctly
   - Reference mode toggle works

### Test Checklist

- [ ] Calculations produce expected results
- [ ] No JavaScript errors in console
- [ ] UI is responsive on mobile
- [ ] State persists across page reloads
- [ ] Import/Export functions work
- [ ] Works in Chrome, Firefox, and Safari
- [ ] Documentation is updated

## License

By contributing to OBJECTIVE, you agree that your contributions will be licensed under the same CC BY-NC-ND 4.0 license that covers the project.

**Important:** This is a non-commercial project. Contributions cannot be used for commercial purposes without explicit permission from OpenBuilding, Inc.

## Questions?

- **Technical questions:** Open a [GitHub issue](https://github.com/openbuilding-ca/objective/issues)
- **Security issues:** Contact us privately via [openbuilding.ca](https://openbuilding.ca)
- **General inquiries:** Visit [openbuilding.ca](https://openbuilding.ca)

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Future project documentation

Thank you for helping make OBJECTIVE better! 🙏
