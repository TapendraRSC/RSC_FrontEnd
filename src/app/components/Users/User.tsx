
// 'use client';
// import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import CustomTable from '../Common/CustomTable';
// import { Plus, Pencil, Trash2, Grid3X3, List, Menu, Search, Download } from 'lucide-react';
// import { AppDispatch, RootState } from '../../../../store/store';
// import { exportUsers, deleteUser, updateUser, addUser } from '../../../../store/userSlice';
// import { getRoles } from '../../../../store/roleSlice';
// import UsersModal from './UsersModal';
// import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
// import { toast } from 'react-toastify';
// import ExportModal from '../Common/ExportModal';
// import { fetchPermissions } from '../../../../store/permissionSlice';

// interface User {
//     id: number;
//     name: string;
//     email: string;
//     phoneNumber: string;
//     password: string;
//     roleId: number;
//     status: string;
//     profileImage: string;
// }

// interface Role {
//     id: number | string;
//     roleType: string;
// }

// type SortConfig = {
//     key: keyof User;
//     direction: 'asc' | 'desc';
// } | null;

// const debounce = (func: Function, wait: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func(...args), wait);
//     };
// };

// const Users: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const { data: users = [], loading } = useSelector((state: RootState) => state.users);
//     const { data: roles = [] } = useSelector((state: RootState) => state.roles);
//     const [searchValue, setSearchValue] = useState('');
//     const [sortConfig, setSortConfig] = useState<SortConfig>(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [userToDelete, setUserToDelete] = useState<User | null>(null);
//     const [editingUser, setEditingUser] = useState<User | any>(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
//     const [showMobileFilters, setShowMobileFilters] = useState(false);
//     const [isExportModalOpen, setIsExportModalOpen] = useState(false);

//     // Refs to prevent duplicate API calls
//     const rolesFetchedRef = useRef(false);
//     const lastUsersFetchRef = useRef<string>('');

//     // API se total aur totalPages lein
//     const totalRecords = users?.data?.total || 0;
//     const totalPages = users?.data?.totalPages || 1;

//     useEffect(() => {
//         if (rolesFetchedRef.current) return;
//         rolesFetchedRef.current = true;
//         dispatch(getRoles({ page: 1, limit: 100, searchValue: '' }));
//     }, [dispatch]);

//     useEffect(() => {
//         const fetchKey = `${currentPage}-${pageSize}`;
//         if (lastUsersFetchRef.current === fetchKey) return;
//         lastUsersFetchRef.current = fetchKey;
//         dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: '' }));
//     }, [dispatch, currentPage, pageSize]);

//     const debouncedSearch = useCallback(
//         debounce((value: string) => {
//             dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: value }));
//         }, 1000),
//         [dispatch, currentPage, pageSize]
//     );

//     useEffect(() => {
//         if (searchValue.length >= 3) {
//             debouncedSearch(searchValue);
//         } else if (searchValue.length === 0 && lastUsersFetchRef.current !== `${currentPage}-${pageSize}`) {
//             dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue: '' }));
//         }
//     }, [searchValue, debouncedSearch, currentPage, pageSize, dispatch]);

//     const roleMap = useMemo(() => {
//         const map = new Map<string, string>();
//         const rolesData: any = roles;
//         let rolesArray: any[] = [];
//         try {
//             if (Array.isArray(rolesData)) {
//                 rolesArray = rolesData;
//             } else if (rolesData && typeof rolesData === 'object') {
//                 if (rolesData.data) {
//                     if (Array.isArray(rolesData.data)) {
//                         rolesArray = rolesData.data;
//                     } else if (rolesData.data.data && Array.isArray(rolesData.data.data)) {
//                         rolesArray = rolesData.data.data;
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error processing roles data:', error);
//         }
//         if (rolesArray && rolesArray.length > 0) {
//             rolesArray.forEach((role: any) => {
//                 if (role && role.id && role.roleType) {
//                     map.set(String(role.id), role.roleType);
//                 } else {
//                     console.error('Invalid role object:', role);
//                 }
//             });
//         }
//         return map;
//     }, [roles]);

//     // API response se direct data lein
//     const paginatedData = useMemo(() => {
//         return users?.data?.data || [];
//     }, [users]);

//     const handleSort = (config: any) => setSortConfig(config);
//     const handlePageChange = (page: number) => setCurrentPage(page);
//     const handlePageSizeChange = (size: number) => {
//         setPageSize(size);
//         setCurrentPage(1);
//     };
//     const handleSearch = (value: string) => {
//         setSearchValue(value);
//         setCurrentPage(1);
//     };
//     const handleColumnVisibilityChange = (newHiddenColumns: string[]) => {
//         setHiddenColumns(newHiddenColumns);
//         localStorage.setItem('users-hidden-columns', JSON.stringify(newHiddenColumns));
//     };

//     useEffect(() => {
//         const savedHiddenColumns = localStorage.getItem('users-hidden-columns');
//         if (savedHiddenColumns) {
//             try {
//                 setHiddenColumns(JSON.parse(savedHiddenColumns));
//             } catch (error) {
//                 console.error('Error parsing hidden columns from localStorage:', error);
//             }
//         }
//     }, []);

//     const handleAdd = () => {
//         setEditingUser(null);
//         setModalOpen(true);
//     };

//     const handleEdit = (user: User) => {
//         setEditingUser(user);
//         setModalOpen(true);
//     };

//     const handleUserSubmit = async (data: any) => {
//         setIsSubmitting(true);
//         let resultAction: any;
//         if (editingUser) {
//             resultAction = await dispatch(updateUser({ id: editingUser.id, userData: data }));
//         } else {
//             resultAction = await dispatch(addUser(data));
//         }
//         const res = resultAction.payload;
//         if (res?.success) {
//             dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
//             setModalOpen(false);
//         } else {
//             const errorMessage = Array.isArray(res?.errors) && res.errors.length > 0
//                 ? res.errors[0]
//                 : res?.message;
//             toast.error(errorMessage);
//         }
//         setIsSubmitting(false);
//     };

//     const handleDelete = (user: User) => {
//         setUserToDelete(user);
//         setIsDeleteModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (userToDelete) {
//             try {
//                 const res = await dispatch(deleteUser(userToDelete.id));
//                 if (res.meta.requestStatus === "fulfilled") {
//                     await dispatch(exportUsers({ page: currentPage, limit: pageSize, searchValue }));
//                     setIsDeleteModalOpen(false);
//                 } else {
//                     toast.error("Failed to delete user ❌");
//                 }
//             } catch (error) {
//                 toast.error("Something went wrong while deleting user ⚠️");
//             }
//         }
//     };

//     const getRoleType = (roleId: number) => {
//         const rolesData: any = roles;
//         let actualRoles: any[] = [];
//         if (Array.isArray(rolesData)) {
//             actualRoles = rolesData;
//         } else if (rolesData?.data) {
//             if (Array.isArray(rolesData.data)) {
//                 actualRoles = rolesData.data;
//             } else if (rolesData.data?.data && Array.isArray(rolesData.data.data)) {
//                 actualRoles = rolesData.data.data;
//             }
//         }
//         const foundRole = actualRoles.find((role: any) => {
//             return String(role.id) === String(roleId) ||
//                 role.id === roleId ||
//                 Number(role.id) === Number(roleId);
//         });
//         return foundRole ? foundRole.roleType : `Role ${roleId}`;
//     };

//     const handleExport = () => {
//         if (paginatedData.length === 0) {
//             toast.error('No data to export');
//             return;
//         }
//         setIsExportModalOpen(true);
//     };

//     const columns: any = [
//         {
//             label: 'Name',
//             accessor: 'name',
//             sortable: true,
//             width: '150px',
//             mobile: true,
//             minWidth: 200,
//             maxWidth: 500,
//             showTooltip: true,
//             render: (row: User) => (
//                 <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
//                     {row.name}
//                 </span>
//             ),
//         },
//         {
//             label: 'Profile Image',
//             accessor: 'profileImage',
//             render: (row: User) =>
//                 row.profileImage ? (
//                     <img
//                         src={row.profileImage}
//                         alt="Profile"
//                         className={`w-20 h-12 object-cover border border-gray-300 dark:border-gray-600 rounded-lg ${row.status === 'inactive' ? 'opacity-50' : ''}`}
//                     />
//                 ) : (
//                     <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>-</span>
//                 ),
//             showTooltip: true,
//         },
//         {
//             label: 'Email',
//             accessor: 'email',
//             sortable: true,
//             width: '200px',
//             mobile: true,
//             render: (row: User) => (
//                 <div
//                     className={`truncate max-w-[150px] md:max-w-[200px] ${row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
//                     title={row.email}
//                 >
//                     {row.email}
//                 </div>
//             ),
//             showTooltip: true,
//         },
//         {
//             label: 'Phone',
//             accessor: 'phoneNumber',
//             sortable: true,
//             width: '140px',
//             mobile: false,
//             minWidth: 200,
//             maxWidth: 500,
//             render: (row: User) => (
//                 <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
//                     {row.phoneNumber}
//                 </span>
//             ),
//             showTooltip: true,
//         },
//         {
//             label: 'Role',
//             accessor: 'roleId',
//             sortable: true,
//             width: '120px',
//             mobile: true,
//             render: (row: User) => {
//                 const roleType = getRoleType(row.roleId);
//                 return (
//                     <div
//                         className={`truncate max-w-[100px] md:max-w-[120px] ${row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
//                         title={roleType}
//                     >
//                         {roleType}
//                     </div>
//                 );
//             },
//         },
//         {
//             label: 'Status',
//             accessor: 'status',
//             sortable: true,
//             width: '100px',
//             mobile: false,
//             render: (row: User) => (
//                 <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active'
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                         : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                         }`}
//                 >
//                     {row.status || 'Active'}
//                 </span>
//             ),
//             showTooltip: true,
//         },
//     ];

//     const { permissions: rolePermissions, loading: rolePermissionsLoading } =
//         useSelector((state: RootState) => state.sidebarPermissions);
//     const { list: allPermissions } = useSelector(
//         (state: RootState) => state.permissions
//     );

//     // Ref to prevent duplicate permission fetch
//     const permissionsFetchedRef = useRef(false);

//     // NOTE: fetchRolePermissionsSidebar is already called globally by LayoutClient.tsx
//     useEffect(() => {
//         if (permissionsFetchedRef.current) return;
//         permissionsFetchedRef.current = true;
//         dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
//     }, [dispatch]);

//     const getLeadPermissions = () => {
//         const leadPerm = rolePermissions?.permissions?.find(
//             (p: any) => p.pageName === 'User Management'
//         );
//         return leadPerm?.permissionIds || [];
//     };

//     const leadPermissionIds = getLeadPermissions();

//     const hasPermission = (permId: number, permName: string) => {
//         if (!leadPermissionIds.includes(permId)) return false;
//         const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
//         if (!matched) return false;
//         return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
//     };

//     const UserCard = ({ user }: { user: User }) => (
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between">
//                 <div className="flex items-center space-x-3 flex-1">
//                     {user.profileImage ? (
//                         <img
//                             src={user.profileImage}
//                             alt="Profile"
//                             className={`w-12 h-12 object-cover border border-gray-300 dark:border-gray-600 rounded-full ${user.status === 'inactive' ? 'opacity-50' : ''}`}
//                         />
//                     ) : (
//                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.status === 'inactive' ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'}`}>
//                             <span className="text-white font-bold text-lg">
//                                 {user.name.charAt(0).toUpperCase()}
//                             </span>
//                         </div>
//                     )}
//                     <div className="flex-1 min-w-0">
//                         <h3 className={`font-semibold text-lg truncate ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{user.name}</h3>
//                         <p className={`text-sm mt-1 ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{getRoleType(user.roleId)}</p>
//                         <p className={`text-sm truncate mt-1 ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{user.email}</p>
//                     </div>
//                 </div>
//                 {user.status && (
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                         : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                         }`}>
//                         {user.status}
//                     </span>
//                 )}
//             </div>
//             {user.phoneNumber && (
//                 <div className={`text-sm ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
//                     <span className="font-medium">Phone:</span> {user.phoneNumber}
//                 </div>
//             )}
//             <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
//                 {hasPermission(22, "edit") && (
//                     <button
//                         onClick={() => handleEdit(user)}
//                         className="flex-1 bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center justify-center gap-2"
//                     >
//                         <Pencil className="w-4 h-4" />
//                         Edit
//                     </button>
//                 )}
//                 {hasPermission(4, "delete") && (
//                     <button
//                         onClick={() => handleDelete(user)}
//                         className="flex-1 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
//                     >
//                         <Trash2 className="w-4 h-4" />
//                         Delete
//                     </button>
//                 )}
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
//             {/* Mobile Header */}
//             <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
//                         <p className="text-xs text-gray-600 dark:text-gray-400">Manage system users</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
//                             className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
//                             title="Switch view"
//                         >
//                             {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
//                         </button>
//                         <button
//                             onClick={() => setShowMobileFilters(!showMobileFilters)}
//                             className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
//                             title="Menu"
//                         >
//                             <Menu className="w-5 h-5" />
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Mobile Action Button */}
//             <div className="sticky top-16 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
//                 <div className="flex items-center gap-2">
//                     {hasPermission(21, "add") && (
//                         <button
//                             onClick={handleAdd}
//                             className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg duration-200"
//                         >
//                             <Plus className="w-5 h-5" />
//                             <span>Add New User</span>
//                         </button>
//                     )}
//                     {hasPermission(24, "export") && (
//                         <button
//                             onClick={handleExport}
//                             className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors shadow-md hover:shadow-lg duration-200"
//                         >
//                             <Download className="w-5 h-5" />
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Desktop Header */}
//             <div className="hidden lg:block p-6">
//                 <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                             Users Management
//                         </h1>
//                         <p className="text-gray-600 dark:text-gray-400 mt-1">
//                             Manage system users and permissions
//                         </p>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//                         {hasPermission(24, "export") && (
//                             <button
//                                 onClick={handleExport}
//                                 className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
//                             >
//                                 <Download className="w-4 h-4 sm:w-5 sm:h-5" />
//                                 <span className="hidden sm:inline">Export</span>
//                             </button>
//                         )}
//                         {hasPermission(21, "add") && (
//                             <button
//                                 onClick={handleAdd}
//                                 className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg duration-200"
//                             >
//                                 <Plus className="w-4 h-4" />
//                                 <span className="hidden sm:inline">Add User</span>
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="px-4 pb-4 lg:px-6 lg:pb-6">
//                 <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
//                     <div className="space-y-4">
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 placeholder="Search users..."
//                                 value={searchValue}
//                                 onChange={(e) => handleSearch(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
//                             />
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
//                             </div>
//                         </div>
//                         {loading ? (
//                             <div className="flex justify-center py-12">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
//                             </div>
//                         ) : (
//                             <>
//                                 <div className="grid gap-4">
//                                     {paginatedData.map((user: any) => (
//                                         <UserCard key={user.id} user={user} />
//                                     ))}
//                                 </div>
//                                 {paginatedData.length === 0 && (
//                                     <div className="text-center py-12">
//                                         <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👥</div>
//                                         <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No users found</p>
//                                         <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
//                                             {searchValue ? 'Try adjusting your search terms' : 'Add your first user to get started'}
//                                         </p>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                         {/* Mobile Pagination */}
//                         {totalPages > 1 && (
//                             <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
//                                 <button
//                                     onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
//                                     disabled={currentPage === 1}
//                                     className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//                                 >
//                                     Previous
//                                 </button>
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-gray-600 dark:text-gray-300">
//                                         Page {currentPage} of {totalPages}
//                                     </span>
//                                     <select
//                                         value={pageSize}
//                                         onChange={(e) => handlePageSizeChange(Number(e.target.value))}
//                                         className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
//                                     >
//                                         <option value={10}>10</option>
//                                         <option value={25}>25</option>
//                                         <option value={50}>50</option>
//                                     </select>
//                                 </div>
//                                 <button
//                                     onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
//                                     disabled={currentPage === totalPages}
//                                     className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         )}
//                         {/* Mobile Summary */}
//                         <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 text-center">
//                             <p className="text-sm text-orange-700 dark:text-orange-300">
//                                 Total: <span className="font-semibold">{totalRecords}</span> users
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table View */}
//                 <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
//                     <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
//                         <CustomTable<User>
//                             data={paginatedData}
//                             columns={columns}
//                             isLoading={loading}
//                             title="Users"
//                             searchValue={searchValue}
//                             onSearchChange={handleSearch}
//                             searchPlaceholder="Search users..."
//                             showSearch
//                             sortConfig={sortConfig}
//                             onSortChange={handleSort}
//                             currentPage={currentPage}
//                             totalPages={totalPages}
//                             pageSize={pageSize}
//                             totalRecords={totalRecords}
//                             onPageChange={handlePageChange}
//                             onPageSizeChange={handlePageSizeChange}
//                             pageSizeOptions={[10, 25, 50, 100]}
//                             showPagination
//                             emptyMessage="No users found"
//                             showColumnToggle
//                             hiddenColumns={hiddenColumns}
//                             onColumnVisibilityChange={handleColumnVisibilityChange}
//                             actions={(row) => (
//                                 <div className="flex gap-1 sm:gap-2">
//                                     {hasPermission(22, "edit") && (
//                                         <button
//                                             onClick={() => handleEdit(row)}
//                                             className="text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1 rounded transition-colors"
//                                             title="Edit"
//                                         >
//                                             <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
//                                         </button>
//                                     )}
//                                     {hasPermission(4, "delete") && (
//                                         <button
//                                             onClick={() => handleDelete(row)}
//                                             className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition-colors"
//                                             title="Delete"
//                                         >
//                                             <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
//                                         </button>
//                                     )}
//                                 </div>
//                             )}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Modals */}
//             <UsersModal
//                 isOpen={modalOpen}
//                 onClose={() => !isSubmitting && setModalOpen(false)}
//                 onSubmit={handleUserSubmit}
//                 user={editingUser}
//             />
//             <DeleteConfirmationModal
//                 isOpen={isDeleteModalOpen}
//                 onClose={() => setIsDeleteModalOpen(false)}
//                 onDelete={confirmDelete}
//                 title="Confirm Deletion"
//                 message={`Are you sure you want to delete the user "${userToDelete?.name}"?`}
//                 Icon={Trash2}
//             />
//             <ExportModal
//                 isOpen={isExportModalOpen}
//                 onClose={() => setIsExportModalOpen(false)}
//                 data={paginatedData}
//                 fileName={`users_export_${new Date().toISOString().split('T')[0]}`}
//                 columns={columns}
//             />
//         </div>
//     );
// };

// export default Users;
'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomTable from '../Common/CustomTable';
import { Plus, Pencil, Trash2, Grid3X3, List, Menu, Search, Download } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../store/store';
import { exportUsers, deleteUser, updateUser, addUser } from '../../../../store/userSlice';
import { getRoles } from '../../../../store/roleSlice';
import UsersModal from './UsersModal';
import DeleteConfirmationModal from '../Common/DeleteConfirmationModal';
import { toast } from 'react-toastify';
import ExportModal from '../Common/ExportModal';
import { fetchPermissions } from '../../../../store/permissionSlice';

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    roleId: number;
    status: string;
    profileImage: string;
}

interface Role {
    id: number | string;
    roleType: string;
}

type SortConfig = {
    key: keyof User;
    direction: 'asc' | 'desc';
} | null;

// Debounce hook - clean implementation
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const Users: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: users = [], loading } = useSelector((state: RootState) => state.users);
    const { data: roles = [] } = useSelector((state: RootState) => state.roles);
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Refs to prevent duplicate API calls
    const rolesFetchedRef = useRef(false);
    const permissionsFetchedRef = useRef(false);
    const isInitialMount = useRef(true);

    // Debounced search value - 500ms delay
    const debouncedSearchValue = useDebounce(searchValue, 500);

    // API se total aur totalPages lein
    const totalRecords = users?.data?.total || 0;
    const totalPages = users?.data?.totalPages || 1;

    // Fetch roles on mount
    useEffect(() => {
        if (rolesFetchedRef.current) return;
        rolesFetchedRef.current = true;
        dispatch(getRoles({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

    // Initial load - only once
    useEffect(() => {
        dispatch(exportUsers({ page: 1, limit: pageSize, searchValue: '' }));
    }, []);

    // Search effect - triggers on debounced value change
    useEffect(() => {
        // Skip initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const trimmedSearch = debouncedSearchValue.trim();

        // Search when empty OR when 3+ characters
        if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
            setCurrentPage(1);
            dispatch(exportUsers({
                page: 1,
                limit: pageSize,
                searchValue: trimmedSearch,
            }));
        }
    }, [debouncedSearchValue, pageSize, dispatch]);

    const roleMap = useMemo(() => {
        const map = new Map<string, string>();
        const rolesData: any = roles;
        let rolesArray: any[] = [];
        try {
            if (Array.isArray(rolesData)) {
                rolesArray = rolesData;
            } else if (rolesData && typeof rolesData === 'object') {
                if (rolesData.data) {
                    if (Array.isArray(rolesData.data)) {
                        rolesArray = rolesData.data;
                    } else if (rolesData.data.data && Array.isArray(rolesData.data.data)) {
                        rolesArray = rolesData.data.data;
                    }
                }
            }
        } catch (error) {
            console.error('Error processing roles data:', error);
        }
        if (rolesArray && rolesArray.length > 0) {
            rolesArray.forEach((role: any) => {
                if (role && role.id && role.roleType) {
                    map.set(String(role.id), role.roleType);
                } else {
                    console.error('Invalid role object:', role);
                }
            });
        }
        return map;
    }, [roles]);

    // API response se direct data lein
    const paginatedData = useMemo(() => {
        return users?.data?.data || [];
    }, [users]);

    const handleSort = (config: any) => setSortConfig(config);

    // Pagination change - direct API call
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const trimmedSearch = debouncedSearchValue.trim();
        const searchParam = trimmedSearch.length >= 3 ? trimmedSearch : '';
        dispatch(exportUsers({
            page,
            limit: pageSize,
            searchValue: searchParam,
        }));
    };

    // Page size change - direct API call
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
        const trimmedSearch = debouncedSearchValue.trim();
        const searchParam = trimmedSearch.length >= 3 ? trimmedSearch : '';
        dispatch(exportUsers({
            page: 1,
            limit: size,
            searchValue: searchParam,
        }));
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const handleColumnVisibilityChange = (newHiddenColumns: string[]) => {
        setHiddenColumns(newHiddenColumns);
        localStorage.setItem('users-hidden-columns', JSON.stringify(newHiddenColumns));
    };

    useEffect(() => {
        const savedHiddenColumns = localStorage.getItem('users-hidden-columns');
        if (savedHiddenColumns) {
            try {
                setHiddenColumns(JSON.parse(savedHiddenColumns));
            } catch (error) {
                console.error('Error parsing hidden columns from localStorage:', error);
            }
        }
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleUserSubmit = async (data: any) => {
        setIsSubmitting(true);
        let resultAction: any;
        if (editingUser) {
            resultAction = await dispatch(updateUser({ id: editingUser.id, userData: data }));
        } else {
            resultAction = await dispatch(addUser(data));
        }
        const res = resultAction.payload;
        if (res?.success) {
            const trimmedSearch = debouncedSearchValue.trim();
            dispatch(exportUsers({
                page: currentPage,
                limit: pageSize,
                searchValue: trimmedSearch.length >= 3 ? trimmedSearch : ''
            }));
            setModalOpen(false);
        } else {
            const errorMessage = Array.isArray(res?.errors) && res.errors.length > 0
                ? res.errors[0]
                : res?.message;
            toast.error(errorMessage);
        }
        setIsSubmitting(false);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                const res = await dispatch(deleteUser(userToDelete.id));
                if (res.meta.requestStatus === "fulfilled") {
                    const trimmedSearch = debouncedSearchValue.trim();
                    await dispatch(exportUsers({
                        page: currentPage,
                        limit: pageSize,
                        searchValue: trimmedSearch.length >= 3 ? trimmedSearch : ''
                    }));
                    setIsDeleteModalOpen(false);
                } else {
                    toast.error("Failed to delete user ❌");
                }
            } catch (error) {
                toast.error("Something went wrong while deleting user ⚠️");
            }
        }
    };

    const getRoleType = (roleId: number) => {
        const rolesData: any = roles;
        let actualRoles: any[] = [];
        if (Array.isArray(rolesData)) {
            actualRoles = rolesData;
        } else if (rolesData?.data) {
            if (Array.isArray(rolesData.data)) {
                actualRoles = rolesData.data;
            } else if (rolesData.data?.data && Array.isArray(rolesData.data.data)) {
                actualRoles = rolesData.data.data;
            }
        }
        const foundRole = actualRoles.find((role: any) => {
            return String(role.id) === String(roleId) ||
                role.id === roleId ||
                Number(role.id) === Number(roleId);
        });
        return foundRole ? foundRole.roleType : `Role ${roleId}`;
    };

    const handleExport = () => {
        if (paginatedData.length === 0) {
            toast.error('No data to export');
            return;
        }
        setIsExportModalOpen(true);
    };

    const columns: any = [
        {
            label: 'Name',
            accessor: 'name',
            sortable: true,
            width: '150px',
            mobile: true,
            minWidth: 200,
            maxWidth: 500,
            showTooltip: true,
            render: (row: User) => (
                <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {row.name}
                </span>
            ),
        },
        {
            label: 'Profile Image',
            accessor: 'profileImage',
            render: (row: User) =>
                row.profileImage ? (
                    <img
                        src={row.profileImage}
                        alt="Profile"
                        className={`w-20 h-12 object-cover border border-gray-300 dark:border-gray-600 rounded-lg ${row.status === 'inactive' ? 'opacity-50' : ''}`}
                    />
                ) : (
                    <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>-</span>
                ),
            showTooltip: true,
        },
        {
            label: 'Email',
            accessor: 'email',
            sortable: true,
            width: '200px',
            mobile: true,
            render: (row: User) => (
                <div
                    className={`truncate max-w-[150px] md:max-w-[200px] ${row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                    title={row.email}
                >
                    {row.email}
                </div>
            ),
            showTooltip: true,
        },
        {
            label: 'Phone',
            accessor: 'phoneNumber',
            sortable: true,
            width: '140px',
            mobile: false,
            minWidth: 200,
            maxWidth: 500,
            render: (row: User) => (
                <span className={row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {row.phoneNumber}
                </span>
            ),
            showTooltip: true,
        },
        {
            label: 'Role',
            accessor: 'roleId',
            sortable: true,
            width: '120px',
            mobile: true,
            render: (row: User) => {
                const roleType = getRoleType(row.roleId);
                return (
                    <div
                        className={`truncate max-w-[100px] md:max-w-[120px] ${row.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                        title={roleType}
                    >
                        {roleType}
                    </div>
                );
            },
        },
        {
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '100px',
            mobile: false,
            render: (row: User) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                >
                    {row.status || 'Active'}
                </span>
            ),
            showTooltip: true,
        },
    ];

    const { permissions: rolePermissions, loading: rolePermissionsLoading } =
        useSelector((state: RootState) => state.sidebarPermissions);
    const { list: allPermissions } = useSelector(
        (state: RootState) => state.permissions
    );

    // NOTE: fetchRolePermissionsSidebar is already called globally by LayoutClient.tsx
    useEffect(() => {
        if (permissionsFetchedRef.current) return;
        permissionsFetchedRef.current = true;
        dispatch(fetchPermissions({ page: 1, limit: 100, searchValue: '' }));
    }, [dispatch]);

    const getLeadPermissions = () => {
        const leadPerm = rolePermissions?.permissions?.find(
            (p: any) => p.pageName === 'User Management'
        );
        return leadPerm?.permissionIds || [];
    };

    const leadPermissionIds = getLeadPermissions();

    const hasPermission = (permId: number, permName: string) => {
        if (!leadPermissionIds.includes(permId)) return false;
        const matched = allPermissions?.data?.permissions?.find((p: any) => p.id === permId);
        if (!matched) return false;
        return matched.permissionName?.trim().toLowerCase() === permName.trim().toLowerCase();
    };

    const UserCard = ({ user }: { user: User }) => (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className={`w-12 h-12 object-cover border border-gray-300 dark:border-gray-600 rounded-full ${user.status === 'inactive' ? 'opacity-50' : ''}`}
                        />
                    ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.status === 'inactive' ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'}`}>
                            <span className="text-white font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-lg truncate ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{user.name}</h3>
                        <p className={`text-sm mt-1 ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{getRoleType(user.roleId)}</p>
                        <p className={`text-sm truncate mt-1 ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{user.email}</p>
                    </div>
                </div>
                {user.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {user.status}
                    </span>
                )}
            </div>
            {user.phoneNumber && (
                <div className={`text-sm ${user.status === 'inactive' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    <span className="font-medium">Phone:</span> {user.phoneNumber}
                </div>
            )}
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {hasPermission(22, "edit") && (
                    <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}
                {hasPermission(4, "delete") && (
                    <button
                        onClick={() => handleDelete(user)}
                        className="flex-1 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-black">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage system users</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Switch view"
                        >
                            {viewMode === 'table' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Action Button */}
            <div className="sticky top-16 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 lg:hidden">
                <div className="flex items-center gap-2">
                    {hasPermission(21, "add") && (
                        <button
                            onClick={handleAdd}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add New User</span>
                        </button>
                    )}
                    {hasPermission(24, "export") && (
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors shadow-md hover:shadow-lg duration-200"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Users Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage system users and permissions
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {hasPermission(24, "export") && (
                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        )}
                        {hasPermission(21, "add") && (
                            <button
                                onClick={handleAdd}
                                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add User</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                <div className={`lg:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-orange-400"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {paginatedData.map((user: any) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                                {paginatedData.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👥</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No users found</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                            {searchValue ? 'Try adjusting your search terms' : 'Add your first user to get started'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {/* Mobile Summary */}
                        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 text-center">
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Total: <span className="font-semibold">{totalRecords}</span> users
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <CustomTable<User>
                            data={paginatedData}
                            columns={columns}
                            isLoading={loading}
                            title="Users"
                            searchValue={searchValue}
                            onSearchChange={handleSearch}
                            searchPlaceholder="Search users..."
                            showSearch
                            sortConfig={sortConfig}
                            onSortChange={handleSort}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalRecords={totalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[10, 25, 50, 100]}
                            showPagination
                            emptyMessage="No users found"
                            showColumnToggle
                            hiddenColumns={hiddenColumns}
                            onColumnVisibilityChange={handleColumnVisibilityChange}
                            actions={(row) => (
                                <div className="flex gap-1 sm:gap-2">
                                    {hasPermission(22, "edit") && (
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    {hasPermission(4, "delete") && (
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UsersModal
                isOpen={modalOpen}
                onClose={() => !isSubmitting && setModalOpen(false)}
                onSubmit={handleUserSubmit}
                user={editingUser}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the user "${userToDelete?.name}"?`}
                Icon={Trash2}
            />
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={paginatedData}
                fileName={`users_export_${new Date().toISOString().split('T')[0]}`}
                columns={columns}
            />
        </div>
    );
};

export default Users;