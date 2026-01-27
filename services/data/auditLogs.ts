
import { AuditLog } from '../../types';

// Mock Data
const ACTIONS = ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Approve', 'Reject'];
const TARGETS = ['Tournament', 'Member', 'Table', 'System', 'Transaction'];
const USERS = [
    { name: 'Admin User', role: 'Admin' },
    { name: 'John Dealer', role: 'Operator' },
    { name: 'Sarah Manager', role: 'Manager' }
];

const generateMockLogs = (count: number): AuditLog[] => {
    return Array.from({ length: count }, (_, i) => {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
        const date = new Date();
        date.setHours(date.getHours() - i); // Spread over hours
        
        return {
            id: `log-${i}`,
            timestamp: date.toISOString(),
            userName: user.name,
            userRole: user.role,
            action: action,
            targetType: target,
            targetName: `${target} ${Math.floor(Math.random() * 100)}`,
            details: `Performed ${action} operation on ${target}`
        };
    });
};

export const SEED_AUDIT_LOGS: AuditLog[] = generateMockLogs(50);

// For now, this is static. In a real app, this would fetch from Supabase 'audit_logs' table.
export const getAuditLogs = (): AuditLog[] => {
    return SEED_AUDIT_LOGS;
};
