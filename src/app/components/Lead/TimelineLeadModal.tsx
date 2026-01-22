'use client';


export interface Remark {
    text: string;
    time: string;
    ago: string;
    by: string;
    type: 'call' | 'email' | 'other';
    status?: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string[];
    email: string;
    projectName?: string | null;
    createdOn: string;
    createdBy: string;
    assignedTo?: string | null;
    remarks: Remark[];
}


import React from 'react';
import { Phone, Mail, Edit, X, User, Calendar, Clock, MapPin } from 'lucide-react';

interface TimelineLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
}

const TimelineLeadModal: React.FC<TimelineLeadModalProps> = ({ isOpen, onClose, lead }) => {
    // Modal close handler
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !lead) return null;

    const getRemarkTypeIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone size={14} />;
            case 'email': return <Mail size={14} />;
            default: return <Edit size={14} />;
        }
    };

    const getRemarkTypeColor = (type: string, status?: string) => {
        if (status === 'IN FOLLOWUP') {
            return 'bg-amber-500 border-amber-400';
        }
        switch (type) {
            case 'call': return 'bg-green-500 border-green-400';
            case 'email': return 'bg-orange-500 border-orange-400';
            default: return 'bg-purple-500 border-purple-400';
        }
    };

    const getRemarkBgColor = (status?: string) => {
        if (status === 'IN FOLLOWUP') {
            return 'bg-amber-50 border-amber-200';
        }
        return 'bg-white border-gray-200';
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{ margin: "0px" }}
        >
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-purple-600/10"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{lead.name}</h2>
                                    <div className="flex items-center space-x-4 text-white/90 text-sm mt-1">
                                        <span className="flex items-center">
                                            <Phone size={14} className="mr-1" />
                                            {Array.isArray(lead.phone) ? lead.phone.join(' | ') : lead.phone}
                                        </span>
                                        <span className="flex items-center">
                                            <Mail size={14} className="mr-1" />
                                            {lead.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="flex items-center text-white/70 mb-1">
                                    <MapPin size={14} className="mr-1" />
                                    Project
                                </div>
                                <div className="text-white font-medium">{lead.projectName || 'Not assigned'}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="flex items-center text-white/70 mb-1">
                                    <Calendar size={14} className="mr-1" />
                                    Created
                                </div>
                                <div className="text-white font-medium">{lead.createdOn}</div>
                                <div className="text-white/70 text-xs">by {lead.createdBy}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="flex items-center text-white/70 mb-1">
                                    <User size={14} className="mr-1" />
                                    Assigned To
                                </div>
                                <div className="text-white font-medium">{lead.assignedTo || 'Unassigned'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Clock size={20} className="mr-2 text-orange-600" />
                            Activity Timeline
                        </h3>
                        <div className="text-sm text-gray-500">
                            {Array.isArray(lead.remarks) ? lead.remarks.length : 0} activities
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-orange-200 via-purple-200 to-orange-200"></div>

                        {Array.isArray(lead.remarks) && lead.remarks.length > 0 ? (
                            <div className="space-y-6">
                                {lead.remarks.map((remark: any, index: any) => {
                                    const isFollowUp = remark.status === 'IN FOLLOWUP';
                                    return (
                                        <div key={index} className="relative flex items-start">
                                            <div className={`relative z-10 w-12 h-12 rounded-full border-4 ${getRemarkTypeColor(remark.type, remark.status)} shadow-lg flex items-center justify-center`}>
                                                <div className="text-white">
                                                    {getRemarkTypeIcon(remark.type)}
                                                </div>
                                            </div>

                                            <div className="flex-1 ml-4">
                                                <div className={`rounded-xl border-2 ${getRemarkBgColor(remark.status)} p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                                                    {isFollowUp && (
                                                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mb-2">
                                                            <Clock size={12} className="mr-1" />
                                                            Follow-up Required
                                                        </div>
                                                    )}
                                                    <p className="text-gray-800 leading-relaxed mb-3">{remark.text}</p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center space-x-3 text-gray-500">
                                                            <span className="flex items-center">
                                                                <Calendar size={12} className="mr-1" />
                                                                {remark.time}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span>{remark.ago}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <User size={12} className="mr-1" />
                                                            <span className="font-medium">{remark.by}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500">No activity records available</p>
                                <p className="text-gray-400 text-sm mt-1">Activities will appear here once they are added</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Last updated: {Array.isArray(lead.remarks) && lead.remarks.length > 0 ? lead.remarks[0]?.time : lead.createdOn}
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                            Export Timeline
                        </button>
                        <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                            Show Filtered Records
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineLeadModal;