import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { UserProvider } from "./context/UserContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <LoadingProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LoadingProvider>
    </UserProvider>
  </React.StrictMode>
);
