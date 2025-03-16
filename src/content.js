/**
 * Cursor MCP - Content Script
 * 
 * This script runs in the context of web pages and captures console logs,
 * network requests, and DOM events.
 */

// Global state
const state = {
  consoleLogs: [],
  consoleErrors: [],
  networkRequests: [],
  selectedElements: [],
  settings: {
    logLimit: 50,
    captureConsole: true,
    captureNetwork: true
  }
};

/**
 * Initialize the content script
 */
function init() {
  // Load settings from background script
  chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
    if (response && response.settings) {
      state.settings = { ...state.settings, ...response.settings };
    }
    
    // Set up console logging
    if (state.settings.captureConsole) {
      setupConsoleLogging();
    }
    
    // Set up network request logging
    if (state.settings.captureNetwork) {
      setupNetworkLogging();
    }
    
    // Set up DOM selection tracking
    setupDOMSelectionTracking();
    
    // Inject the cursor integration script
    injectCursorIntegrationScript();
  });
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Set up console logging
 */
function setupConsoleLogging() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  
  // Override console.log
  console.log = function(...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    logToBackground('console-log', {
      level: 'log',
      message,
      timestamp: Date.now()
    });
    
    // Call original method
    originalConsole.log.apply(console, args);
  };
  
  // Override console.info
  console.info = function(...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    logToBackground('console-log', {
      level: 'info',
      message,
      timestamp: Date.now()
    });
    
    // Call original method
    originalConsole.info.apply(console, args);
  };
  
  // Override console.warn
  console.warn = function(...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    logToBackground('console-log', {
      level: 'warn',
      message,
      timestamp: Date.now()
    });
    
    // Call original method
    originalConsole.warn.apply(console, args);
  };
  
  // Override console.error
  console.error = function(...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    logToBackground('console-log', {
      level: 'error',
      message,
      timestamp: Date.now()
    });
    
    // Call original method
    originalConsole.error.apply(console, args);
  };
  
  // Override console.debug
  console.debug = function(...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    logToBackground('console-log', {
      level: 'debug',
      message,
      timestamp: Date.now()
    });
    
    // Call original method
    originalConsole.debug.apply(console, args);
  };
  
  // Capture uncaught errors
  window.addEventListener('error', (event) => {
    logToBackground('console-log', {
      level: 'error',
      message: `Uncaught ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      stack: event.error ? event.error.stack : '',
      timestamp: Date.now()
    });
  });
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    let message = 'Unhandled Promise Rejection';
    
    if (event.reason) {
      if (typeof event.reason === 'string') {
        message = `Unhandled Promise Rejection: ${event.reason}`;
      } else if (event.reason.message) {
        message = `Unhandled Promise Rejection: ${event.reason.message}`;
      }
    }
    
    logToBackground('console-log', {
      level: 'error',
      message,
      stack: event.reason && event.reason.stack ? event.reason.stack : '',
      timestamp: Date.now()
    });
  });
}

/**
 * Set up network request logging
 */
function setupNetworkLogging() {
  // Use a fetch interceptor
  const originalFetch = window.fetch;
  
  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : resource.url;
    const method = init && init.method ? init.method : 'GET';
    const startTime = Date.now();
    
    try {
      const response = await originalFetch.apply(this, arguments);
      
      // Clone the response to avoid consuming it
      const clonedResponse = response.clone();
      
      // Log successful request
      logNetworkRequest(url, method, response.status, startTime, null, clonedResponse);
      
      return response;
    } catch (error) {
      // Log failed request
      logNetworkRequest(url, method, 0, startTime, error.message);
      throw error;
    }
  };
  
  // Use an XMLHttpRequest interceptor
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._mcpMethod = method;
    this._mcpUrl = url;
    this._mcpStartTime = Date.now();
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    
    xhr.addEventListener('load', function() {
      logNetworkRequest(xhr._mcpUrl, xhr._mcpMethod, xhr.status, xhr._mcpStartTime);
    });
    
    xhr.addEventListener('error', function() {
      logNetworkRequest(xhr._mcpUrl, xhr._mcpMethod, 0, xhr._mcpStartTime, 'Network Error');
    });
    
    return originalXHRSend.apply(this, arguments);
  };
}

/**
 * Log a network request
 * @param {string} url - Request URL
 * @param {string} method - HTTP method
 * @param {number} status - HTTP status code
 * @param {number} startTime - Request start time
 * @param {string} error - Error message (if any)
 * @param {Response} response - Fetch response (if available)
 */
function logNetworkRequest(url, method, status, startTime, error = null, response = null) {
  const requestData = {
    url,
    method,
    status,
    timestamp: Date.now(),
    duration: Date.now() - startTime
  };
  
  if (error) {
    requestData.error = error;
  }
  
  // Log to background script
  logToBackground('network-request', requestData);
}

/**
 * Set up DOM selection tracking
 */
function setupDOMSelectionTracking() {
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedNode = range.commonAncestorContainer;
      
      // Get the actual element (not text node)
      const element = selectedNode.nodeType === Node.TEXT_NODE ? selectedNode.parentElement : selectedNode;
      
      if (element) {
        state.selectedElements = [getElementDetails(element)];
      }
    }
  });
  
  // Track clicks on elements
  document.addEventListener('click', (event) => {
    const element = event.target;
    if (element) {
      state.selectedElements = [getElementDetails(element)];
    }
  }, true);
}

/**
 * Get details about an element
 * @param {Element} element - DOM element
 * @returns {Object} Element details
 */
function getElementDetails(element) {
  if (!element || !element.tagName) {
    return null;
  }
  
  const details = {
    tagName: element.tagName.toLowerCase(),
    xpath: getXPath(element),
    cssSelector: getCssSelector(element)
  };
  
  // Add ID if available
  if (element.id) {
    details.id = element.id;
  }
  
  // Add class names if available
  if (element.className && typeof element.className === 'string') {
    details.className = element.className;
  }
  
  // Add text content if available
  if (element.textContent) {
    // Trim and limit text content length
    details.textContent = element.textContent.trim().substring(0, 100);
    if (element.textContent.length > 100) {
      details.textContent += '...';
    }
  }
  
  // Add attributes
  details.attributes = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    details.attributes[attr.name] = attr.value;
  }
  
  return details;
}

/**
 * Get XPath for an element
 * @param {Element} element - DOM element
 * @returns {string} XPath
 */
function getXPath(element) {
  if (!element) return '';
  
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }
  
  let path = '';
  let current = element;
  
  while (current && current !== document.body) {
    let index = 1;
    let sibling = current.previousElementSibling;
    
    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    
    const tagName = current.tagName.toLowerCase();
    path = `/${tagName}[${index}]${path}`;
    current = current.parentElement;
  }
  
  return `/html/body${path}`;
}

/**
 * Get CSS selector for an element
 * @param {Element} element - DOM element
 * @returns {string} CSS selector
 */
function getCssSelector(element) {
  if (!element) return '';
  
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element === document.body) {
    return 'body';
  }
  
  let path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    } else if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\\s+/);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }
    
    // Add nth-child if needed
    let index = 1;
    let sibling = current.previousElementSibling;
    
    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    
    if (index > 1) {
      selector += `:nth-child(${index})`;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

/**
 * Log data to the background script
 * @param {string} dataType - Data type
 * @param {Object} data - Data to log
 */
function logToBackground(dataType, data) {
  chrome.runtime.sendMessage({
    type: 'log',
    data: {
      dataType,
      ...data,
      hasSettings: true,
      settings: state.settings
    }
  });
}

/**
 * Handle messages from the background script
 * @param {Object} request - Message request
 * @param {Object} sender - Message sender
 * @param {Function} sendResponse - Response function
 * @returns {boolean} Whether the response will be sent asynchronously
 */
function handleMessage(request, sender, sendResponse) {
  if (request.type === 'getSelectedElements') {
    sendResponse({ elements: state.selectedElements });
  } else if (request.type === 'updateSettings') {
    state.settings = { ...state.settings, ...request.settings };
    sendResponse({ settings: state.settings });
  }
  
  return false;
}

/**
 * Inject the cursor integration script
 */
function injectCursorIntegrationScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/cursor-integration.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Initialize the content script
init();