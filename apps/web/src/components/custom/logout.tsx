"use client";

import * as React from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { redirect } from "next/navigation";

export default function Logout() {
  const handleLogout = async () => {
    await logout();
    redirect("/auth/login");
  };

  return (
    <Button variant="outline" size="icon" onClick={handleLogout}>
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Logout</span>
    </Button>
  );
}
