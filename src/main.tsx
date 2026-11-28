import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './bootstrap/registerServiceWorker';
import './index.css';
import './shared/motion/motion.css';

// Self-hosted fonts (Latin + Vietnamese subsets only; drops unused Cyrillic/Greek/Latin-ext) -
// satisfies the "zero network requests during gameplay" NFR and offline PWA use.
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/vietnamese-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/vietnamese-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/vietnamese-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/vietnamese-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/vietnamese-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/inter/vietnamese-800.css';

import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/vietnamese-400.css';
import '@fontsource/bitter/latin-500.css';
import '@fontsource/bitter/vietnamese-500.css';
import '@fontsource/bitter/latin-700.css';
import '@fontsource/bitter/vietnamese-700.css';
import '@fontsource/bitter/latin-800.css';
import '@fontsource/bitter/vietnamese-800.css';

// Self-hosted Shantell Sans for handwriting titles/notes (supports Vietnamese).
import '@fontsource/shantell-sans/latin-400.css';
import '@fontsource/shantell-sans/vietnamese-400.css';
import '@fontsource/shantell-sans/latin-500.css';
import '@fontsource/shantell-sans/vietnamese-500.css';
import '@fontsource/shantell-sans/latin-600.css';
import '@fontsource/shantell-sans/vietnamese-600.css';
import '@fontsource/shantell-sans/latin-700.css';
import '@fontsource/shantell-sans/vietnamese-700.css';

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
