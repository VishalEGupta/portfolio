// Vite uses index.html as the entry HTML, which has <script type="module" src="/src/main.jsx">.
// This file is therefore the JavaScript entry point — it mounts the React app into the DOM.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global CSS is imported here (not inside a component) so it applies to the entire page.
// index.css sets base resets, font, and scroll behavior.
import './index.css'
import App from './App.jsx'

// createRoot is the React 18 API for mounting. It replaced the old ReactDOM.render().
// It enables concurrent features (like automatic batching and transitions).
// getElementById('root') targets the <div id="root"> in index.html — that's where React takes over.
createRoot(document.getElementById('root')).render(
  // StrictMode wraps the app in development only — it double-invokes renders and effects
  // to surface bugs from side effects. It has zero cost in production builds.
  <StrictMode>
    <App />
  </StrictMode>,
)
