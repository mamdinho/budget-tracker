import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { configureAmplify } from './lib/amplify.js';
import { AuthProvider } from './context/AuthContext.jsx';

// Bootstrap CSS (to match portfolio’s look-and-feel)
import 'bootstrap/dist/css/bootstrap.min.css';

configureAmplify();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
