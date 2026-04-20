import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Unregister any stale service worker from a previous build. The old SW only
// precached `/`, `/index.html`, and `/manifest.json` — none of the hashed JS/CSS
// bundles — so returning users could hit a cached index.html pointing at assets
// that no longer exist.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
}
