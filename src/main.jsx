import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from "./context/AuthContext";  // Add this
import { UserProvider } from "./context/UserContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>  {/* Add AuthProvider here */}
      <UserProvider>
        <LoadingProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LoadingProvider>
      </UserProvider>
    </AuthProvider>  {/* Close AuthProvider */}
  </React.StrictMode>
);
