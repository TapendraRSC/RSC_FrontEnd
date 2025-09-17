'use client';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ReduxProvider from "./ReduxProvider";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
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
    );
}


function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authChecked, setAuthChecked] = useState(false);

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
            <Header />

            <div className="p-4 lg:p-6">{children}</div>
        </main>
    );
}
