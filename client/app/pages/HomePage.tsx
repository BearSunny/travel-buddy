'use client';

import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import useUserSync from "@/hooks/UserSync";
import { useEffect } from "react";

export default function HomePage() {
  const {syncStatus} = useUserSync();

  // alert(syncStatus)
  return (
    <div className="logged-in-section">
      <p className="logged-in-message">✅ Successfully logged in!</p>
      <Profile />
      <LogoutButton />
    </div>
  );
}
