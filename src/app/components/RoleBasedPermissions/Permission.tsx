'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { fetchPermissions } from '../../../../store/permissionSlice';
import { fetchPages } from '../../../../store/pagePermissionSlice';

interface Permission {
    pageName: string;
    permissions: {
        [key: string]: boolean;
    };
}

const UserPermissions: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.permissions);
    const { list: pages, loading: pagesLoading, error: pagesError } = useSelector((state: RootState) => state.pages);

    const [selectedRole, setSelectedRole] = useState<string>('Sales Executive');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const roles = ['Sales Executive', 'Manager', 'Admin', 'Associate'];

    const [permissions, setPermissions] = useState<Permission[]>([]);
    // console.log(permissions, "permissions");

    useEffect(() => {
        dispatch(fetchPermissions({ page: 1, limit: 10, searchValue: "" }));
        dispatch(fetchPages({ page: 1, limit: 10, searchValue: "" }));
    }, [dispatch, selectedRole]);

    useEffect(() => {
        if (Array.isArray(pages?.data?.permissions) && pages.data.permissions.length) {
            const normalized = pages.data.permissions.map((p: any) => ({
                pageName: p.pageName ?? 'Unnamed Page',
                permissions: { ...p.permissions }, // shallow copy
            }));
            setPermissions(normalized);
        }
    }, [pages?.data?.permissions]);

    const togglePermission = (rowIdx: number, permKey: string) => {
        setPermissions(prevPermissions => {
            const updated = [...prevPermissions];
            if (!updated[rowIdx]) return prevPermissions;

            const currentVal = updated[rowIdx].permissions?.[permKey] ?? false;

            // Make sure we’re updating immutably
            updated[rowIdx] = {
                ...updated[rowIdx],
                permissions: {
                    ...updated[rowIdx].permissions,
                    [permKey]: !currentVal,
                },
            };

            return updated;
        });
    };
    const headers = list?.data?.permissions || [];

    return (
        <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-semibold">User Permissions</h2>
            </div>

            <div className="p-4 sm:p-6">
                {/* Role Dropdown */}
                <div className="relative mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full sm:w-64 px-3 py-2 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:border-indigo-400 transition-colors"
                    >
                        <span className="text-sm sm:text-base">{selectedRole}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        setSelectedRole(role);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm transition-colors"
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DESKTOP VIEW */}
                <div className="hidden xl:block">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm min-w-[180px]">Module Name</th>
                                        {headers.map((h: any) => (
                                            <th key={h.id} className="text-center p-4 font-semibold text-gray-700 text-xs min-w-[80px] capitalize">
                                                {h.permissionName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={headers.length + 1} className="p-6 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={headers.length + 1} className="p-6 text-center text-red-500">{error}</td>
                                        </tr>
                                    ) : permissions.length > 0 ? (
                                        permissions.map((row, ri) => (
                                            <tr key={ri} className={`border-b ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                <td className="p-4 text-gray-700 font-medium text-sm">{row.pageName}</td>
                                                {headers.map((h: any) => {
                                                    const key = h.permissionName.toLowerCase();
                                                    const val = permissions[ri]?.permissions?.[key] ?? false;
                                                    return (
                                                        <td key={h.id} className="p-4 text-center">
                                                            <button
                                                                onClick={() => togglePermission(ri, key)}
                                                                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all hover:scale-110 ${val
                                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                                                                    : 'bg-white border-gray-300 hover:border-indigo-400'
                                                                    }`}
                                                            >
                                                                {val && <Check className="w-3 h-3" />}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={headers.length + 1} className="p-6 text-center text-gray-500">No permissions to display.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* TABLET VIEW */}
                <div className="hidden md:block xl:hidden">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className={`min-w-[${Math.max(600, (headers.length + 2) * 80)}px]`}>
                                <div className="bg-gray-50 border-b border-gray-200 p-4">
                                    <div className="grid gap-3" style={{ gridTemplateColumns: `200px repeat(${headers.length}, 80px)` }}>
                                        <div className="font-semibold text-gray-700 text-sm">Module Name</div>
                                        {headers.map((h: any) => (
                                            <div key={h.id} className="text-center font-semibold text-gray-700 text-xs capitalize">
                                                {h.permissionName}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {permissions.map((row, ri) => (
                                    <div key={ri} className={`p-4 border-b ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <div className="grid gap-3 items-center" style={{ gridTemplateColumns: `200px repeat(${headers.length}, 80px)` }}>
                                            <div className="text-gray-700 font-medium text-sm">{row.pageName}</div>
                                            {headers.map((h: any) => {
                                                const key = h.permissionName.toLowerCase();
                                                const val = permissions[ri]?.permissions?.[key] ?? false;

                                                return (
                                                    <div key={h.id} className="flex justify-center">
                                                        <button
                                                            onClick={() => togglePermission(ri, key)}
                                                            className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all hover:scale-110 ${val
                                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                                                                : 'bg-white border-gray-300 hover:border-indigo-400'
                                                                }`}
                                                        >
                                                            {val && <Check className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE VIEW */}
                <div className="block md:hidden space-y-4">
                    {permissions.map((row, ri) => (
                        <div key={ri} className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-4 text-base border-b border-gray-100 pb-2">{row.pageName}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {headers.map((h: any) => {
                                    const key = h.permissionName.toLowerCase();
                                    const val = permissions[ri]?.permissions?.[key] ?? false;

                                    return (
                                        <div key={h.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600 font-medium capitalize">{h.permissionName}</span>
                                            <button
                                                onClick={() => togglePermission(ri, key)}
                                                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all hover:scale-110 ${val
                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                                                    : 'bg-white border-gray-300 hover:border-indigo-400'
                                                    }`}
                                            >
                                                {val && <Check className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserPermissions;
