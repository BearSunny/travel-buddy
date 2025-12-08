"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0/client";

interface DbUser {
  id: string; // The UUID from your Postgres DB
  auth0_id: string;
  email: string;
  display_name: string;
  avatar: string;
}

interface UserContextType {
  user: DbUser | null;
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  refetchUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to prevent double-syncing in React.StrictMode
  const hasSynced = useRef(false);

  const fetchOrSyncUser = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const token = await getAccessToken({
        scope: "openid profile email",
        audience: process.env.AUTH0_AUDIENCE,
      });
      if (!token) throw new Error("No access token retrieved");
      const response = await fetch(`${process.env.APP_API_URL}/api/auth/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth0_id: user?.sub,
          email: user?.email,
          display_name: user?.name,
          avatar: user?.picture,
        }),
      });

      if (!response.ok)
        throw new Error(`Failed to sync user: ${response.status}`);

      const userData: DbUser = await response.json();

      console.dir(userData);
      setDbUser(userData);
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && !hasSynced.current) {
      hasSynced.current = true;
      fetchOrSyncUser();
    }
  }, [user, authLoading]);

  return (
    <UserContext.Provider
      value={{
        user: dbUser,
        isLoading: authLoading || isSyncing,
        error,
        refetchUser: fetchOrSyncUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useDbUser = () => useContext(UserContext);
