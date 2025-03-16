/**
 * Cursor MCP - Background Script
 * 
 * This script runs in the background and manages the extension's state.
 * It handles tab tracking, logging, and communication with content scripts.
 */

// Global state
const state = {
  currentTabId: null,
  currentUrl: null,
  tabs: {},
  settings: {
    logLimit: 50,
    queryLimit: 30000,
    showRequestHeaders: false,
    showResponseHeaders: false
  }
};

// Initialize WebSocket for real-time communication with Cursor IDE
let cursorWebSocket = null;

/**
 * Initialize the background script
 */
function init() {
  // Set up listeners
  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      state.currentTabId = tabs[0].id;
      state.currentUrl = tabs[0].url;
      console.log('Initial tab:', state.currentTabId, state.currentUrl);
    }
  });
  
  // Load settings from storage
  chrome.storage.sync.get('cursorMCPSettings', (result) => {
    if (result.cursorMCPSettings) {
      state.settings = { ...state.settings, ...result.cursorMCPSettings };
    }
    console.log('Loaded settings:', state.settings);
  });
  
  // Try to connect to Cursor IDE WebSocket
  connectToCursorIDE();
}

/**
 * Handle tab activated event
 * @param {Object} activeInfo - Tab activation info
 */
function handleTabActivated(activeInfo) {
  const tabId = activeInfo.tabId;
  
  chrome.tabs.get(tabId, (tab) => {
    const oldTabId = state.currentTabId;
    const oldUrl = state.currentUrl;
    
    state.currentTabId = tabId;
    state.currentUrl = tab.url;
    
    console.log(`Updated current tab ID: ${oldTabId} -> ${tabId}`);
    console.log(`Updated current URL via tab activation: ${oldUrl} -> ${tab.url}`);
    
    // Send update to Cursor IDE
    sendCurrentUrlUpdate(tab.url, tabId, 'tab_activated');
  });
}

/**
 * Handle tab updated event
 * @param {number} tabId - Tab ID
 * @param {Object} changeInfo - Change information
 * @param {Object} tab - Tab object
 */
function handleTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    if (tabId === state.currentTabId) {
      const oldUrl = state.currentUrl;
      state.currentUrl = changeInfo.url;
      
      console.log(`Updated current URL via tab update: ${oldUrl} -> ${changeInfo.url}`);
      
      // Send update to Cursor IDE
      sendCurrentUrlUpdate(changeInfo.url, tabId, 'tab_url_change');
    }
  }
  
  if (changeInfo.status === 'complete' && tabId === state.currentTabId) {
    // Send update to Cursor IDE
    sendCurrentUrlUpdate(tab.url, tabId, 'page_complete');
  }
}

/**
 * Handle messages from content scripts
 * @param {Object} request - Message request
 * @param {Object} sender - Message sender
 * @param {Function} sendResponse - Response function
 * @returns {boolean} Whether the response will be sent asynchronously
 */
function handleMessage(request, sender, sendResponse) {
  if (request.type === 'log') {
    processLog(request.data, sender.tab.id);
    sendResponse({ success: true });
  } else if (request.type === 'getSettings') {
    sendResponse({ settings: state.settings });
  } else if (request.type === 'updateSettings') {
    state.settings = { ...state.settings, ...request.settings };
    chrome.storage.sync.set({ cursorMCPSettings: state.settings });
    sendResponse({ settings: state.settings });
  } else if (request.type === 'getCurrentUrl') {
    sendResponse({ url: state.currentUrl, tabId: state.currentTabId });
  } else if (request.type === 'takeScreenshot') {
    takeScreenshot(request.tabId || state.currentTabId)
      .then(dataUrl => sendResponse({ success: true, dataUrl }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicate async response
  } else if (request.type === 'getLogs') {
    const tabId = request.tabId || state.currentTabId;
    const tabLogs = state.tabs[tabId] || { consoleLogs: [], consoleErrors: [], networkSuccess: [], networkErrors: [] };
    
    sendResponse({
      logs: {
        consoleLogs: request.logType === 'consoleLogs' ? tabLogs.consoleLogs : [],
        consoleErrors: request.logType === 'consoleErrors' ? tabLogs.consoleErrors : [],
        networkSuccess: request.logType === 'networkSuccess' ? tabLogs.networkSuccess : [],
        networkErrors: request.logType === 'networkErrors' ? tabLogs.networkErrors : []
      }
    });
  } else if (request.type === 'wipeLogs') {
    if (request.currentTabOnly) {
      if (state.tabs[state.currentTabId]) {
        state.tabs[state.currentTabId] = {
          consoleLogs: [],
          consoleErrors: [],
          networkSuccess: [],
          networkErrors: []
        };
      }
    } else {
      state.tabs = {};
    }
    sendResponse({ success: true });
  }
  
  return false;
}

/**
 * Process a log entry
 * @param {Object} logData - Log data
 * @param {number} tabId - Tab ID
 */
function processLog(logData, tabId) {
  console.log('=== Received Extension Log ===');
  console.log('Request body:', logData);
  
  // Initialize tab logs if not exists
  if (!state.tabs[tabId]) {
    state.tabs[tabId] = {
      consoleLogs: [],
      consoleErrors: [],
      networkSuccess: [],
      networkErrors: []
    };
  }
  
  // Update settings if provided
  if (logData.hasSettings && logData.settings) {
    console.log('Updating settings:', logData.settings);
    state.settings = { ...state.settings, ...logData.settings };
  }
  
  // Process log based on type
  if (logData.dataType === 'console-log') {
    console.log('Processing console-log log entry');
    
    const logEntry = {
      level: logData.level || 'info',
      message: logData.message || '',
      timestamp: logData.timestamp
    };
    
    if (logEntry.level === 'error' || logEntry.level === 'warn') {
      addLogEntry(tabId, 'consoleErrors', logEntry);
    } else {
      addLogEntry(tabId, 'consoleLogs', logEntry);
    }
  } else if (logData.dataType === 'network-request') {
    console.log('Processing network-request log entry');
    
    const requestEntry = {
      url: logData.url,
      method: logData.method,
      status: logData.status,
      timestamp: logData.timestamp
    };
    
    // Add headers if enabled in settings
    if (state.settings.showRequestHeaders && logData.requestHeaders) {
      requestEntry.requestHeaders = logData.requestHeaders;
    }
    
    if (state.settings.showResponseHeaders && logData.responseHeaders) {
      requestEntry.responseHeaders = logData.responseHeaders;
    }
    
    // Add request/response body if available and not too large
    if (logData.requestBody && logData.requestBody.length < state.settings.queryLimit) {
      requestEntry.requestBody = logData.requestBody;
    }
    
    if (logData.responseBody && logData.responseBody.length < state.settings.queryLimit) {
      requestEntry.responseBody = logData.responseBody;
    }
    
    if (logData.status >= 400) {
      requestEntry.error = logData.error || getStatusText(logData.status);
      addLogEntry(tabId, 'networkErrors', requestEntry);
    } else {
      addLogEntry(tabId, 'networkSuccess', requestEntry);
    }
  }
  
  // Log current counts
  console.log('Current log counts:', {
    consoleLogs: state.tabs[tabId].consoleLogs.length,
    consoleErrors: state.tabs[tabId].consoleErrors.length,
    networkErrors: state.tabs[tabId].networkErrors.length,
    networkSuccess: state.tabs[tabId].networkSuccess.length
  });
  
  console.log('=== End Extension Log ===');
}

/**
 * Add a log entry to the specified log array
 * @param {number} tabId - Tab ID
 * @param {string} logType - Log type
 * @param {Object} entry - Log entry
 */
function addLogEntry(tabId, logType, entry) {
  // Add the entry to the beginning of the array
  state.tabs[tabId][logType].unshift(entry);
  
  // Trim the array if it exceeds the limit
  if (state.tabs[tabId][logType].length > state.settings.logLimit) {
    state.tabs[tabId][logType] = state.tabs[tabId][logType].slice(0, state.settings.logLimit);
  }
  
  console.log(`Adding ${logType}:`, entry);
}

/**
 * Take a screenshot of a tab
 * @param {number} tabId - Tab ID
 * @returns {Promise<string>} Screenshot as data URL
 */
function takeScreenshot(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(dataUrl);
      }
    });
  });
}

/**
 * Get HTTP status text
 * @param {number} status - HTTP status code
 * @returns {string} Status text
 */
function getStatusText(status) {
  const statusTexts = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  return statusTexts[status] || 'Error';
}

/**
 * Connect to Cursor IDE via WebSocket
 */
function connectToCursorIDE() {
  try {
    // Try to connect to Cursor IDE WebSocket
    // This is a placeholder - in a real implementation, you would connect to Cursor's WebSocket
    cursorWebSocket = {
      send: (message) => {
        console.log('Sending message to Cursor IDE:', message);
      },
      close: () => {
        console.log('Closing WebSocket connection to Cursor IDE');
      }
    };
    
    console.log('Chrome extension connected via WebSocket');
    
    // Send initial URL update
    if (state.currentUrl) {
      sendCurrentUrlUpdate(state.currentUrl, state.currentTabId, 'initial_connection');
    }
  } catch (error) {
    console.error('Failed to connect to Cursor IDE:', error);
  }
}

/**
 * Send current URL update to Cursor IDE
 * @param {string} url - Current URL
 * @param {number} tabId - Tab ID
 * @param {string} source - Update source
 */
function sendCurrentUrlUpdate(url, tabId, source) {
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://')) {
    // Skip chrome:// and edge:// URLs
    return;
  }
  
  const updateData = {
    url,
    tabId,
    timestamp: Date.now(),
    source
  };
  
  console.log('Received current URL update request:', JSON.stringify(updateData, null, 2));
  
  if (cursorWebSocket) {
    cursorWebSocket.send(JSON.stringify({
      type: 'url_update',
      data: updateData
    }));
  }
  
  // Update state
  state.currentTabId = tabId;
  state.currentUrl = url;
  
  console.log(`Updated current URL via dedicated endpoint: ${state.currentUrl} -> ${url}`);
  console.log(`URL update details: source=${source}, tabId=${tabId}, timestamp=${new Date(updateData.timestamp).toISOString()}`);
}

// Initialize the background script
init();