import React, { useState } from 'react';
import { CatchRecord } from '../types';
import { Plus, Fish, DollarSign, Scale, QrCode } from 'lucide-react';

interface CatchLogProps {
    catches: CatchRecord[];
    setCatches: React.Dispatch<React.SetStateAction<CatchRecord[]>>;
}

export const CatchLog: React.FC<CatchLogProps> = ({ catches, setCatches }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fishermanName: '',
        vesselId: '',
        species: 'Nile Perch',
        weightKg: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const weight = parseFloat(formData.weightKg);
        // Simple mock calculation logic
        const pricePerKg = formData.species === 'Nile Perch' ? 350 : formData.species === 'Tilapia' ? 250 : 100;
        const value = weight * pricePerKg;
        const fee = value * 0.02; // 2% BMU fee

        const newCatch: CatchRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            fishermanName: formData.fishermanName,
            vesselId: formData.vesselId,
            species: formData.species,
            weightKg: weight,
            value: value,
            fee: fee
        };

        setCatches([newCatch, ...catches]);
        setShowForm(false);
        setFormData({ fishermanName: '', vesselId: '', species: 'Nile Perch', weightKg: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">Landing & Catch Log</h2>
                    <p className="text-gray-500 text-sm">Record daily catches and calculate BMU fees.</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Record Landing
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">New Landing Record</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Vessel ID</label>
                                     <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.vesselId}
                                            onChange={(e) => setFormData({...formData, vesselId: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
                                            placeholder="e.g. MAZ-042"
                                        />
                                        <button type="button" className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200" title="Scan QR">
                                            <QrCode size={20} />
                                        </button>
                                     </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fisherman Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.fishermanName}
                                    onChange={(e) => setFormData({...formData, fishermanName: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
                                    placeholder="Full Name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                    <select 
                                        value={formData.species}
                                        onChange={(e) => setFormData({...formData, species: e.target.value})}
                                        className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
                                    >
                                        <option>Nile Perch</option>
                                        <option>Tilapia</option>
                                        <option>Omena</option>
                                        <option>Catfish</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Kg)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        step="0.1"
                                        value={formData.weightKg}
                                        onChange={(e) => setFormData({...formData, weightKg: e.target.value})}
                                        className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 font-medium mt-2"
                            >
                                Save Record
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {catches.map((record) => (
                     <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Fish size={18} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{record.species}</h4>
                                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{record.vesselId}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-gray-50">
                            <div>
                                <p className="text-xs text-gray-400">Weight</p>
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                    <Scale size={12} /> {record.weightKg}kg
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Value</p>
                                <p className="font-semibold text-gray-800">{record.value.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Fee (2%)</p>
                                <p className="font-semibold text-green-600 flex items-center gap-1">
                                    <DollarSign size={12} /> {record.fee.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                             <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                {record.fishermanName.charAt(0)}
                             </div>
                             {record.fishermanName}
                        </div>
                     </div>
                 ))}
            </div>
        </div>
    );
};