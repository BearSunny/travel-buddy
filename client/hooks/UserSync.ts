'use client';

import { useUser, getAccessToken } from "@auth0/nextjs-auth0/client";
import { useEffect, useState, useRef } from "react";

type SyncStatus = "idle" | "syncing" | "success" | "error";

interface Auth0User {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

const useUserSync = () => {
  const { user, isLoading, error } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!user || isLoading || error || hasSynced.current) return;

      setSyncStatus("syncing");
      hasSynced.current = true;

      try {
        // const token = await getAccessToken();
        const token = await getAccessToken({
          scope: "openid profile email",
          audience: process.env.AUTH0_AUDIENCE,
        });

        console.log(token);

        if (!token) throw new Error("No access token retrieved");

        const response = await fetch(
          `${process.env.APP_API_URL}/api/auth/sync`,
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              auth0_id: user.sub,
              email: user.email,
              display_name: user.name,
              avatar: user.picture,
            }),
          }
        );

        console.dir(response)

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status}`);
        }

        const userData = await response.json();
        console.log("User synced successfully:", userData);
        setSyncStatus("success");
      } catch (error) {
        console.error("User sync failed:", error);
        setSyncStatus("error");
      }
    };

    syncUser();
  }, [user, isLoading, error, getAccessToken]);

  return { syncStatus, isAuthenticated: !!user && !error };
};

export default useUserSync;
