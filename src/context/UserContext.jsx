// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load stored session on app start
  useEffect(() => {
    const stored = localStorage.getItem("ironboy_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // When login success
  const loginUser = (info) => {
    setUser(info);
    localStorage.setItem("ironboy_user", JSON.stringify(info));
  };

  // Logout everywhere
  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = () => useContext(UserContext);
