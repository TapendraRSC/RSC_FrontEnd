"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X
} from "lucide-react";

type Contact = {
    id: string | number;
    fullName: string;
    email: string;
    phone: string;
    message: string;
};

type SortConfig = {
    key: keyof Contact | null;
    direction: "asc" | "desc";
};

const Director = () => {
    const [data, setData] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: "asc",
    });

    const [openMessage, setOpenMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                const res = await fetch(
                    "/allotments/allotment-requests",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) throw new Error("API failed");

                const json = await res.json();
                const contacts = json.data || json.contacts || [];

                setData(Array.isArray(contacts) ? contacts : []);
            } catch (error) {
                console.error("API error:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(
            (item) =>
                item.fullName?.toLowerCase().includes(query) ||
                item.email?.toLowerCase().includes(query) ||
                item.phone?.includes(query) ||
                item.message?.toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key!];
            const bVal = b[sortConfig.key!];
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage]);

    const handleSort = (key: keyof Contact) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof Contact }) => {
        if (sortConfig.key !== columnKey) {
            return (
                <span className="ml-1 inline-flex flex-col text-slate-400">
                    <ChevronUp className="w-3 h-3 -mb-1" />
                    <ChevronDown className="w-3 h-3" />
                </span>
            );
        }
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4 ml-1 text-blue-500" />
        ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-blue-500" />
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">

                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold">
                                    Assistant Director
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {sortedData.length} total records
                                </p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="
            w-full
            h-11
            pl-10
            pr-4
            text-sm
            rounded-xl
            bg-slate-800/70
            text-slate-200
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2
            focus:ring-slate-600
        "
                                />
                            </div>


                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">

                                    <th onClick={() => handleSort("fullName")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Name <SortIcon columnKey="fullName" /></div>
                                    </th>
                                    <th onClick={() => handleSort("email")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Email <SortIcon columnKey="email" /></div>
                                    </th>
                                    <th onClick={() => handleSort("phone")} className="px-4 py-3 text-left text-xs font-semibold cursor-pointer">
                                        <div className="flex items-center">Phone <SortIcon columnKey="phone" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">
                                        Message
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4">{item.fullName}</td>
                                            <td className="px-4 py-4">{item.email}</td>
                                            <td className="px-4 py-4">{item.phone}</td>

                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => setOpenMessage(item.message)}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                    <div className="px-4 py-4 border-t flex justify-between items-center">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                                <ChevronLeft />
                            </button>
                            <span>{currentPage} / {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {openMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-5 relative">
                        <button
                            onClick={() => setOpenMessage(null)}
                            className="absolute top-3 right-3 text-slate-700"
                        >
                            <X />
                        </button>

                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Message</h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {openMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Director;
