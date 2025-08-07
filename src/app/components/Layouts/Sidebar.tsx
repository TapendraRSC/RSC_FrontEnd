'use client';

import Link from 'next/link';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, X } from 'lucide-react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import AnimateHeight from 'react-animate-height';

import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissions } from '../../../../store/rolePermissionSlice';
import { fetchPermissions } from '../../../../store/permissionSlice';

// Sidebar Context Setup
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

// Main Sidebar Component
const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const { sidebarOpen, toggleSidebar, setSidebarOpen } = useSidebar();

    const [currentMenu, setCurrentMenu] = useState<string>('');

    // Redux state
    const { rolePermissions, loading: rolePermissionsLoading } = useSelector((state: RootState) => state.rolePermissions);
    console.log(rolePermissions, "rolePermissions")
    const permissionList = useSelector((state: RootState) => state.permissions.list?.data?.permissions || []);
    const permissionsLoading = useSelector((state: RootState) => state.permissions.loading);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        const roleId = user?.roleId;
        if (roleId) {
            dispatch(fetchRolePermissions(roleId));
            // dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: "" }));
        }
    }, [dispatch]);


    // Sidebar structure
    const menuStructure = {
        dashboard: {
            pageName: 'Dashboard',
            title: 'Dashboard',
            href: '/',
            type: 'single',
            alwaysShow: true
        },
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
                { pageName: 'Plot Status', title: 'Plot Status', href: '/plotstatus' }
            ]
        },
        // plot: {
        //     pageName: 'Plot Status',
        //     title: 'Plot Status',
        //     href: '/plotstatus',
        //     type: 'single',
        //     alwaysShow: true
        // },
    };

    const isViewPermissionValid = (ids: number[]) => {
        return ids.includes(17);
    };

    const getFilteredMenu = () => {
        if (!rolePermissions?.permissions) return {};

        const filtered: any = {};

        Object.entries(menuStructure).forEach(([key, item]: any) => {
            if (item.type === 'single') {
                if (item.alwaysShow) {
                    filtered[key] = item;
                    return;
                }

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

                if (children.length > 0) {
                    filtered[key] = { ...item, children };
                }
            }
        });

        return filtered;
    };

    const filteredMenuItems = getFilteredMenu();

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [pathname]);

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

        if (sidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    // If loading
    if (permissionsLoading || rolePermissionsLoading) {
        return (
            <nav className="sidebar fixed top-0 bottom-0 z-50 h-full w-[260px] bg-white dark:bg-black transition-transform duration-300 ease-in-out lg:translate-x-0">
                <div className="p-4 space-y-3 animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {sidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />}
            <nav className={`sidebar fixed top-0 bottom-0 z-50 h-full w-[260px] bg-white dark:bg-black shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <Link href="/" className="main-logo flex items-center gap-2">
                            <span className="text-2xl font-semibold text-black dark:text-white">RSC Group</span>
                        </Link>
                        <button onClick={toggleSidebar} className="lg:hidden h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <X className="w-5 h-5 text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Menu */}
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="space-y-0.5 p-4 font-semibold">
                            {/* Dashboard */}
                            {filteredMenuItems.dashboard && (
                                <li className="menu nav-item">
                                    <Link href={filteredMenuItems.dashboard.href} className="nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                        <span className="text-black dark:text-white">
                                            {filteredMenuItems.dashboard.title}
                                        </span>
                                    </Link>
                                </li>
                            )}

                            {/* All Masters Dropdown */}
                            {filteredMenuItems.allMasters && (
                                <li className="menu nav-item">
                                    <button
                                        onClick={() => setCurrentMenu(currentMenu === filteredMenuItems.allMasters.key ? '' : filteredMenuItems.allMasters.key)}
                                        className={`nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition ${currentMenu === filteredMenuItems.allMasters.key ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                    >
                                        <span className="text-black dark:text-white">{filteredMenuItems.allMasters.title}</span>
                                        <ChevronDown className={`w-5 h-5 text-black dark:text-white transition-transform ${currentMenu === filteredMenuItems.allMasters.key ? 'rotate-0' : '-rotate-90'}`} />
                                    </button>

                                    <AnimateHeight duration={300} height={currentMenu === filteredMenuItems.allMasters.key ? 'auto' : 0}>
                                        <ul className="sub-menu pl-6 py-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            {filteredMenuItems.allMasters.children.map((child: any, index: number) => (
                                                <li key={index}>
                                                    <Link href={child.href} className="hover:text-black dark:hover:text-white transition">
                                                        {child.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            )}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
