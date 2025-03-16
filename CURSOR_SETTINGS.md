# Adding Cursor MCP to Cursor Settings

This guide will walk you through the process of adding the Cursor MCP (Model Context Protocol) to your Cursor IDE settings.

## Prerequisites

- Cursor IDE installed on your system
- Cursor MCP extension installed in your browser (see INSTALL.md)

## Adding MCP to Cursor Settings

### Method 1: Using the Cursor Settings UI

1. Open Cursor IDE
2. Go to Settings (gear icon in the bottom left corner)
3. Navigate to the "Extensions" or "MCPs" section
4. Click "Add MCP"
5. Enter the following information:
   - Name: `Cursor MCP`
   - URL: `https://path-to-your-hosted-cursor-config.json` or local file path
   - Click "Add"

### Method 2: Manually Editing Cursor Settings

1. Open Cursor IDE
2. Go to Settings (gear icon in the bottom left corner)
3. Click "Open Settings (JSON)" to open the settings file
4. Add the following to your settings JSON:

```json
{
  "mcps": [
    {
      "name": "Cursor MCP",
      "configUrl": "path-to-your-cursor-config.json"
    }
  ]
}
```

5. Save the settings file

### Method 3: Using Local Files

If you're using a local installation of the MCP:

1. Install the Cursor MCP extension in your browser (see INSTALL.md)
2. Copy the `cursor-config.json` file to a location accessible by Cursor
3. In Cursor settings, add the MCP using the local file path to the config file

## Verifying the Installation

To verify that the MCP is properly integrated with Cursor:

1. Open Cursor IDE
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Type "MCP" and look for Cursor MCP commands
4. You should see commands like "Get Console Logs", "Take Screenshot", etc.

## Configuring the MCP

Once installed, you can configure the MCP through Cursor settings:

1. Go to Settings > Extensions > Cursor MCP
2. You'll see the following options:
   - **Log Limit**: Maximum number of logs to store per tab
   - **Capture Console**: Enable/disable console log capture
   - **Capture Network**: Enable/disable network request capture
   - **Auto Capture**: Automatically include MCP context when sending to LLM

## Using the MCP with Cursor

The MCP provides several functions that you can use in Cursor:

1. **In the Command Palette**:
   - Type "MCP" to see available commands

2. **In JavaScript/TypeScript files**:
   ```javascript
   // Get console logs
   const logs = await window.cursor.mcp.getConsoleLogs();
   
   // Take a screenshot
   const screenshot = await window.cursor.mcp.takeScreenshot();
   
   // Get all context
   const context = await window.cursor.mcp.getAllContext();
   ```

3. **Auto-capture with LLMs**:
   - If you enable the "Auto Capture" setting, the MCP will automatically include browser context when sending to LLMs

## Troubleshooting

If you encounter issues with the MCP in Cursor:

1. **MCP not appearing in settings**: Make sure the config URL is correct and accessible
2. **Commands not available**: Restart Cursor after adding the MCP
3. **Functions not working**: Check that the browser extension is installed and running
4. **Settings not saving**: Check Cursor's logs for any errors

## Updating the MCP

To update the MCP:

1. Update the browser extension (see INSTALL.md)
2. If the config file has changed, update it in Cursor settings