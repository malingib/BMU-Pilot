import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Anchor, 
    Smartphone, 
    Menu, 
    X,
    LogOut,
    FileText,
    MessageSquare
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { CatchLog } from './components/CatchLog';
import { USSDSimulator } from './components/USSDSimulator';
import { Governance } from './components/Governance';
import { BulkSMS } from './components/BulkSMS';
import { AIChat } from './components/AIChat';
import { Member, MemberStatus, Role, CatchRecord, Incident } from './types';

// Mock Data
const MOCK_MEMBERS: Member[] = [
    { id: '1', name: 'Juma Ali', role: Role.FISHERMAN, vesselId: 'MAZ-042', status: MemberStatus.ACTIVE, phone: '0712345678', registrationDate: '2024-01-15' },
    { id: '2', name: 'Sarah Achieng', role: Role.COMMITTEE, status: MemberStatus.ACTIVE, phone: '0722334455', registrationDate: '2024-01-10' },
    { id: '3', name: 'Peter Omondi', role: Role.FISHERMAN, vesselId: 'MAZ-055', status: MemberStatus.PENDING, phone: '0733445566', registrationDate: '2024-10-20' },
];

const MOCK_CATCHES: CatchRecord[] = [
    { id: '101', date: new Date().toISOString(), fishermanName: 'Juma Ali', vesselId: 'MAZ-042', species: 'Nile Perch', weightKg: 45.5, value: 15925, fee: 318.5 },
    { id: '102', date: new Date().toISOString(), fishermanName: 'Juma Ali', vesselId: 'MAZ-042', species: 'Tilapia', weightKg: 22.0, value: 5500, fee: 110 },
    { id: '103', date: new Date(Date.now() - 86400000).toISOString(), fishermanName: 'Moses K.', vesselId: 'MAZ-011', species: 'Omena', weightKg: 100, value: 10000, fee: 200 },
    { id: '104', date: new Date(Date.now() - 86400000).toISOString(), fishermanName: 'John D.', vesselId: 'MAZ-003', species: 'Nile Perch', weightKg: 30, value: 10500, fee: 210 },
];

const MOCK_INCIDENTS: Incident[] = [
    { id: '1', date: '2024-10-24', type: 'Gear Theft', description: 'Nets stolen from boat MAZ-042 at night.', severity: 'High', status: 'Open', reportedBy: 'Juma Ali' },
    { id: '2', date: '2024-10-25', type: 'Engine Failure', description: 'Engine stalled in rough waters, towed back.', severity: 'Medium', status: 'Resolved', reportedBy: 'Peter Omondi' },
];

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'catch' | 'ussd' | 'governance' | 'messages'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Global State
    const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
    const [catches, setCatches] = useState<CatchRecord[]>(MOCK_CATCHES);
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
    const [appContext, setAppContext] = useState('');

    useEffect(() => {
        // Generate a context summary for Gemini
        const totalWeight = catches.reduce((acc, c) => acc + c.weightKg, 0);
        const totalRevenue = catches.reduce((acc, c) => acc + c.fee, 0);
        const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;
        const openIncidents = incidents.filter(i => i.status === 'Open');
        
        const summary = JSON.stringify({
            stats: {
                activeMembers,
                totalCatchWeight: totalWeight,
                totalFeesCollected: totalRevenue,
                openIncidentsCount: openIncidents.length
            },
            recentCatches: catches.slice(0, 5).map(c => ({
                species: c.species,
                weight: c.weightKg,
                vessel: c.vesselId,
                date: c.date.split('T')[0]
            })),
            incidents: incidents.map(i => ({
                type: i.type,
                status: i.status,
                severity: i.severity,
                desc: i.description
            })),
            marketContext: "Nile Perch: ~350/kg, Tilapia: ~250/kg, Omena: ~100/kg"
        }, null, 2);

        setAppContext(summary);
    }, [members, catches, incidents]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button 
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === id 
                ? 'bg-ocean-100 text-ocean-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-ocean-700 font-bold text-xl">
                        <Anchor className="text-ocean-500" />
                        <span>BMU Pilot</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem id="members" icon={Users} label="Membership" />
                    <NavItem id="messages" icon={MessageSquare} label="Communication" />
                    <NavItem id="catch" icon={Anchor} label="Catch & Fees" />
                    <NavItem id="governance" icon={FileText} label="Governance" />
                    <NavItem id="ussd" icon={Smartphone} label="USSD Simulator" />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-ocean-600 text-white flex items-center justify-center font-bold text-sm">
                            JD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                            <p className="text-xs text-gray-500 truncate">Officer</p>
                        </div>
                        <LogOut size={16} className="text-gray-400 cursor-pointer hover:text-red-500" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header (Mobile Only) */}
                <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4">
                    <button onClick={toggleSidebar} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <h1 className="font-semibold text-gray-800 capitalize">{activeTab}</h1>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'dashboard' && (
                            <Dashboard membersCount={members.length} recentCatches={catches} />
                        )}
                        {activeTab === 'members' && (
                            <Members members={members} setMembers={setMembers} />
                        )}
                        {activeTab === 'messages' && (
                            <BulkSMS />
                        )}
                        {activeTab === 'catch' && (
                            <CatchLog catches={catches} setCatches={setCatches} />
                        )}
                        {activeTab === 'governance' && (
                            <Governance incidents={incidents} />
                        )}
                        {activeTab === 'ussd' && (
                            <USSDSimulator />
                        )}
                    </div>
                </div>
            </main>

            {/* Floating Chatbot */}
            <AIChat context={appContext} />
        </div>
    );
};

export default App;