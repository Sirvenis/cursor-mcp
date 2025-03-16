/**
 * Cursor MCP - Cursor IDE Integration
 * 
 * This script provides integration between the MCP extension and Cursor IDE.
 * It exposes the MCP API to Cursor and provides a way to send context to LLMs.
 */

// Import the MCP API
// Note: In a real implementation, this would be imported from the extension
const CursorMCP = window.CursorMCP || {};

// Import commands (will be loaded separately)
// This is just to acknowledge the dependency
const CursorMCPCommands = window.CursorMCPCommands;

/**
 * CursorMCPIntegration class
 * Provides methods for integrating MCP with Cursor IDE
 */
class CursorMCPIntegration {
  /**
   * Initialize the integration
   */
  static init() {
    // Register the MCP API with Cursor
    if (window.cursor) {
      window.cursor.mcp = {
        getConsoleLogs: this.getConsoleLogs.bind(this),
        getConsoleErrors: this.getConsoleErrors.bind(this),
        getNetworkSuccessLogs: this.getNetworkSuccessLogs.bind(this),
        getNetworkErrorLogs: this.getNetworkErrorLogs.bind(this),
        takeScreenshot: this.takeScreenshot.bind(this),
        getSelectedElements: this.getSelectedElements.bind(this),
        wipeLogs: this.wipeLogs.bind(this),
        
        // Additional helper methods
        getAllContext: this.getAllContext.bind(this),
        
        // Settings methods
        getSettings: this.getSettings.bind(this),
        updateSettings: this.updateSettings.bind(this)
      };
      
      // Register for auto-capture if enabled
      if (this.getSettings().autoCapture) {
        this._setupAutoCapture();
      }
      
      // Load commands script if not already loaded
      this._loadCommandsScript();
      
      console.log('Cursor MCP integration initialized');
    } else {
      console.error('Cursor IDE not detected');
    }
  }
  
  /**
   * Get console logs
   * @returns {Promise<Array>} Array of console log entries
   */
  static async getConsoleLogs() {
    if (!this.getSettings().captureConsole) {
      return [];
    }
    
    if (CursorMCP.getConsoleLogs) {
      return await CursorMCP.getConsoleLogs();
    }
    return [];
  }
  
  /**
   * Get console errors
   * @returns {Promise<Array>} Array of console error entries
   */
  static async getConsoleErrors() {
    if (!this.getSettings().captureConsole) {
      return [];
    }
    
    if (CursorMCP.getConsoleErrors) {
      return await CursorMCP.getConsoleErrors();
    }
    return [];
  }
  
  /**
   * Get network success logs
   * @returns {Promise<Array>} Array of successful network request entries
   */
  static async getNetworkSuccessLogs() {
    if (!this.getSettings().captureNetwork) {
      return [];
    }
    
    if (CursorMCP.getNetworkSuccessLogs) {
      return await CursorMCP.getNetworkSuccessLogs();
    }
    return [];
  }
  
  /**
   * Get network error logs
   * @returns {Promise<Array>} Array of failed network request entries
   */
  static async getNetworkErrorLogs() {
    if (!this.getSettings().captureNetwork) {
      return [];
    }
    
    if (CursorMCP.getNetworkErrorLogs) {
      return await CursorMCP.getNetworkErrorLogs();
    }
    return [];
  }
  
  /**
   * Take a screenshot
   * @returns {Promise<string>} Screenshot as a data URL
   */
  static async takeScreenshot() {
    if (CursorMCP.takeScreenshot) {
      return await CursorMCP.takeScreenshot();
    }
    return null;
  }
  
  /**
   * Get selected elements
   * @returns {Promise<Array>} Array of selected element details
   */
  static async getSelectedElements() {
    if (CursorMCP.getSelectedElements) {
      return await CursorMCP.getSelectedElements();
    }
    return [];
  }
  
  /**
   * Clear logs
   * @param {boolean} currentTabOnly - Whether to clear logs only for the current tab
   * @returns {Promise<boolean>} Success status
   */
  static async wipeLogs(currentTabOnly = true) {
    if (CursorMCP.wipeLogs) {
      return await CursorMCP.wipeLogs(currentTabOnly);
    }
    return false;
  }
  
  /**
   * Get all context for sending to LLMs
   * @returns {Promise<Object>} All context data
   */
  static async getAllContext() {
    const settings = this.getSettings();
    const context = {
      timestamp: new Date().toISOString()
    };
    
    if (settings.captureConsole) {
      context.consoleLogs = await this.getConsoleLogs();
      context.consoleErrors = await this.getConsoleErrors();
    }
    
    if (settings.captureNetwork) {
      context.networkSuccessLogs = await this.getNetworkSuccessLogs();
      context.networkErrorLogs = await this.getNetworkErrorLogs();
    }
    
    context.selectedElements = await this.getSelectedElements();
    
    return context;
  }
  
  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  static getSettings() {
    if (window.cursorMCPSettings) {
      return window.cursorMCPSettings.getAllSettings();
    }
    
    // Default settings if not available
    return {
      logLimit: 50,
      captureConsole: true,
      captureNetwork: true,
      autoCapture: false
    };
  }
  
  /**
   * Update settings
   * @param {Object} settings - New settings
   * @returns {Object} Updated settings
   */
  static async updateSettings(settings) {
    if (window.cursorMCPSettings) {
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        await window.cursorMCPSettings.updateSetting(key, value);
      }
      
      // Check if autoCapture was enabled
      if (settings.autoCapture && !this.getSettings().autoCapture) {
        this._setupAutoCapture();
      }
      
      return window.cursorMCPSettings.getAllSettings();
    }
    
    return settings;
  }
  
  /**
   * Set up auto-capture for LLM context
   * @private
   */
  static _setupAutoCapture() {
    if (window.cursor && window.cursor.beforeSendToLLM) {
      window.cursor.beforeSendToLLM(async (context) => {
        // Add MCP context to the LLM context
        const mcpContext = await this.getAllContext();
        return {
          ...context,
          mcpContext
        };
      });
      
      console.log('Cursor MCP auto-capture enabled');
    }
  }
  
  /**
   * Load the commands script if not already loaded
   * @private
   */
  static _loadCommandsScript() {
    if (!window.CursorMCPCommands && !document.getElementById('cursor-mcp-commands-script')) {
      const script = document.createElement('script');
      script.id = 'cursor-mcp-commands-script';
      script.src = chrome.runtime.getURL('src/commands.js');
      script.onload = () => {
        console.log('Cursor MCP commands script loaded');
      };
      script.onerror = (error) => {
        console.error('Failed to load Cursor MCP commands script:', error);
      };
      document.head.appendChild(script);
    }
  }
}

// Initialize the integration when the script is loaded
if (document.readyState === 'complete') {
  CursorMCPIntegration.init();
} else {
  window.addEventListener('load', () => {
    CursorMCPIntegration.init();
  });
}