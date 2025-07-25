'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, User, Mail, Lock, LogOut, LayoutDashboard, Grid, Box, CircleEllipsis, Layers, MessageCircle, FileText, Calendar, List, Clock, AlertCircle, CheckCircle, XCircle, AlertTriangle, BarChart2, Mic, Image, BookOpen, File, Shield, CreditCard, DollarSign, PieChart, ShoppingCart, Users, Settings, Globe, Moon, Sun } from 'lucide-react';
import { useSidebar } from './Sidebar';
import Dropdown from '../dropdown';
import { useSelector } from 'react-redux';

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { sidebarOpen, toggleSidebar } = useSidebar();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            all.forEach((element) => {
                element?.classList.remove('active');
            });
            const allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            allLinks.forEach((element) => {
                element?.classList.remove('active');
            });
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

    // const setLocale = (flag) => {
    //     if (flag.toLowerCase() === 'ae') {
    //     } else {
    //     }
    //     router.refresh();
    // };

    // function createMarkup(messages) {
    //     return { __html: messages };
    // }

    const handleSignOut = () => {
        // Remove tokens and user from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const [messages, setMessages] = useState([
        {
            id: 1,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
            title: 'Congratulations!',
            message: 'Your OS has been updated.',
            time: '1hr',
        },
        {
            id: 2,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
            title: 'Did you know?',
            message: 'You can switch between artboards.',
            time: '2hr',
        },
        {
            id: 3,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
            title: 'Something went wrong!',
            message: 'Send Report',
            time: '2days',
        },
        {
            id: 4,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
            title: 'Warning',
            message: 'Your password strength is low.',
            time: '5days',
        },
    ]);

    // const removeMessage = (value) => {
    //     setMessages(messages.filter((user) => user.id !== value));
    // };

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            profile: 'user-profile.jpeg',
            message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
            time: '45 min ago',
        },
        {
            id: 2,
            profile: 'profile-34.jpeg',
            message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
            time: '9h Ago',
        },
        {
            id: 3,
            profile: 'profile-16.jpeg',
            message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
            time: '9h Ago',
        },
    ]);

    // const removeNotification = (value) => {
    //     setNotifications(notifications.filter((user) => user.id !== value));
    // };

    const [search, setSearch] = useState(false);

    return (
        <header className={`z-40 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[0px]' : 'ml-0'}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black justify-between lg:justify-end">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.svg" alt="logo" />
                            <span className="hidden align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">RSC</span>
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                            onClick={toggleSidebar}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                    {!sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-4"
                        >
                            <Menu className="w-5 h-5 text-black dark:text-white" />
                        </button>
                    )}
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
                                        href="/users/profile"
                                        className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <User className="h-4.5 w-4.5 shrink-0 mr-3 text-gray-500" />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/apps/mailbox"
                                        className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Mail className="h-4.5 w-4.5 shrink-0 mr-3 text-gray-500" />
                                        Inbox
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/auth/boxed-lockscreen"
                                        className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Lock className="h-4.5 w-4.5 shrink-0 mr-3 text-gray-500" />
                                        Lock Screen
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
                            <li>
                                <Link href="/">Sales</Link>
                            </li>
                            <li>
                                <Link href="/analytics">Analytics</Link>
                            </li>
                            <li>
                                <Link href="/finance">Finance</Link>
                            </li>
                            <li>
                                <Link href="/crypto">Crypto</Link>
                            </li>
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
                            <li>
                                <Link href="/apps/chat">
                                    <MessageCircle className="shrink-0" />
                                    <span className="px-1">Chat</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/mailbox">
                                    <Mail className="shrink-0" />
                                    <span className="px-1">Mailbox</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/todolist">
                                    <List className="shrink-0" />
                                    <span className="px-1">Todo List</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/notes">
                                    <FileText className="shrink-0" />
                                    <span className="px-1">Notes</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/scrumboard">
                                    <Layers className="shrink-0" />
                                    <span className="px-1">Scrumboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/contacts">
                                    <Users className="shrink-0" />
                                    <span className="px-1">Contacts</span>
                                </Link>
                            </li>
                            <li className="relative">
                                <button type="button">
                                    <FileText className="shrink-0" />
                                    <span className="px-1">Invoice</span>
                                    <div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
                                        <CircleEllipsis />
                                    </div>
                                </button>
                                <ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow ltr:left-[95%] rtl:right-[95%] dark:bg-[#1b2e4b] dark:text-white-dark">
                                    <li>
                                        <Link href="/apps/invoice/list">List</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/preview">Preview</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/add">Add</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/edit">Edit</Link>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <Link href="/apps/calendar">
                                    <Calendar className="shrink-0" />
                                    <span className="px-1">Calendar</span>
                                </Link>
                            </li>
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
                            <li>
                                <Link href="/components/tabs">Tabs</Link>
                            </li>
                            <li>
                                <Link href="/components/accordions">Accordions</Link>
                            </li>
                            <li>
                                <Link href="/components/modals">Modals</Link>
                            </li>
                            <li>
                                <Link href="/components/cards">Cards</Link>
                            </li>
                            <li>
                                <Link href="/components/carousel">Carousel</Link>
                            </li>
                            <li>
                                <Link href="/components/countdown">Countdown</Link>
                            </li>
                            <li>
                                <Link href="/components/counter">Counter</Link>
                            </li>
                            <li>
                                <Link href="/components/sweetalert">Sweet Alerts</Link>
                            </li>
                            <li>
                                <Link href="/components/timeline">Timeline</Link>
                            </li>
                            <li>
                                <Link href="/components/notifications">Notifications</Link>
                            </li>
                            <li>
                                <Link href="/components/media-object">Media Object</Link>
                            </li>
                            <li>
                                <Link href="/components/list-group">List Group</Link>
                            </li>
                            <li>
                                <Link href="/components/pricing-table">Pricing Tables</Link>
                            </li>
                            <li>
                                <Link href="/components/lightbox">Lightbox</Link>
                            </li>
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
                            <li>
                                <Link href="/dragndrop">Drag and Drop</Link>
                            </li>
                            <li>
                                <Link href="/charts">Charts</Link>
                            </li>
                            <li>
                                <Link href="/font-icons">Font Icons</Link>
                            </li>
                            <li>
                                <Link href="/widgets">Widgets</Link>
                            </li>
                            <li>
                                <Link href="https://vristo.sbthemes.com" target="_blank">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <div className="dropdown flex shrink-0">
                        <Dropdown
                            offset={[0, 8]}
                            btnClassName="relative group block"
                            button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.jpeg" alt="userProfile" />}
                        >
                            <ul className="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                <li>
                                    <div className="flex items-center px-4 py-4">
                                        <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/user-profile.jpeg" alt="userProfile" />
                                        <div className="truncate ltr:pl-4 rtl:pr-4">
                                            <h4 className="text-base">
                                                John Doe
                                                <span className="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span>
                                            </h4>
                                            <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                johndoe@gmail.com
                                            </button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <Link href="/users/profile" className="dark:hover:text-white">
                                        <User className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/mailbox" className="dark:hover:text-white">
                                        <Mail className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Inbox
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                        <Lock className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Lock Screen
                                    </Link>
                                </li>
                                <li className="border-t border-white-light dark:border-white-light/10">
                                    <Link href="/auth/boxed-signin" className="!py-3 text-danger">
                                        <LogOut className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                        Sign Out
                                    </Link>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                </ul>
            </div>
        </header>
    );
};

export default Header;
