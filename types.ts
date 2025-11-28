export enum MemberStatus {
    PENDING = 'Pending',
    ACTIVE = 'Active',
    SUSPENDED = 'Suspended'
}

export enum Role {
    FISHERMAN = 'Fisherman',
    TRADER = 'Trader',
    OFFICER = 'BMU Officer',
    COMMITTEE = 'Committee Member'
}

export interface Member {
    id: string;
    name: string;
    role: Role;
    vesselId?: string;
    status: MemberStatus;
    phone: string;
    registrationDate: string;
}

export interface CatchRecord {
    id: string;
    date: string;
    fishermanName: string;
    vesselId: string;
    species: string;
    weightKg: number;
    value: number; // in local currency
    fee: number; // BMU fee
}

export interface Incident {
    id: string;
    date: string;
    type: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'Resolved';
    reportedBy: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
}