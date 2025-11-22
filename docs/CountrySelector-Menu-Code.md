# Country Selector Menu Code (Preserved from Reverted Commit)

**Source**: Commit c0b9860 (before revert to file separation architecture)
**Date**: November 21, 2025
**Status**: Reference only - Not for use with file separation architecture

This code was part of the dynamic country switching approach that we decided to abandon in favor of file separation architecture. However, the **UI component itself is nice** and can be adapted for future use (e.g., linking to separate German site).

---

## HTML Section (Lines 168-210 of index.html)

Insert this in the header controls area:

```html
<!-- Country/Localization Selector -->
<div class="btn-group me-2">
  <button
    type="button"
    class="btn btn-sm btn-outline-primary"
    title="International Localizations In Development"
  >
    🇨🇦 Canada
  </button>
  <button
    type="button"
    class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split"
    data-bs-toggle="dropdown"
    aria-expanded="false"
    title="International Localizations In Development"
  >
    <span class="visually-hidden">Select Country/Language</span>
  </button>
  <ul class="dropdown-menu">
    <li><h6 class="dropdown-header">Select Country & Language</h6></li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault();">
        🇨🇦 Canada (English)
      </a>
    </li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault();">
        🇨🇦 Canada (Français)
      </a>
    </li>
    <li><hr class="dropdown-divider" /></li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault();">
        🇩🇪 Germany (Deutsch)
      </a>
    </li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault();">
        🇩🇪 Germany (English)
      </a>
    </li>
  </ul>
</div>
```

---

## JavaScript Section (Lines 1455-1488 of index.html)

Original code (for localStorage-based switching with page reload):

```javascript
// 🌍 COUNTRY SELECTOR: Ultra-light localStorage-based switcher
const countryDropdown = document.querySelector('.btn-group .dropdown-menu');
const countryButton = document.querySelector('.btn-group button[data-bs-toggle="dropdown"]')?.previousElementSibling;

if (countryDropdown && countryButton) {
  // Add click handlers to dropdown items
  countryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();
      let code = text.includes('Germany') || text.includes('Deutschland') ? 'DE' : 'CA';

      if (code) {
        countryButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        countryButton.disabled = true;
        try {
          localStorage.setItem('TEUI_SELECTED_COUNTRY', code);
          setTimeout(() => window.location.reload(), 100);
        } catch (e) {
          alert('Error switching country: ' + e.message);
          countryButton.disabled = false;
        }
      }
    });
  });

  // Set initial button state from localStorage
  try {
    const saved = localStorage.getItem('TEUI_SELECTED_COUNTRY');
    countryButton.innerHTML = saved === 'DE' ? '🇩🇪 Germany' : '🇨🇦 Canada';
  } catch (e) {
    countryButton.innerHTML = '🇨🇦 Canada';
  }
}
```

---

## Adaptation for File Separation Architecture

Instead of localStorage + reload with same URL, this can be adapted to **link to separate sites**:

```javascript
// 🌍 COUNTRY SELECTOR: Link to separate country sites
const countryDropdown = document.querySelector('.btn-group .dropdown-menu');

if (countryDropdown) {
  // Add click handlers to dropdown items
  countryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();

      // Determine target URL based on selection
      let targetUrl = window.location.origin;

      if (text.includes('Germany') || text.includes('Deutschland')) {
        targetUrl += '/de/';  // Link to German version
      } else if (text.includes('Canada')) {
        targetUrl += '/';  // Link to Canadian version (root)
      }

      // Navigate to target URL
      window.location.href = targetUrl;
    });
  });
}
```

---

## Usage Notes

1. **For Canadian Version** (`index.html`):
   - Button shows: `🇨🇦 Canada`
   - German menu items link to `/de/`

2. **For German Version** (`index-de.html`):
   - Button shows: `🇩🇪 Germany` (or `🇩🇪 Deutschland`)
   - Canadian menu items link to `/`

3. **No State Mixing**: Each version is completely independent
4. **No localStorage**: No shared state, no race conditions
5. **Clean Separation**: Clear URL structure for each market

---

## Bootstrap Dependencies

This component uses Bootstrap 5:
- `btn-group` - Button group container
- `dropdown-toggle` - Dropdown trigger
- `dropdown-menu` - Menu container
- `dropdown-item` - Menu items
- `dropdown-divider` - Visual separator

Already included in current index.html via CDN.
