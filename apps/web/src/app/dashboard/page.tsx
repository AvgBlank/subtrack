"use client";

import { useRequiredAuthUser } from "@/store/auth-store";

const Dashboard = () => {
  const user = useRequiredAuthUser();
  console.log(user);

  return <div>Dashboard</div>;
};

export default Dashboard;
