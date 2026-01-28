// 'use client';

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { ThemeProvider } from "next-themes";
// import { useDispatch, useSelector } from "react-redux";

// import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
// import Header from "./components/Layouts/Header";
// import ReduxProvider from "./ReduxProvider";
// import { AppDispatch, RootState } from "../../store/store";
// import { fetchRolePermissionsSidebar } from "../../store/sidebarPermissionSlice";
// import Link from "next/link";

// // URL to pageName mapping
// const routeToPageNameMap: { [key: string]: string } = {
//     '/': 'Dashboard',
//     '/users': 'User Management',
//     '/roles': 'Roles',
//     '/permissions': 'Permissions',
//     '/pagepermissions': 'Page Permissions',
//     '/rolebasedpermissions': 'User Permissions',
//     '/leadstagemasterpage': 'Lead Stage Master View',
//     '/statusmasterview': 'Status Master View',
//     '/land': 'Land',
//     '/leadplatform': 'Lead Platform',
//     '/googleanalytics': 'Google Analytics',
//     '/projectstatus': 'Project Status',
//     '/lead': 'Lead',
//     '/Assistantdirector': 'Assistantdirector',
//     '/booking': 'Booking',
//     '/collection': 'Collection'
// };

// // Public routes - no permission check needed
// const publicRoutes = ['/login', '/register', '/forgot-password', '/support'];

// export default function LayoutClient({ children }: { children: React.ReactNode }) {
//     return (
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//             <ReduxProvider>
//                 <LayoutWrapper>{children}</LayoutWrapper>
//                 <ToastContainer
//                     position="top-right"
//                     autoClose={3000}
//                     hideProgressBar={false}
//                     newestOnTop={false}
//                     closeOnClick
//                     rtl={false}
//                     pauseOnFocusLoss
//                     draggable
//                     pauseOnHover
//                     theme="dark"
//                 />
//             </ReduxProvider>
//         </ThemeProvider>
//     );
// }

// function LayoutWrapper({ children }: { children: React.ReactNode }) {
//     const router = useRouter();
//     const pathname = usePathname();
//     const dispatch = useDispatch<AppDispatch>();

//     // Initial state as null to prevent hydration mismatch
//     const [mounted, setMounted] = useState(false);
//     const [permissionChecked, setPermissionChecked] = useState(false);
//     const [isUnauthorized, setIsUnauthorized] = useState(false);

//     const { permissions: rolePermissions, loading: permissionsLoading } = useSelector(
//         (state: RootState) => state.sidebarPermissions
//     );

//     const isAuthRoute = pathname === "/login";
//     const isPublicRoute = publicRoutes.includes(pathname);

//     // Set mounted to true after hydration
//     useEffect(() => {
//         setMounted(true);
//     }, []);

//     // Fetch permissions on mount
//     useEffect(() => {
//         if (!mounted) return;

//         const token = localStorage.getItem("accessToken");
//         if (token) {
//             dispatch(fetchRolePermissionsSidebar());
//         } else if (!isAuthRoute) {
//             router.replace("/login");
//         }
//     }, [mounted, dispatch, isAuthRoute, router]);

//     // Permission check
//     useEffect(() => {
//         if (!mounted) return;

//         const token = localStorage.getItem("accessToken");

//         // Auth route or no token - skip permission check
//         if (isAuthRoute || !token) {
//             setPermissionChecked(true);
//             setIsUnauthorized(false);
//             return;
//         }

//         // Public routes - always accessible
//         if (isPublicRoute) {
//             setPermissionChecked(true);
//             setIsUnauthorized(false);
//             return;
//         }

//         // Still loading permissions
//         if (permissionsLoading) {
//             return;
//         }

//         // Permissions loaded - check access
//         if (rolePermissions?.permissions) {
//             const pageName = routeToPageNameMap[pathname];

//             // Route not in protected list - allow access
//             if (!pageName) {
//                 setPermissionChecked(true);
//                 setIsUnauthorized(false);
//                 return;
//             }

//             // Check if user has view permission (17) for this page
//             const pagePermission = rolePermissions.permissions.find(
//                 (p: any) => p.pageName === pageName
//             );
//             const hasViewPermission = pagePermission && pagePermission.permissionIds.includes(17);

//             if (!hasViewPermission) {
//                 // No permission - show 404
//                 setIsUnauthorized(true);
//                 setPermissionChecked(true);
//                 return;
//             }

//             // Has permission - allow access
//             setIsUnauthorized(false);
//             setPermissionChecked(true);
//         }

//     }, [mounted, pathname, rolePermissions, permissionsLoading, isAuthRoute, isPublicRoute]);

//     // Not mounted yet - return null to prevent hydration mismatch
//     if (!mounted) {
//         return null;
//     }

//     // Loading state
//     if (!permissionChecked) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
//                     <p className="text-gray-600 dark:text-gray-400">Loading...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Unauthorized - Show 404 page
//     if (isUnauthorized) {
//         return <NotFoundPage />;
//     }

//     // Auth route (login page)
//     if (isAuthRoute) {
//         return <main className="flex-1">{children}</main>;
//     }

//     // Authorized - Show main layout
//     return (
//         <SidebarProvider>
//             <div className="min-h-screen bg-gray-50 dark:bg-black">
//                 <Sidebar />
//                 <MainContent>{children}</MainContent>
//             </div>
//         </SidebarProvider>
//     );
// }

// // 404 Not Found Page Component
// function NotFoundPage() {
//     const router = useRouter();
//     const { permissions: rolePermissions } = useSelector(
//         (state: RootState) => state.sidebarPermissions
//     );

//     // Find the first accessible page for this user
//     const getFirstAccessibleRoute = () => {
//         if (!rolePermissions?.permissions || rolePermissions.permissions.length === 0) {
//             return '/login';
//         }

//         const firstPermission = rolePermissions.permissions.find(
//             (p: any) => p.permissionIds.includes(17)
//         );

//         if (firstPermission) {
//             const route = Object.entries(routeToPageNameMap).find(
//                 ([_, pageName]) => pageName === firstPermission.pageName
//             );
//             return route ? route[0] : '/login';
//         }

//         return '/login';
//     };

//     return (
//         <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
//             <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:aspect-square before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:opacity-10 md:py-20">
//                 <div className="relative">
//                     <img
//                         src="/assets/images/error/404-light.svg"
//                         alt="404"
//                         className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
//                     />
//                     <p className="mt-5 text-base dark:text-white">
//                         {/* The page you requested was not found! */}
//                         You Don`t Have Access To This Page Please Contact Admin.
//                     </p>
//                     {/* <button
//                         onClick={() => router.push(getFirstAccessibleRoute())}
//                         className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                         Home
//                     </button> */}
//                     <button
//                         onClick={() => router.back()}
//                         className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
//                     >
//                         Home
//                     </button>

//                 </div>
//             </div>
//         </div>
//     );
// }

// function MainContent({ children }: { children: React.ReactNode }) {
//     const { sidebarOpen } = useSidebar();

//     return (
//         <main className="lg:ml-[260px]">
//             <Header />
//             <div className="p-4 lg:p-6">{children}</div>
//         </main>
//     );
// }






'use client';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { useDispatch, useSelector } from "react-redux";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ReduxProvider from "./ReduxProvider";
import { AppDispatch, RootState } from "../../store/store";
import { fetchRolePermissionsSidebar } from "../../store/sidebarPermissionSlice";
import Link from "next/link";

// URL to pageName mapping
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
    '/googleanalytics': 'Google Analytics',
    '/projectstatus': 'Project Status',
    '/lead': 'Lead',
    '/Assistantdirector': 'Assistantdirector',
    '/booking': 'Booking',
    '/collection': 'Collection'
};

// Public routes - no permission check needed
const publicRoutes = ['/login', '/register', '/forgot-password', '/support'];

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

    // ✅ ALL HOOKS FIRST - BEFORE ANY RETURNS
    const [mounted, setMounted] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);

    const { permissions: rolePermissions, loading: permissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const permissionFetchedRef = useRef(false);
    const isAuthRoute = pathname === "/login";
    const isPublicRoute = publicRoutes.includes(pathname);

    // Set mounted to true after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (permissionFetchedRef.current) return;

        const token = localStorage.getItem("accessToken");
        if (token) {
            permissionFetchedRef.current = true;
            dispatch(fetchRolePermissionsSidebar());
        } else if (!isAuthRoute) {
            router.replace("/login");
        }
    }, [mounted, dispatch, isAuthRoute, router]);

    // Permission check
    useEffect(() => {
        if (!mounted) return;

        const token = localStorage.getItem("accessToken");

        // Auth route or no token - skip permission check
        if (isAuthRoute || !token) {
            setPermissionChecked(true);
            setIsUnauthorized(false);
            return;
        }

        // Public routes - always accessible
        if (isPublicRoute) {
            setPermissionChecked(true);
            setIsUnauthorized(false);
            return;
        }

        // Still loading permissions
        if (permissionsLoading) {
            return;
        }

        // Permissions loaded - check access
        if (rolePermissions?.permissions) {
            const pageName = routeToPageNameMap[pathname];

            // Route not in protected list - allow access
            if (!pageName) {
                setPermissionChecked(true);
                setIsUnauthorized(false);
                return;
            }

            // Check if user has view permission (17) for this page
            const pagePermission = rolePermissions.permissions.find(
                (p: any) => p.pageName === pageName
            );
            const hasViewPermission = pagePermission && pagePermission.permissionIds.includes(17);

            if (!hasViewPermission) {
                // No permission - show 404
                setIsUnauthorized(true);
                setPermissionChecked(true);
                return;
            }

            // Has permission - allow access
            setIsUnauthorized(false);
            setPermissionChecked(true);
        }

    }, [mounted, pathname, rolePermissions, permissionsLoading, isAuthRoute, isPublicRoute]);

    // Not mounted yet - return null to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    // Loading state
    if (!permissionChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (isUnauthorized) {
        return <NotFoundPage />;
    }

    // Auth route (login page)
    if (isAuthRoute) {
        return <main className="flex-1">{children}</main>;
    }

    // Authorized - Show main layout
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black">
                <Sidebar />
                <MainContent>{children}</MainContent>
            </div>
        </SidebarProvider>
    );
}

// 404 Not Found Page Component
function NotFoundPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:aspect-square before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:opacity-10 md:py-20">
                <div className="relative">
                    <img
                        src="/assets/images/error/404-light.svg"
                        alt="404"
                        className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
                    />
                    <p className="mt-5 text-base dark:text-white">
                        You Don't Have Access To This Page. Please Contact Admin.
                    </p>
                    <a
                        href="/"
                        className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-block"
                    >
                        Go Back
                    </a>
                </div>
            </div>
        </div>
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

