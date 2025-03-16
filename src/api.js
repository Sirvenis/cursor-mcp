/**
 * Cursor MCP - API
 * 
 * This script defines the public API for the Cursor MCP extension.
 * It provides methods for accessing console logs, network requests, and more.
 */

// Create the CursorMCP namespace
window.CursorMCP = (function() {
  /**
   * Get console logs
   * @returns {Promise<Array>} Array of console log entries
   */
  async function getConsoleLogs() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getLogs',
        logType: 'consoleLogs'
      }, (response) => {
        resolve(response && response.logs ? response.logs.consoleLogs : []);
      });
    });
  }
  
  /**
   * Get console errors
   * @returns {Promise<Array>} Array of console error entries
   */
  async function getConsoleErrors() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getLogs',
        logType: 'consoleErrors'
      }, (response) => {
        resolve(response && response.logs ? response.logs.consoleErrors : []);
      });
    });
  }
  
  /**
   * Get network success logs
   * @returns {Promise<Array>} Array of successful network request entries
   */
  async function getNetworkSuccessLogs() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getLogs',
        logType: 'networkSuccess'
      }, (response) => {
        resolve(response && response.logs ? response.logs.networkSuccess : []);
      });
    });
  }
  
  /**
   * Get network error logs
   * @returns {Promise<Array>} Array of failed network request entries
   */
  async function getNetworkErrorLogs() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getLogs',
        logType: 'networkErrors'
      }, (response) => {
        resolve(response && response.logs ? response.logs.networkErrors : []);
      });
    });
  }
  
  /**
   * Take a screenshot
   * @returns {Promise<string>} Screenshot as a data URL
   */
  async function takeScreenshot() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'takeScreenshot'
      }, (response) => {
        resolve(response && response.success ? response.dataUrl : null);
      });
    });
  }
  
  /**
   * Get selected elements
   * @returns {Promise<Array>} Array of selected element details
   */
  async function getSelectedElements() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getSelectedElements'
      }, (response) => {
        resolve(response && response.elements ? response.elements : []);
      });
    });
  }
  
  /**
   * Clear logs
   * @param {boolean} currentTabOnly - Whether to clear logs only for the current tab
   * @returns {Promise<boolean>} Success status
   */
  async function wipeLogs(currentTabOnly = true) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'wipeLogs',
        currentTabOnly
      }, (response) => {
        resolve(response && response.success);
      });
    });
  }
  
  /**
   * Get current URL
   * @returns {Promise<Object>} Current URL and tab ID
   */
  async function getCurrentUrl() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getCurrentUrl'
      }, (response) => {
        resolve({
          url: response ? response.url : null,
          tabId: response ? response.tabId : null
        });
      });
    });
  }
  
  /**
   * Get settings
   * @returns {Promise<Object>} Current settings
   */
  async function getSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'getSettings'
      }, (response) => {
        resolve(response && response.settings ? response.settings : {});
      });
    });
  }
  
  /**
   * Update settings
   * @param {Object} settings - New settings
   * @returns {Promise<Object>} Updated settings
   */
  async function updateSettings(settings) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'updateSettings',
        settings
      }, (response) => {
        resolve(response && response.settings ? response.settings : settings);
      });
    });
  }
  
  // Return the public API
  return {
    getConsoleLogs,
    getConsoleErrors,
    getNetworkSuccessLogs,
    getNetworkErrorLogs,
    takeScreenshot,
    getSelectedElements,
    wipeLogs,
    getCurrentUrl,
    getSettings,
    updateSettings
  };
})();

// Log that the API is ready
console.log('Cursor MCP API initialized');