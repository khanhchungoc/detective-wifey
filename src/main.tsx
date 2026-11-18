import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './bootstrap/registerServiceWorker';
import './index.css';
import './shared/motion/motion.css';

// Self-hosted Inter (subset of weights used by tailwind/index.css) -
// satisfies the "zero network requests during gameplay" NFR and offline PWA use.
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

// Self-hosted Shantell Sans for handwriting titles/notes (supports Vietnamese).
import '@fontsource/shantell-sans/400.css';
import '@fontsource/shantell-sans/500.css';
import '@fontsource/shantell-sans/600.css';
import '@fontsource/shantell-sans/700.css';

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
