import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// apply polyfill
polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

// Polyfill requires an empty listener on touchmove to prevent default scroll while dragging
window.addEventListener('touchmove', function () { }, { passive: false });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
);