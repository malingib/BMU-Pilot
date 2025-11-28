import React, { useState } from 'react';
import { Users, Scale, AlertTriangle, TrendingUp, FileText, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyzeCatchData } from '../services/geminiService';
import { CatchRecord } from '../types';

interface DashboardProps {
    membersCount: number;
    recentCatches: CatchRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ membersCount, recentCatches }) => {
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock data aggregation
    const totalWeight = recentCatches.reduce((acc, curr) => acc + curr.weightKg, 0);
    const totalRevenue = recentCatches.reduce((acc, curr) => acc + curr.fee, 0);
    
    // Transform data for chart
    const chartData = recentCatches.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.name === curr.species);
        if (existing) {
            existing.weight += curr.weightKg;
        } else {
            acc.push({ name: curr.species, weight: curr.weightKg });
        }
        return acc;
    }, []);

    const generateDailyReport = async () => {
        setIsGenerating(true);
        const report = await analyzeCatchData(recentCatches);
        setAiReport(report);
        setIsGenerating(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Members</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{membersCount}</h3>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp size={12} /> +12% this month
                        </p>
                    </div>
                    <div className="p-3 bg-ocean-50 rounded-lg text-ocean-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Catch Volume (Today)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalWeight} kg</h3>
                        <p className="text-xs text-gray-500 mt-1">Across {recentCatches.length} landings</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <Scale size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">BMU Fees Collected</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">KES {totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-green-600 mt-1">On track</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <span className="font-bold text-xl">$</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Open Incidents</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">2</h3>
                        <p className="text-xs text-red-500 mt-1">Needs attention</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-6">Catch Composition by Species</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f0f9ff' }}
                                />
                                <Bar dataKey="weight" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Actions Area */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                            <Sparkles size={18} />
                        </div>
                        <h3 className="font-semibold text-gray-800">AI Intelligence</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6 flex-1">
                        Use Gemini to analyze today's catch data, identify trends, and draft your daily BMU report automatically.
                    </p>

                    <button 
                        onClick={generateDailyReport}
                        disabled={isGenerating}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-70"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FileText size={18} /> Generate Daily Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* AI Report Result */}
            {aiReport && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-600" />
                            Generated Insight
                        </h3>
                        <button onClick={() => setAiReport(null)} className="text-indigo-400 hover:text-indigo-600">
                            <span className="text-sm">Close</span>
                        </button>
                    </div>
                    <div className="prose prose-sm max-w-none text-indigo-800 whitespace-pre-line">
                        {aiReport}
                    </div>
                </div>
            )}
        </div>
    );
};