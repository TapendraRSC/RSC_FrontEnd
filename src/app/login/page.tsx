'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ComponentsAuthLoginForm from '../components/forms/ComponentsAuthLoginForm';

const BoxedSignIn = () => {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            router.replace('/');
        } else {
            setAuthChecked(true);
        }
    }, [router]);

    if (!authChecked) return null; // Prevent flash

    return (
        <div className="relative min-h-screen">
            {/* Background Image Layer */}
            <div className="absolute inset-0 h-full w-full">
                <img
                    src="/assets/images/auth/bg-gradient.png"
                    alt="background"
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Main Content Wrapper */}
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-3 py-6 dark:bg-[#060818] sm:px-6 md:px-10 lg:px-16 xl:py-10">

                {/* Decorative Elements - Responsive positioning and sizing */}
                <img
                    src="/assets/images/auth/coming-soon-object1.png"
                    alt="image"
                    className="absolute left-0 top-1/2 h-full max-h-[400px] -translate-y-1/2 opacity-30 sm:opacity-50 md:max-h-[600px] lg:max-h-[893px] lg:opacity-100"
                />
                <img
                    src="/assets/images/auth/coming-soon-object2.png"
                    alt="image"
                    className="absolute left-4 top-0 h-20 opacity-30 sm:left-12 sm:h-24 sm:opacity-50 md:left-24 md:h-32 md:opacity-75 lg:h-40 lg:opacity-100 xl:left-[30%]"
                />
                <img
                    src="/assets/images/auth/coming-soon-object3.png"
                    alt="image"
                    className="absolute right-0 top-0 h-32 opacity-30 sm:h-40 sm:opacity-50 md:h-48 md:opacity-75 lg:h-[300px] lg:opacity-100"
                />
                <img
                    src="/assets/images/auth/polygon-object.svg"
                    alt="image"
                    className="absolute bottom-0 end-[20%] opacity-30 sm:opacity-50 md:opacity-75 lg:end-[28%] lg:opacity-100"
                />

                {/* Login Card - Enhanced responsive design */}
                <div className="relative w-full max-w-[320px] rounded-lg bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-1.5 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)] sm:max-w-[400px] sm:rounded-xl sm:p-2 md:max-w-[500px] lg:max-w-[600px] xl:max-w-[870px]">
                    <div className="relative flex flex-col justify-center rounded-lg bg-white/70 px-4 py-8 backdrop-blur-lg dark:bg-black/60 sm:px-6 sm:py-12 sm:rounded-xl md:px-8 md:py-16 lg:min-h-[500px] lg:px-10 xl:px-6 xl:py-20">

                        {/* Language Dropdown Container */}
                        <div className="absolute end-3 top-3 sm:end-4 sm:top-4 md:end-6 md:top-6">
                            {/* <LanguageDropdown /> */}
                        </div>

                        {/* Content Container */}
                        <div className="mx-auto w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[440px]">

                            {/* Header Section */}
                            <div className="mb-6 text-center sm:mb-8 md:mb-10 sm:text-left">
                                <h1 className="text-2xl font-extrabold uppercase !leading-snug text-primary sm:text-3xl md:text-4xl lg:text-4xl">
                                    Sign in
                                </h1>
                                <p className="mt-2 text-sm font-bold leading-normal text-white-dark sm:text-base md:mt-3">
                                    Enter your email and password to login
                                </p>
                            </div>

                            {/* Login Form */}
                            <div className="w-full">
                                <ComponentsAuthLoginForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoxedSignIn;