import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import roleReducer from './roleSlice';
import permissionReducer from "./permissionSlice"
import pagePermissionReducer from './pagePermissionSlice';
import rolePermissionSlice from "./rolePermissionSlice"
import sidebarPermissionSlice from './sidebarPermissionSlice';
import projectStatusSlice from './projectSlice'
import landSlice from "./landSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        roles: roleReducer,
        permissions: permissionReducer,
        pages: pagePermissionReducer,
        rolePermissions: rolePermissionSlice,
        sidebarPermissions: sidebarPermissionSlice,
        projectStatus: projectStatusSlice,
        lands: landSlice
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
