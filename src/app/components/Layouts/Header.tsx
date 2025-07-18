'use client';
import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';

import { usePathname, useRouter } from 'next/navigation';
// import { getTranslation } from '@/i18n';

const Header = () => {
    const pathname = usePathname();
    // const dispatch = useDispatch();
    const router = useRouter();
    // const { t, i18n } = getTranslation();

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    // const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        if (flag.toLowerCase() === 'ae') {
            // dispatch(toggleRTL('rtl'));
        } else {
            // dispatch(toggleRTL('ltr'));
        }
        router.refresh();
    };

    function createMarkup(messages: any) {
        return { __html: messages };
    }
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
            message: 'Send Reposrt',
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

    const removeMessage = (value: number) => {
        setMessages(messages.filter((user) => user.id !== value));
    };

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

    const removeNotification = (value: number) => {
        setNotifications(notifications.filter((user) => user.id !== value));
    };

    const [search, setSearch] = useState(false);

    return (
        <header className={`z-40 `}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.svg" alt="logo" />
                            <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">VRISTO</span>
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                        // onClick={() => dispatch(toggleSidebar())}
                        >
                            {/* <IconMenu className="h-5 w-5" /> */}
                        </button>
                    </div>

                    <div className="hidden ltr:mr-2 rtl:ml-2 sm:block">
                        <ul className="flex items-center space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                            <li>
                                <Link href="/apps/calendar" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    {/* <IconCalendar /> */}
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/todolist" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    {/* <IconEdit /> */}
                                </Link>
                            </li>
                            <li>
                                <Link href="/apps/chat" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    {/* <IconChatNotification /> */}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
                            <form
                                className={`${search && '!block'} absolute inset-x-0 top-1/2 z-10 mx-4 hidden -translate-y-1/2 sm:relative sm:top-0 sm:mx-0 sm:block sm:translate-y-0`}
                                onSubmit={() => setSearch(false)}
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="peer form-input bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4"
                                        placeholder="Search..."
                                    />
                                    <button type="button" className="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                        {/* <IconSearch className="mx-auto" /> */}
                                    </button>
                                    <button type="button" className="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden" onClick={() => setSearch(false)}>
                                        {/* <IconXCircle /> */}
                                    </button>
                                </div>
                            </form>
                            <button
                                type="button"
                                onClick={() => setSearch(!search)}
                                className="search_btn rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 dark:bg-dark/40 dark:hover:bg-dark/60 sm:hidden"
                            >
                                {/* <IconSearch className="mx-auto h-4.5 w-4.5 dark:text-[#d0d2d6]" /> */}
                            </button>
                        </div>

                    </div>
                </div>

                {/* horizontal menu */}
                <ul className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black rtl:space-x-reverse dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8">
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                {/* <IconMenuDashboard className="shrink-0" /> */}
                                <span className="px-1">{('dashboard')}</span>
                            </div>
                            <div className="right_arrow">
                                {/* <IconCaretDown /> */}
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <Link href="/">{('sales')}</Link>
                            </li>
                            <li>
                                <Link href="/analytics">{('analytics')}</Link>
                            </li>
                            <li>
                                <Link href="/finance">{('finance')}</Link>
                            </li>
                            <li>
                                <Link href="/crypto">{('crypto')}</Link>
                            </li>
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                {/* <IconMenuApps className="shrink-0" /> */}
                                <span className="px-1">{('apps')}</span>
                            </div>
                            <div className="right_arrow">
                                {/* <IconCaretDown /> */}
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <Link href="/apps/chat">{('chat')}</Link>
                            </li>
                            <li>
                                <Link href="/apps/mailbox">{('mailbox')}</Link>
                            </li>
                            <li>
                                <Link href="/apps/todolist">{('todo_list')}</Link>
                            </li>
                            <li>
                                <Link href="/apps/notes">{('notes')}</Link>
                            </li>
                            <li>
                                <Link href="/apps/scrumboard">{('scrumboard')}</Link>
                            </li>
                            <li>
                                <Link href="/apps/contacts">{('contacts')}</Link>
                            </li>
                            <li className="relative">
                                <button type="button">
                                    {('invoice')}
                                    <div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
                                        {/* <IconCaretDown /> */}
                                    </div>
                                </button>
                                <ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow ltr:left-[95%] rtl:right-[95%] dark:bg-[#1b2e4b] dark:text-white-dark">
                                    <li>
                                        <Link href="/apps/invoice/list">{('list')}</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/preview">{('preview')}</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/add">{('add')}</Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/invoice/edit">{('edit')}</Link>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <Link href="/apps/calendar">{('calendar')}</Link>
                            </li>
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                {/* <IconMenuComponents className="shrink-0" /> */}
                                <span className="px-1">{('components')}</span>
                            </div>
                            <div className="right_arrow">
                                {/* <IconCaretDown /> */}
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <Link href="/components/tabs">{('tabs')}</Link>
                            </li>
                            <li>
                                <Link href="/components/accordions">{('accordions')}</Link>
                            </li>
                            <li>
                                <Link href="/components/modals">{('modals')}</Link>
                            </li>
                            <li>
                                <Link href="/components/cards">{('cards')}</Link>
                            </li>
                            <li>
                                <Link href="/components/carousel">{('carousel')}</Link>
                            </li>
                            <li>
                                <Link href="/components/countdown">{('countdown')}</Link>
                            </li>
                            <li>
                                <Link href="/components/counter">{('counter')}</Link>
                            </li>
                            <li>
                                <Link href="/components/sweetalert">{('sweet_alerts')}</Link>
                            </li>
                            <li>
                                <Link href="/components/timeline">{('timeline')}</Link>
                            </li>
                            <li>
                                <Link href="/components/notifications">{('notifications')}</Link>
                            </li>
                            <li>
                                <Link href="/components/media-object">{('media_object')}</Link>
                            </li>
                            <li>
                                <Link href="/components/list-group">{('list_group')}</Link>
                            </li>
                            <li>
                                <Link href="/components/pricing-table">{('pricing_tables')}</Link>
                            </li>
                            <li>
                                <Link href="/components/lightbox">{('lightbox')}</Link>
                            </li>
                        </ul>
                    </li>

                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                {/* <IconMenuMore className="shrink-0" /> */}
                                <span className="px-1">{('more')}</span>
                            </div>
                            <div className="right_arrow">
                                {/* <IconCaretDown /> */}
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <Link href="/dragndrop">{('drag_and_drop')}</Link>
                            </li>
                            <li>
                                <Link href="/charts">{('charts')}</Link>
                            </li>
                            <li>
                                <Link href="/font-icons">{('font_icons')}</Link>
                            </li>
                            <li>
                                <Link href="/widgets">{('widgets')}</Link>
                            </li>
                            <li>
                                <Link href="https://vristo.sbthemes.com" target="_blank">
                                    {('documentation')}
                                </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;
