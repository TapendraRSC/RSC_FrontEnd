"use client";
import Link from 'next/link';
import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
    ChevronDown,
    X,
    LifeBuoy,
    LayoutDashboard,
    Users,
    Shield,
    FileKey,
    UserCog,
    GitBranch,
    Activity,
    Map,
    Share2,
    BarChart3,
    UserCheck,
    FolderKanban,
    Target,
    CalendarCheck,
    Wallet,
    Building2,
    Sparkles
} from 'lucide-react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import AnimateHeight from 'react-animate-height';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import Image from 'next/image';
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


const iconMap: Record<string, React.ReactNode> = {
    'Dashboard': <LayoutDashboard className="w-5 h-5" />,
    'User Management': <Users className="w-5 h-5" />,
    'Roles': <Shield className="w-5 h-5" />,
    'Permissions': <FileKey className="w-5 h-5" />,
    'Page Permissions': <FileKey className="w-5 h-5" />,
    'User Permissions': <UserCog className="w-5 h-5" />,
    'Lead Stage Master View': <GitBranch className="w-5 h-5" />,
    'Status Master View': <Activity className="w-5 h-5" />,
    'Land': <Map className="w-5 h-5" />,
    'Lead Platform': <Share2 className="w-5 h-5" />,
    'Google Analytics': <BarChart3 className="w-5 h-5" />,
    'Assistant Director': <UserCheck className="w-5 h-5" />,
    'Project Status': <FolderKanban className="w-5 h-5" />,
    'Lead': <Target className="w-5 h-5" />,
    'Booking': <CalendarCheck className="w-5 h-5" />,
    'Collection': <Wallet className="w-5 h-5" />,
    'Support': <LifeBuoy className="w-5 h-5" />,
    'All Masters': <Sparkles className="w-5 h-5" />,
};


const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const { sidebarOpen, toggleSidebar, setSidebarOpen } = useSidebar();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Track if we already fetched permissions
    const hasFetchedRef = useRef(false);

    const { permissions: rolePermissions, loading: rolePermissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    // Fetch only once on mount
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            dispatch(fetchRolePermissionsSidebar());
        }
    }, [dispatch]);

    const menuStructure = {
        dashboard: {
            pageName: 'Dashboard',
            title: 'Dashboard',
            href: '/',
            type: 'single',
            icon: iconMap['Dashboard']
        },
        allMasters: {
            title: 'All Masters',
            type: 'dropdown',
            key: 'All Masters',
            icon: iconMap['All Masters'],
            children: [
                { pageName: 'User Management', title: 'User Management', href: '/users', icon: iconMap['User Management'] },
                { pageName: 'Roles', title: 'Roles', href: '/roles', icon: iconMap['Roles'] },
                { pageName: 'Permissions', title: 'Permissions', href: '/permissions', icon: iconMap['Permissions'] },
                { pageName: 'Page Permissions', title: 'Page Permissions', href: '/pagepermissions', icon: iconMap['Page Permissions'] },
                { pageName: 'User Permissions', title: 'User Permissions', href: '/rolebasedpermissions', icon: iconMap['User Permissions'] },
                { pageName: 'Lead Stage Master View', title: 'Lead Stage Master', href: '/leadstagemasterpage', icon: iconMap['Lead Stage Master View'] },
                { pageName: 'Status Master View', title: 'Status Master', href: '/statusmasterview', icon: iconMap['Status Master View'] },
                { pageName: 'Land', title: 'Land', href: '/land', icon: iconMap['Land'] },
                { pageName: 'Lead Platform', title: 'Lead Platform', href: '/leadplatform', icon: iconMap['Lead Platform'] },
                { pageName: 'Google Analytics', title: 'Google Analytics', href: '/googleanalytics', icon: iconMap['Google Analytics'] },
            ]
        },
        assistantdirector: {
            pageName: 'Assistantdirector',
            title: 'Assistant Director',
            href: '/Assistantdirector',
            type: 'single',
            icon: iconMap['Assistant Director']
        },
        projectstatus: {
            pageName: 'Project Status',
            title: 'Project Status',
            href: '/projectstatus',
            type: 'single',
            icon: iconMap['Project Status']
        },
        lead: {
            pageName: 'Lead',
            title: 'Lead',
            href: '/lead',
            type: 'single',
            icon: iconMap['Lead']
        },
        booking: {
            pageName: 'Booking',
            title: 'Booking',
            href: '/booking',
            type: 'single',
            icon: iconMap['Booking']
        },
        collection: {
            pageName: 'Collection',
            title: 'Collection',
            href: '/collection',
            type: 'single',
            icon: iconMap['Collection']
        },
        support: {
            pageName: 'Support',
            title: 'Support',
            href: '/support',
            type: 'single',
            alwaysShow: true,
            icon: iconMap['Support']
        },
    };

    const isViewPermissionValid = (ids: number[]) => ids?.includes(17) ?? false;

    const getFilteredMenu = () => {
        if (!rolePermissions?.permissions) return {};
        const filtered: any = {};
        Object.entries(menuStructure).forEach(([key, item]: any) => {
            if (item.alwaysShow) {
                filtered[key] = item;
                return;
            }
            if (item.type === 'single') {
                const permission = rolePermissions.permissions.find(
                    (perm: any) => perm.pageName === item.pageName
                );
                if (permission && isViewPermissionValid(permission.permissionIds)) {
                    filtered[key] = item;
                }
            }
            if (item.type === 'dropdown') {
                const children = item.children.filter((child: any) => {
                    const permission = rolePermissions.permissions.find(
                        (perm: any) => perm.pageName === child.pageName
                    );
                    return permission && isViewPermissionValid(permission.permissionIds);
                });
                if (children.length > 0) {
                    filtered[key] = { ...item, children };
                }
            }
        });
        return filtered;
    };

    const filteredMenuItems = getFilteredMenu();

    const handleMenuToggle = useCallback((menuKey: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    }, []);

    const isActiveLink = useCallback((href: string) => pathname === href, [pathname]);

    const hasActiveChild = useCallback((children?: any[]) => {
        return children?.some(child => child.href && isActiveLink(child.href));
    }, [isActiveLink]);

    // Auto-open All Masters dropdown if child is active
    useEffect(() => {
        const allMastersChildren = menuStructure.allMasters.children;
        const isInAllMasters = allMastersChildren.some(child => pathname === child.href);
        if (isInAllMasters && !openMenus['All Masters']) {
            setOpenMenus(prev => ({ ...prev, 'All Masters': true }));
        }
    }, [pathname]);

    // Close sidebar on mobile navigation - with delay
    useEffect(() => {
        if (window.innerWidth < 1024) {
            const timer = setTimeout(() => {
                setSidebarOpen(false);
            }, 100);
            return () => clearTimeout(timer);
        }
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

    // FIX: Only show loading on FIRST load, not on every navigation
    const isInitialLoading = rolePermissionsLoading && !rolePermissions?.permissions;

    if (isInitialLoading) {
        return (
            <nav className="sidebar fixed top-0 bottom-0 z-50 h-full w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:translate-x-0">
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    </div>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        </div>
                    ))}
                </div>
            </nav>
        );
    }

    const renderMenuItem = (key: string, item: any) => {
        if (!item) return null;
        const isActive = isActiveLink(item.href);

        return (
            <li key={key}>
                <Link
                    href={item.href}
                    className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                        transition-all duration-300 ease-in-out
                        hover:pl-5 
                        ${isActive
                            ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-indigo-500 text-white shadow-lg shadow-orange-500/30 pl-5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                        }
                    `}
                >
                    <span className={`
                        relative flex-shrink-0 transition-all duration-300
                        ${isActive
                            ? 'text-white scale-110'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:scale-110'
                        }
                    `}>
                        {item.icon}
                    </span>

                    <span className="relative font-medium text-sm tracking-wide transition-transform duration-300">
                        {item.title}
                    </span>

                    {isActive && (
                        <span className="absolute right-3 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                    )}
                </Link>
            </li>
        );
    };

    const renderDropdownMenu = (key: string, item: any) => {
        if (!item) return null;
        const isOpen = openMenus[item.key];
        const hasActive = hasActiveChild(item.children);

        return (
            <li key={key}>
                <button
                    type="button"
                    onClick={() => handleMenuToggle(item.key)}
                    className={`
                        group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5
                        transition-all duration-300 ease-in-out
                        hover:pl-5
                        ${hasActive
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 pl-5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className={`
                            flex-shrink-0 transition-all duration-300
                            ${hasActive
                                ? 'text-orange-500 dark:text-orange-400 scale-110'
                                : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:scale-110'
                            }
                        `}>
                            {item.icon}
                        </span>
                        <span className="font-medium text-sm tracking-wide">{item.title}</span>
                    </div>

                    <div className={`
                        flex items-center justify-center w-6 h-6 rounded-lg
                        transition-all duration-300
                        ${isOpen ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}
                    `}>
                        <ChevronDown className={`
                            w-4 h-4 transition-transform duration-300 ease-out
                            ${hasActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}
                            ${isOpen ? 'rotate-180' : 'rotate-0'}
                        `} />
                    </div>
                </button>

                <AnimateHeight duration={300} height={isOpen ? 'auto' : 0} easing="ease-out">
                    <ul className="mt-2 ml-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                        {item.children.map((child: any, index: number) => {
                            const isChildActive = child.href && isActiveLink(child.href);
                            return (
                                <li
                                    key={index}
                                    className="transform transition-all duration-300"
                                    style={{
                                        transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                                        opacity: isOpen ? 1 : 0,
                                        transform: isOpen ? 'translateX(0)' : 'translateX(-10px)'
                                    }}
                                >
                                    <Link
                                        href={child.href}
                                        className={`
                                            group flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                            transition-all duration-300 ease-in-out
                                            hover:pl-5
                                            ${isChildActive
                                                ? 'bg-gradient-to-r from-orange-500/10 to-indigo-500/10 dark:from-orange-500/20 dark:to-indigo-500/20 text-orange-600 dark:text-orange-400 font-medium border-l-2 border-orange-500 -ml-[2px] pl-5'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            flex-shrink-0 w-4 h-4 transition-all duration-200
                                            ${isChildActive
                                                ? 'text-orange-500 dark:text-orange-400'
                                                : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400'
                                            }
                                        `}>
                                            {child.icon}
                                        </span>
                                        <span>{child.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </AnimateHeight>
            </li>
        );
    };


    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem("theme");
        setIsDark(theme === "dark");
    }, []);

    return (
        <>
            {sidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    aria-hidden="true"
                />
            )}

            <nav
                className={`
                    sidebar fixed top-0 left-0 z-50 h-screen w-[280px]
                    bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                    border-r border-gray-200/80 dark:border-gray-800/80
                    shadow-2xl shadow-gray-900/5 dark:shadow-black/20
                    transition-all duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-[100px] px-5 border-b border-gray-200/80 dark:border-gray-800/80">

                        <Link href="/" className="group h-full">
                            <div className="relative h-full w-full flex items-center">
                                <div
                                    className="
        relative
        h-full
        min-w-[280px] md:min-w-[360px]
        px-6
        flex items-center
        justify-center
      "
                                >
                                    <Image
                                        src="/RSC-GOLD-NEW-with-R.png"
                                        alt="RSC Group Logo"
                                        width={420}
                                        height={140}
                                        priority
                                        className="
          max-h-[80%]
          w-auto
          object-contain
          translate-y-[1px] 
          translate-x-[-50px]
          rsc-logo-animate
        "
                                    />
                                </div>
                            </div>
                        </Link>


                        {/* Mobile close button */}
                        {/* <button
                            type="button"
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button> */}

                    </div>



                    <div className="flex-1 overflow-hidden">
                        <PerfectScrollbar
                            className="h-full px-4 py-6"
                            options={{ wheelSpeed: 1, wheelPropagation: false, suppressScrollX: true }}
                        >
                            <ul className="space-y-1.5">
                                {filteredMenuItems.dashboard && renderMenuItem('dashboard', filteredMenuItems.dashboard)}
                                {filteredMenuItems.allMasters && renderDropdownMenu('allMasters', filteredMenuItems.allMasters)}
                                {filteredMenuItems.assistantdirector && renderMenuItem('assistantdirector', filteredMenuItems.assistantdirector)}
                                {filteredMenuItems.projectstatus && renderMenuItem('projectstatus', filteredMenuItems.projectstatus)}
                                {filteredMenuItems.lead && renderMenuItem('lead', filteredMenuItems.lead)}
                                {filteredMenuItems.booking && renderMenuItem('booking', filteredMenuItems.booking)}
                                {filteredMenuItems.collection && renderMenuItem('collection', filteredMenuItems.collection)}
                                {filteredMenuItems.support && (
                                    <li className="menu nav-item border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                                        <Link
                                            href={filteredMenuItems.support.href}
                                            className={`nav-link group flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-all duration-300 ease-in-out hover:pl-5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/60 dark:to-orange-900/40 border border-orange-200 dark:border-orange-700 shadow-sm hover:shadow-md ${pathname === '/support' ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-100 pl-5' : 'text-orange-700 dark:text-orange-200 hover:text-orange-800 dark:hover:text-orange-100'}`}
                                        >
                                            <LifeBuoy className="w-5 h-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                            <span className="font-semibold tracking-wide uppercase text-sm dark:text-orange-100">{filteredMenuItems.support.title}</span>
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-200/60 dark:bg-orange-500/30 text-orange-700 dark:text-orange-100 font-medium">Help</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </PerfectScrollbar>
                    </div>
                    <div
                        className={`
                mt-auto border-t p-4 transition-all duration-300
                ${isDark
                                ? "bg-white border-gray-200"
                                : "bg-white/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800"}
            `}
                    >
                        <Link
                            href="https://www.digitechnohub.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                    group flex flex-col items-center justify-center gap-1
                    transition-all duration-300
                    ${isDark ? "opacity-100" : "opacity-70 hover:opacity-100"}
                `}
                        >
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-[2px]">
                                Powered & Designed By
                            </span>

                            <div
                                className={`
                        relative w-32 h-8 transition-all duration-500
                        ${isDark ? "" : "grayscale group-hover:grayscale-0"}
                    `}
                            >
                                <Image
                                    src="/Digitechnohub.webp"
                                    alt="Digitechnohub"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;