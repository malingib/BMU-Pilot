import React, { useState } from 'react';
import { FileText, ShieldAlert, Sparkles, Save, Copy, Loader2, MessageSquare, Send } from 'lucide-react';
import { Incident } from '../types';
import { draftMeetingMinutes, analyzeIncidents, draftBroadcastMessage } from '../services/geminiService';

interface GovernanceProps {
    incidents: Incident[];
}

export const Governance: React.FC<GovernanceProps> = ({ incidents }) => {
    // Meeting Minutes State
    const [notes, setNotes] = useState('');
    const [minutes, setMinutes] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    // Incident Analysis State
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // SMS Broadcast State
    const [smsTopic, setSmsTopic] = useState('');
    const [smsAudience, setSmsAudience] = useState('All Fishermen');
    const [smsDraft, setSmsDraft] = useState('');
    const [isDraftingSMS, setIsDraftingSMS] = useState(false);

    const handleDraftMinutes = async () => {
        if (!notes.trim()) return;
        setIsDrafting(true);
        const result = await draftMeetingMinutes(notes);
        setMinutes(result);
        setIsDrafting(false);
    };

    const handleAnalyzeIncidents = async () => {
        setIsAnalyzing(true);
        const result = await analyzeIncidents(incidents);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    const handleDraftSMS = async () => {
        if (!smsTopic.trim()) return;
        setIsDraftingSMS(true);
        const result = await draftBroadcastMessage(smsTopic, smsAudience);
        setSmsDraft(result);
        setIsDraftingSMS(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Admin & Communication */}
                <div className="space-y-6">
                    {/* Meeting Minutes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Meeting Minutes Assistant</h3>
                                <p className="text-sm text-gray-500">Draft formal minutes from rough notes using AI.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter rough notes here (e.g., Agenda: Budget approval, Decision: Patrols increased on weekends...)"
                                className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                            />
                            
                            <button
                                onClick={handleDraftMinutes}
                                disabled={isDrafting || !notes.trim()}
                                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-70"
                            >
                                {isDrafting ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                Draft Formal Minutes
                            </button>

                            {minutes && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Generated Draft</span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(minutes)}
                                            className="text-gray-400 hover:text-gray-600"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap text-sm h-64 overflow-y-auto">
                                        {minutes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SMS Broadcast Assistant */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                         <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Broadcast Alerts</h3>
                                <p className="text-sm text-gray-500">Draft urgent SMS notifications for members.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Alert Topic / Details</label>
                                <input 
                                    type="text"
                                    value={smsTopic}
                                    onChange={(e) => setSmsTopic(e.target.value)}
                                    placeholder="e.g. High tide warning for tomorrow morning"
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Target Audience</label>
                                <select 
                                    value={smsAudience}
                                    onChange={(e) => setSmsAudience(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option>All Fishermen</option>
                                    <option>Committee Members</option>
                                    <option>Boat Owners</option>
                                    <option>Defaulters</option>
                                </select>
                            </div>

                            <button
                                onClick={handleDraftSMS}
                                disabled={isDraftingSMS || !smsTopic.trim()}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-70"
                            >
                                {isDraftingSMS ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                Draft SMS (Max 160 chars)
                            </button>

                            {smsDraft && (
                                <div className="mt-4">
                                     <div className="relative">
                                        <textarea
                                            value={smsDraft}
                                            onChange={(e) => setSmsDraft(e.target.value)}
                                            className="w-full h-24 p-3 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono"
                                        />
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(smsDraft)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded"
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                     </div>
                                     <p className="text-xs text-gray-500 text-right mt-1">{smsDraft.length} / 160 chars</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Compliance & Incidents */}
                <div className="space-y-6">
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Safety & Incident Analysis</h3>
                                <p className="text-sm text-gray-500">AI-powered risk assessment and pattern detection.</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Recent Reports</h4>
                                {incidents.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No incidents reported.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {incidents.map(inc => (
                                            <div key={inc.id} className="bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-gray-800">{inc.type}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                        inc.severity === 'High' ? 'bg-red-100 text-red-800' : 
                                                        inc.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>{inc.severity}</span>
                                                </div>
                                                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{inc.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">{inc.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAnalyzeIncidents}
                                disabled={isAnalyzing || incidents.length === 0}
                                className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-70 mt-auto"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldAlert size={16} />}
                                Analyze Risks & Patterns
                            </button>

                            {analysis && (
                                <div className="flex-1 bg-red-50 rounded-lg p-4 border border-red-100 overflow-y-auto max-h-[400px]">
                                     <h4 className="text-xs font-semibold text-red-800 mb-2 uppercase flex items-center gap-1">
                                        <Sparkles size={12} /> AI Safety Report
                                     </h4>
                                     <div className="prose prose-sm max-w-none text-red-900 text-sm whitespace-pre-wrap">
                                        {analysis}
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};