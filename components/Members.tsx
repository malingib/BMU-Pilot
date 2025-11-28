import React, { useState } from 'react';
import { Member, MemberStatus, Role } from '../types';
import { Check, X, MoreHorizontal, UserPlus, MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';
import { draftBroadcastMessage } from '../services/geminiService';

interface MembersProps {
    members: Member[];
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export const Members: React.FC<MembersProps> = ({ members, setMembers }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [smsText, setSmsText] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStatusChange = (id: string, status: MemberStatus) => {
        setMembers(members.map(m => m.id === id ? { ...m, status } : m));
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === members.length && members.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(members.map(m => m.id)));
        }
    };

    const handleAiDraft = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        const draft = await draftBroadcastMessage(aiTopic, 'Selected Members');
        setSmsText(draft);
        setIsGenerating(false);
    };

    const sendSms = () => {
        // Mock sending logic
        alert(`Sending SMS to ${selectedIds.size} members: "${smsText}"`);
        setIsSmsModalOpen(false);
        setSmsText('');
        setAiTopic('');
        setSelectedIds(new Set());
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
                <div>
                    {selectedIds.size > 0 ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                             <div className="bg-ocean-100 text-ocean-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {selectedIds.size} Selected
                             </div>
                             <p className="text-sm text-gray-500">members ready for action</p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Membership Management</h2>
                            <p className="text-gray-500 text-sm">Manage fishermen, traders, and boat owners.</p>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2">
                    {selectedIds.size > 0 ? (
                        <button 
                            onClick={() => setIsSmsModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 animate-fade-in shadow-sm"
                        >
                            <MessageSquare size={18} />
                            Send Bulk SMS
                        </button>
                    ) : (
                        <button className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors flex items-center gap-2">
                            <UserPlus size={18} />
                            Register Member
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.size === members.length && members.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500 w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Member Info</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role & Vessel</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <tr 
                                key={member.id} 
                                className={`transition-colors ${selectedIds.has(member.id) ? 'bg-ocean-50' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(member.id)}
                                        onChange={() => toggleSelection(member.id)}
                                        className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500 w-4 h-4 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{member.name}</span>
                                        <span className="text-xs text-gray-500">{member.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">{member.role}</span>
                                        {member.vesselId && (
                                            <span className="text-xs text-ocean-600 bg-ocean-50 inline-block px-2 py-0.5 rounded-full w-fit mt-1">
                                                {member.vesselId}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${member.status === MemberStatus.ACTIVE ? 'bg-green-100 text-green-800' : 
                                          member.status === MemberStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {member.status === MemberStatus.PENDING && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusChange(member.id, MemberStatus.ACTIVE)}
                                                    className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(member.id, MemberStatus.SUSPENDED)}
                                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                        <button className="p-1.5 hover:bg-gray-100 text-gray-400 rounded">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bulk SMS Modal */}
            {isSmsModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <MessageSquare size={18} className="text-ocean-600"/>
                                Bulk SMS ({selectedIds.size} recipients)
                            </h3>
                            <button onClick={() => setIsSmsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            {/* AI Draft Section */}
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <div className="flex gap-2 mb-2 items-center">
                                    <Sparkles size={14} className="text-indigo-600"/>
                                    <label className="text-xs font-bold text-indigo-900 uppercase tracking-wide">AI Assistant</label>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g. Meeting reminder for tomorrow 2pm"
                                        className="flex-1 text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
                                    />
                                    <button 
                                        onClick={handleAiDraft}
                                        disabled={isGenerating || !aiTopic}
                                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : 'Draft'}
                                    </button>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                <textarea 
                                    value={smsText}
                                    onChange={(e) => setSmsText(e.target.value)}
                                    className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-ocean-500 focus:outline-none resize-none text-gray-700"
                                    placeholder="Type your message here..."
                                />
                                <div className="flex justify-between mt-2">
                                    <p className="text-xs text-gray-400">Standard SMS rates apply.</p>
                                    <span className={`text-xs font-medium ${smsText.length > 160 ? 'text-red-600' : 'text-gray-500'} transition-colors`}>
                                        {smsText.length} / 160 characters
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setIsSmsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={sendSms}
                                    disabled={!smsText.trim()}
                                    className="flex-1 py-2.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <Send size={18} /> Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};