'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import setupLocatorUI from "@locator/runtime";
import ReduxProvider from "./reduxProvider";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </ReduxProvider>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ❗️If login page, don’t show sidebar/header
  const isAuthRoute = pathname === "/login";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
    } else if (!isAuthRoute) {
      router.replace("/login");
    }
    setAuthChecked(true);
  }, [router, isAuthRoute]);

  if (!authChecked) return null;

  if (isAuthRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useSidebar();

  return (
    <main className={`flex-1 min-h-screen bg-gray-50 dark:bg-black transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
      <Header />
      <div className="p-6">{children}</div>
    </main>
  );
}
