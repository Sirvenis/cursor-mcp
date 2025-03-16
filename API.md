# Cursor MCP API Documentation

This document provides detailed information about the Cursor MCP (Model Context Protocol) API, which allows you to capture browser context for use in Cursor IDE.

## API Overview

The Cursor MCP API provides the following core functions:

1. `getConsoleLogs()` - Retrieve console logs
2. `getConsoleErrors()` - Retrieve console errors
3. `getNetworkSuccessLogs()` - Retrieve successful network requests
4. `getNetworkErrorLogs()` - Retrieve failed network requests
5. `takeScreenshot()` - Capture a screenshot
6. `getSelectedElements()` - Get information about selected DOM elements
7. `wipeLogs()` - Clear stored logs

## Detailed API Reference

### Console Logs

#### getConsoleLogs()

Retrieves all console logs from the current tab.

```javascript
const logs = await window.cursor.mcp.getConsoleLogs();
```

**Returns**: `Promise<Array>` - Array of console log objects with the following properties:
- `level` (string): Log level ('info', 'log', 'debug', etc.)
- `message` (string): Log message
- `timestamp` (number): Unix timestamp when the log was captured
- `source` (string): Source of the log (e.g., 'console', 'javascript')

**Example Response**:
```json
[
  {
    "level": "info",
    "message": "Application initialized",
    "timestamp": 1742157149061,
    "source": "console"
  },
  {
    "level": "log",
    "message": "User logged in: john.doe",
    "timestamp": 1742157150123,
    "source": "javascript"
  }
]
```

#### getConsoleErrors()

Retrieves all console errors from the current tab.

```javascript
const errors = await window.cursor.mcp.getConsoleErrors();
```

**Returns**: `Promise<Array>` - Array of console error objects with the following properties:
- `level` (string): Error level ('error', 'warn')
- `message` (string): Error message
- `timestamp` (number): Unix timestamp when the error was captured
- `source` (string): Source of the error
- `stack` (string, optional): Error stack trace if available

**Example Response**:
```json
[
  {
    "level": "error",
    "message": "Uncaught TypeError: Cannot read property 'value' of undefined",
    "timestamp": 1742157152456,
    "source": "javascript",
    "stack": "TypeError: Cannot read property 'value' of undefined\n    at processForm (app.js:42)\n    at submitButton.addEventListener (app.js:27)"
  }
]
```

### Network Logs

#### getNetworkSuccessLogs()

Retrieves logs of successful network requests from the current tab.

```javascript
const logs = await window.cursor.mcp.getNetworkSuccessLogs();
```

**Returns**: `Promise<Array>` - Array of successful network request objects with the following properties:
- `url` (string): Request URL
- `method` (string): HTTP method (GET, POST, etc.)
- `status` (number): HTTP status code
- `timestamp` (number): Unix timestamp when the request was completed
- `requestHeaders` (object, optional): Request headers if enabled in settings
- `responseHeaders` (object, optional): Response headers if enabled in settings
- `requestBody` (string, optional): Request body if available
- `responseBody` (string, optional): Response body if available and not too large

**Example Response**:
```json
[
  {
    "url": "https://api.example.com/users",
    "method": "GET",
    "status": 200,
    "timestamp": 1742157165531
  },
  {
    "url": "https://api.example.com/data",
    "method": "POST",
    "status": 201,
    "timestamp": 1742157168235
  }
]
```

#### getNetworkErrorLogs()

Retrieves logs of failed network requests from the current tab.

```javascript
const logs = await window.cursor.mcp.getNetworkErrorLogs();
```

**Returns**: `Promise<Array>` - Array of failed network request objects with the following properties:
- `url` (string): Request URL
- `method` (string): HTTP method (GET, POST, etc.)
- `status` (number): HTTP status code (4xx or 5xx)
- `timestamp` (number): Unix timestamp when the request failed
- `error` (string): Error message
- `requestHeaders` (object, optional): Request headers if enabled in settings
- `responseHeaders` (object, optional): Response headers if enabled in settings

**Example Response**:
```json
[
  {
    "url": "https://api.example.com/missing",
    "method": "GET",
    "status": 404,
    "timestamp": 1742157170123,
    "error": "Not Found"
  },
  {
    "url": "https://api.example.com/server-error",
    "method": "POST",
    "status": 500,
    "timestamp": 1742157175456,
    "error": "Internal Server Error"
  }
]
```

### Screenshots

#### takeScreenshot()

Captures a screenshot of the current tab.

```javascript
const screenshot = await window.cursor.mcp.takeScreenshot();
```

**Returns**: `Promise<string>` - Screenshot as a data URL (base64-encoded PNG)

**Example Response**:
```
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
```

### DOM Elements

#### getSelectedElements()

Gets information about elements selected on the page.

```javascript
const elements = await window.cursor.mcp.getSelectedElements();
```

**Returns**: `Promise<Array>` - Array of selected element objects with the following properties:
- `tagName` (string): HTML tag name
- `id` (string, optional): Element ID if available
- `className` (string, optional): Element class names
- `attributes` (object): Map of element attributes
- `textContent` (string, optional): Text content if available
- `xpath` (string): XPath to the element
- `cssSelector` (string): CSS selector to uniquely identify the element

**Example Response**:
```json
[
  {
    "tagName": "button",
    "id": "submit-btn",
    "className": "btn btn-primary",
    "attributes": {
      "type": "submit",
      "disabled": "false"
    },
    "textContent": "Submit",
    "xpath": "/html/body/div/form/button",
    "cssSelector": "#submit-btn"
  }
]
```

### Log Management

#### wipeLogs([currentTabOnly])

Clears stored logs.

```javascript
const success = await window.cursor.mcp.wipeLogs(true);
```

**Parameters**:
- `currentTabOnly` (boolean, optional): Whether to clear logs only for the current tab. Defaults to `true`.

**Returns**: `Promise<boolean>` - Success status

### Helper Methods

#### getAllContext()

Gets all context data for sending to LLMs.

```javascript
const context = await window.cursor.mcp.getAllContext();
```

**Returns**: `Promise<Object>` - Object containing all context data:
- `timestamp` (string): ISO timestamp
- `consoleLogs` (array, optional): Console logs if enabled
- `consoleErrors` (array, optional): Console errors if enabled
- `networkSuccessLogs` (array, optional): Successful network requests if enabled
- `networkErrorLogs` (array, optional): Failed network requests if enabled
- `selectedElements` (array): Selected elements

### Settings Management

#### getSettings()

Gets the current MCP settings.

```javascript
const settings = await window.cursor.mcp.getSettings();
```

**Returns**: `Object` - Current settings object:
- `logLimit` (number): Maximum number of logs to store per tab
- `captureConsole` (boolean): Whether to capture console logs
- `captureNetwork` (boolean): Whether to capture network requests
- `autoCapture` (boolean): Whether to automatically capture context when sending to LLM

#### updateSettings(settings)

Updates MCP settings.

```javascript
const updatedSettings = await window.cursor.mcp.updateSettings({
  logLimit: 100,
  autoCapture: true
});
```

**Parameters**:
- `settings` (object): Settings to update

**Returns**: `Promise<Object>` - Updated settings object

## Command Palette Integration

The MCP registers the following commands with Cursor's Command Palette:

1. `cursor-mcp.getConsoleLogs` - Get console logs
2. `cursor-mcp.getConsoleErrors` - Get console errors
3. `cursor-mcp.getNetworkSuccessLogs` - Get network success logs
4. `cursor-mcp.getNetworkErrorLogs` - Get network error logs
5. `cursor-mcp.takeScreenshot` - Take screenshot
6. `cursor-mcp.getSelectedElements` - Get selected elements
7. `cursor-mcp.wipeLogs` - Wipe all logs
8. `cursor-mcp.getAllContext` - Get all context
9. `cursor-mcp.openSettings` - Open MCP settings