
/**
 * Global Feature Flags
 * Toggle experimental or environment-specific features here.
 */

// Validate seat availability before assigning a player to a table.
// Set to false to allow overriding seats or double booking (useful for manual store ops).
export const ENABLE_SEAT_VALIDATION = false;

// Set this to true to force using local mock data (bypass Supabase)
// Useful for demos or when backend is WIP.
export const USE_MOCK_DATA = true;
