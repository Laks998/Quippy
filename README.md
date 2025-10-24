# Quippy Widget 🚀

A smart browser extension that helps you quickly convert units, look up meanings, calculate, and more - all triggered with **Ctrl+Q**!

## Features

- 🔢 **Weight Conversion** - Convert between kg, g, lbs, oz, and more
- 📏 **Length Conversion** - Convert between meters, feet, inches, km, etc.
- 💲 **Currency Conversion** - Convert between USD, EUR, GBP, INR, etc.
- 🕐 **Timezone Conversion** - Convert times between timezones
- 🧮 **Calculator** - Quick calculations
- 🔤 **Word Meanings** - Look up definitions
- 🎨 **Design Tools** - Color conversions, sizing tools
- 💻 **Digital Conversions** - File sizes, data units
- 💊 **Health Conversions** - Medical units and measurements

## Installation

### For Chrome/Edge/Brave

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `quippy` folder
6. Done! Press **Ctrl+Q** to open Quippy

### For Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from your quippy folder
4. Done! Press **Ctrl+Q** to open Quippy

## Usage

1. **Press Ctrl+Q** anywhere in your browser to open Quippy
2. **Select text** on any webpage
3. Quippy automatically detects what you want to do
4. Choose a function or use suggestions
5. Get your result instantly!

## File Structure
```
quippy/
├── assets/            # Icons folder
├── manifest.json      # Extension configuration
├── index.html         # Widget UI structure
├── style.css          # Widget styling & animations
├── index.js           # Function detection & processing
├── widget.js          # Widget control & interactions
├── background.js      # Background service worker
└── package.json       # Project metadata
```

## Customization

### Change Colors
Edit `style.css` and replace `#FFD93D` with your preferred color.

### Change Keyboard Shortcut
Edit `manifest.json`:
```json
"suggested_key": {
    "default": "Ctrl+Shift+Q"
}
```

### Add New Functions
Edit `index.js` to add new conversion types and detection patterns.

## Troubleshooting

**Widget doesn't open:**
- Make sure extension is enabled
- Try reloading the page
- Check if Ctrl+Q conflicts with other software

**Conversions not working:**
- Check browser console (F12) for errors
- Make sure text format matches expected patterns

## License

MIT License - feel free to use and modify!

---

**Enjoy using Quippy! Press Ctrl+Q to boost productivity! 🚀**