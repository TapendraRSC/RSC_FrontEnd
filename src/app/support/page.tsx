"use client";

import React, { useState, useEffect } from 'react';

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

    const policySections: PolicySection[] = [
        {
            title: "1. About RSC Group Dholera CRM",
            content: [
                "RSC Group Dholera CRM is an internal and authorized digital platform designed to manage:",
                "• Leads and customer data",
                "• Sales activities and follow-ups",
                "• Project, land, plot, and inventory information",
                "• User roles and performance tracking",
                "The CRM is strictly intended for official business use only related to RSC Group Dholera."
            ]
        },
        {
            title: "2. Eligibility & Authorized Access",
            content: [
                "• Access to the CRM is restricted to authorized employees, partners, and management of RSC Group Dholera.",
                "• Each user is provided with unique login credentials.",
                "• Users must be 18 years or older and legally capable of entering into binding agreements.",
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
                "• All data stored in the CRM, including leads, customer details, projects, pricing, and reports, is the exclusive property of RSC Group Dholera.",
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
                "• Lead classification such as Fresh, Hot, Warm, Cold, Dump, or Not Interested is for internal analysis and workflow purposes.",
                "• Any misrepresentation, false commitment, or unethical sales practice is a violation of company policy."
            ]
        },
        {
            title: "7. Intellectual Property Rights",
            content: [
                "• All CRM software, design, dashboards, reports, content, logos, and branding elements are the intellectual property of RSC Group Dholera.",
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
                "• These Terms are governed by the laws of India.",
                "• Any disputes shall be subject to the jurisdiction of India courts only."
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <main className="relative max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-transparent dark:border-blue-800/50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        We're here to help
                    </div>
                    <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
                        Contact Support
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Welcome to RSC Group Dholera CRM. These Terms & Conditions govern the access and use of the Customer Relationship Management (CRM) system operated by RSC Group Dholera. By accessing, logging in, or using this CRM platform, you agree to comply with and be legally bound by these Terms.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    <div className="group bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Email Us</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Send us an email and our team will respond within 24 hours during business days.
                        </p>
                        <a
                            href="mailto:support@rscgroupdholera.in"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            support@rscgroupdholera.in
                        </a>
                    </div>

                    <div className="group bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Office Hours</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Our support team is available during these hours to assist you.
                        </p>

                        <div className="space-y-2">
                            {officeHours.map((schedule, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-300 ${schedule.day === currentDay
                                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-200 dark:border-emerald-700/50'
                                        : 'bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {schedule.day === currentDay && (
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        )}
                                        <span className={`font-medium ${schedule.day === currentDay ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {schedule.day}
                                        </span>
                                        {schedule.day === currentDay && (
                                            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium ${schedule.isOpen
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

                {/* <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700/50">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                            Average response time: <span className="text-slate-800 dark:text-white font-semibold">Under 4 hours</span>
                        </span>
                    </div>
                </div> */}

                {/* Terms & Conditions Policy Section */}
                <div className="mt-20">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-transparent dark:border-amber-800/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Legal Information
                        </div>
                        <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
                            Terms & Conditions
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                            Please read these terms carefully before using the RSC Group Dholera CRM platform.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        {/* Policy Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">RSC Group Dholera CRM</h3>
                                    <p className="text-amber-100 text-sm">Terms & Conditions of Use</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Content */}
                        <div className="p-8 space-y-8">
                            {policySections.map((section, index) => (
                                <div
                                    key={index}
                                    className="group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                                                {section.title.replace(/^\d+\.\s*/, '')}
                                            </h4>
                                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                                                {Array.isArray(section.content) ? (
                                                    section.content.map((line, lineIndex) => (
                                                        <p
                                                            key={lineIndex}
                                                            className={`${line.startsWith('•') ? 'pl-4 text-slate-500 dark:text-slate-400' : ''}`}
                                                        >
                                                            {line}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p>{section.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {index < policySections.length - 1 && (
                                        <div className="mt-6 border-b border-slate-100 dark:border-slate-700/50"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Policy Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                                        Last updated: December 2025
                                    </span>
                                </div>
                                <a
                                    href="mailto:support@rscgroupdholera.in"
                                    className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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