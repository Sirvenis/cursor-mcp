/**
 * Cursor MCP - Commands
 * 
 * This script registers MCP commands with Cursor IDE.
 * These commands can be accessed through the Command Palette.
 */

class CursorMCPCommands {
  /**
   * Initialize and register commands
   */
  static init() {
    if (window.cursor && window.cursor.registerCommand) {
      this._registerCommands();
      console.log('Cursor MCP commands registered');
    } else {
      console.error('Cursor command registration not available');
    }
  }
  
  /**
   * Register all MCP commands
   * @private
   */
  static _registerCommands() {
    // Console logs commands
    this._registerCommand('cursor-mcp.getConsoleLogs', 'MCP: Get Console Logs', async () => {
      const logs = await window.cursor.mcp.getConsoleLogs();
      this._displayResults('Console Logs', logs);
    });
    
    this._registerCommand('cursor-mcp.getConsoleErrors', 'MCP: Get Console Errors', async () => {
      const errors = await window.cursor.mcp.getConsoleErrors();
      this._displayResults('Console Errors', errors);
    });
    
    // Network logs commands
    this._registerCommand('cursor-mcp.getNetworkSuccessLogs', 'MCP: Get Network Success Logs', async () => {
      const logs = await window.cursor.mcp.getNetworkSuccessLogs();
      this._displayResults('Network Success Logs', logs);
    });
    
    this._registerCommand('cursor-mcp.getNetworkErrorLogs', 'MCP: Get Network Error Logs', async () => {
      const logs = await window.cursor.mcp.getNetworkErrorLogs();
      this._displayResults('Network Error Logs', logs);
    });
    
    // Screenshot command
    this._registerCommand('cursor-mcp.takeScreenshot', 'MCP: Take Screenshot', async () => {
      const screenshot = await window.cursor.mcp.takeScreenshot();
      if (screenshot) {
        this._displayScreenshot(screenshot);
      } else {
        this._showNotification('Failed to take screenshot');
      }
    });
    
    // Selected elements command
    this._registerCommand('cursor-mcp.getSelectedElements', 'MCP: Get Selected Elements', async () => {
      const elements = await window.cursor.mcp.getSelectedElements();
      this._displayResults('Selected Elements', elements);
    });
    
    // Wipe logs command
    this._registerCommand('cursor-mcp.wipeLogs', 'MCP: Wipe All Logs', async () => {
      const success = await window.cursor.mcp.wipeLogs();
      if (success) {
        this._showNotification('All logs wiped successfully');
      } else {
        this._showNotification('Failed to wipe logs');
      }
    });
    
    // Get all context command
    this._registerCommand('cursor-mcp.getAllContext', 'MCP: Get All Context', async () => {
      const context = await window.cursor.mcp.getAllContext();
      this._displayResults('All Context', context);
    });
    
    // Open settings command
    this._registerCommand('cursor-mcp.openSettings', 'MCP: Open Settings', () => {
      if (window.cursor.openSettings) {
        window.cursor.openSettings('extensions.cursor-mcp');
      } else {
        this._showNotification('Settings API not available');
      }
    });
  }
  
  /**
   * Register a single command
   * @param {string} id - Command ID
   * @param {string} title - Command title
   * @param {Function} callback - Command callback
   * @private
   */
  static _registerCommand(id, title, callback) {
    window.cursor.registerCommand({
      id,
      title,
      callback
    });
  }
  
  /**
   * Display results in a panel or editor
   * @param {string} title - Results title
   * @param {any} data - Results data
   * @private
   */
  static _displayResults(title, data) {
    // Format the data as JSON with indentation
    const formattedData = JSON.stringify(data, null, 2);
    
    // Create a new editor with the results
    if (window.cursor.createEditor) {
      window.cursor.createEditor({
        content: formattedData,
        language: 'json',
        title: `MCP: ${title}`
      });
    } else {
      // Fallback to console if editor API not available
      console.log(`MCP ${title}:`, data);
      this._showNotification(`Results logged to console (Editor API not available)`);
    }
  }
  
  /**
   * Display a screenshot
   * @param {string} dataUrl - Screenshot data URL
   * @private
   */
  static _displayScreenshot(dataUrl) {
    // Create HTML content with the screenshot
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MCP Screenshot</title>
        <style>
          body { margin: 0; padding: 20px; font-family: sans-serif; }
          img { max-width: 100%; border: 1px solid #ddd; }
          .actions { margin-top: 10px; }
          button { padding: 5px 10px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <h2>MCP Screenshot</h2>
        <div>
          <img src="${dataUrl}" alt="Screenshot" />
        </div>
        <div class="actions">
          <button onclick="saveScreenshot()">Save Screenshot</button>
        </div>
        <script>
          function saveScreenshot() {
            const a = document.createElement('a');
            a.href = '${dataUrl}';
            a.download = 'screenshot-${new Date().toISOString().replace(/:/g, '-')}.png';
            a.click();
          }
        </script>
      </body>
      </html>
    `;
    
    // Create a new editor with the screenshot
    if (window.cursor.createEditor) {
      window.cursor.createEditor({
        content,
        language: 'html',
        title: 'MCP: Screenshot'
      });
    } else {
      // Fallback to console if editor API not available
      console.log('MCP Screenshot:', dataUrl);
      this._showNotification('Screenshot logged to console (Editor API not available)');
    }
  }
  
  /**
   * Show a notification
   * @param {string} message - Notification message
   * @private
   */
  static _showNotification(message) {
    if (window.cursor.showNotification) {
      window.cursor.showNotification(message);
    } else {
      console.log('MCP Notification:', message);
    }
  }
}

// Initialize commands when the script is loaded
if (document.readyState === 'complete') {
  CursorMCPCommands.init();
} else {
  window.addEventListener('load', () => {
    CursorMCPCommands.init();
  });
}