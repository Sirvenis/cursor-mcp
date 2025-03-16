/**
 * Cursor MCP - Settings Integration
 * 
 * This script provides integration with Cursor's settings system.
 * It allows users to configure the MCP through Cursor's settings UI.
 */

class CursorMCPSettings {
  /**
   * Initialize settings with default values
   */
  constructor() {
    this.settings = {
      logLimit: 50,
      captureConsole: true,
      captureNetwork: true,
      autoCapture: false
    };
    
    this.loadSettings();
  }
  
  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      const storedSettings = await new Promise(resolve => {
        chrome.storage.sync.get('cursorMCPSettings', result => {
          resolve(result.cursorMCPSettings || {});
        });
      });
      
      // Merge stored settings with defaults
      this.settings = {
        ...this.settings,
        ...storedSettings
      };
      
      console.log('Cursor MCP settings loaded:', this.settings);
    } catch (error) {
      console.error('Failed to load Cursor MCP settings:', error);
    }
  }
  
  /**
   * Save settings to storage
   */
  async saveSettings() {
    try {
      await new Promise(resolve => {
        chrome.storage.sync.set({ cursorMCPSettings: this.settings }, resolve);
      });
      
      console.log('Cursor MCP settings saved:', this.settings);
    } catch (error) {
      console.error('Failed to save Cursor MCP settings:', error);
    }
  }
  
  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  async updateSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      await this.saveSettings();
      return true;
    }
    return false;
  }
  
  /**
   * Get a specific setting
   * @param {string} key - Setting key
   * @returns {any} Setting value
   */
  getSetting(key) {
    return this.settings[key];
  }
  
  /**
   * Get all settings
   * @returns {Object} All settings
   */
  getAllSettings() {
    return { ...this.settings };
  }
  
  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    this.settings = {
      logLimit: 50,
      captureConsole: true,
      captureNetwork: true,
      autoCapture: false
    };
    
    await this.saveSettings();
    return this.settings;
  }
}

// Create a global instance of the settings manager
window.cursorMCPSettings = new CursorMCPSettings();

// Register settings with Cursor if available
if (window.cursor && window.cursor.registerMCP) {
  window.cursor.registerMCP({
    id: 'cursor-mcp',
    name: 'Cursor MCP',
    version: '1.0.0',
    settings: window.cursorMCPSettings,
    getSettings: () => window.cursorMCPSettings.getAllSettings(),
    updateSettings: (settings) => {
      Object.entries(settings).forEach(([key, value]) => {
        window.cursorMCPSettings.updateSetting(key, value);
      });
      return window.cursorMCPSettings.getAllSettings();
    }
  });
  
  console.log('Cursor MCP registered with Cursor settings');
}