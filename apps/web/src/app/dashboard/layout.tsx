import Logout from "@/components/custom/logout";
import { verifyAuth } from "@/lib/api/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch cookies
  const cookieStore = await cookies();


  // Verify authentication
  const response = await verifyAuth(cookieStore.toString());
  if (!response) {
    redirect("/auth/login");
  }

  return (
    <>
      <Logout />
      {children}
    </>
  );
}
