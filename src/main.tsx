import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('[App] booting');

const mountApp = () => {
  try {
    const rootEl = document.getElementById('root');
    if (!rootEl) throw new Error('Root element not found');

    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    console.error('Failed to mount React app:', err);
    const body = document.body;
    if (body) {
      body.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #b91c1c; background: #fff6f6;">
          <h1 style="color:#b91c1c">Application Error</h1>
          <pre style="white-space: pre-wrap; font-size: 14px;">${String(err)}</pre>
          <p>Please check the browser console for the full stack trace.</p>
        </div>
      `;
    }
  }
};

window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error || e.message);
  // show a simple overlay if possible
  const body = document.body;
  if (body) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.color = 'white';
    overlay.style.padding = '24px';
    overlay.style.zIndex = '9999';
    overlay.innerText = 'A runtime error occurred. Check the console for details.';
    body.appendChild(overlay);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

mountApp();
