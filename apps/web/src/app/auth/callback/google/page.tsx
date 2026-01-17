"use client";

import { googleOAuth } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OAuthSuccessPage() {
  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const {
        actions: { setAuth },
      } = useAuthStore.getState();

      const result = await googleOAuth(code);

      if (result.success) {
        setAuth(result.data.user, result.data.accessToken);
        redirect("/dashboard");
      } else {
        toast("OAuth process failed");
        redirect("/auth/login");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
