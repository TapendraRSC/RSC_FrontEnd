'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ComponentsDashboardSales from "./components/Dashboard/LeadsDashboard";

const MainContent = () => {
  const { sidebarOpen } = useSidebar();

  return (
    <main className={`min-h-screen w-full bg-gray-50 dark:bg-black transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
      <Header />
      <div className="p-6">
        <ComponentsDashboardSales />
      </div>
    </main>
  );
};

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) return null; // ⛔️ Wait for auth check

  if (!isAuthenticated) return null; // ⛔️ Prevent unauthorized dashboard render

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
