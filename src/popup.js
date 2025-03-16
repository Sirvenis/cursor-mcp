/**
 * Cursor MCP - Popup Script
 * 
 * This script handles the popup UI for the Cursor MCP extension.
 */

// DOM elements
const elements = {
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  consoleLogs: document.getElementById('console-logs'),
  consoleEmpty: document.getElementById('console-empty'),
  networkLogs: document.getElementById('network-logs'),
  networkEmpty: document.getElementById('network-empty'),
  refreshConsole: document.getElementById('refresh-console'),
  refreshConsoleEmpty: document.getElementById('refresh-console-empty'),
  clearConsole: document.getElementById('clear-console'),
  copyConsole: document.getElementById('copy-console'),
  refreshNetwork: document.getElementById('refresh-network'),
  refreshNetworkEmpty: document.getElementById('refresh-network-empty'),
  clearNetwork: document.getElementById('clear-network'),
  copyNetwork: document.getElementById('copy-network'),
  takeScreenshot: document.getElementById('take-screenshot'),
  getSelectedElements: document.getElementById('get-selected-elements'),
  getAllContext: document.getElementById('get-all-context'),
  wipeLogs: document.getElementById('wipe-logs'),
  logLimit: document.getElementById('log-limit'),
  captureConsole: document.getElementById('capture-console'),
  captureNetwork: document.getElementById('capture-network'),
  autoCapture: document.getElementById('auto-capture'),
  saveSettings: document.getElementById('save-settings'),
  resetSettings: document.getElementById('reset-settings'),
  version: document.getElementById('version')
};

// State
let state = {
  consoleLogs: [],
  consoleErrors: [],
  networkSuccess: [],
  networkErrors: [],
  settings: {
    logLimit: 50,
    captureConsole: true,
    captureNetwork: true,
    autoCapture: false
  }
};

/**
 * Initialize the popup
 */
function init() {
  // Set up tab switching
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Set up refresh buttons
  elements.refreshConsole.addEventListener('click', refreshConsoleLogs);
  elements.refreshConsoleEmpty.addEventListener('click', refreshConsoleLogs);
  elements.refreshNetwork.addEventListener('click', refreshNetworkLogs);
  elements.refreshNetworkEmpty.addEventListener('click', refreshNetworkLogs);
  
  // Set up clear buttons
  elements.clearConsole.addEventListener('click', clearConsoleLogs);
  elements.clearNetwork.addEventListener('click', clearNetworkLogs);
  
  // Set up copy buttons
  elements.copyConsole.addEventListener('click', copyConsoleLogs);
  elements.copyNetwork.addEventListener('click', copyNetworkLogs);
  
  // Set up tool buttons
  elements.takeScreenshot.addEventListener('click', takeScreenshot);
  elements.getSelectedElements.addEventListener('click', getSelectedElements);
  elements.getAllContext.addEventListener('click', getAllContext);
  elements.wipeLogs.addEventListener('click', wipeLogs);
  
  // Set up settings buttons
  elements.saveSettings.addEventListener('click', saveSettings);
  elements.resetSettings.addEventListener('click', resetSettings);
  
  // Load settings
  loadSettings();
  
  // Load logs
  refreshConsoleLogs();
  refreshNetworkLogs();
  
  // Set version
  chrome.runtime.getManifest().version;
  elements.version.textContent = `v${chrome.runtime.getManifest().version}`;
}

/**
 * Switch to a different tab
 * @param {string} tabId - Tab ID
 */
function switchTab(tabId) {
  // Update tab buttons
  elements.tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update tab contents
  elements.tabContents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

/**
 * Refresh console logs
 */
async function refreshConsoleLogs() {
  try {
    // Get console logs and errors
    const [logs, errors] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'consoleLogs' }),
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'consoleErrors' })
    ]);
    
    state.consoleLogs = logs && logs.logs ? logs.logs.consoleLogs : [];
    state.consoleErrors = errors && errors.logs ? errors.logs.consoleErrors : [];
    
    // Update UI
    renderConsoleLogs();
  } catch (error) {
    console.error('Failed to refresh console logs:', error);
  }
}

/**
 * Render console logs
 */
function renderConsoleLogs() {
  const logs = [...state.consoleLogs, ...state.consoleErrors].sort((a, b) => b.timestamp - a.timestamp);
  
  if (logs.length === 0) {
    elements.consoleLogs.style.display = 'none';
    elements.consoleEmpty.style.display = 'flex';
    return;
  }
  
  elements.consoleLogs.style.display = 'block';
  elements.consoleEmpty.style.display = 'none';
  
  elements.consoleLogs.innerHTML = '';
  
  logs.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${log.level}`;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date(log.timestamp).toLocaleString();
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = log.message;
    
    logEntry.appendChild(timestamp);
    logEntry.appendChild(message);
    
    elements.consoleLogs.appendChild(logEntry);
  });
}

/**
 * Clear console logs
 */
async function clearConsoleLogs() {
  try {
    await chrome.runtime.sendMessage({ type: 'wipeLogs', currentTabOnly: true });
    refreshConsoleLogs();
  } catch (error) {
    console.error('Failed to clear console logs:', error);
  }
}

/**
 * Copy console logs to clipboard
 */
function copyConsoleLogs() {
  const logs = [...state.consoleLogs, ...state.consoleErrors].sort((a, b) => b.timestamp - a.timestamp);
  
  if (logs.length === 0) {
    return;
  }
  
  const text = logs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
  }).join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Console logs copied to clipboard');
  }).catch(error => {
    console.error('Failed to copy console logs:', error);
  });
}

/**
 * Refresh network logs
 */
async function refreshNetworkLogs() {
  try {
    // Get network logs
    const [success, errors] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'networkSuccess' }),
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'networkErrors' })
    ]);
    
    state.networkSuccess = success && success.logs ? success.logs.networkSuccess : [];
    state.networkErrors = errors && errors.logs ? errors.logs.networkErrors : [];
    
    // Update UI
    renderNetworkLogs();
  } catch (error) {
    console.error('Failed to refresh network logs:', error);
  }
}

/**
 * Render network logs
 */
function renderNetworkLogs() {
  const logs = [...state.networkSuccess, ...state.networkErrors].sort((a, b) => b.timestamp - a.timestamp);
  
  if (logs.length === 0) {
    elements.networkLogs.style.display = 'none';
    elements.networkEmpty.style.display = 'flex';
    return;
  }
  
  elements.networkLogs.style.display = 'block';
  elements.networkEmpty.style.display = 'none';
  
  elements.networkLogs.innerHTML = '';
  
  logs.forEach(log => {
    const isError = log.status >= 400;
    
    const networkEntry = document.createElement('div');
    networkEntry.className = `network-entry ${isError ? 'error' : 'success'}`;
    
    const url = document.createElement('div');
    url.className = 'url';
    url.textContent = log.url;
    
    const details = document.createElement('div');
    details.className = 'details';
    
    const method = document.createElement('span');
    method.className = `method ${log.method.toLowerCase()}`;
    method.textContent = log.method;
    
    const status = document.createElement('span');
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.textContent = log.status;
    
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date(log.timestamp).toLocaleString();
    
    details.appendChild(method);
    details.appendChild(status);
    details.appendChild(timestamp);
    
    networkEntry.appendChild(url);
    networkEntry.appendChild(details);
    
    elements.networkLogs.appendChild(networkEntry);
  });
}

/**
 * Clear network logs
 */
async function clearNetworkLogs() {
  try {
    await chrome.runtime.sendMessage({ type: 'wipeLogs', currentTabOnly: true });
    refreshNetworkLogs();
  } catch (error) {
    console.error('Failed to clear network logs:', error);
  }
}

/**
 * Copy network logs to clipboard
 */
function copyNetworkLogs() {
  const logs = [...state.networkSuccess, ...state.networkErrors].sort((a, b) => b.timestamp - a.timestamp);
  
  if (logs.length === 0) {
    return;
  }
  
  const text = logs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const status = log.status || 'Error';
    return `[${timestamp}] ${log.method} ${log.url} - ${status}`;
  }).join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Network logs copied to clipboard');
  }).catch(error => {
    console.error('Failed to copy network logs:', error);
  });
}

/**
 * Take a screenshot
 */
async function takeScreenshot() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'takeScreenshot' });
    
    if (response && response.success && response.dataUrl) {
      // Open a new tab with the screenshot
      chrome.tabs.create({ url: response.dataUrl });
    } else {
      alert('Failed to take screenshot');
    }
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    alert('Failed to take screenshot');
  }
}

/**
 * Get selected elements
 */
async function getSelectedElements() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getSelectedElements' });
    
    if (response && response.elements) {
      // Create a new tab with the elements
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Selected Elements</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Selected Elements</h1>
          <pre>${JSON.stringify(response.elements, null, 2)}</pre>
        </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      chrome.tabs.create({ url });
    } else {
      alert('No elements selected');
    }
  } catch (error) {
    console.error('Failed to get selected elements:', error);
    alert('Failed to get selected elements');
  }
}

/**
 * Get all context
 */
async function getAllContext() {
  try {
    // Get all logs
    const [consoleLogs, consoleErrors, networkSuccess, networkErrors, elements] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'consoleLogs' }),
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'consoleErrors' }),
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'networkSuccess' }),
      chrome.runtime.sendMessage({ type: 'getLogs', logType: 'networkErrors' }),
      chrome.runtime.sendMessage({ type: 'getSelectedElements' })
    ]);
    
    const context = {
      timestamp: new Date().toISOString(),
      consoleLogs: consoleLogs && consoleLogs.logs ? consoleLogs.logs.consoleLogs : [],
      consoleErrors: consoleErrors && consoleErrors.logs ? consoleErrors.logs.consoleErrors : [],
      networkSuccess: networkSuccess && networkSuccess.logs ? networkSuccess.logs.networkSuccess : [],
      networkErrors: networkErrors && networkErrors.logs ? networkErrors.logs.networkErrors : [],
      selectedElements: elements && elements.elements ? elements.elements : []
    };
    
    // Create a new tab with the context
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All Context</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>All Context</h1>
        <pre>${JSON.stringify(context, null, 2)}</pre>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    chrome.tabs.create({ url });
  } catch (error) {
    console.error('Failed to get all context:', error);
    alert('Failed to get all context');
  }
}

/**
 * Wipe all logs
 */
async function wipeLogs() {
  try {
    await chrome.runtime.sendMessage({ type: 'wipeLogs', currentTabOnly: false });
    
    // Refresh logs
    refreshConsoleLogs();
    refreshNetworkLogs();
    
    alert('All logs wiped successfully');
  } catch (error) {
    console.error('Failed to wipe logs:', error);
    alert('Failed to wipe logs');
  }
}

/**
 * Load settings
 */
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getSettings' });
    
    if (response && response.settings) {
      state.settings = response.settings;
      
      // Update UI
      elements.logLimit.value = state.settings.logLimit;
      elements.captureConsole.checked = state.settings.captureConsole;
      elements.captureNetwork.checked = state.settings.captureNetwork;
      elements.autoCapture.checked = state.settings.autoCapture;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Save settings
 */
async function saveSettings() {
  try {
    const settings = {
      logLimit: parseInt(elements.logLimit.value, 10),
      captureConsole: elements.captureConsole.checked,
      captureNetwork: elements.captureNetwork.checked,
      autoCapture: elements.autoCapture.checked
    };
    
    await chrome.runtime.sendMessage({ type: 'updateSettings', settings });
    
    // Reload settings
    loadSettings();
    
    alert('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
    alert('Failed to save settings');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  try {
    const settings = {
      logLimit: 50,
      captureConsole: true,
      captureNetwork: true,
      autoCapture: false
    };
    
    await chrome.runtime.sendMessage({ type: 'updateSettings', settings });
    
    // Reload settings
    loadSettings();
    
    alert('Settings reset to defaults');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    alert('Failed to reset settings');
  }
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);