'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { loginUser, completeLogin } from '../../../../store/authSlice';
import axiosInstance from '@/libs/axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

type LoginForm = {
    email: string;
    password: string;
};

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch<any>();
    const { loading } = useSelector((state: RootState) => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [emailForOtp, setEmailForOtp] = useState('');
    const [userIdForOtp, setUserIdForOtp] = useState(''); // ✅ NEW: Store userId
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<LoginForm>();

    useEffect(() => {
        if (step === 'otp' && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, resendTimer]);

    const isOtpComplete = otpDigits.every(digit => digit !== '' && digit.length === 1 && /\d/.test(digit));
    const getFullOtp = () => otpDigits.join(''); // STRING "3735"

    const handleOtpChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length > 1) return;

        const newOtp = [...otpDigits];
        newOtp[index] = numericValue;
        setOtpDigits(newOtp);

        if (numericValue && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };


    const onSubmit = async (data: LoginForm) => {
        const toastId = toast.loading('Signing in...');
        try {
            const result = await dispatch(loginUser(data));

            if (loginUser.fulfilled.match(result)) {
                console.log('Login response:', result.payload);

                toast.update(toastId, {
                    render: 'OTP sent to your email',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                });


                setEmailForOtp(data.email);
                setUserIdForOtp(result.payload.userId);
                setStep('otp');
                setOtpDigits(['', '', '', '']);
                setResendTimer(60);
                reset();
            } else {
                toast.update(toastId, {
                    render: result.payload || 'Invalid credentials',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch {
            toast.update(toastId, {
                render: 'Something went wrong',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        }
    };


    const verifyOtp = async () => {
        if (!isOtpComplete) {
            toast.error('Enter valid 4 digit OTP');
            return;
        }

        const otp = getFullOtp();
        console.log('Verify', userIdForOtp, 'otp:', otp);

        const toastId = toast.loading('Verifying OTP...');
        try {

            const result = await dispatch(completeLogin({
                userId: userIdForOtp,
                otp: otp
            }));

            if (completeLogin.fulfilled.match(result)) {
                console.log('OTPSUCCESS', result.payload);
                toast.update(toastId, {
                    render: 'Login successful!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                });
                router.push('/');
            } else {
                throw new Error(result.payload as string || 'OTP verification failed');
            }
        } catch (err: any) {
            console.error(' OTP ERROR:', err);
            toast.update(toastId, {
                render: err.message || 'Invalid OTP',
                type: 'error',
                isLoading: false,
                autoClose: 4000,
            });
            setOtpDigits(['', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const resendOtp = async () => {
        if (resendTimer > 0) {
            toast.info(`Please wait ${Math.floor(resendTimer / 60)}m ${resendTimer % 60}s`);
            return;
        }

        setResendLoading(true);
        try {
            const response = await axiosInstance.post('auth/resend-otp', {
                userId: userIdForOtp
            });
            console.log('RESEND SUCCESS:', response.data);
            toast.success('OTP resent successfully');
            setOtpDigits(['', '', '', '']);
            setResendTimer(60);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            console.error('RESEND ERROR:', err.response?.data);
            toast.error('Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    // UI - NO CHANGES (Exact same design)
    if (step === 'otp') {
        return (
            <div className="space-y-5">
                <h2 className="text-xl font-semibold text-center">Verify OTP</h2>
                <p className="text-sm text-center text-gray-500">
                    OTP sent to <b>{emailForOtp}</b>
                </p>

                <div className="flex gap-3 justify-center mb-6">
                    {otpDigits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={(e) => {
                                e.preventDefault();
                                const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                                const newOtp = pasteData.split('').concat(Array(4).fill('')).slice(0, 4);
                                setOtpDigits(newOtp);
                                inputRefs.current[3]?.focus();
                            }}
                            className="form-input w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-blue-400 transition-all duration-200"
                            autoComplete="off"
                        />
                    ))}
                </div>

                <button
                    onClick={verifyOtp}
                    disabled={!isOtpComplete || loading}
                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                    type="button"
                    onClick={resendOtp}
                    disabled={resendLoading || resendTimer > 0}
                    className="text-sm text-blue-500 w-full disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {resendLoading
                        ? 'Resending...'
                        : resendTimer > 0
                            ? `Resend OTP (${Math.floor(resendTimer / 60)}m ${resendTimer % 60}s)`
                            : 'Resend OTP'
                    }
                </button>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Email</label>
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
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div>
                <label>Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className={`form-input w-full ps-10 pe-10 placeholder:text-white-dark ${errors.password ? 'border-red-500' : ''}`}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

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
