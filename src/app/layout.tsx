'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ReduxProvider from "./ReduxProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  // ❗️If login page, don't show sidebar/header
  const isAuthRoute = pathname === "/login";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token && !isAuthRoute) {
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
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useSidebar();

  return (
    <main className="lg:ml-[260px]">
      {/* Header */}
      <Header />

      {/* Content area */}
      <div className="p-4 lg:p-6">{children}</div>
    </main>
  );
}
