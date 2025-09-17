'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu, User, Mail, Lock, LogOut, LayoutDashboard, Grid, Box, CircleEllipsis,
    Layers, MessageCircle, FileText, Calendar, List, Moon, Sun, Users
} from 'lucide-react';
import { useSidebar } from './Sidebar';
import Dropdown from '../dropdown';
import { useTheme } from 'next-themes'; // 🔹 for dark/light mode

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { sidebarOpen, toggleSidebar } = useSidebar();
    const [user, setUser] = useState<any>(null);

    const { theme, setTheme } = useTheme(); // 🔹 theme state

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // highlight menu active link
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
        <header className={`z-40 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[0px]' : 'ml-0'}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black justify-between lg:justify-end">
                    {/* Logo + Sidebar toggle (Mobile) */}
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <span className="hidden align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white md:inline" style={{ marginRight: "8px" }}>
                                Idigital
                            </span>
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                            onClick={toggleSidebar}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Sidebar toggle (Desktop when closed) */}
                    {!sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-4"
                        >
                            <Menu className="w-5 h-5 text-black dark:text-white" />
                        </button>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* 🔹 Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {/* 🔹 User Dropdown */}
                        <div className="dropdown flex shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                btnClassName="relative group block"
                                button={
                                    <img
                                        className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100 transition duration-300"
                                        src={user?.profileImage || "/assets/images/user-profile.jpeg"}
                                        alt="userProfile"
                                    />
                                }
                            >
                                <ul className="w-[280px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90 shadow-[0_5px_15px_rgba(0,0,0,0.12)] rounded-lg overflow-hidden">
                                    {/* Profile Header */}
                                    <li className="border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center px-4 py-4 space-x-4">
                                            <img
                                                className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                                src={user?.profileImage || "/assets/images/user-profile.jpeg"}
                                                alt="userProfile"
                                            />
                                            <div className="flex-1 truncate">
                                                <h4 className="text-base font-medium flex items-center">
                                                    {user?.name || 'John Doe'}
                                                    <span className="ml-2 rounded-full bg-success-light px-2 py-0.5 text-xs text-success">
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
                                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <User className="h-4.5 w-4.5 shrink-0 mr-3 text-gray-500" />
                                            Profile
                                        </Link>
                                    </li>
                                    {/* Sign Out */}
                                    <li className="border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="h-4.5 w-4.5 shrink-0 mr-3" />
                                            Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* horizontal menu */}
                <ul className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black rtl:space-x-reverse dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8">
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <LayoutDashboard className="shrink-0" />
                                <span className="px-1">Dashboard</span>
                            </div>
                            <div className="right_arrow">
                                <CircleEllipsis />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li><Link href="/">Sales</Link></li>
                            <li><Link href="/analytics">Analytics</Link></li>
                            <li><Link href="/finance">Finance</Link></li>
                            <li><Link href="/crypto">Crypto</Link></li>
                        </ul>
                    </li>

                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <Grid className="shrink-0" />
                                <span className="px-1">Apps</span>
                            </div>
                            <div className="right_arrow">
                                <CircleEllipsis />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li><Link href="/apps/chat"><MessageCircle className="shrink-0" /><span className="px-1">Chat</span></Link></li>
                            <li><Link href="/apps/mailbox"><Mail className="shrink-0" /><span className="px-1">Mailbox</span></Link></li>
                            <li><Link href="/apps/todolist"><List className="shrink-0" /><span className="px-1">Todo List</span></Link></li>
                            <li><Link href="/apps/notes"><FileText className="shrink-0" /><span className="px-1">Notes</span></Link></li>
                            <li><Link href="/apps/scrumboard"><Layers className="shrink-0" /><span className="px-1">Scrumboard</span></Link></li>
                            <li><Link href="/apps/contacts"><Users className="shrink-0" /><span className="px-1">Contacts</span></Link></li>
                            <li><Link href="/apps/calendar"><Calendar className="shrink-0" /><span className="px-1">Calendar</span></Link></li>
                        </ul>
                    </li>

                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <Box className="shrink-0" />
                                <span className="px-1">Components</span>
                            </div>
                            <div className="right_arrow">
                                <CircleEllipsis />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li><Link href="/components/tabs">Tabs</Link></li>
                            <li><Link href="/components/accordions">Accordions</Link></li>
                            <li><Link href="/components/modals">Modals</Link></li>
                            <li><Link href="/components/cards">Cards</Link></li>
                            <li><Link href="/components/carousel">Carousel</Link></li>
                            <li><Link href="/components/countdown">Countdown</Link></li>
                            <li><Link href="/components/notifications">Notifications</Link></li>
                        </ul>
                    </li>

                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <CircleEllipsis className="shrink-0" />
                                <span className="px-1">More</span>
                            </div>
                            <div className="right_arrow">
                                <CircleEllipsis />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li><Link href="/dragndrop">Drag and Drop</Link></li>
                            <li><Link href="/charts">Charts</Link></li>
                            <li><Link href="/font-icons">Font Icons</Link></li>
                            <li><Link href="/widgets">Widgets</Link></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;
