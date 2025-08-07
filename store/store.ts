import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import roleReducer from './roleSlice';
import permissionReducer from "./permissionSlice"
import pagePermissionReducer from './pagePermissionSlice'; // Adjust the path as necessary
import rolePermissionSlice from "./rolePermissionSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        roles: roleReducer,
        permissions: permissionReducer,
        pages: pagePermissionReducer,
        rolePermissions: rolePermissionSlice
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
