import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- Console Cleanup for a "Perfect" Experience ---
const originalLog = console.log;
const originalWarn = console.warn;

console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) return;
  originalLog(...args);
};

console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return;
  originalWarn(...args);
};
// ------------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
