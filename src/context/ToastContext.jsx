// src/context/ToastContext.jsx
import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  // Show toast
  const show = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, show }}>
      {children}

      {toast && <div className="global-toast">{toast}</div>}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
