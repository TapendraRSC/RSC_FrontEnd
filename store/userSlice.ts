// "use client";
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '@/libs/axios';
// import { toast } from 'react-toastify';

// interface ExportedUserState {
//     data: any;
//     loading: boolean;
//     error: string | null;
// }

// const initialState: ExportedUserState = {
//     data: null,
//     loading: false,
//     error: null,
// };

// // Thunk to export users
// export const exportUsers = createAsyncThunk(
//     'users/exportUsers',
//     async ({ page, limit, searchValue }: { page: number; limit: number; searchValue: string }, thunkAPI) => {
//         try {
//             const response = await axiosInstance.get(`users/getAllUser?page=${page}&limit=${limit}&search=${searchValue}`);
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to export users');
//         }
//     }
// );

// // Thunk to get a single user by ID
// export const getUserById = createAsyncThunk(
//     'users/getUserById',
//     async (id: number, thunkAPI) => {
//         try {
//             const response = await axiosInstance.get(`users/getUser/${id}`);
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
//         }
//     }
// );

// // Thunk to add a user (with profileImage using FormData)
// export const addUser = createAsyncThunk(
//     'users/addUser',
//     async (userData: any, thunkAPI) => {
//         try {
//             const formData = new FormData();
//             Object.keys(userData).forEach((key) => {
//                 if (key === 'profileImage' && userData[key]) {
//                     formData.append(key, userData[key]); // append file
//                 } else {
//                     formData.append(key, userData[key]);
//                 }
//             });
//             const response = await axiosInstance.post('users/addUser', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add user');
//         }
//     }
// );

// // Thunk to update a user (with profileImage using FormData)
// export const updateUser = createAsyncThunk(
//     'users/updateUser',
//     async ({ id, userData }: { id: number; userData: any }, thunkAPI) => {
//         try {
//             const formData = new FormData();
//             Object.keys(userData).forEach((key) => {
//                 if (key === 'profileImage' && userData[key]) {
//                     formData.append(key, userData[key]); // append file
//                 } else {
//                     formData.append(key, userData[key]);
//                 }
//             });
//             const response = await axiosInstance.put(`users/updateUser/${id}`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user');
//         }
//     }
// );

// // Thunk to delete a user
// export const deleteUser = createAsyncThunk(
//     'users/deleteUser',
//     async (id: number, thunkAPI) => {
//         try {
//             const response = await axiosInstance.delete(`users/deleteUser/${id}`);
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete user');
//         }
//     }
// );

// const userSlice = createSlice({
//     name: 'users',
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             // Export Users
//             .addCase(exportUsers.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(exportUsers.fulfilled, (state, action) => {
//                 state.data = action.payload;
//                 state.loading = false;
//                 // toast.success(action.payload.message || 'Users exported successfully!');
//             })
//             .addCase(exportUsers.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//                 toast.error(action.payload as string);
//             })
//             // Get User by ID
//             .addCase(getUserById.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(getUserById.fulfilled, (state, action) => {
//                 state.data = action.payload;
//                 state.loading = false;
//                 // toast.success(action.payload.message || 'User fetched successfully!');
//             })
//             .addCase(getUserById.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//                 toast.error(action.payload as string);
//             })
//             // Add User
//             .addCase(addUser.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(addUser.fulfilled, (state, action) => {
//                 state.data = action.payload;
//                 state.loading = false;
//                 toast.success(action.payload.message || 'User added successfully!');
//             })
//             .addCase(addUser.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//                 toast.error(action.payload as string);
//             })
//             // Update User
//             .addCase(updateUser.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(updateUser.fulfilled, (state, action) => {
//                 state.data = action.payload;
//                 state.loading = false;
//                 toast.success(action.payload.message || 'User updated successfully!');
//             })
//             .addCase(updateUser.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//                 toast.error(action.payload as string);
//             })
//             // Delete User
//             .addCase(deleteUser.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(deleteUser.fulfilled, (state, action) => {
//                 state.data = action.payload;
//                 state.loading = false;
//                 toast.success(action.payload.message);
//             })
//             .addCase(deleteUser.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//                 toast.error(action.payload as string);
//             });
//     },
// });

// export default userSlice.reducer;


"use client";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/libs/axios';
import { toast } from 'react-toastify';

interface ExportedUserState {
    data: any;
    loading: boolean;
    error: string | null;
}

const initialState: ExportedUserState = {
    data: null,
    loading: false,
    error: null,
};

// Thunk to export users
export const exportUsers = createAsyncThunk(
    'users/exportUsers',
    async ({ page, limit, searchValue }: { page: number; limit: number; searchValue: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`users/getAllUser?page=${page}&limit=${limit}&search=${searchValue}`);
            return response.data;
        } catch (error: any) {
            // Error response bhej rahe hain taaki rejected case mein use reset kar sakein
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Thunk to get a single user by ID
export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (id: number, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`users/getUser/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

// Thunk to add a user
export const addUser = createAsyncThunk(
    'users/addUser',
    async (userData: any, thunkAPI) => {
        try {
            const formData = new FormData();
            Object.keys(userData).forEach((key) => {
                if (key === 'profileImage' && userData[key]) {
                    formData.append(key, userData[key]);
                } else {
                    formData.append(key, userData[key]);
                }
            });
            const response = await axiosInstance.post('users/addUser', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add user');
        }
    }
);

// Thunk to update a user
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }: { id: number; userData: any }, thunkAPI) => {
        try {
            const formData = new FormData();
            Object.keys(userData).forEach((key) => {
                if (key === 'profileImage' && userData[key]) {
                    formData.append(key, userData[key]);
                } else {
                    formData.append(key, userData[key]);
                }
            });
            const response = await axiosInstance.put(`users/updateUser/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

// Thunk to delete a user
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: number, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(`users/deleteUser/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- Export / Get All Users ---
            .addCase(exportUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportUsers.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(exportUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;

                // CRITICAL FIX: Jab API fail ho (jaise search results not found), 
                // tab purane data ko clear karna zaroori hai.
                state.data = {
                    success: false,
                    message: action.payload,
                    data: {
                        data: [], // UI mein list khali ho jayegi
                        total: 0,
                        totalPages: 0
                    }
                };

                // Search ke waqt "Not Found" error par toast annoying lagta hai,
                // isliye sirf genuine failure par hi toast dikhayenge.
                if (action.payload !== "Users Not Found") {
                    toast.error(action.payload as string);
                }
            })

            // --- Get User by ID ---
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            })

            // --- Add User ---
            .addCase(addUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message || 'User added successfully!');
            })
            .addCase(addUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            })

            // --- Update User ---
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message || 'User updated successfully!');
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            })

            // --- Delete User ---
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message || 'User deleted successfully!');
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            });
    },
});

export default userSlice.reducer;