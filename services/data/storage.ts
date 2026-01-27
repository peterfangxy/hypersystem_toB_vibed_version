
// Storage Keys
export const SETTINGS_KEY = 'rf_settings';
export const MEMBERS_KEY = 'rf_members';
export const TABLES_KEY = 'rf_tables';
export const STRUCTURES_KEY = 'rf_structures';
export const PAYOUTS_KEY = 'rf_payouts';
export const TOURNAMENTS_KEY = 'rf_tournaments';
export const TEMPLATES_KEY = 'rf_templates';
export const REGISTRATIONS_KEY = 'rf_registrations';
export const FINANCIALS_KEY = 'rf_financials';
export const TEAM_KEY = 'rf_team';
export const CLOCKS_KEY = 'rf_clocks';
export const ROLES_KEY = 'rf_roles';
export const TIERS_KEY = 'rf_tiers';
export const DEPOSITS_KEY = 'rf_deposits';
export const WITHDRAWALS_KEY = 'rf_withdrawals';

// Helpers
export function getLocalData<T>(key: string): T | null {
  const str = localStorage.getItem(key);
  return str ? JSON.parse(str) : null;
}

export function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}
