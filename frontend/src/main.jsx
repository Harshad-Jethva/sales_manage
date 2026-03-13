import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import { buildApiUrl } from './config/api';
import { getStoredToken } from './utils/authStorage';

const ERROR_ENDPOINT = buildApiUrl('error_monitor.php');

const shouldSkipMonitoring = (urlOrMessage = '') =>
  String(urlOrMessage).includes('error_monitor.php') || String(urlOrMessage).includes('Download the React DevTools');

const reportClientError = (payload) => {
  if (typeof window === 'undefined') {
    return;
  }

  const safePayload = {
    ...payload,
    href: window.location.href,
    timestamp: new Date().toISOString(),
  };

  if (shouldSkipMonitoring(safePayload.url) || shouldSkipMonitoring(safePayload.message)) {
    return;
  }

  const body = JSON.stringify(safePayload);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(ERROR_ENDPOINT, blob);
      return;
    }
  } catch {
    // Ignore sendBeacon errors and fallback to fetch.
  }

  fetch(ERROR_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
};

const installAxiosGuards = () => {
  axios.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token && !config.headers?.Authorization) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (!config.timeout) {
      config.timeout = 20000;
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      reportClientError({
        type: 'axios_error',
        message: error?.message || 'Axios request failed',
        url: error?.config?.url || '',
        method: error?.config?.method || '',
        status: error?.response?.status || null,
        response: error?.response?.data || null,
      });
      return Promise.reject(error);
    }
  );
};

const installGlobalErrorMonitoring = () => {
  window.addEventListener('error', (event) => {
    reportClientError({
      type: 'runtime_error',
      message: event.message || 'Unhandled runtime error',
      stack: event.error?.stack || null,
      source: event.filename || null,
      line: event.lineno || null,
      column: event.colno || null,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportClientError({
      type: 'unhandled_rejection',
      message: reason?.message || String(reason || 'Unhandled promise rejection'),
      stack: reason?.stack || null,
    });
  });
};

// Keep console noise reduced while preserving application errors.
const originalLog = console.log;
const originalWarn = console.warn;

console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) {
    return;
  }
  originalLog(...args);
};

console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
    return;
  }
  if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.WebGLRenderer: Context Lost')) {
    return;
  }
  originalWarn(...args);
};

installAxiosGuards();
installGlobalErrorMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
