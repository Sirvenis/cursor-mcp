# Cursor MCP Installation Guide

This guide will walk you through the process of installing and setting up the Cursor MCP (Model Context Protocol) extension.

## Prerequisites

- Google Chrome or Microsoft Edge browser (version 88 or later)
- Cursor IDE installed on your system

## Installation Steps

### 1. Download the Extension

First, download the Cursor MCP extension:

1. Clone the repository or download the source code:
   ```
   git clone https://github.com/Sirvenis/cursor-mcp.git
   ```

2. Alternatively, you can download the ZIP file from the GitHub repository and extract it to a folder on your computer.

### 2. Install the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click "Load unpacked" button that appears
4. Select the `cursor-mcp` directory that you cloned or extracted
5. The extension should now be installed and visible in your browser toolbar

### 3. Install the Extension in Edge

1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" by toggling the switch in the left sidebar
3. Click "Load unpacked" button that appears
4. Select the `cursor-mcp` directory that you cloned or extracted
5. The extension should now be installed and visible in your browser toolbar

## Verifying the Installation

To verify that the extension is installed correctly:

1. Look for the Cursor MCP icon in your browser toolbar
2. Click on the icon to open the popup
3. You should see tabs for Console, Network, and Tools
4. Navigate to a website and check if logs are being captured

## Adding to Cursor Settings

After installing the browser extension, you need to add the MCP to Cursor IDE settings:

1. See [CURSOR_SETTINGS.md](CURSOR_SETTINGS.md) for detailed instructions on adding the MCP to Cursor settings

## Troubleshooting

### Extension Not Loading

If the extension fails to load:

1. Make sure you have enabled Developer mode in your browser
2. Check that you selected the correct directory (it should contain the `manifest.json` file)
3. Look for any error messages in the browser's extension page
4. Try restarting your browser

### Permissions Issues

If you see permissions-related errors:

1. Make sure you've granted all necessary permissions when prompted
2. You may need to manually enable permissions in the extension settings
3. For some websites, you might need to click the extension icon and grant site-specific permissions

### Extension Not Capturing Logs

If the extension is not capturing logs:

1. Make sure the extension is enabled
2. Check that you're on a supported website (not a browser internal page like chrome:// or edge://)
3. Try refreshing the page
4. Check the extension settings to ensure logging is enabled

## Updating the Extension

To update the extension to a newer version:

1. Pull the latest changes from the repository:
   ```
   git pull origin main
   ```

2. Or download the latest ZIP file and extract it

3. Go to your browser's extensions page
4. Find the Cursor MCP extension
5. Click the refresh/reload icon or remove and reinstall the extension

## Uninstalling the Extension

To uninstall the extension:

1. Go to your browser's extensions page
2. Find the Cursor MCP extension
3. Click "Remove" or the trash icon
4. Confirm the removal when prompted

## Building from Source

If you want to modify the extension or build it from source:

1. Make your changes to the source code
2. No build step is required for basic changes
3. For more complex changes, you may need to set up a development environment with Node.js
4. After making changes, reload the extension in your browser

## Additional Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Microsoft Edge Extensions Documentation](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Cursor IDE Documentation](https://cursor.sh/docs)