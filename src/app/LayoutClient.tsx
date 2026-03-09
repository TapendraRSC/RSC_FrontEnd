'use client';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState, useRef, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Sidebar, { SidebarProvider, useSidebar } from "./components/Layouts/Sidebar";
import Header from "./components/Layouts/Header";
import ReduxProvider from "./ReduxProvider";
import { AppDispatch, RootState } from "../../store/store";
import { fetchRolePermissionsSidebar } from "../../store/sidebarPermissionSlice";

/* ═══════════════════════════════════════════════════
   Custom Theme Provider — replaces next-themes
   ═══════════════════════════════════════════════════ */
const ThemeContext = createContext<{
    theme: string;
    setTheme: (theme: string) => void;
}>({
    theme: 'dark',
    setTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<string>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme') || 'dark';
        setThemeState(stored);
        if (stored === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, []);

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    };

    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: 'dark', setTheme }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

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
    '/collection': 'Collection',
    '/creditcollection': 'Credit Collection',
    '/onlinecollection': 'Online Collection',
    '/bulkland': 'Bulk Land',
    '/paymentplatforms': 'Payment Platforms',
};

const availableRoutes = [
    { href: '/', pageName: 'Dashboard' },
    { href: '/users', pageName: 'User Management' },
    { href: '/roles', pageName: 'Roles' },
    { href: '/permissions', pageName: 'Permissions' },
    { href: '/pagepermissions', pageName: 'Page Permissions' },
    { href: '/rolebasedpermissions', pageName: 'User Permissions' },
    { href: '/leadstagemasterpage', pageName: 'Lead Stage Master View' },
    { href: '/statusmasterview', pageName: 'Status Master View' },
    { href: '/land', pageName: 'Land' },
    { href: '/leadplatform', pageName: 'Lead Platform' },
    { href: '/googleanalytics', pageName: 'Google Analytics' },
    { href: '/projectstatus', pageName: 'Project Status' },
    { href: '/lead', pageName: 'Lead' },
    { href: '/Assistantdirector', pageName: 'Assistantdirector' },
    { href: '/booking', pageName: 'Booking' },
    { href: '/collection', pageName: 'Collection' },
    { href: '/creditcollection', pageName: 'Credit Collection' },
    { href: '/onlinecollection', pageName: 'Online Collection' },
    { href: '/bulkland', pageName: 'Bulk Land' },
    { href: '/paymentplatforms', pageName: 'Payment Platforms' },
];

const roleDefaultRoutes: { [key: string]: string } = {
    'admin': '/',
    'bulk land role': '/bulkland',
    'bulk land': '/bulkland',
    'assistant director': '/Assistantdirector',
    'assistantdirector': '/Assistantdirector',
};

const publicRoutes = ['/login', '/register', '/forgot-password', '/support'];

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <CustomThemeProvider>
            <ReduxProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    theme="dark"
                />
            </ReduxProvider>
        </CustomThemeProvider>
    );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const [mounted, setMounted] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { permissions: rolePermissions, loading: permissionsLoading, error: permissionsError } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    const permissionFetchedRef = useRef(false);
    const redirectAttemptedRef = useRef(false);
    const isAuthRoute = pathname === "/login";
    const isPublicRoute = publicRoutes.includes(pathname);

    const getUserRole = (): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.role || user.roleName || user.role_name || null;
            }
        } catch (e) {
            console.error('Error parsing user:', e);
        }
        return null;
    };

    const isTokenValid = () => {
        if (typeof window === 'undefined') return false;
        const token = localStorage.getItem("accessToken");
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Date.now() < payload.exp * 1000;
        } catch (error) {
            return false;
        }
    };

    const hasViewPermission = (pageName: string, permissions: any[]): boolean => {
        if (!permissions || !pageName) return false;
        const pagePermission = permissions.find((p: any) => p.pageName === pageName);
        return !!(pagePermission && pagePermission.permissionIds && pagePermission.permissionIds.length > 0);
    };

    const getRoleDefaultRoute = (roleName: string | null): string | null => {
        if (!roleName) return null;
        const normalizedRole = roleName.toLowerCase().trim();
        return roleDefaultRoutes[normalizedRole] || null;
    };

    const getFirstAvailableRoute = (permissions: any[]): string | null => {
        if (!permissions || permissions.length === 0) return null;

        const userRole = getUserRole();
        const roleDefault = getRoleDefaultRoute(userRole);
        if (roleDefault) {
            const defaultPageName = routeToPageNameMap[roleDefault];
            if (defaultPageName && hasViewPermission(defaultPageName, permissions)) {
                return roleDefault;
            }
        }

        for (const route of availableRoutes) {
            if (hasViewPermission(route.pageName, permissions)) {
                return route.href;
            }
        }

        return null;
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        redirectAttemptedRef.current = false;
    }, [pathname]);

    useEffect(() => {
        if (!mounted) return;
        setIsCheckingAuth(true);

        if (isAuthRoute) {
            setIsCheckingAuth(false);
            setPermissionChecked(true);
            return;
        }

        if (!isTokenValid()) {
            localStorage.removeItem("accessToken");
            router.replace("/login");
            return;
        }

        setIsCheckingAuth(false);
        if (!permissionFetchedRef.current) {
            permissionFetchedRef.current = true;
            dispatch(fetchRolePermissionsSidebar());
        }
    }, [mounted, isAuthRoute, router, dispatch]);

    useEffect(() => {
        if (!mounted || isCheckingAuth) return;
        if (isAuthRoute || isPublicRoute) {
            setPermissionChecked(true);
            setIsUnauthorized(false);
            return;
        }

        if (permissionsLoading) return;

        if (permissionsError) {
            router.replace("/login");
            return;
        }

        if (rolePermissions?.permissions) {
            const pageName = routeToPageNameMap[pathname];

            if (!pageName) {
                setPermissionChecked(true);
                setIsUnauthorized(false);
                return;
            }

            const hasAccess = hasViewPermission(pageName, rolePermissions.permissions);

            if (!hasAccess) {
                if (!redirectAttemptedRef.current) {
                    redirectAttemptedRef.current = true;
                    setIsRedirecting(true);

                    const firstAvailableRoute = getFirstAvailableRoute(rolePermissions.permissions);

                    if (firstAvailableRoute && firstAvailableRoute !== pathname) {
                        router.replace(firstAvailableRoute);
                        return;
                    } else {
                        setIsUnauthorized(true);
                        setPermissionChecked(true);
                        setIsRedirecting(false);
                    }
                }
                return;
            }

            setIsUnauthorized(false);
            setPermissionChecked(true);
            setIsRedirecting(false);
        }
    }, [mounted, pathname, rolePermissions, permissionsLoading, permissionsError, isAuthRoute, isPublicRoute, isCheckingAuth, router]);

    if (!mounted) return null;

    if (isCheckingAuth || isRedirecting || (!permissionChecked && !isAuthRoute)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isRedirecting ? 'Redirecting...' : 'Verifying Permissions...'}
                    </p>
                </div>
            </div>
        );
    }

    if (isUnauthorized) return <NotFoundPage />;
    if (isAuthRoute) return <main className="flex-1">{children}</main>;

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black">
                <Sidebar />
                <MainContent>{children}</MainContent>
            </div>
        </SidebarProvider>
    );
}

function NotFoundPage() {
    const router = useRouter();
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-900">
            <div className="text-center">
                <p className="mt-5 text-base text-white">You Don&apos;t Have Access To This Page.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-7 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <main
            className={`
        transition-all duration-300 ease-out
        ${collapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}
      `}
        >
            <Header />
            <div className="p-4 lg:p-6">{children}</div>
        </main>
    );
}