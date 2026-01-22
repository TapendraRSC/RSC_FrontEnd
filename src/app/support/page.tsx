"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter,
    Globe,
    ExternalLink,
    Pin
} from 'lucide-react';

interface OfficeHour {
    day: string;
    time: string;
    isOpen: boolean;
}

interface PolicySection {
    title: string;
    content: string | string[];
}

export default function SupportPage(): React.JSX.Element {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isOfficeOpen, setIsOfficeOpen] = useState<boolean>(false);

    const officeHours: OfficeHour[] = [
        { day: 'Monday', time: '10:00 AM - 7:00 PM', isOpen: true },
        { day: 'Tuesday', time: '10:00 AM - 7:00 PM', isOpen: true },
        { day: 'Wednesday', time: '10:00 AM - 7:00 PM', isOpen: true },
        { day: 'Thursday', time: '10:00 AM - 7:00 PM', isOpen: true },
        { day: 'Friday', time: '10:00 AM - 7:00 PM', isOpen: true },
        { day: 'Saturday', time: 'Closed', isOpen: false },
        { day: 'Sunday', time: 'Closed', isOpen: false },
    ];


    const socialLinks = [
        { url: "https://rscgroupdholera.in/", icon: <Globe className="w-4 h-4" />, color: "bg-blue-500" },
        { url: "https://www.facebook.com/people/RSC-Group-Dholera/61571785018455/", icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600" },
        { url: "https://www.instagram.com/rsc_group_dholera/", icon: <Instagram className="w-4 h-4" />, color: "bg-pink-600" },
        { url: "https://www.linkedin.com/company/rsc-group-dholera-sir/", icon: <Linkedin className="w-4 h-4" />, color: "bg-blue-700" },
        { url: "https://x.com/dholerarscgroup", icon: <Twitter className="w-4 h-4" />, color: "bg-black" },
        {
            url: "https://in.pinterest.com/rsc_group_dholera/",
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
            ),
            color: "bg-red-600"
        },
        { url: "https://www.youtube.com/@rscgroupdholeraindia", icon: <Youtube className="w-4 h-4" />, color: "bg-red-700" },
        {
            url: "https://share.google/tS3BcpnRNX0WRVmtZ",
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
            ),
            color: "bg-green-600"
        },
    ];


    const renderTextWithBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <span key={i} className="font-semibold text-slate-800 dark:text-slate-200">
                        {part.slice(2, -2)}
                    </span>
                );
            }
            return part;
        });
    };

    const policySections: PolicySection[] = [
        {
            title: "1. About RSC Group Dholera CRM",
            content: [
                "RSC Group Dholera CRM is an internal and authorized digital platform designed to manage:",
                "• Leads and customer data",
                "• Sales activities and follow-ups",
                "• Project, land, plot, and inventory information",
                "• User roles and performance tracking",
                "The CRM is strictly intended for **official business use only** related to RSC Group Dholera."
            ]
        },
        {
            title: "2. Eligibility & Authorized Access",
            content: [
                "• Access to the CRM is **restricted to authorized employees, partners, and management** of RSC Group Dholera.",
                "• Each user is provided with **unique login credentials.**",
                "• Users must be **18 years or older** and legally capable of entering into binding agreements.",
                "• Sharing login credentials with unauthorized persons is strictly prohibited."
            ]
        },
        {
            title: "3. User Responsibilities",
            content: [
                "By using this CRM, you agree to:",
                "• Maintain confidentiality of login credentials",
                "• Enter accurate, updated, and truthful information",
                "• Use customer data strictly for official business purposes",
                "• Follow internal company policies and data handling guidelines",
                "• Immediately report any unauthorized access or suspicious activity",
                "Any misuse, manipulation, or unauthorized extraction of data may result in disciplinary and legal action."
            ]
        },
        {
            title: "4. Data Usage & Confidentiality",
            content: [
                "• All data stored in the CRM, including leads, customer details, projects, pricing, and reports, is the **exclusive property of RSC Group Dholera.**",
                "• Users must not download, copy, sell, transfer, or disclose CRM data to any third party without written authorization.",
                "• The CRM complies with applicable Indian data protection and privacy standards."
            ]
        },
        {
            title: "5. Customer Information & Privacy",
            content: [
                "• Customer data collected through the CRM is used for sales communication, follow-ups, documentation, and service improvement.",
                "• RSC Group Dholera is committed to protecting customer privacy and ensuring secure handling of personal information.",
                "• Unauthorized use of customer data for personal gain is strictly forbidden."
            ]
        },
        {
            title: "6. Lead Management & Sales Activities",
            content: [
                "• Leads generated through marketing platforms, website forms, calls, or third-party integrations are assigned and tracked via the CRM.",
                "• Lead classification such as **Fresh, Hot, Warm, Cold, Dump, or Not Interested** is for internal analysis and workflow purposes.",
                "• Any misrepresentation, false commitment, or unethical sales practice is a violation of company policy."
            ]
        },
        {
            title: "7. Intellectual Property Rights",
            content: [
                "• All CRM software, design, dashboards, reports, content, logos, and branding elements are the intellectual property of **RSC Group Dholera.**",
                "• Users may not modify, reverse-engineer, or replicate any part of the CRM without explicit permission."
            ]
        },
        {
            title: "8. System Availability & Maintenance",
            content: [
                "• RSC Group Dholera strives to ensure uninterrupted CRM access but does not guarantee 100% uptime.",
                "• Temporary downtime may occur due to system maintenance, upgrades, or technical issues.",
                "• The company is not liable for data loss caused by events beyond reasonable control, though strong security measures are maintained."
            ]
        },
        {
            title: "9. Monitoring & Audit Rights",
            content: [
                "• User activities within the CRM may be monitored, logged, and audited for security, compliance, and performance evaluation.",
                "• RSC Group Dholera reserves the right to suspend or terminate access without prior notice in case of policy violations."
            ]
        },
        {
            title: "10. Limitation of Liability",
            content: [
                "• The CRM is provided on an \"as-is\" and \"as-available\" basis.",
                "• RSC Group Dholera shall not be held responsible for indirect, incidental, or consequential damages arising from CRM usage.",
                "• Users are responsible for their actions performed through their login accounts."
            ]
        },
        {
            title: "11. Termination of Access",
            content: [
                "RSC Group Dholera reserves the right to:",
                "• Disable or revoke CRM access upon resignation, termination, or role change",
                "• Suspend access due to misconduct, misuse, or breach of these Terms",
                "• Take legal action if company's interests are harmed"
            ]
        },
        {
            title: "12. Amendments to Terms",
            content: [
                "• These Terms & Conditions may be updated from time to time.",
                "• Continued use of the CRM after updates implies acceptance of revised Terms.",
                "• Users are encouraged to review this page periodically."
            ]
        },
        {
            title: "13. Governing Law & Jurisdiction",
            content: [
                "• These Terms are governed by the laws of **India.**",
                "• Any disputes shall be subject to the jurisdiction of **India courts** only."
            ]
        },
        {
            title: "14. Changes & Approval",
            content: "Final changes & approval for the CRM must be from the HOD."
        },
        // {
        //     title: "15. Contact Information",
        //     content: [
        //         "For any questions, concerns, or support related to the CRM, please contact:",
        //         "RSC Group Dholera: Official Support Team",
        //         "• Working Days: Monday to Friday",
        //         "• Working Hours: 10:00 AM to 7:00 PM (IST)",
        //         "• Weekly Off: Saturday and Sunday",
        //         "• Email: support@rscgroupdholera.in"
        //     ]
        // }
    ];

    const getCurrentDay = (): string => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            weekday: 'long'
        };
        return new Intl.DateTimeFormat('en-US', options).format(currentTime);
    };

    const checkIfOfficeOpen = (): boolean => {
        const kolkataTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const currentHour = kolkataTime.getHours();
        const currentDay = getCurrentDay();

        if (currentDay === 'Saturday' || currentDay === 'Sunday') return false;

        return currentHour >= 10 && currentHour < 19;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setIsOfficeOpen(checkIfOfficeOpen());
    }, [currentTime]);

    const currentDay = getCurrentDay();


    const getLastUpdatedMonth = () => {
        const now = new Date();
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const month = monthNames[previousMonth.getMonth()];
        const year = previousMonth.getFullYear();

        return `${month} ${year}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">

            {/* Background decorative elements - responsive sizing */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-20 w-48 h-48 sm:-left-40 sm:w-96 sm:h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 right-1/4 w-40 h-40 sm:-bottom-40 sm:right-1/3 sm:w-80 sm:h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
                {/* Header Section - Responsive text and spacing */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-transparent dark:border-orange-800/50">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        We're here to help
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 tracking-tight">
                        Contact Support
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-4xl mx-auto px-2">
                        Welcome to <b>RSC Group Dholera</b> CRM. These Terms & Conditions govern the access and use of the Customer Relationship Management (CRM) system operated by <b>RSC Group Dholera.</b> By accessing, logging in, or using this CRM platform, you agree to comply with and be legally bound by these Terms.
                    </p>

                </div>

                {/* Cards Grid - Responsive layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">

                    {/* Email Card */}
                    <div className="group bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-orange-200/30 dark:hover:shadow-orange-900/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg shadow-orange-500/30 dark:shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3">Email Us</h2>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 lg:mb-6">
                            Send us an email and our team will respond within 24 hours during business days.
                        </p>
                        <a
                            href="mailto:support@rscgroupdholera.in"
                            className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 dark:shadow-orange-500/15 hover:shadow-xl hover:shadow-orange-500/30"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">support@rscgroupdholera.in</span>
                        </a>
                    </div>

                    {/* Office Hours Card */}
                    <div className="group bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3">Office Hours</h2>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 lg:mb-6">
                            Our support team is available during these hours to assist you.
                        </p>

                        {/* Office Hours List - Responsive */}
                        <div className="space-y-1.5 sm:space-y-2">
                            {officeHours.map((schedule, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 ${schedule.day === currentDay
                                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-200 dark:border-emerald-700/50'
                                        : 'bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        {schedule.day === currentDay && (
                                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></span>
                                        )}
                                        <span className={`text-sm sm:text-base font-medium truncate ${schedule.day === currentDay ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {schedule.day}
                                        </span>
                                        {schedule.day === currentDay && (
                                            <span className="hidden xs:inline text-[10px] sm:text-xs bg-emerald-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-xs sm:text-sm font-medium flex-shrink-0 ml-2 ${schedule.isOpen
                                        ? schedule.day === currentDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                                        : 'text-red-500 dark:text-red-400'
                                        }`}>
                                        {schedule.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>



                <div className="mt-12 max-w-4xl mx-auto px-4">
                    <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-8 tracking-tight text-center">
                        Social Media Presence
                    </h2>

                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                        {socialLinks.map((social, idx) => (
                            <motion.a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-3.5 rounded-full text-white ${social.color} shadow-lg transition-all`}

                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: idx * 0.1, 
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }}

                                whileHover={{
                                    scale: 1.15,
                                    rotate: 5,
                                    boxShadow: "0px 10px 20px rgba(0,0,0,0.2)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-4 h-4 sm:w-7 sm:h-7 flex items-center justify-center">
                                    {social.icon}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="mt-12 sm:mt-16 lg:mt-20">
                    <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-transparent dark:border-amber-800/50">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Legal Information
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 tracking-tight">
                            Terms & Conditions
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto px-2">
                            Please read these terms carefully before using the RSC Group Dholera CRM platform.
                        </p>
                    </div>

                    {/* Terms Card */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        {/* Terms Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">RSC Group Dholera CRM</h3>
                                    <p className="text-amber-100 text-xs sm:text-sm">Terms & Conditions of Use</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Content */}
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                            {policySections.map((section, index) => (
                                <div key={index} className="group">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2 sm:mb-3">
                                                {section.title.replace(/^\d+\.\s*/, '')}
                                            </h4>
                                            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed space-y-1.5 sm:space-y-2">
                                                {Array.isArray(section.content) ? (
                                                    section.content.map((line, lineIndex) => (
                                                        <p
                                                            key={lineIndex}
                                                            className={`${line.startsWith('•') ? 'pl-2 sm:pl-4 text-slate-500 dark:text-slate-400' : ''}`}
                                                        >
                                                            {renderTextWithBold(line)}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p>{renderTextWithBold(section.content)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {index < policySections.length - 1 && (
                                        <div className="mt-4 sm:mt-6 border-b border-slate-100 dark:border-slate-700/50"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Terms Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                                        Last updated: {getLastUpdatedMonth()}
                                    </span>
                                </div>
                                <a
                                    href="mailto:support@rscgroupdholera.in"
                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-xs sm:text-sm transition-colors"
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Questions? Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

        </div>
    );
}