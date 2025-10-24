# Installation Guide

## Prerequisites

Make sure you have:
- Your 3 icon files (icon16.png, icon48.png, icon128.png)
- Chrome, Firefox, Edge, or Brave browser
- All Quippy project files in one folder

## Step-by-Step Installation

### Step 1: Prepare Icons

1. Create an `assets` folder inside your `quippy` folder
2. Place your 3 PNG icon files inside:
```
   quippy/
   └── assets/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
```

### Step 2: Update manifest.json

Make sure your `manifest.json` has the correct icon paths:
```json
"icons": {
  "16": "assets/icon16.png",
  "48": "assets/icon48.png",
  "128": "assets/icon128.png"
}
```

### Step 3: Install in Browser

#### Chrome/Edge/Brave
1. Open your browser
2. Type in address bar: `chrome://extensions/`
3. Toggle ON "Developer mode" (top-right corner)
4. Click "Load unpacked" button
5. Navigate to and select your `quippy` folder
6. Extension should now appear in your extensions list!

#### Firefox
1. Open Firefox
2. Type in address bar: `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to your `quippy` folder
5. Select the `manifest.json` file
6. Extension should now be loaded!

### Step 4: Test

1. Go to any website (try google.com)
2. Select some text like "20 g"
3. Press **Ctrl+Q** (Windows/Linux) or **Cmd+Q** (Mac)
4. Quippy should appear!

## Troubleshooting

### "Error loading extension"
- Check that all files are in the quippy folder
- Verify manifest.json has no syntax errors
- Make sure icon files exist at the paths specified

### Ctrl+Q doesn't work
- Reload the webpage
- Check if another application uses this shortcut
- Try closing and reopening the browser

### Widget appears broken
- Clear browser cache
- Disable/re-enable the extension
- Check browser console (F12) for errors

## Updating the Extension

When you make changes to any file:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your Quippy extension
3. Reload the webpage you're testing on

## Need More Help?

Check README.md for full documentation and features.