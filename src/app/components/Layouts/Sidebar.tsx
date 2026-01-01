'use client';
import Link from 'next/link';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, X, LifeBuoy } from 'lucide-react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import AnimateHeight from 'react-animate-height';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';

interface SidebarContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
    return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const { sidebarOpen, toggleSidebar, setSidebarOpen } = useSidebar();
    const [currentMenu, setCurrentMenu] = useState<string>('');

    const { permissions: rolePermissions, loading: rolePermissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            dispatch(fetchRolePermissionsSidebar());
        }
    }, [dispatch]);

    const menuStructure = {
        dashboard: { pageName: 'Dashboard', title: 'Dashboard', href: '/', type: 'single' },
        allMasters: {
            title: 'All Masters',
            type: 'dropdown',
            key: 'All Masters',
            children: [
                { pageName: 'User Management', title: 'User Management', href: '/users' },
                { pageName: 'Roles', title: 'Roles', href: '/roles' },
                { pageName: 'Permissions', title: 'Permissions', href: '/permissions' },
                { pageName: 'Page Permissions', title: 'Page Permissions', href: '/pagepermissions' },
                { pageName: 'User Permissions', title: 'User Permissions', href: '/rolebasedpermissions' },
                { pageName: 'Lead Stage Master View', title: 'Lead Stage Master View', href: '/leadstagemasterpage' },
                { pageName: 'Status Master View', title: 'Status Master View', href: '/statusmasterview' },
                { pageName: 'Land', title: 'Land', href: '/land' },
                { pageName: 'Lead Platform', title: 'Lead Platform', href: '/leadplatform' },
            ]
        },
        projectstatus: { pageName: 'Project Status', title: 'Project Status', href: '/projectstatus', type: 'single' },
        Lead: { pageName: 'Lead', title: 'Lead', href: '/lead', type: 'single' },
        support: { pageName: 'Support', title: 'Support', href: '/support', type: 'single', alwaysShow: true },
    };

    const isViewPermissionValid = (ids: number[]) => ids.includes(17);

    const getFilteredMenu = () => {
        if (!rolePermissions?.permissions) return {};
        const filtered: any = {};
        Object.entries(menuStructure).forEach(([key, item]: any) => {
            // Agar hamesha dikhana hai (Support ke liye)
            if (item.alwaysShow) {
                filtered[key] = item;
                return;
            }

            if (item.type === 'single') {
                const permission = rolePermissions.permissions.find(
                    (perm: any) => perm.pageName === item.pageName && isViewPermissionValid(perm.permissionIds)
                );
                if (permission) filtered[key] = item;
            }
            if (item.type === 'dropdown') {
                const children = item.children.filter((child: any) => {
                    const permission = rolePermissions.permissions.find(
                        (perm: any) => perm.pageName === child.pageName && isViewPermissionValid(perm.permissionIds)
                    );
                    return permission;
                });
                if (children.length > 0) filtered[key] = { ...item, children };
            }
        });
        return filtered;
    };

    const filteredMenuItems = getFilteredMenu();

    useEffect(() => {
        if (window.innerWidth < 1024) setSidebarOpen(false);
    }, [pathname, setSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth >= 1024) return;
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.querySelector('.sidebar-toggle');
            if (
                sidebar &&
                !sidebar.contains(event.target as Node) &&
                !toggleBtn?.contains(event.target as Node)
            ) {
                setSidebarOpen(false);
            }
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen, setSidebarOpen]);

    if (rolePermissionsLoading) {
        return (
            <nav className="sidebar fixed top-0 bottom-0 z-50 h-full w-[260px] bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0">
                <div className="p-4 space-y-3 animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {sidebarOpen && (
                <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
            )}
            <nav
                className={`sidebar fixed top-0 bottom-0 z-50 h-full w-[260px] bg-white dark:bg-gray-900 shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] dark:shadow-[5px_0_25px_0_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <Link href="/" className="main-logo flex items-center gap-2">
                            <span className="text-2xl font-semibold text-gray-900 dark:text-white">RSC Group</span>
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden h-8 w-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <PerfectScrollbar
                            className="h-full"
                            options={{
                                wheelSpeed: 2,
                                wheelPropagation: false,
                                suppressScrollX: true,
                            }}
                        >
                            <ul className="space-y-0.5 p-4 font-semibold">
                                {filteredMenuItems.dashboard && (
                                    <li className="menu nav-item">
                                        <Link
                                            href={filteredMenuItems.dashboard.href}
                                            className="nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                                        >
                                            <span>{filteredMenuItems.dashboard.title}</span>
                                        </Link>
                                    </li>
                                )}

                                {filteredMenuItems.allMasters && (
                                    <li className="menu nav-item">
                                        <button
                                            onClick={() =>
                                                setCurrentMenu(
                                                    currentMenu === filteredMenuItems.allMasters.key ? '' : filteredMenuItems.allMasters.key
                                                )
                                            }
                                            className={`nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100 ${currentMenu === filteredMenuItems.allMasters.key ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                                        >
                                            <span>{filteredMenuItems.allMasters.title}</span>
                                            <ChevronDown
                                                className={`w-5 h-5 transition-transform text-gray-900 dark:text-gray-100 ${currentMenu === filteredMenuItems.allMasters.key ? 'rotate-0' : '-rotate-90'}`}
                                            />
                                        </button>
                                        <AnimateHeight duration={300} height={currentMenu === filteredMenuItems.allMasters.key ? 'auto' : 0}>
                                            <ul className="sub-menu pl-6 py-2 space-y-1 text-sm">
                                                {filteredMenuItems.allMasters.children.map((child: any, index: number) => (
                                                    <li key={index}>
                                                        <Link
                                                            href={child.href}
                                                            className="block px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AnimateHeight>
                                    </li>
                                )}

                                {filteredMenuItems.projectstatus && (
                                    <li className="menu nav-item">
                                        <Link
                                            href={filteredMenuItems.projectstatus.href}
                                            className="nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                                        >
                                            <span>{filteredMenuItems.projectstatus.title}</span>
                                        </Link>
                                    </li>
                                )}

                                {filteredMenuItems.Lead && (
                                    <li className="menu nav-item">
                                        <Link
                                            href={filteredMenuItems.Lead.href}
                                            className="nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                                        >
                                            <span>{filteredMenuItems.Lead.title}</span>
                                        </Link>
                                    </li>
                                )}


                                {filteredMenuItems.support && (
                                    <li className="menu nav-item border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                                        <Link
                                            href={filteredMenuItems.support.href}
                                            className={`
                                                nav-link group flex w-full items-center gap-3 rounded px-3 py-2 text-left 
                                                transition-all duration-200 hover:scale-[1.02]
                                                bg-gradient-to-r from-blue-50 to-blue-100
                                                dark:from-blue-950/60 dark:to-blue-900/40
                                                border border-blue-200 dark:border-blue-700
                                                shadow-sm hover:shadow-md
                                                ${pathname === '/support'
                                                    ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-100'
                                                    : 'text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100'
                                                }
                                            `}
                                        >
                                            <LifeBuoy className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                            <span className="font-semibold tracking-wide uppercase text-sm">
                                                {filteredMenuItems.support.title}
                                            </span>
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-500/30 text-blue-700 dark:text-blue-100 font-medium">
                                                Help
                                            </span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </PerfectScrollbar>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;