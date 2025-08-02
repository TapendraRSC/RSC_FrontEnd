'use client';
import React, { useEffect, useState } from 'react';
import {
    Camera, Mail, Phone, MapPin, Calendar, User,
    CreditCard, MessageCircle, Edit3, Copy, Check, Eye, EyeOff
} from 'lucide-react';

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
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [hiddenFields, setHiddenFields] = useState(new Set(['aadhar', 'pan']));

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse user:', err);
            }
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const toggleFieldVisibility = (field: string) => {
        const updated = new Set(hiddenFields);
        updated.has(field) ? updated.delete(field) : updated.add(field);
        setHiddenFields(updated);
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        return s === 'active' ? 'bg-green-100 text-green-700 border-green-200'
            : s === 'inactive' ? 'bg-red-100 text-red-700 border-red-200'
                : s === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getRoleTitle = (roleId: number) => ({
        1: 'Administrator', 2: 'Manager', 3: 'User', 4: 'Guest'
    }[roleId] ?? 'Unknown');

    const getRoleColor = (roleId: number) => ({
        1: 'bg-purple-100 text-purple-800',
        2: 'bg-blue-100 text-blue-800',
        3: 'bg-green-100 text-green-800',
        4: 'bg-gray-100 text-gray-800',
    }[roleId] ?? 'bg-gray-100 text-gray-800');

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-1 text-base">Manage your personal and contact information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-32 h-32 bg-gray-100 rounded-xl border border-gray-300 overflow-hidden">
                            {previewImage || user.profileImage ? (
                                <img src={previewImage || user.profileImage!} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User size={36} />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow transition">
                            <Camera size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center lg:text-left space-y-2">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                            <div className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.roleId)}`}>
                                {getRoleTitle(user.roleId)}
                            </div>
                        </div>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
                            <Calendar size={16} /> Joined {new Date(user.registerDate!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                            <span className={`px-4 py-1.5 text-sm rounded-full border font-medium ${getStatusColor(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition">
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InfoSection title="Personal Info" icon={<User size={20} />} iconColor="text-blue-600">
                        <InfoItem label="Full Name" value={user.name} icon={<User size={16} />} copyable onCopy={() => copyToClipboard(user.name, 'name')} copied={copiedField === 'name'} />
                        <InfoItem label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US') : 'Not specified'} icon={<Calendar size={16} />} />
                        <InfoItem label="Location" value={user.city && user.state ? `${user.city}, ${user.state}` : 'Not specified'} icon={<MapPin size={16} />} />
                    </InfoSection>

                    <InfoSection title="Contact Info" icon={<Phone size={20} />} iconColor="text-green-600">
                        <InfoItem label="Email" value={user.email} icon={<Mail size={16} />} copyable onCopy={() => copyToClipboard(user.email, 'email')} copied={copiedField === 'email'} />
                        <InfoItem label="Phone" value={user.phoneNumber} icon={<Phone size={16} />} copyable onCopy={() => copyToClipboard(user.phoneNumber, 'phone')} copied={copiedField === 'phone'} />
                        <InfoItem label="WhatsApp" value={user.whatsappNumber || 'Not provided'} icon={<MessageCircle size={16} />} copyable={!!user.whatsappNumber} onCopy={() => copyToClipboard(user.whatsappNumber!, 'whatsapp')} copied={copiedField === 'whatsapp'} />
                    </InfoSection>

                    <InfoSection title="Documents" icon={<CreditCard size={20} />} iconColor="text-purple-600">
                        <InfoItem label="Aadhar" value={user.aadharNumber ? (hiddenFields.has('aadhar') ? `••••••••${user.aadharNumber.slice(-4)}` : user.aadharNumber) : 'Not provided'} icon={<CreditCard size={16} />} sensitive hidden={hiddenFields.has('aadhar')} onToggleVisibility={() => toggleFieldVisibility('aadhar')} copyable={!!user.aadharNumber} onCopy={() => copyToClipboard(user.aadharNumber!, 'aadhar')} copied={copiedField === 'aadhar'} />
                        <InfoItem label="PAN" value={user.panNumber ? (hiddenFields.has('pan') ? `${user.panNumber.slice(0, 3)}••••${user.panNumber.slice(-2)}` : user.panNumber) : 'Not provided'} icon={<CreditCard size={16} />} sensitive hidden={hiddenFields.has('pan')} onToggleVisibility={() => toggleFieldVisibility('pan')} copyable={!!user.panNumber} onCopy={() => copyToClipboard(user.panNumber!, 'pan')} copied={copiedField === 'pan'} />
                    </InfoSection>

                    <InfoSection title="Address" icon={<MapPin size={20} />} iconColor="text-orange-600">
                        <InfoItem label="Full Address" value={user.fullAddress || 'Not provided'} icon={<MapPin size={16} />} multiline copyable={!!user.fullAddress} onCopy={() => copyToClipboard(user.fullAddress!, 'address')} copied={copiedField === 'address'} />
                    </InfoSection>
                </div>
            </div>
        </div>
    );
};

const InfoSection = ({ title, icon, iconColor, children }: { title: string, icon: React.ReactNode, iconColor: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className={`${iconColor}`}>{icon}</div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const InfoItem = ({
    label, value, icon, multiline, copyable, onCopy, copied, sensitive, hidden, onToggleVisibility
}: {
    label: string, value: string, icon: React.ReactNode, multiline?: boolean, copyable?: boolean,
    onCopy?: () => void, copied?: boolean, sensitive?: boolean, hidden?: boolean, onToggleVisibility?: () => void
}) => (
    <div className="group">
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span className="text-gray-400">{icon}</span>
                {label}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {sensitive && onToggleVisibility && (
                    <button onClick={onToggleVisibility} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition">
                        {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                )}
                {copyable && onCopy && value !== 'Not provided' && (
                    <button onClick={onCopy} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition">
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
        <div className={`px-4 ${multiline ? 'py-3 min-h-[4rem]' : 'h-12'} flex items-center bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900`}>
            <span className={`${multiline ? 'leading-relaxed' : ''} ${sensitive && hidden ? 'font-mono tracking-widest' : ''}`}>
                {value}
            </span>
        </div>
    </div>
);

export default Profile;
