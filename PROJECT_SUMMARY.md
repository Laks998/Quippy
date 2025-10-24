# Quippy Widget - Project Summary

## Overview

Quippy is a browser extension that provides quick text utilities triggered by Ctrl+Q.

## Architecture

### Core Components

1. **manifest.json** - Extension configuration and permissions
2. **background.js** - Handles keyboard shortcuts
3. **index.js** - Function detection and processing logic
4. **widget.js** - Widget UI control and interactions
5. **index.html** - Widget structure
6. **style.css** - Styling and animations

### How It Works
```
User presses Ctrl+Q
↓
background.js catches command
↓
Sends message to index.js
↓
widget.js toggles widget visibility
↓
User selects text
↓
index.js detects function type
↓
Displays appropriate UI
↓
Processes conversion/calculation
↓
Shows result
```

## Key Features

### Smart Detection
The `detectFunction()` method in index.js uses regex patterns to identify:
- Weight units (kg, g, lbs, etc.)
- Length units (m, cm, ft, etc.)
- Currency symbols ($, €, £, etc.)
- Time formats
- Mathematical expressions
- Plain text (for word meanings)

### Function Processing
Each function type has its own conversion logic:
- Weight/Length: Factor-based conversion
- Currency: Exchange rate calculation
- Calculator: Safe eval() with validation
- Meaning: API integration point

### UI States
- **Initial**: Welcome screen with popular functions
- **Active**: Text selected, function dropdown, suggestions, results

## File Responsibilities

| File | Purpose |
|------|---------|
| manifest.json | Extension metadata, permissions, shortcuts |
| background.js | Service worker, keyboard listener |
| index.js | Function detection, conversions, suggestions |
| widget.js | Widget lifecycle, DOM manipulation, events |
| index.html | Widget UI structure |
| style.css | Styling, animations, responsive design |

## Future Enhancements

- Real-time API integrations
- Conversion history
- User preferences
- More function types
- Keyboard navigation