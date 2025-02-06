import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
