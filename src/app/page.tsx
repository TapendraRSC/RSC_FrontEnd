// old
// 'use client';

import ComponentsDashboardSales from "./components/Dashboard/LeadsDashboard";

export default function Home() {
  return <ComponentsDashboardSales />;
}


// //new

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import ComponentsDashboardSales from "./components/Dashboard/LeadsDashboard";
// import ComponentsAssistantDirector from "./Assistantdirector/page"; // Import your AD component

// export default function Home() {
//   const [isChecking, setIsChecking] = useState(true);
//   const [isAssistantDirector, setIsAssistantDirector] = useState(false);

//   const { permissions: rolePermissions, loading: rolePermissionsLoading } = useSelector(
//     (state: RootState) => state.sidebarPermissions
//   );

//   useEffect(() => {
//     if (rolePermissionsLoading) return;

//     const isAD = rolePermissions?.permissions?.some(
//       (perm: any) => perm.pageName === 'Assistantdirector' && perm.permissionIds?.includes(17)
//     );

//     setIsAssistantDirector(!!isAD);
//     setIsChecking(false);
//   }, [rolePermissions, rolePermissionsLoading]);

//   if (isChecking || rolePermissionsLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
//           <span className="text-gray-600 dark:text-gray-400 text-sm">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (isAssistantDirector) {
//     return <ComponentsAssistantDirector />;
//   }

//   return <ComponentsDashboardSales />;
// }