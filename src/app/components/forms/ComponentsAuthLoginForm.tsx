'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { loginUser } from '../../../../store/authSlice';
import { toast } from 'react-toastify';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch<any>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data: any) => {
        const toastId = toast.loading('Signing in...');
        try {
            const result = await dispatch(loginUser(data));

            if (loginUser.fulfilled.match(result)) {
                toast.update(toastId, {
                    render: 'Login successful!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                });
                router.push('/');
            } else {
                toast.update(toastId, {
                    render: result.payload?.message || 'Login failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (err) {
            toast.update(toastId, {
                render: 'Something went wrong',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        type="email"
                        placeholder="Enter Email"
                        className={`form-input w-full ps-10 placeholder:text-white-dark ${errors.email ? 'border-red-500' : ''}`}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format',
                            },
                            validate: (value) => {
                                if (/\s/.test(value)) {
                                    return 'Email must not contain spaces';
                                }
                                return true;
                            },
                        })}
                    />
                </div>
                {typeof errors.email?.message === 'string' && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type="password"
                        placeholder="Enter Password"
                        className={`form-input w-full ps-10 placeholder:text-white-dark ${errors.password ? 'border-red-500' : ''}`}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        })}
                    />
                </div>
                {typeof errors.password?.message === 'string' && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
            >
                {loading ? 'Logging in...' : 'Sign in'}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
