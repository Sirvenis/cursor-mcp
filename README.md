# Cursor MCP (Model Context Protocol)

A browser extension that provides enhanced debugging and context gathering capabilities for Cursor IDE. This extension allows you to capture console logs, network requests, screenshots, and selected DOM elements from web pages.

## Features

- **Console Logging**: Capture and view all console logs and errors
- **Network Monitoring**: Track successful and failed network requests
- **Screenshot Capture**: Take screenshots of the current tab
- **DOM Element Selection**: Get details about selected elements on the page
- **Log Management**: Clear logs when needed
- **Cursor Integration**: Seamlessly integrate with Cursor IDE settings

## Functions

The MCP provides the following functions:

1. **GetConsoleLogs**: Retrieve all console logs from the current tab
2. **GetConsoleErrors**: Retrieve all console errors from the current tab
3. **GetNetworkErrorLogs**: Retrieve logs of failed network requests
4. **GetNetworkSuccessLogs**: Retrieve logs of successful network requests
5. **TakeScreenshot**: Capture a screenshot of the current tab
6. **GetSelectedElements**: Get information about elements selected on the page
7. **WipeLogs**: Clear all stored logs

## Installation

### Browser Extension

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `cursor-mcp` directory
5. The extension should now be installed and visible in your browser toolbar

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Adding to Cursor Settings

To add the MCP to Cursor IDE settings:

1. Open Cursor IDE
2. Go to Settings (gear icon in the bottom left corner)
3. Navigate to the "Extensions" or "MCPs" section
4. Click "Add MCP"
5. Enter the MCP information and click "Add"

See [CURSOR_SETTINGS.md](CURSOR_SETTINGS.md) for detailed instructions on adding the MCP to Cursor settings.

## Usage

### Browser Extension

1. Click on the Cursor MCP icon in your browser toolbar to open the popup
2. Use the tabs to navigate between different functions:
   - **Console**: View console logs and errors
   - **Network**: View network request logs
   - **Tools**: Take screenshots and get selected elements

### Cursor IDE Integration

Once added to Cursor settings, you can use the MCP directly from Cursor:

```javascript
// Get console logs
const logs = await window.cursor.mcp.getConsoleLogs();

// Take a screenshot
const screenshot = await window.cursor.mcp.takeScreenshot();

// Get all context
const context = await window.cursor.mcp.getAllContext();
```

## Configuration

The MCP can be configured through Cursor settings:

- **Log Limit**: Maximum number of logs to store per tab
- **Capture Console**: Enable/disable console log capture
- **Capture Network**: Enable/disable network request capture
- **Auto Capture**: Automatically include MCP context when sending to LLM

## Development

### Project Structure

```
cursor-mcp/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── api.js
│   ├── background.js
│   ├── content.js
│   ├── cursor-integration.js
│   ├── popup.html
│   ├── popup.js
│   └── settings-integration.js
├── test/
│   └── test-page.html
├── API.md
├── CURSOR_SETTINGS.md
├── INSTALL.md
├── README.md
├── cursor-config.json
└── manifest.json
```

### Building and Testing

1. Make changes to the source code
2. Reload the extension in Chrome by clicking the refresh icon on the extension card
3. Test the functionality in different web pages
4. Use the test page at `test/test-page.html` to verify functionality

## Documentation

- [API.md](API.md) - Detailed API documentation
- [INSTALL.md](INSTALL.md) - Installation instructions
- [CURSOR_SETTINGS.md](CURSOR_SETTINGS.md) - Instructions for adding to Cursor settings

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.