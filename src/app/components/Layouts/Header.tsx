'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu, User, Mail, Lock, LogOut, LayoutDashboard, Grid, Box,
    CircleEllipsis, Layers, MessageCircle, FileText, Calendar,
    List, Moon, Sun, Users
} from 'lucide-react';
import { useSidebar } from './Sidebar';
import Dropdown from '../dropdown';
import { useTheme } from 'next-themes';
import { StatusBar, Style } from '@capacitor/status-bar';

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { sidebarOpen, toggleSidebar } = useSidebar();
    const [user, setUser] = useState<any>(null);
    const { theme, setTheme } = useTheme();

    // Initialize Capacitor StatusBar
    useEffect(() => {
        const initStatusBar = async () => {
            try {
                await StatusBar.show();
                await StatusBar.setOverlaysWebView({ overlay: false });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                await StatusBar.setStyle({ style: Style.Dark });
            } catch (e) {
                console.log("StatusBar error:", e);
            }
        };
        initStatusBar();
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));

        const selector = document.querySelector(
            'ul.horizontal-menu a[href="' + window.location.pathname + '"]'
        );
        if (selector) {
            const all = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            all.forEach((element) => element?.classList.remove('active'));
            const allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            allLinks.forEach((element) => element?.classList.remove('active'));
            selector?.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                const ele = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele.length > 0) {
                    setTimeout(() => {
                        ele[0]?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <>
            {/* Safe Area Spacer for Status Bar - Fixed height for Android */}
            <div className="h-[24px] lg:h-[env(safe-area-inset-top)] bg-white dark:bg-black"></div>

            <header className={`z-50 w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-[0px]' : 'ml-0'}`}>
                <div className="shadow-sm">
                    {/* Main Header Container */}
                    <div className="relative flex w-full items-center bg-white px-4 py-3
                                   dark:bg-black justify-between lg:justify-end
                                   h-[60px] lg:h-auto">

                        {/* Mobile View - Logo + Menu Button */}
                        <div className="horizontal-logo flex items-center justify-between
                                       ltr:mr-2 rtl:ml-2 lg:hidden w-full">
                            <div className="flex items-center flex-1">
                                <Link href="/" className="main-logo flex shrink-0 items-center">
                                    <span className="text-sm font-semibold transition-all duration-300
                                                   dark:text-white truncate max-w-[150px]">
                                        Dholera Property                                    </span>
                                </Link>
                            </div>
                            <button
                                type="button"
                                className="collapse-icon flex flex-none rounded-full bg-white-light/40
                                          p-2.5 hover:bg-white-light/90 hover:text-primary
                                          dark:bg-dark/40 dark:hover:bg-dark/60"
                                onClick={toggleSidebar}
                                aria-label="Toggle sidebar">
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Desktop Sidebar Toggle (when closed) */}
                        {!sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="hidden lg:flex items-center justify-center
                                          h-9 w-9 rounded-md hover:bg-gray-100
                                          dark:hover:bg-gray-800 transition mr-4">
                                <Menu className="w-5 h-5 text-black dark:text-white" />
                            </button>
                        )}

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center justify-center h-10 w-10
                                          rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Toggle theme">
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="dropdown flex shrink-0">
                                <Dropdown
                                    offset={[0, 8]}
                                    btnClassName="relative group block"
                                    button={
                                        <div className="h-10 w-10 rounded-full overflow-hidden border
                                                       border-gray-200 dark:border-gray-700">
                                            <img
                                                className="h-full w-full object-cover saturate-50
                                                          group-hover:saturate-100 transition-all"
                                                src={user?.profileImage || "/assets/images/user-profile.jpeg"}
                                                alt="User Profile" />
                                        </div>
                                    }>
                                    <ul className="w-[280px] !py-0 font-semibold text-dark dark:text-white-dark
                                                  dark:text-white-light/90 shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                                                  rounded-lg overflow-hidden min-w-[90vw] max-w-[95vw]">
                                        {/* Profile Header */}
                                        <li className="border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center px-4 py-4 space-x-4">
                                                <img
                                                    className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                                    src={user?.profileImage || "/assets/images/user-profile.jpeg"}
                                                    alt="User Profile" />
                                                <div className="flex-1 truncate">
                                                    <h4 className="text-base font-medium flex items-center">
                                                        {user?.name || 'John Doe'}
                                                        <span className="ml-2 rounded-full bg-success-light
                                                                        px-2 py-0.5 text-xs text-success">
                                                            Pro
                                                        </span>
                                                    </h4>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                                        {user?.email || 'johndoe@gmail.com'}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        {/* Menu Items */}
                                        <li>
                                            <Link
                                                href="/profile"
                                                className="flex items-center px-4 py-3 text-sm
                                                          hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <User className="h-4.5 w-4.5 shrink-0 mr-3 text-gray-500" />
                                                Profile
                                            </Link>
                                        </li>
                                        {/* Sign Out */}
                                        <li className="border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center px-4 py-3 text-sm
                                                          text-red-500 hover:bg-red-50
                                                          dark:hover:bg-red-500/10">
                                                <LogOut className="h-4.5 w-4.5 shrink-0 mr-3" />
                                                Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Menu (Desktop Only) */}
                    <ul className="horizontal-menu hidden border-t border-[#ebedf2] bg-white
                                  px-6 py-1.5 font-semibold text-black rtl:space-x-reverse
                                  dark:border-[#191e3a] dark:bg-black dark:text-white-dark
                                  lg:space-x-1.5 xl:space-x-8">
                        {/* Dashboard Menu */}
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link group">
                                <div className="flex items-center">
                                    <LayoutDashboard className="shrink-0 group-hover:text-primary" />
                                    <span className="px-1">Dashboard</span>
                                </div>
                                <div className="right_arrow">
                                    <CircleEllipsis className="group-hover:text-primary" />
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li><Link href="/" className="group-hover:text-primary">Sales</Link></li>
                                <li><Link href="/analytics" className="group-hover:text-primary">Analytics</Link></li>
                                <li><Link href="/finance" className="group-hover:text-primary">Finance</Link></li>
                                <li><Link href="/crypto" className="group-hover:text-primary">Crypto</Link></li>
                            </ul>
                        </li>

                        {/* Apps Menu */}
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link group">
                                <div className="flex items-center">
                                    <Grid className="shrink-0 group-hover:text-primary" />
                                    <span className="px-1">Apps</span>
                                </div>
                                <div className="right_arrow">
                                    <CircleEllipsis className="group-hover:text-primary" />
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li>
                                    <Link href="/apps/chat" className="group-hover:text-primary">
                                        <MessageCircle className="shrink-0" /><span className="px-1">Chat</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/mailbox" className="group-hover:text-primary">
                                        <Mail className="shrink-0" /><span className="px-1">Mailbox</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/todolist" className="group-hover:text-primary">
                                        <List className="shrink-0" /><span className="px-1">Todo List</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/notes" className="group-hover:text-primary">
                                        <FileText className="shrink-0" /><span className="px-1">Notes</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/scrumboard" className="group-hover:text-primary">
                                        <Layers className="shrink-0" /><span className="px-1">Scrumboard</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/contacts" className="group-hover:text-primary">
                                        <Users className="shrink-0" /><span className="px-1">Contacts</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/calendar" className="group-hover:text-primary">
                                        <Calendar className="shrink-0" /><span className="px-1">Calendar</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Components Menu */}
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link group">
                                <div className="flex items-center">
                                    <Box className="shrink-0 group-hover:text-primary" />
                                    <span className="px-1">Components</span>
                                </div>
                                <div className="right_arrow">
                                    <CircleEllipsis className="group-hover:text-primary" />
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li><Link href="/components/tabs" className="group-hover:text-primary">Tabs</Link></li>
                                <li><Link href="/components/accordions" className="group-hover:text-primary">Accordions</Link></li>
                                <li><Link href="/components/modals" className="group-hover:text-primary">Modals</Link></li>
                                <li><Link href="/components/cards" className="group-hover:text-primary">Cards</Link></li>
                                <li><Link href="/components/carousel" className="group-hover:text-primary">Carousel</Link></li>
                                <li><Link href="/components/countdown" className="group-hover:text-primary">Countdown</Link></li>
                                <li><Link href="/components/notifications" className="group-hover:text-primary">Notifications</Link></li>
                            </ul>
                        </li>

                        {/* More Menu */}
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link group">
                                <div className="flex items-center">
                                    <CircleEllipsis className="shrink-0 group-hover:text-primary" />
                                    <span className="px-1">More</span>
                                </div>
                                <div className="right_arrow">
                                    <CircleEllipsis className="group-hover:text-primary" />
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li><Link href="/dragndrop" className="group-hover:text-primary">Drag and Drop</Link></li>
                                <li><Link href="/charts" className="group-hover:text-primary">Charts</Link></li>
                                <li><Link href="/font-icons" className="group-hover:text-primary">Font Icons</Link></li>
                                <li><Link href="/widgets" className="group-hover:text-primary">Widgets</Link></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </header>
        </>
    );
};

export default Header;
