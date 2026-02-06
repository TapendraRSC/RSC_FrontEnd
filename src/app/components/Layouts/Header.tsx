'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, Moon, Sun, Bell } from 'lucide-react';
import { useSidebar } from './Sidebar';
import Dropdown from '../dropdown';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useNotifications } from '../.././components/NotificationProvider';

const Header = () => {
    const router = useRouter();
    const { sidebarOpen, toggleSidebar } = useSidebar();
    const [user, setUser] = useState<any>(null);
    const { theme, setTheme } = useTheme();

    const { unreadCount } = useNotifications();

    console.log(unreadCount, "unreadCount")
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, []);



    const role = useSelector((state: RootState) => state.auth.role);

    const isAdmin = role === 'Admin';
    const isAccountant = role === 'Accountant';



    const handleSignOut = () => {
        const confirmLogout = window.confirm("Are you sure you want to sign out?");
        if (!confirmLogout) return;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        router.push('/login');
    };


    return (
        <header className={`z-50 w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-[0px]' : 'ml-0'}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-4 py-3
                               dark:bg-black justify-between lg:justify-end
                               h-[60px] lg:h-auto">

                    {/* Mobile View - Logo + Menu Button */}
                    <div className="horizontal-logo flex items-center justify-between
                                   ltr:mr-2 rtl:ml-2 lg:hidden w-full">
                        <div className="flex items-center flex-1">
                            <Link href="/" className="main-logo flex items-center gap-2">
                                <div className="h-10 sm:h-12 md:h-14 w-auto flex items-center">
                                    <Image
                                        src="/RSC-GOLD-NEW-with-R.png"
                                        alt="RSC Group Logo"
                                        width={300}
                                        height={100}
                                        priority
                                        className="h-full w-auto object-contain"
                                    />
                                </div>
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

                    {/* Desktop Sidebar Toggle */}
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
                        {/* Theme Toggle */}
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



                        {(isAdmin || isAccountant) && (

                            <button
                                onClick={() => router.push('/notifications')}
                                className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell size={24} className="text-gray-600 dark:text-gray-400" />

                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900 px-1">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                        )}



                        {/* User Profile Dropdown */}
                        <div className="dropdown flex shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                btnClassName="relative group block"
                                button={
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt="User Profile"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src="/RSC-GOLD-NEW-with-R.png"
                                                alt="RSC Logo"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        )}
                                    </div>

                                }>
                                <ul className="w-[280px] !py-0 font-semibold text-dark dark:text-white-dark
                                              dark:text-white-light/90 shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                                              rounded-lg overflow-hidden min-w-[90vw] max-w-[95vw]">
                                    {/* Profile Header */}
                                    <li className="border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center px-4 py-4 space-x-4">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                {user?.profileImage ? (
                                                    <Image
                                                        src={user.profileImage}
                                                        alt="User Profile"
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="/RSC-GOLD-NEW-with-R.png"
                                                        alt="RSC Logo"
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 truncate">
                                                <h4 className="text-base font-medium">
                                                    {user?.name || 'User'}
                                                    <span className="ml-2 rounded-full bg-success-light
                                                                        px-2 py-0.5 text-xs text-success">
                                                        Pro
                                                    </span>
                                                </h4>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                                    {user?.email || ''}
                                                </p>
                                            </div>
                                        </div>
                                    </li>

                                    {/* Profile Link */}
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
            </div>
        </header>
    );
};

export default Header;