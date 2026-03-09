"use client";
import Link from 'next/link';
import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    Sparkles,
    Layers,
    Globe,
    CreditCard,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import AnimateHeight from 'react-animate-height';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchRolePermissionsSidebar } from '../../../../store/sidebarPermissionSlice';
import Image from 'next/image';

/* ═══════════════════════════════════════
   Sidebar Context — includes collapsed
   ═══════════════════════════════════════ */
interface SidebarContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
    return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const toggleCollapse = () => setCollapsed(prev => !prev);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
                setCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar, collapsed, setCollapsed, toggleCollapse }}>
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
    'Payment Platforms': <Wallet className="w-5 h-5" />,
    'Assistant Director': <UserCheck className="w-5 h-5" />,
    'Project Status': <FolderKanban className="w-5 h-5" />,
    'Lead': <Target className="w-5 h-5" />,
    'Booking': <CalendarCheck className="w-5 h-5" />,
    'Collection': <Wallet className="w-5 h-5" />,
    'Support': <LifeBuoy className="w-5 h-5" />,
    'All Masters': <Sparkles className="w-5 h-5" />,
    'Bulk Land': <Layers className="w-5 h-5" />,
    'Online Collection': <Globe className="w-5 h-5" />,
    'Credit Collection': <CreditCard className="w-5 h-5" />,
};


/* ─── Portal Popover (collapsed dropdown) ─── */
const CollapsedPopover = ({
    item,
    isActiveLink,
}: {
    item: any;
    isActiveLink: (href: string) => boolean;
}) => {
    const [show, setShow] = useState(false);
    const [portalMounted, setPortalMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasActive = item.children?.some((child: any) => child.href && isActiveLink(child.href));

    useEffect(() => { setPortalMounted(true); }, []);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const popoverHeight = (item.children?.length || 0) * 44 + 50;
            let top = rect.top;
            if (top + popoverHeight > window.innerHeight - 10) {
                top = window.innerHeight - popoverHeight - 10;
            }
            if (top < 10) top = 10;
            setPosition({ top, left: rect.right + 8 });
        }
    };

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        updatePosition();
        setShow(true);
    };
    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setShow(false), 200);
    };
    const handlePopoverEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    const handlePopoverLeave = () => {
        timeoutRef.current = setTimeout(() => setShow(false), 200);
    };

    return (
        <div ref={triggerRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <div className={`
                flex items-center justify-center w-11 h-11 rounded-xl mx-auto cursor-pointer transition-all duration-200
                ${hasActive
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-indigo-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-orange-500 dark:hover:text-orange-400'
                }
            `}>
                <span className="flex-shrink-0">{item.icon}</span>
            </div>

            {show && portalMounted && createPortal(
                <div
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handlePopoverLeave}
                    style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 99999 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl shadow-black/15 dark:shadow-black/50 py-2 min-w-[200px] max-h-[70vh] overflow-y-auto"
                >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.title}</span>
                    </div>
                    {item.children.map((child: any, index: number) => {
                        const isChildActive = child.href && isActiveLink(child.href);
                        return (
                            <Link key={index} href={child.href}
                                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-150
                                    ${isChildActive
                                        ? 'bg-gradient-to-r from-orange-500/10 to-indigo-500/10 dark:from-orange-500/20 dark:to-indigo-500/20 text-orange-600 dark:text-orange-400 font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className={`w-4 h-4 flex-shrink-0 ${isChildActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>{child.icon}</span>
                                {child.title}
                            </Link>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
};


/* ─── Portal Tooltip (collapsed single item) ─── */
const CollapsedIconLink = ({ item, isActive }: { item: any; isActive: boolean }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [portalMounted, setPortalMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setPortalMounted(true); }, []);

    const handleEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({ top: rect.top + rect.height / 2, left: rect.right + 12 });
        }
        setShowTooltip(true);
    };

    return (
        <div ref={triggerRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={() => setShowTooltip(false)}>
            <Link href={item.href}
                className={`flex items-center justify-center w-11 h-11 rounded-xl mx-auto transition-all duration-200
                    ${isActive
                        ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-indigo-500 text-white shadow-lg shadow-orange-500/30'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-orange-500 dark:hover:text-orange-400'
                    }`}
            >
                <span className="flex-shrink-0">{item.icon}</span>
            </Link>

            {showTooltip && portalMounted && createPortal(
                <div
                    style={{ position: 'fixed', top: position.top, left: position.left, transform: 'translateY(-50%)', zIndex: 99999 }}
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
                >
                    {item.title}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-100" />
                </div>,
                document.body
            )}
        </div>
    );
};


/* ═══════════════════════════════════════
   Main Sidebar Component
   ═══════════════════════════════════════ */
const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const { sidebarOpen, toggleSidebar, setSidebarOpen, collapsed, toggleCollapse } = useSidebar();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const hasFetchedRef = useRef(false);

    const { permissions: rolePermissions, loading: rolePermissionsLoading } = useSelector(
        (state: RootState) => state.sidebarPermissions
    );

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            dispatch(fetchRolePermissionsSidebar());
        }
    }, [dispatch]);

    const menuStructure = {
        dashboard: { pageName: 'Dashboard', title: 'Dashboard', href: '/', type: 'single', icon: iconMap['Dashboard'] },
        allMasters: {
            title: 'All Masters', type: 'dropdown', key: 'All Masters', icon: iconMap['All Masters'],
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
                { pageName: 'Payment Platforms', title: 'Payment Platforms', href: '/paymentplatforms', icon: iconMap['Payment Platforms'] },
            ]
        },
        assistantdirector: { pageName: 'Assistantdirector', title: 'Assistant Director', href: '/Assistantdirector', type: 'single', icon: iconMap['Assistant Director'] },
        bulkland: { pageName: 'Bulk Land', title: 'Bulk Land', href: '/bulkland', type: 'single', icon: iconMap['Bulk Land'] },
        projectstatus: { pageName: 'Project Status', title: 'Project Status', href: '/projectstatus', type: 'single', icon: iconMap['Project Status'] },
        lead: { pageName: 'Lead', title: 'Lead', href: '/lead', type: 'single', icon: iconMap['Lead'] },
        booking: { pageName: 'Booking', title: 'Booking', href: '/booking', type: 'single', icon: iconMap['Booking'] },
        collection: { pageName: 'Collection', title: 'Collection', href: '/collection', type: 'single', icon: iconMap['Collection'] },
        onlinecollection: { pageName: 'Online Collection', title: 'Online Collection', href: '/onlinecollection', type: 'single', icon: iconMap['Online Collection'] },
        creditcollection: { pageName: 'Credit Collection', title: 'Credit Collection', href: '/creditcollection', type: 'single', icon: iconMap['Credit Collection'] },
        support: { pageName: 'Support', title: 'Support', href: '/support', type: 'single', alwaysShow: true, icon: iconMap['Support'] },
    };

    const hasViewPermission = (permissionIds: number[]) => permissionIds && permissionIds.length > 0;

    const getFilteredMenu = () => {
        if (!rolePermissions?.permissions) return {};
        const filtered: any = {};
        Object.entries(menuStructure).forEach(([key, item]: any) => {
            if (item.alwaysShow) { filtered[key] = item; return; }
            if (item.type === 'single') {
                const permission = rolePermissions.permissions.find((perm: any) => perm.pageName === item.pageName);
                if (permission && hasViewPermission(permission.permissionIds)) filtered[key] = item;
            }
            if (item.type === 'dropdown') {
                const children = item.children.filter((child: any) => {
                    const permission = rolePermissions.permissions.find((perm: any) => perm.pageName === child.pageName);
                    return permission && hasViewPermission(permission.permissionIds);
                });
                if (children.length > 0) filtered[key] = { ...item, children };
            }
        });
        return filtered;
    };

    const filteredMenuItems = getFilteredMenu();
    const handleMenuToggle = useCallback((menuKey: string) => { setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] })); }, []);
    const isActiveLink = useCallback((href: string) => pathname === href, [pathname]);
    const hasActiveChild = useCallback((children?: any[]) => children?.some(child => child.href && isActiveLink(child.href)), [isActiveLink]);

    useEffect(() => {
        const allMastersChildren = menuStructure.allMasters.children;
        if (allMastersChildren.some(child => pathname === child.href) && !openMenus['All Masters']) {
            setOpenMenus(prev => ({ ...prev, 'All Masters': true }));
        }
    }, [pathname]);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            const timer = setTimeout(() => setSidebarOpen(false), 100);
            return () => clearTimeout(timer);
        }
    }, [pathname, setSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth >= 1024) return;
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.querySelector('.sidebar-toggle');
            if (sidebar && !sidebar.contains(event.target as Node) && !toggleBtn?.contains(event.target as Node)) {
                setSidebarOpen(false);
            }
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen, setSidebarOpen]);

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

    /* ─── ORIGINAL expanded menu item ─── */
    const renderMenuItem = (key: string, item: any) => {
        if (!item) return null;
        const isActive = isActiveLink(item.href);
        return (
            <li key={key}>
                <Link href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ease-in-out hover:pl-5
                        ${isActive
                            ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-indigo-500 text-white shadow-lg shadow-orange-500/30 pl-5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <span className={`relative flex-shrink-0 transition-all duration-300
                        ${isActive ? 'text-white scale-110' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:scale-110'}`}>
                        {item.icon}
                    </span>
                    <span className="relative font-medium text-sm tracking-wide transition-transform duration-300">{item.title}</span>
                    {isActive && <span className="absolute right-3 w-2 h-2 rounded-full bg-white/80 animate-pulse" />}
                </Link>
            </li>
        );
    };

    /* ─── ORIGINAL expanded dropdown ─── */
    const renderDropdownMenu = (key: string, item: any) => {
        if (!item) return null;
        const isOpen = openMenus[item.key];
        const hasActive = hasActiveChild(item.children);
        return (
            <li key={key}>
                <button type="button" onClick={() => handleMenuToggle(item.key)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-300 ease-in-out hover:pl-5
                        ${hasActive
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 pl-5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 transition-all duration-300
                            ${hasActive ? 'text-orange-500 dark:text-orange-400 scale-110' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:scale-110'}`}>
                            {item.icon}
                        </span>
                        <span className="font-medium text-sm tracking-wide">{item.title}</span>
                    </div>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 ${isOpen ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-out ${hasActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'} ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </div>
                </button>
                <AnimateHeight duration={300} height={isOpen ? 'auto' : 0} easing="ease-out">
                    <ul className="mt-2 ml-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                        {item.children.map((child: any, index: number) => {
                            const isChildActive = child.href && isActiveLink(child.href);
                            return (
                                <li key={index} className="transform transition-all duration-300"
                                    style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms', opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateX(0)' : 'translateX(-10px)' }}>
                                    <Link href={child.href}
                                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-in-out hover:pl-5
                                            ${isChildActive
                                                ? 'bg-gradient-to-r from-orange-500/10 to-indigo-500/10 dark:from-orange-500/20 dark:to-indigo-500/20 text-orange-600 dark:text-orange-400 font-medium border-l-2 border-orange-500 -ml-[2px] pl-5'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                                            }`}>
                                        <span className={`flex-shrink-0 w-4 h-4 transition-all duration-200
                                            ${isChildActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400'}`}>
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

    /* ═══ COLLAPSED SIDEBAR ═══ */
    if (collapsed) {
        return (
            <nav className={`sidebar fixed top-0 left-0 z-50 h-screen w-[80px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/80 dark:border-gray-800/80 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
                <div className="flex items-center justify-center h-[100px] border-b border-gray-200/80 dark:border-gray-800/80">
                    <Link href="/"><div className="w-11 h-11 flex items-center justify-center"><Image src="/RSC-GOLD-NEW-with-R.png" alt="RSC" width={44} height={44} priority className="w-full h-full object-contain" /></div></Link>
                </div>
                <div className="flex items-center justify-center py-3">
                    <button onClick={toggleCollapse} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Expand sidebar">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="space-y-1.5 px-3">
                        {filteredMenuItems.dashboard && <CollapsedIconLink item={filteredMenuItems.dashboard} isActive={isActiveLink('/')} />}
                        {filteredMenuItems.allMasters && <CollapsedPopover item={filteredMenuItems.allMasters} isActiveLink={isActiveLink} />}
                        {filteredMenuItems.assistantdirector && <CollapsedIconLink item={filteredMenuItems.assistantdirector} isActive={isActiveLink('/Assistantdirector')} />}
                        {filteredMenuItems.bulkland && <CollapsedIconLink item={filteredMenuItems.bulkland} isActive={isActiveLink('/bulkland')} />}
                        {filteredMenuItems.projectstatus && <CollapsedIconLink item={filteredMenuItems.projectstatus} isActive={isActiveLink('/projectstatus')} />}
                        {filteredMenuItems.lead && <CollapsedIconLink item={filteredMenuItems.lead} isActive={isActiveLink('/lead')} />}
                        {filteredMenuItems.booking && <CollapsedIconLink item={filteredMenuItems.booking} isActive={isActiveLink('/booking')} />}
                        {filteredMenuItems.collection && <CollapsedIconLink item={filteredMenuItems.collection} isActive={isActiveLink('/collection')} />}
                        {filteredMenuItems.creditcollection && <CollapsedIconLink item={filteredMenuItems.creditcollection} isActive={isActiveLink('/creditcollection')} />}
                        {filteredMenuItems.onlinecollection && <CollapsedIconLink item={filteredMenuItems.onlinecollection} isActive={isActiveLink('/onlinecollection')} />}
                        {filteredMenuItems.support && <CollapsedIconLink item={filteredMenuItems.support} isActive={isActiveLink('/support')} />}
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 p-3">
                    <Link href="https://www.digitechnohub.in/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <div className="relative w-9 h-9"><Image src="/Digitechnohub.png" alt="DTH" fill className="object-contain" /></div>
                    </Link>
                </div>
            </nav>
        );
    }

    /* ═══ EXPANDED SIDEBAR — ORIGINAL UI ═══ */
    return (
        <>
            {sidebarOpen && (
                <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300" aria-hidden="true" />
            )}
            <nav className={`sidebar fixed top-0 left-0 z-50 h-screen w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/80 dark:border-gray-800/80 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-[100px] px-5 border-b border-gray-200/80 dark:border-gray-800/80">
                        <Link href="/" className="group h-full">
                            <div className="relative h-full w-full flex items-center">
                                <div className="relative h-full min-w-[280px] md:min-w-[360px] px-6 flex items-center justify-center">
                                    <Image src="/RSC-GOLD-NEW-with-R.png" alt="RSC Group Logo" width={420} height={140} priority className="max-h-[80%] w-auto object-contain translate-y-[1px] translate-x-[-50px] rsc-logo-animate" />
                                </div>
                            </div>
                        </Link>
                        <button onClick={toggleCollapse} className="hidden lg:flex absolute right-3 top-17 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10" aria-label="Collapse sidebar">
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <PerfectScrollbar className="h-full px-4 py-6" options={{ wheelSpeed: 1, wheelPropagation: false, suppressScrollX: true }}>
                            <ul className="space-y-1.5">
                                {filteredMenuItems.dashboard && renderMenuItem('dashboard', filteredMenuItems.dashboard)}
                                {filteredMenuItems.allMasters && renderDropdownMenu('allMasters', filteredMenuItems.allMasters)}
                                {filteredMenuItems.assistantdirector && renderMenuItem('assistantdirector', filteredMenuItems.assistantdirector)}
                                {filteredMenuItems.bulkland && renderMenuItem('bulkland', filteredMenuItems.bulkland)}
                                {filteredMenuItems.projectstatus && renderMenuItem('projectstatus', filteredMenuItems.projectstatus)}
                                {filteredMenuItems.lead && renderMenuItem('lead', filteredMenuItems.lead)}
                                {filteredMenuItems.booking && renderMenuItem('booking', filteredMenuItems.booking)}
                                {filteredMenuItems.collection && renderMenuItem('collection', filteredMenuItems.collection)}
                                {filteredMenuItems.creditcollection && renderMenuItem('creditcollection', filteredMenuItems.creditcollection)}
                                {filteredMenuItems.onlinecollection && renderMenuItem('onlinecollection', filteredMenuItems.onlinecollection)}
                                {filteredMenuItems.support && (
                                    <li className="menu nav-item border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                                        <Link href={filteredMenuItems.support.href}
                                            className={`nav-link group flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-all duration-300 ease-in-out hover:pl-5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/60 dark:to-orange-900/40 border border-orange-200 dark:border-orange-700 shadow-sm hover:shadow-md ${pathname === '/support' ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-100 pl-5' : 'text-orange-700 dark:text-orange-200 hover:text-orange-800 dark:hover:text-orange-100'}`}>
                                            <LifeBuoy className="w-5 h-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                            <span className="font-semibold tracking-wide uppercase text-sm dark:text-orange-100">{filteredMenuItems.support.title}</span>
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-200/60 dark:bg-orange-500/30 text-orange-700 dark:text-orange-100 font-medium">Help</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </PerfectScrollbar>
                    </div>

                    <div className="mt-auto border-t p-4 bg-white border-gray-200 transition-all duration-300">
                        <Link
                            href="https://www.digitechnohub.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center justify-center gap-1 opacity-100 transition-all duration-300"
                        >
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-[2px]">
                                Powered & Designed By
                            </span>

                            <div className="relative w-32 h-8  transition-all duration-500">
                                <Image
                                    src="/Digitechnohub.png"
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