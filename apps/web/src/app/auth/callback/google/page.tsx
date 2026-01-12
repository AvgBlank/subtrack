"use client";
import { googleOAuth } from "@/lib/api/auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function OAuthSuccessPage() {
  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      const response = await googleOAuth(code);

      if (response) {
        redirect("/dashboard")
      } else {
        toast("OAuth process failed");
        redirect("/auth/login")
      }
    })();
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
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
