
import { TeamMember, RoleDefinition } from '../../types';
import { SEED_ROLES } from '../mockData';
import { getLocalData, setLocalData, TEAM_KEY, ROLES_KEY } from './storage';

// --- Team ---
export const getTeamMembers = (): TeamMember[] => {
    const team = getLocalData<TeamMember[]>(TEAM_KEY);
    if (!team || team.length === 0) {
        return [{
            id: 'owner',
            fullName: 'Club Owner',
            email: 'owner@club.com',
            role: 'Owner',
            status: 'Active',
            avatarUrl: ''
        }];
    }
    return team;
};

export const saveTeamMember = (member: TeamMember): void => {
    const team = getTeamMembers();
    const idx = team.findIndex(t => t.id === member.id);
    if (idx >= 0) team[idx] = member;
    else team.push(member);
    setLocalData(TEAM_KEY, team);
};

export const deleteTeamMember = (id: string): void => {
    const team = getTeamMembers().filter(t => t.id !== id);
    setLocalData(TEAM_KEY, team);
};

// --- Roles ---
export const getRoleConfigs = (): RoleDefinition[] => {
    const roles = getLocalData<RoleDefinition[]>(ROLES_KEY);
    if (!roles || roles.length === 0) {
        setLocalData(ROLES_KEY, SEED_ROLES);
        return SEED_ROLES;
    }
    return roles;
};

export const saveRoleConfig = (role: RoleDefinition): void => {
    const roles = getRoleConfigs();
    const idx = roles.findIndex(r => r.id === role.id);
    if (idx >= 0) {
        roles[idx] = role;
    } else {
        roles.push(role);
    }
    setLocalData(ROLES_KEY, roles);
};

export const deleteRoleConfig = (id: string): void => {
    const roles = getRoleConfigs().filter(r => r.id !== id);
    setLocalData(ROLES_KEY, roles);
};
