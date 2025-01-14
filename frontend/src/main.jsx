import React from 'react';
import { createRoot } from 'react-dom/client';
import App from "./App.jsx"

const container = document.querySelector('#root');
if (!container) {
  throw new Error("Target container #app not found");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
