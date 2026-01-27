
import { AuditLog } from '../../types';

// Backup EN
const ACTIONS_EN = ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Approve', 'Reject'];
const TARGETS_EN = ['Tournament', 'Member', 'Table', 'System', 'Transaction'];
const USERS_EN = [{ name: 'Admin User', role: 'Admin' }, { name: 'John Dealer', role: 'Operator' }, { name: 'Sarah Manager', role: 'Manager' }];

// Active ZH
const ACTIONS = ['建立', '更新', '刪除', '登入', '登出', '匯出', '核准', '拒絕'];
const TARGETS = ['賽事', '會員', '牌桌', '系統', '交易'];
const USERS = [
    { name: '管理員', role: 'Admin' },
    { name: '王小美 (荷官)', role: 'Operator' },
    { name: '李大同 (經理)', role: 'Manager' }
];

const generateMockLogs = (count: number, actions: string[], targets: string[], users: any[]): AuditLog[] => {
    return Array.from({ length: count }, (_, i) => {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const target = targets[Math.floor(Math.random() * targets.length)];
        const date = new Date();
        date.setHours(date.getHours() - i); 
        
        return {
            id: `log-${i}`,
            timestamp: date.toISOString(),
            userName: user.name,
            userRole: user.role,
            action: action,
            targetType: target,
            targetName: `${target} ${Math.floor(Math.random() * 100)}`,
            details: `執行了 ${action} 操作於 ${target}`
        };
    });
};

export const SEED_AUDIT_LOGS_EN: AuditLog[] = generateMockLogs(50, ACTIONS_EN, TARGETS_EN, USERS_EN);
export const SEED_AUDIT_LOGS: AuditLog[] = generateMockLogs(50, ACTIONS, TARGETS, USERS);

// For now, this is static. In a real app, this would fetch from Supabase 'audit_logs' table.
export const getAuditLogs = (): AuditLog[] => {
    return SEED_AUDIT_LOGS;
};
