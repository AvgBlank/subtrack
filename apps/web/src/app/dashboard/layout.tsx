"use client";

import Logout from "@/components/custom/logout";
import { verifyAuth } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // If user is authenticated skip verification
      const {
        user,
        actions: { setAuth, clearAuth },
      } = useAuthStore.getState();
      if (user) {
        setLoading(false);
        return;
      }

      // Attempt to verify user
      const result = await verifyAuth();
      if (result.success) {
        setAuth(result.data.user);
        setLoading(false);
      } else {
        clearAuth();
        redirect("/auth/login");
      }
    })();
  });

  if (loading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-black dark:fill-white"
          width="32"
          height="32"
          viewBox="0 0 256 256"
        >
          <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"></path>
        </svg>
      </div>
    );
  }

  return (
    <>
      <Logout />
      {children}
    </>
  );
}
