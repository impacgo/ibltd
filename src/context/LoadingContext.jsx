// src/context/LoadingContext.jsx
import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const show = () => setLoading(true);
  const hide = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, show, hide }}>
      {children}

      {loading && (
        <div className="global-loader">
          <div className="spinner"></div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
