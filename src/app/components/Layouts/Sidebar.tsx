'use client';

import Link from 'next/link';
import PerfectScrollbar from 'react-perfect-scrollbar';
import AnimateHeight from 'react-animate-height';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

// Create Sidebar Context
interface SidebarContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Default false for mobile-first approach

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setSidebarOpen(true); // Always open on desktop
            } else {
                setSidebarOpen(false); // Always closed by default on mobile
            }
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
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    // Close sidebar when clicking outside (mobile only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth < 1024) { // Only for mobile
                const sidebar = document.querySelector('.sidebar');
                const toggleButton = document.querySelector('.sidebar-toggle');

                if (sidebar &&
                    !sidebar.contains(event.target as Node) &&
                    !toggleButton?.contains(event.target as Node)) {
                    setSidebarOpen(false);
                }
            }
        };

        if (sidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSidebarOpen, sidebarOpen]);

    // Handle route changes
    useEffect(() => {
        // Close sidebar on route change for mobile only
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
        setActiveRoute();
    }, [pathname, setSidebarOpen]);

    const setActiveRoute = () => {
        const allLinks = document.querySelectorAll('.sidebar ul a.active');
        allLinks.forEach((link) => link.classList.remove('active'));

        const selector = document.querySelector(`.sidebar ul a[href="${window.location.pathname}"]`);
        selector?.classList.add('active');
    };

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        } else {
            document.body.style.overflow = ''; // Reset for desktop
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    return (
        <>
            {/* Overlay (mobile and tablet only) */}
            {sidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <nav
                className={`sidebar fixed top-0 bottom-0 z-50 h-full w-[260px] bg-white dark:bg-black shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0`} // Always visible on large screens
            >
                <div className="h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <Link href="/" className="main-logo flex items-center gap-2">
                            <span className="text-2xl font-semibold text-black dark:text-white">RSC Group</span>
                        </Link>

                        {/* Close button - only visible on mobile */}
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition lg:hidden"
                        >
                            <X className="w-5 h-5 text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Menu */}
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="space-y-0.5 p-4 font-semibold">
                            <li className="menu nav-item">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu('dashboard')}
                                    className={`nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition ${currentMenu === 'dashboard' ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`}
                                >
                                    <span className="text-black dark:text-white">Dashboard</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-black dark:text-white transition-transform ${currentMenu === 'dashboard' ? 'rotate-0' : '-rotate-90'
                                            }`}
                                    />
                                </button>
                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu pl-6 py-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li>
                                            <Link href="/" className="hover:text-black dark:hover:text-white">
                                                Sales
                                            </Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu('User Permisson')}
                                    className={`nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition ${currentMenu === 'User Permisson' ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`}
                                >
                                    <span className="text-black dark:text-white">All Masters</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-black dark:text-white transition-transform ${currentMenu === 'User Permisson' ? 'rotate-0' : '-rotate-90'
                                            }`}
                                    />
                                </button>
                                <AnimateHeight duration={300} height={currentMenu === 'User Permisson' ? 'auto' : 0}>
                                    <ul className="sub-menu pl-6 py-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li>
                                            <Link href="/users" className="hover:text-black dark:hover:text-white">
                                                User Management
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/roles" className="hover:text-black dark:hover:text-white">
                                                Roles
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/permissions" className="hover:text-black dark:hover:text-white">
                                                Permissions
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/pagepermissions" className="hover:text-black dark:hover:text-white">
                                                Page Permissions
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/rolebasedpermissions" className="hover:text-black dark:hover:text-white">
                                                User Permissions
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/leadstagemasterpage" className="hover:text-black dark:hover:text-white">
                                                Lead Stage Master
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/statusmasterview" className="hover:text-black dark:hover:text-white">
                                                Status Master View
                                            </Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu('Lead Management')}
                                    className={`nav-link group flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition ${currentMenu === 'Lead Management' ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`}
                                >
                                    <span className="text-black dark:text-white">Lead Management</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-black dark:text-white transition-transform ${currentMenu === 'Lead Management' ? 'rotate-0' : '-rotate-90'
                                            }`}
                                    />
                                </button>
                                <AnimateHeight duration={300} height={currentMenu === 'Lead Management' ? 'auto' : 0}>
                                    <ul className="sub-menu pl-6 py-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li>
                                            <Link href="/" className="hover:text-black dark:hover:text-white">
                                                Today Call
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/" className="hover:text-black dark:hover:text-white">
                                                Lead
                                            </Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;