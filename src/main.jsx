import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Base styles are imported by each page component (BSNSite imports styles.css,
// AppOld imports stylesOld.css) so the two versions never load each other's CSS.
//
// StrictMode is intentionally omitted: the BSN experience boots a WebGL reactor +
// scroll rig once, and StrictMode's dev double-invoke would spin it up twice.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
