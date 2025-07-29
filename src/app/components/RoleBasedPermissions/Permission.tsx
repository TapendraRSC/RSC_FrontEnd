import React, { useState } from 'react';
import { ChevronDown, Check, Menu } from 'lucide-react';

interface Permission {
    name: string;
    category?: string;
    permissions: {
        view: boolean;
        add: boolean;
        edit: boolean;
        delete: boolean;
        print: boolean;
        import: boolean;
        export: boolean;
    };
}

const UserPermissions: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState('Sales Executive');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const roles = ['Sales Executive', 'Manager', 'Admin', 'Associate'];

    const [permissions, setPermissions] = useState<Permission[]>([
        {
            name: 'Approval',
            permissions: { view: true, add: false, edit: false, delete: false, print: false, import: false, export: false }
        },
        {
            name: 'Associate',
            permissions: { view: false, add: false, edit: true, delete: true, print: true, import: true, export: true }
        },
        {
            name: 'Associate Document',
            permissions: { view: false, add: true, edit: false, delete: true, print: false, import: false, export: false }
        },
        {
            name: 'Associate Transfer',
            permissions: { view: true, add: true, edit: false, delete: false, print: false, import: false, export: false }
        },
        {
            name: 'Associate Tree',
            permissions: { view: true, add: false, edit: false, delete: false, print: false, import: false, export: false }
        },
        {
            name: 'Commission Slab Attendence',
            permissions: { view: true, add: true, edit: true, delete: true, print: false, import: false, export: false }
        },
        {
            name: 'Commission Slab',
            permissions: { view: true, add: false, edit: true, delete: false, print: false, import: false, export: false }
        }
    ]);

    const togglePermission = (index: number, permissionType: keyof Permission['permissions']) => {
        const updatedPermissions = [...permissions];
        updatedPermissions[index].permissions[permissionType] = !updatedPermissions[index].permissions[permissionType];
        setPermissions(updatedPermissions);
    };

    const categories = [
        { name: 'Associate', items: permissions.slice(0, 7) },
        { name: 'Attendance', items: [] }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-semibold">User Permission</h2>
            </div>

            <div className="p-4 sm:p-6">
                {/* Role Selector */}
                <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full sm:w-80 px-3 py-2 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                        >
                            <span className="text-gray-700">{selectedRole}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-indigo-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="block lg:hidden space-y-4">
                    {permissions.map((permission, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-3 text-sm">{permission.name}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(permission.permissions).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600 capitalize">{key}</span>
                                        <button
                                            onClick={() => togglePermission(index, key as keyof Permission['permissions'])}
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${value
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm'
                                                : 'bg-white border-gray-300 hover:border-indigo-400'
                                                }`}
                                        >
                                            {value && <Check className="w-2.5 h-2.5" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden lg:block border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="grid grid-cols-8 gap-4 p-3">
                            <div className="font-semibold text-gray-700 text-sm">Name</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">View</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Add</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Edit</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Delete</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Print</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Import</div>
                            <div className="font-semibold text-gray-700 text-center text-xs">Export</div>
                        </div>
                    </div>

                    {/* Category: Associate */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-gray-200">
                        <div className="px-3 py-2">
                            <span className="font-medium text-gray-700 text-sm">Associate</span>
                        </div>
                    </div>

                    {/* Permission Rows */}
                    {permissions.map((permission, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-indigo-50/30 transition-colors">
                            <div className="grid grid-cols-8 gap-4 p-3">
                                <div className="text-gray-700 bg-gray-50 px-2 py-1.5 rounded-md text-sm font-medium">
                                    {permission.name}
                                </div>

                                {Object.entries(permission.permissions).map(([key, value]) => (
                                    <div key={key} className="flex justify-center">
                                        <button
                                            onClick={() => togglePermission(index, key as keyof Permission['permissions'])}
                                            className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${value
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm hover:bg-indigo-600'
                                                : 'bg-white border-gray-300 hover:border-indigo-400 hover:shadow-sm'
                                                }`}
                                        >
                                            {value && <Check className="w-2.5 h-2.5" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Category: Attendance */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-gray-200">
                        <div className="px-3 py-2">
                            <span className="font-medium text-gray-700 text-sm">Attendance</span>
                        </div>
                    </div>

                    {/* Empty state for Attendance category */}
                    <div className="p-6 text-center text-gray-500">
                        <p className="text-sm">No permissions configured for Attendance category</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {/* <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300">
                        Cancel
                    </button> */}
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md hover:shadow-lg">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserPermissions;