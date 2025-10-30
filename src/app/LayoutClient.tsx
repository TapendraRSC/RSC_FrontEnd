'use client';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { useDispatch, useSelector } from "react-redux";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ReduxProvider from "./ReduxProvider";
import { AppDispatch, RootState } from "../../store/store";
import { fetchRolePermissionsSidebar } from "../../store/sidebarPermissionSlice";

const routeToPageNameMap: { [key: string]: string } = {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/roles': 'Roles',
    '/permissions': 'Permissions',
    '/pagepermissions': 'Page Permissions',
    '/rolebasedpermissions': 'User Permissions',
    '/leadstagemasterpage': 'Lead Stage Master View',
    '/statusmasterview': 'Status Master View',
    '/land': 'Land',
    '/leadplatform': 'Lead Platform',
    '/projectstatus': 'Project Status',
    '/lead': 'Lead',
};

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
    const dispatch = useDispatch<AppDispatch>();
    const [permissionChecked, setPermissionChecked] = useState(false);

    const { permissions: rolePermissions, loading: permissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const isAuthRoute = pathname === "/login";

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            dispatch(fetchRolePermissionsSidebar());
        } else if (!isAuthRoute) {
            router.replace("/login");
        }
    }, [dispatch, isAuthRoute, router]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (isAuthRoute || !token) {
            setPermissionChecked(true);
            return;
        }

        if (permissionsLoading) {
            return;
        }

        if (rolePermissions?.permissions) {
            const pageName = routeToPageNameMap[pathname];

            if (pageName) {
                const pagePermission = rolePermissions.permissions.find(
                    (p: any) => p.pageName === pageName
                );
                const hasViewPermission = pagePermission && pagePermission.permissionIds.includes(27);

                if (!hasViewPermission) {
                    router.replace("/");
                    return;
                }
            }
        }

        setPermissionChecked(true);

    }, [pathname, rolePermissions, permissionsLoading, isAuthRoute, router]);

    if (!permissionChecked) {
        return null;
    }

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