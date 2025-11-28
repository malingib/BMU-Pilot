import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare } from 'lucide-react';

type UserRole = 'fisherman' | 'officer' | 'committee' | 'fisheries';

interface ScreenState {
    id: string;
    text: string;
    inputRequired?: boolean;
}

export const USSDSimulator: React.FC = () => {
    const [activeRole, setActiveRole] = useState<UserRole>('fisherman');
    const [screenStack, setScreenStack] = useState<ScreenState[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [notification, setNotification] = useState<string | null>(null);
    const [dialing, setDialing] = useState(false);

    // Initial Menu based on Role
    const getMainMenu = (role: UserRole): ScreenState => {
        switch (role) {
            case 'fisherman':
                return {
                    id: 'MAIN',
                    text: "COASTAL BMU SERVICE\n1. My Status & Permit\n2. Pay Fees\n3. Info Hub\n4. Weather Alerts",
                    inputRequired: true
                };
            case 'officer':
                return {
                    id: 'MAIN',
                    text: "OFFICER PORTAL\n1. Record Landing\n2. Vessel Inspection\n3. Report Incident\n4. Scan QR (Manual)",
                    inputRequired: true
                };
            case 'committee':
                return {
                    id: 'MAIN',
                    text: "COMMITTEE ADMIN\n1. Approve Members (1)\n2. Daily Financials\n3. Compliance Alerts",
                    inputRequired: true
                };
            case 'fisheries':
                return {
                    id: 'MAIN',
                    text: "MINISTRY FISHERIES DEPT\n1. Register New Member\n2. Register Vessel/Gear\n3. Compliance Audit",
                    inputRequired: true
                };
        }
    };

    // Reset simulator
    const reset = () => {
        setScreenStack([]);
        setInputValue('');
        setNotification(null);
        setDialing(true);
        setTimeout(() => {
            setDialing(false);
            setScreenStack([getMainMenu(activeRole)]);
        }, 800);
    };

    useEffect(() => {
        reset();
    }, [activeRole]);

    const handleInput = (val: string) => {
        if (!screenStack.length) return;
        
        const current = screenStack[screenStack.length - 1];
        let nextScreen: ScreenState | null = null;
        let smsTrigger: string | null = null;

        // Navigation Logic
        if (val === '0' && screenStack.length > 1) {
            setScreenStack(prev => prev.slice(0, -1));
            setInputValue('');
            return;
        }

        // --- FISHERMAN FLOWS ---
        if (activeRole === 'fisherman') {
            if (current.id === 'MAIN') {
                if (val === '1') nextScreen = { id: 'STATUS', text: "MEMBER STATUS\nName: Juma Ali\nBMU ID: BMU-001\nStatus: ACTIVE\nPermit: Valid (Exp 31/12)\n\n0. Back" };
                if (val === '2') nextScreen = { id: 'PAY', text: "SELECT PAYMENT\n1. Landing Fee\n2. Monthly Membership\n3. Facility/Ice Fee\n\n0. Back", inputRequired: true };
                if (val === '3') nextScreen = { id: 'INFO', text: "INFO HUB\n1. By-laws Summary\n2. Announcements\n\n0. Back", inputRequired: true };
                if (val === '4') {
                     nextScreen = { id: 'WEATHER', text: "WEATHER ALERT\nWind: 15kts SE\nTide: High @ 14:00\nAdvice: Small boats stay near shore.\n\n0. Back" };
                     smsTrigger = "BMU SAFETY: Strong SE winds predicted for afternoon. Small craft advisory in effect.";
                }
            }
            else if (current.id === 'PAY') {
                if (val === '1') nextScreen = { id: 'PAY_LANDING', text: "LANDING FEE\nEnter Amount (KES):", inputRequired: true };
                if (val === '2') nextScreen = { id: 'PAY_MEM', text: "MONTHLY DUE\nAmount: KES 200\n1. Confirm\n\n0. Back", inputRequired: true };
                if (val === '3') nextScreen = { id: 'PAY_FAC', text: "FACILITY FEE\nEnter Amount (KES):", inputRequired: true };
            }
            else if (['PAY_LANDING', 'PAY_FAC'].includes(current.id)) {
                 nextScreen = { id: 'PIN', text: `Pay KES ${val}?\nEnter M-PESA PIN:`, inputRequired: true };
            }
            else if (current.id === 'PAY_MEM' && val === '1') {
                 nextScreen = { id: 'PIN', text: "Pay KES 200?\nEnter M-PESA PIN:", inputRequired: true };
            }
            else if (current.id === 'PIN') {
                nextScreen = { id: 'SUCCESS', text: "PAYMENT SENT\nWait for SMS receipt.\n\n0. Home" };
                smsTrigger = "M-PESA Confirmed. KES 200.00 sent to COASTAL BMU. New Balance: KES 4,500. Receipt: QKD82828.";
            }
            else if (current.id === 'INFO') {
                if (val === '1') nextScreen = { id: 'BYLAWS', text: "BY-LAWS\n1. No seine nets <2inch\n2. Pay landing fee daily\n3. Report accidents immediately\n\n0. Back" };
                if (val === '2') nextScreen = { id: 'ANNOUNCE', text: "NEWS\nAGM Scheduled for 15th Nov at Community Hall. All members to attend.\n\n0. Back" };
            }
        }

        // --- OFFICER FLOWS ---
        if (activeRole === 'officer') {
            if (current.id === 'MAIN') {
                if (val === '1') nextScreen = { id: 'REC_VESSEL', text: "RECORD LANDING\nEnter Vessel ID:", inputRequired: true };
                if (val === '2') nextScreen = { id: 'INSPECT', text: "INSPECTION\nEnter Vessel ID:", inputRequired: true };
                if (val === '3') nextScreen = { id: 'INCIDENT', text: "REPORT INCIDENT\n1. Illegal Gear\n2. Accident\n3. Conflict\n\n0. Back", inputRequired: true };
                if (val === '4') nextScreen = { id: 'QR', text: "MANUAL QR ENTRY\nEnter Code below QR:", inputRequired: true };
            }
            // Landing Flow
            else if (current.id === 'REC_VESSEL') nextScreen = { id: 'REC_SPECIES', text: `Vessel ${val}\nSelect Species:\n1. Nile Perch\n2. Tilapia\n3. Omena`, inputRequired: true };
            else if (current.id === 'REC_SPECIES') nextScreen = { id: 'REC_WEIGHT', text: "Enter Weight (KG):", inputRequired: true };
            else if (current.id === 'REC_WEIGHT') {
                const fee = parseInt(val) * 5; // Mock calculation
                nextScreen = { id: 'REC_CONFIRM', text: `Weight: ${val}kg\nCalc Fee: KES ${fee}\n1. Confirm & Save\n2. Cancel`, inputRequired: true };
            }
            else if (current.id === 'REC_CONFIRM' && val === '1') {
                nextScreen = { id: 'DONE', text: "RECORD SAVED\nSMS sent to owner.\n\n0. Home" };
                smsTrigger = "BMU SYSTEM: Landing recorded. 45kg Nile Perch. Fee KES 225. billed to Account MAZ-042.";
            }
            // Inspection Flow
            else if (current.id === 'INSPECT') nextScreen = { id: 'INSPECT_CHECK', text: `Inspecting ${val}\n1. Pass (All Clear)\n2. Fail (Safety Gear)\n3. Fail (Permit Exp)`, inputRequired: true };
            else if (current.id === 'INSPECT_CHECK') {
                const res = val === '1' ? 'PASSED' : 'FAILED';
                nextScreen = { id: 'DONE', text: `INSPECTION RECORDED\nResult: ${res}\n\n0. Home` };
            }
            // Incident Flow
            else if (current.id === 'INCIDENT') nextScreen = { id: 'INC_DESC', text: "Describe briefly (or type code):\n1. Nets Stolen\n2. Engine Failure", inputRequired: true };
            else if (current.id === 'INC_DESC') {
                nextScreen = { id: 'DONE', text: "INCIDENT LOGGED\nAlert sent to Committee.\n\n0. Home" };
                smsTrigger = "ALERT: New Incident Reported. Type: Theft. Location: Landing Site A. Officer: John Doe.";
            }
            // QR Flow
            else if (current.id === 'QR') {
                nextScreen = { id: 'QR_RES', text: `QR DATA FOUND\nVessel: MAZ-055\nOwner: P. Omondi\nPermit: Valid\n\n0. Back` };
            }
        }

        // --- COMMITTEE FLOWS ---
        if (activeRole === 'committee') {
            if (current.id === 'MAIN') {
                if (val === '1') nextScreen = { id: 'APPROVE', text: "PENDING: Peter Omondi\nRole: Fisherman\nGear: Gillnet\n\n1. Approve\n2. Reject", inputRequired: true };
                if (val === '2') nextScreen = { id: 'SUMMARY', text: "DAILY SUMMARY\nDate: Today\nLandings: 14\nTotal Vol: 620kg\nFees: KES 4,500\n\n0. Back" };
                if (val === '3') nextScreen = { id: 'ALERTS', text: "ALERTS\n1. High Incident Rate (Theft)\n2. 3 Permits Expiring Soon\n\n0. Back" };
            }
            else if (current.id === 'APPROVE') {
                if (val === '1') {
                    nextScreen = { id: 'DONE', text: "APPROVED\nMember activated.\nWelcome SMS sent.\n\n0. Home" };
                    smsTrigger = "BMU ADMIN: Peter Omondi has been approved as a new member. Digital ID generated.";
                } else {
                    nextScreen = { id: 'DONE', text: "REJECTED\nApplication archived.\n\n0. Home" };
                }
            }
        }

        // --- FISHERIES OFFICER (GOVT) FLOWS ---
        if (activeRole === 'fisheries') {
            if (current.id === 'MAIN') {
                if (val === '1') nextScreen = { id: 'REG_MEM_ID', text: "NEW MEMBER REG\nEnter National ID:", inputRequired: true };
                if (val === '2') nextScreen = { id: 'REG_VESSEL_ID', text: "VESSEL REGISTRATION\nEnter Vessel ID (e.g. MAZ-001):", inputRequired: true };
                if (val === '3') nextScreen = { id: 'AUDIT_ID', text: "COMPLIANCE AUDIT\nEnter Vessel ID to check:", inputRequired: true };
            }
            // Register Member Flow
            else if (current.id === 'REG_MEM_ID') {
                 nextScreen = { id: 'REG_MEM_NAME', text: "Enter Full Name:", inputRequired: true };
            }
            else if (current.id === 'REG_MEM_NAME') {
                 nextScreen = { id: 'REG_MEM_ROLE', text: `Registering: ${val}\nSelect Role:\n1. Fisherman\n2. Trader\n3. Boat Owner`, inputRequired: true };
            }
            else if (current.id === 'REG_MEM_ROLE') {
                const roles = ['Fisherman', 'Trader', 'Boat Owner'];
                const role = roles[parseInt(val) - 1] || 'Fisherman';
                nextScreen = { id: 'REG_CONFIRM', text: `CONFIRM DETAILS\nID: 12345678\nRole: ${role}\n\n1. Submit\n2. Cancel`, inputRequired: true };
            }
            else if (current.id === 'REG_CONFIRM' && val === '1') {
                nextScreen = { id: 'DONE', text: "APPLICATION SUBMITTED\nPending BMU Committee Approval.\n\n0. Home" };
                smsTrigger = "GOVT FISHERIES: New member application submitted. Awaiting BMU Committee validation.";
            }
            
            // Register Vessel Flow
            else if (current.id === 'REG_VESSEL_ID') {
                nextScreen = { id: 'REG_VESSEL_GEAR', text: `Vessel: ${val}\nSelect Gear Type:\n1. Gillnet\n2. Longline\n3. Trap`, inputRequired: true };
            }
            else if (current.id === 'REG_VESSEL_GEAR') {
                nextScreen = { id: 'REG_VESSEL_OWNER', text: "Enter Owner National ID:", inputRequired: true };
            }
            else if (current.id === 'REG_VESSEL_OWNER') {
                nextScreen = { id: 'DONE', text: "VESSEL REGISTERED\nPermit Issued.\n\n0. Home" };
                smsTrigger = "LICENSING: Vessel registered successfully. Digital Permit #P-2024-889 issued.";
            }

            // Audit Flow
            else if (current.id === 'AUDIT_ID') {
                nextScreen = { id: 'AUDIT_CHECK', text: `Vessel: ${val}\nStatus: REGISTERED\nLast Insp: 2 weeks ago\n\n1. Log Compliant\n2. Flag Violation`, inputRequired: true };
            }
            else if (current.id === 'AUDIT_CHECK') {
                if (val === '1') {
                    nextScreen = { id: 'DONE', text: "AUDIT LOGGED\nStatus: OK\n\n0. Home" };
                    smsTrigger = "COMPLIANCE: Audit passed for Vessel. Next check due in 3 months.";
                } else {
                    nextScreen = { id: 'AUDIT_VIOLATION', text: "Select Violation:\n1. Illegal Gear\n2. No Permit\n3. Unsafe", inputRequired: true };
                }
            }
            else if (current.id === 'AUDIT_VIOLATION') {
                nextScreen = { id: 'DONE', text: "VIOLATION RECORDED\nFine issued.\n\n0. Home" };
                smsTrigger = "ENFORCEMENT: Violation recorded. Fine of KES 5,000 issued to owner.";
            }
        }

        if (nextScreen) {
            setScreenStack(prev => [...prev, nextScreen!]);
            setInputValue('');
        }
        
        if (smsTrigger) {
            setNotification(smsTrigger);
            // Auto-hide notification
            setTimeout(() => setNotification(null), 6000);
        }
    };

    const currentScreen = screenStack[screenStack.length - 1];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Smartphone size={20} className="text-gray-600" />
                        USSD & SMS Simulator
                    </h3>
                    <p className="text-sm text-gray-500">
                        Test the offline-first interface for Fishermen, Officers, and Committee.
                    </p>
                </div>
                
                {/* Role Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    {(['fisherman', 'officer', 'committee', 'fisheries'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setActiveRole(r)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-all ${
                                activeRole === r 
                                ? 'bg-white text-ocean-700 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {r === 'fisheries' ? 'Govt Officer' : r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center relative">
                {/* Device Frame */}
                <div className="relative w-72 h-[520px] bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-800 ring-1 ring-gray-950/50">
                    
                    {/* Screen Area */}
                    <div className="bg-black w-full h-full rounded-xl overflow-hidden relative flex flex-col">
                        
                        {/* Status Bar */}
                        <div className="bg-gray-800/50 h-6 flex justify-between items-center px-3 text-[10px] text-gray-300">
                            <span>Safaricom</span>
                            <div className="flex gap-1">
                                <span>4G</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* USSD Content */}
                        <div className="flex-1 p-4 font-mono text-sm text-green-500 leading-relaxed overflow-y-auto">
                            {dialing ? (
                                <div className="flex items-center justify-center h-full animate-pulse">
                                    Running USSD code...
                                </div>
                            ) : (
                                <>
                                    <div className="whitespace-pre-wrap mb-4">{currentScreen?.text}</div>
                                    {currentScreen?.inputRequired && (
                                        <div className="border-b border-green-500/50 flex items-center mt-auto">
                                            <span className="mr-1 text-green-600">{'>'}</span>
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="bg-transparent border-none outline-none text-green-400 w-full placeholder-green-900/30"
                                                placeholder=""
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleInput(inputValue);
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Soft Keys */}
                        <div className="h-12 border-t border-gray-800 flex text-gray-400 text-xs font-medium">
                            <button 
                                onClick={() => handleInput(inputValue)}
                                className="flex-1 hover:bg-gray-800 flex items-center justify-center border-r border-gray-800 active:bg-gray-700 transition-colors"
                            >
                                SEND
                            </button>
                            <button 
                                onClick={() => {
                                    setInputValue('');
                                    if (screenStack.length > 1) {
                                        setScreenStack(prev => prev.slice(0, -1));
                                    }
                                }}
                                className="flex-1 hover:bg-gray-800 flex items-center justify-center active:bg-gray-700 transition-colors"
                            >
                                CANCEL
                            </button>
                        </div>

                        {/* Simulated SMS Notification Overlay */}
                        {notification && (
                            <div className="absolute top-8 left-2 right-2 bg-gray-100 text-gray-900 p-3 rounded-lg shadow-lg animate-fade-in-down z-20 border-l-4 border-green-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare size={14} className="text-green-600" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Messages • Now</span>
                                </div>
                                <p className="text-xs leading-snug font-medium text-gray-800">{notification}</p>
                            </div>
                        )}
                    </div>

                    {/* Home Bar */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full"></div>
                </div>

                {/* Legend/Help */}
                <div className="hidden lg:block absolute -right-64 top-10 w-56 text-sm text-gray-500 space-y-4">
                    <h4 className="font-semibold text-gray-700">Simulator Guide:</h4>
                    <ul className="space-y-2 list-disc pl-4 text-xs">
                        <li>Select a <strong>Role</strong> top-left to switch personae.</li>
                        <li>Type numbers (e.g., '1') in the phone screen to navigate menus.</li>
                        <li><strong>Enter</strong> key or <strong>SEND</strong> button submits.</li>
                    </ul>
                    <div className="p-3 bg-ocean-50 text-ocean-700 rounded-lg text-xs border border-ocean-100">
                        <strong>Try this (Govt Officer):</strong>
                        <br/>Select 'Govt Officer' → '1. Register New Member' → Input details. Watch for the 'Validation' SMS.
                    </div>
                </div>
            </div>
        </div>
    );
};