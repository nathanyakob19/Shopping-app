import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ correct import for React 18
import { BrowserRouter } from 'react-router-dom';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root')); // ✅ correct for React 18

root.render(
  <BrowserRouter>
 
    <App />
  </BrowserRouter>
);
