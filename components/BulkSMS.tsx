import React, { useState } from 'react';
import { Send, Sparkles, Clock, Users, Loader2, Copy, CheckCircle, X, AlertTriangle, RefreshCw, Calendar, Eye, Smartphone } from 'lucide-react';
import { draftBroadcastMessage } from '../services/geminiService';

interface SmsLog {
    id: number;
    date: string;
    recipient: string;
    message: string;
    status: 'Delivered' | 'Sent' | 'Failed' | 'Queued' | 'Scheduled' | 'Read' | 'Pending Delivery';
}

const MOCK_HISTORY: SmsLog[] = [
    { id: 1, date: '2024-10-26 14:30', recipient: 'All Fishermen', message: 'High tide warning: 3.5m waves expected tomorrow morning. Secure all vessels.', status: 'Read' },
    { id: 2, date: '2024-10-25 09:00', recipient: 'Committee', message: 'Urgent meeting at 14:00 today regarding new by-laws.', status: 'Delivered' },
    { id: 3, date: '2024-10-20 16:15', recipient: 'Defaulters', message: 'Reminder: Monthly landing fees are due. Please pay via USSD *384#.', status: 'Failed' },
    { id: 4, date: '2024-10-28 08:00', recipient: 'Active Members Only', message: 'Weekly catch reports are now available on the portal.', status: 'Scheduled' },
    { id: 5, date: '2024-10-29 10:00', recipient: 'Traders', message: 'Market prices update: Nile Perch up by 10%.', status: 'Pending Delivery' },
];

export const BulkSMS: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [recipient, setRecipient] = useState('All Fishermen');
    const [message, setMessage] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState<SmsLog[]>(MOCK_HISTORY);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleAiDraft = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        const draft = await draftBroadcastMessage(topic, recipient);
        setMessage(draft);
        setIsGenerating(false);
    };

    const handleSendClick = () => {
        if (!message.trim()) return;
        setShowConfirm(true);
    };

    const confirmSend = () => {
        setIsSending(true);
        // Simulate network delay
        setTimeout(() => {
            const newLog: SmsLog = {
                id: Date.now(),
                date: scheduledTime ? new Date(scheduledTime).toLocaleString() : new Date().toLocaleString(),
                recipient: recipient,
                message: message,
                status: scheduledTime ? 'Scheduled' : 'Pending Delivery'
            };
            setHistory([newLog, ...history]);
            setMessage('');
            setTopic('');
            setScheduledTime('');
            setIsSending(false);
            setShowConfirm(false);
        }, 1500);
    };

    const getStatusColor = (status: SmsLog['status']) => {
        switch (status) {
            case 'Read': return 'bg-green-100 text-green-700 border-green-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Pending Delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Queued': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const now = new Date().toISOString().slice(0, 16);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-ocean-600" />
                        Communication Hub
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage bulk SMS broadcasts and view communication logs.</p>
                </div>
                <div className="hidden md:flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        System Online
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-ocean-500"></div>
                        Credits: 4,500
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-ocean-50 px-6 py-4 border-b border-ocean-100 flex justify-between items-center">
                            <h3 className="font-semibold text-ocean-900">Compose Message</h3>
                            <span className="text-xs font-medium bg-white text-ocean-600 px-2 py-1 rounded border border-ocean-100">
                                SMS
                            </span>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Audience Selector */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                    <select 
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:outline-none transition-all"
                                    >
                                        <option>All Fishermen</option>
                                        <option>Active Members Only</option>
                                        <option>Committee Members</option>
                                        <option>Boat Owners</option>
                                        <option>Defaulters (Fees Owed)</option>
                                        <option>Traders</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                                    <div className="relative">
                                        <input 
                                            type="datetime-local"
                                            min={now}
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:outline-none transition-all pl-10 text-sm text-gray-600"
                                        />
                                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* AI Assistant */}
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 transition-all hover:shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={16} className="text-indigo-600" />
                                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Gemini Assistant</span>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Describe what you want to say (e.g., 'Emergency meeting tomorrow at 9am')"
                                        className="flex-1 text-sm border border-indigo-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
                                    />
                                    <button 
                                        onClick={handleAiDraft}
                                        disabled={isGenerating || !topic.trim()}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : 'Draft Message'}
                                    </button>
                                </div>
                            </div>

                            {/* Message Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                                <div className="relative">
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className={`w-full h-40 p-4 border rounded-xl focus:ring-2 focus:outline-none resize-none text-gray-700 leading-relaxed transition-colors
                                            ${message.length > 160 ? 'border-red-300 focus:ring-red-200 bg-red-50/10' : 'border-gray-200 focus:ring-ocean-500'}
                                        `}
                                        placeholder="Type your message here..."
                                    />
                                    {message && (
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(message)}
                                            className="absolute top-3 right-3 p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                            title="Copy Text"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <p className="text-gray-400">Standard SMS limit: 160 characters</p>
                                    <div className="flex items-center gap-2">
                                        {message.length > 160 && (
                                            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium">
                                                <AlertTriangle size={10} /> Multi-part
                                            </span>
                                        )}
                                        <span className={`font-medium ${message.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                                            {message.length} / 160
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-2 gap-3">
                                <button 
                                    onClick={() => setShowPreview(true)}
                                    disabled={!message.trim()}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <Eye size={18} /> Preview
                                </button>
                                <button 
                                    onClick={handleSendClick}
                                    disabled={!message.trim()}
                                    className={`text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95
                                        ${scheduledTime ? 'bg-purple-600 hover:bg-purple-700' : 'bg-ocean-600 hover:bg-ocean-700'}
                                    `}
                                >
                                    {scheduledTime ? <Clock size={18} /> : <Send size={18} />}
                                    {scheduledTime ? 'Schedule Broadcast' : 'Send Broadcast'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Clock size={18} className="text-gray-500" />
                                Recent Broadcasts
                            </h3>
                            <button className="text-ocean-600 hover:bg-ocean-50 p-1.5 rounded-lg transition-colors">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No messages sent yet.</p>
                                </div>
                            ) : (
                                history.map((log) => (
                                    <div key={log.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-ocean-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate max-w-[120px]">{log.recipient}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2 line-clamp-3 leading-relaxed">{log.message}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span>{log.date}</span>
                                            <button className="opacity-0 group-hover:opacity-100 hover:text-ocean-600 transition-opacity">
                                                Resend
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-auto flex flex-col items-center">
                         <button 
                            onClick={() => setShowPreview(false)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Smartphone size={20} /> Preview
                        </h3>

                        {/* Phone Frame */}
                        <div className="w-64 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-xl border-4 border-gray-800 ring-1 ring-gray-950/50 relative">
                            {/* Camera Notch Mockup */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10"></div>
                            
                            <div className="bg-white w-full h-full rounded-2xl overflow-hidden flex flex-col relative">
                                {/* Status Bar */}
                                <div className="bg-gray-100 h-8 flex justify-between items-end pb-1 px-4 text-[10px] text-gray-500">
                                    <span>12:00</span>
                                    <div className="flex gap-1">
                                        <span>5G</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                                {/* Message App Header */}
                                <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs border border-green-200">BMU</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">BMU Alert</p>
                                        <p className="text-[10px] text-gray-400 truncate w-32">To: {recipient}</p>
                                    </div>
                                </div>
                                {/* Message Body */}
                                <div className="flex-1 bg-white p-4 overflow-y-auto">
                                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm break-words">
                                        {message}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Just now</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowPreview(false)}
                            className="mt-6 text-gray-500 hover:text-gray-800 text-sm font-medium"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">
                                {scheduledTime ? 'Confirm Schedule' : 'Confirm Broadcast'}
                            </h3>
                            <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                                    <AlertTriangle className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        You are about to {scheduledTime ? 'schedule' : 'send'} this message to <strong className="text-gray-900">{recipient}</strong>.
                                    </p>
                                    {scheduledTime && (
                                        <p className="text-xs text-purple-600 mt-2 font-medium flex items-center gap-1">
                                            <Clock size={12} /> Sends on: {new Date(scheduledTime).toLocaleString()}
                                        </p>
                                    )}
                                    <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-32 overflow-y-auto">
                                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                        <p className="text-sm text-gray-800 italic break-words">"{message}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-blue-600 uppercase font-bold">Recipients</p>
                                    <p className="text-lg font-bold text-blue-900">~ 124</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-green-600 uppercase font-bold">Est. Cost</p>
                                    <p className="text-lg font-bold text-green-900">KES 124.00</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmSend}
                                    disabled={isSending}
                                    className={`flex-1 py-3 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all
                                        ${scheduledTime ? 'bg-purple-600 hover:bg-purple-700' : 'bg-ocean-600 hover:bg-ocean-700'}
                                    `}
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                    {isSending ? 'Processing...' : (scheduledTime ? 'Confirm Schedule' : 'Confirm Send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};