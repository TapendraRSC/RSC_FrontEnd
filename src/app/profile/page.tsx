'use client';
import React, { useEffect, useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, User, CreditCard, MessageCircle, Edit3 } from 'lucide-react';

type UserProfile = {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    roleId: number;
    aadharNumber?: string | null;
    panNumber?: string | null;
    city?: string | null;
    state?: string | null;
    fullAddress?: string | null;
    whatsappNumber?: string | null;
    dateOfBirth?: string | null;
    registerDate?: string;
    profileImage?: string | null;
    status: string;
};

const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: UserProfile = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (err) {
                console.error('Failed to parse user from localStorage:', err);
            }
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'inactive': return 'bg-red-50 text-red-700 border-red-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getRoleTitle = (roleId: number) => {
        const roles = { 1: 'Administrator', 2: 'Manager', 3: 'User', 4: 'Guest' };
        return roles[roleId as keyof typeof roles] || 'Unknown';
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-600 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-12">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl border border-slate-300 p-10 mb-10 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">

                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-300">
                                {previewImage || user.profileImage ? (
                                    <img
                                        src={previewImage || user.profileImage!}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                        <User className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-slate-800 text-white p-2.5 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors shadow-lg">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="mb-6">
                                <h1 className="text-4xl font-bold text-slate-900 mb-3">{user.name}</h1>
                                <p className="text-slate-600 text-lg mb-2">{user.email}</p>
                                <p className="text-slate-500">{getRoleTitle(user.roleId)}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(user.status)}`}>
                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm">
                                    <Edit3 size={16} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Personal Information */}
                    <InfoSection
                        title="Personal Information"
                        icon={<User size={20} />}
                        iconColor="text-blue-600"
                    >
                        <InfoItem
                            label="Full Name"
                            value={user.name}
                            icon={<User size={16} />}
                        />
                        <InfoItem
                            label="Date of Birth"
                            value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Not specified'}
                            icon={<Calendar size={16} />}
                        />
                        <InfoItem
                            label="Location"
                            value={user.city && user.state ? `${user.city}, ${user.state}` : 'Not specified'}
                            icon={<MapPin size={16} />}
                        />
                    </InfoSection>

                    {/* Contact Information */}
                    <InfoSection
                        title="Contact Information"
                        icon={<Phone size={20} />}
                        iconColor="text-emerald-600"
                    >
                        <InfoItem
                            label="Email Address"
                            value={user.email}
                            icon={<Mail size={16} />}
                        />
                        <InfoItem
                            label="Phone Number"
                            value={user.phoneNumber}
                            icon={<Phone size={16} />}
                        />
                        <InfoItem
                            label="WhatsApp"
                            value={user.whatsappNumber || 'Not provided'}
                            icon={<MessageCircle size={16} />}
                        />
                    </InfoSection>

                    {/* Documents */}
                    <InfoSection
                        title="Identity Documents"
                        icon={<CreditCard size={20} />}
                        iconColor="text-purple-600"
                    >
                        <InfoItem
                            label="Aadhar Number"
                            value={user.aadharNumber ? `••••••••${user.aadharNumber.slice(-4)}` : 'Not provided'}
                            icon={<CreditCard size={16} />}
                        />
                        <InfoItem
                            label="PAN Number"
                            value={user.panNumber ? `${user.panNumber.slice(0, 3)}••••${user.panNumber.slice(-2)}` : 'Not provided'}
                            icon={<CreditCard size={16} />}
                        />
                    </InfoSection>

                    {/* Address */}
                    <InfoSection
                        title="Address Information"
                        icon={<MapPin size={20} />}
                        iconColor="text-orange-600"
                    >
                        <InfoItem
                            label="Full Address"
                            value={user.fullAddress || 'Not provided'}
                            icon={<MapPin size={16} />}
                            multiline
                        />
                    </InfoSection>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm">
                        Member since {new Date(user.registerDate!).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

type InfoSectionProps = {
    title: string;
    icon: React.ReactNode;
    iconColor: string;
    children: React.ReactNode;
};

const InfoSection = ({ title, icon, iconColor, children }: InfoSectionProps) => (
    <div className="bg-white rounded-3xl border border-slate-300 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
            <div className={`${iconColor}`}>
                {icon}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

type InfoItemProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
    multiline?: boolean;
};

const InfoItem = ({ label, value, icon, multiline = false }: InfoItemProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <span className="text-slate-400">
                {icon}
            </span>
            <label className="text-sm font-medium text-slate-700">{label}</label>
        </div>
        <div className={`${multiline ? 'min-h-[3.5rem] py-4' : 'h-12'} px-4 bg-slate-50 border border-slate-300 rounded-xl flex items-center text-slate-900 font-medium`}>
            {value}
        </div>
    </div>
);

export default Profile;