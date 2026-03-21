import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register Service Worker for Offline Capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // استخدام '/sw.js' مسار مطلق لضمان العمل في المجلدات الفرعية
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered successfully:', registration.scope);
      })
      .catch(error => {
        // التحقق مما إذا كان الخطأ بسبب بيئة المعاينة (اختلاف النطاق)
        // هذا يمنع ظهور الخطأ الأحمر المخيف للمستخدم في بيئات التطوير
        if (error.message.includes('origin') || error.message.includes('scriptURL') || error.message.includes('mime')) {
          console.log("Service Worker skipped (Preview Environment detected). This is normal.");
        } else {
          console.warn('Service Worker registration failed:', error.message);
        }
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);