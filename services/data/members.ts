
import { Member, TierDefinition, MemberStatus } from '../../types';
import { SEED_MEMBERS } from '../mockData';
import { supabase, isSupabaseAvailable } from '../supabaseClient';
import { getLocalData, setLocalData, MEMBERS_KEY, TIERS_KEY } from './storage';
import type { Database } from '../../supabaseSchema';
import { USE_MOCK_DATA } from '../../featureFlags';

// --- Helpers ---

// Map DB Enums (snake_case) to UI Status (Title Case)
const mapStatus = (dbStatus: string | null): MemberStatus => {
    switch (dbStatus) {
        case 'activated': return 'Activated';
        case 'pending_approval': return 'Pending Approval';
        case 'deactivated': return 'Deactivated';
        default: return 'Pending Approval';
    }
};

// Map DB Tier (lowercase) to UI Tier (Title Case)
const mapTier = (dbTier: string | null): string => {
    if (!dbTier) return '';
    return dbTier.charAt(0).toUpperCase() + dbTier.slice(1);
};

// --- Members ---

// Synchronous getter (Local Cache)
export const getMembers = (): Member[] => {
  const data = getLocalData<Member[]>(MEMBERS_KEY);
  if (!data || data.length === 0) {
      setLocalData(MEMBERS_KEY, SEED_MEMBERS);
      return SEED_MEMBERS;
  }
  return data;
};

// Asynchronous Fetch (Supabase Priority)
export const fetchMembers = async (): Promise<Member[]> => {
    if (!USE_MOCK_DATA && isSupabaseAvailable() && supabase) {
        try {
            console.log('Fetching members from Supabase...');
            
            // Query 'club_member' and join with the 'member' table to get profile details
            const { data, error } = await supabase
                .from('club_member')
                .select(`
                    *,
                    member:member_id (
                        id,
                        full_name,
                        email,
                        mobile_phone,
                        id_url,
                        id_number
                    )
                `);
            
            if (error) {
                console.error("Supabase Error:", error.message);
                return getMembers(); // Fallback to local
            }

            if (data && data.length > 0) {
                // Map DB columns to Member model
                const mappedMembers: Member[] = data.map((row: any) => {
                    const profile = row.member;
                    
                    return {
                        // Use string conversion for IDs as frontend uses strings
                        id: String(profile?.id || row.member_id),
                        fullName: profile?.full_name || 'Unknown',
                        nickname: row.nickname || '',
                        email: profile?.email || '',
                        phone: profile?.mobile_phone || '',
                        club_id: row.club_member_code || '',
                        
                        // Map Enums
                        status: mapStatus(row.member_status),
                        tier: mapTier(row.membership_level),
                        
                        // Dates
                        join_date: row.joined_date || row.created_at || new Date().toISOString(), // DB field
                        joinDate: row.joined_date || row.created_at || new Date().toISOString(), // UI field
                        
                        // Images
                        avatarUrl: row.avatar_url || '',
                        idPhotoFrontUrl: profile?.id_url || '',
                        
                        notes: row.notes || '',
                        
                        // Client-side defaults for fields not strictly in this join view
                        age: 21, // Calculate from date_of_birth if available
                        gender: 'Prefer not to say',
                        birthDate: '',
                        isIdVerified: row.kyc_status === 'verified',
                        idNumber: profile?.id_number || '',
                        passportNumber: '',
                        idPhotoBackUrl: ''
                    };
                });
                
                // Update local cache with fresh data
                setLocalData(MEMBERS_KEY, mappedMembers);
                return mappedMembers;
            }
        } catch (e) {
            console.error("Fetch Exception:", e);
        }
    } else {
        console.log("Supabase fetch skipped (Mock Data Mode or Supabase Unavailable)");
    }
    // Fallback to local storage if Supabase is not configured or fails
    return new Promise((resolve) => {
        resolve(getMembers());
    });
};

export const saveMember = async (member: Member): Promise<void> => {
  // 1. Optimistic Update (Local)
  const members = getMembers();
  const idx = members.findIndex(m => m.id === member.id);
  if (idx >= 0) members[idx] = member;
  else members.push(member);
  setLocalData(MEMBERS_KEY, members);
  
  // 2. Persist to Supabase
  if (!USE_MOCK_DATA && isSupabaseAvailable() && supabase) {
      try {
          // Note: Full upsert requires writing to 'member' then 'club_member'.
          // This simplified version attempts to update the 'member' identity table.
          // For a full implementation, you would need a stored procedure or multiple calls.
          
          // Attempt to map UI Member to DB row (Partial)
          const memberPayload = {
              full_name: member.fullName,
              email: member.email,
              mobile_phone: member.phone || null,
              notes: member.notes || null,
          };

          // We assume 'id' is a number in DB, but string in frontend. 
          // If ID is a UUID string from frontend (new member), this might fail against an Int8 column
          // unless the DB is set up to auto-increment and we omit ID on insert.
          
          const numericId = parseInt(member.id);
          
          if (!isNaN(numericId)) {
             await supabase.from('member').update(memberPayload).eq('id', numericId);
          } else {
             console.warn("Skipping Supabase write: ID is not numeric (likely a local-only new member).");
          }

      } catch (err) {
          console.error("Supabase Save Exception:", err);
      }
  }
};

// --- Membership Tiers ---
const DEFAULT_TIERS: TierDefinition[] = [
    { id: 'Diamond', name: '鑽石', color: '#22d3ee', order: 1, requirements: '10,000 積分', benefits: '私人包廂使用權\n免費餐飲\n優先候補' },
    { id: 'Platinum', name: '白銀', color: '#cbd5e1', order: 2, requirements: '5,000 積分', benefits: '免費飲料\n2倍積分累積' },
    { id: 'Gold', name: '金', color: '#eab308', order: 3, requirements: '1,000 積分', benefits: '1.5倍積分累積' },
    { id: 'Silver', name: '銀', color: '#9ca3af', order: 4, requirements: '500 積分', benefits: '標準積分累積' },
    { id: 'Bronze', name: '銅', color: '#c2410c', order: 5, requirements: '註冊即可', benefits: '基本會員權益' },
];

export const getTierDefinitions = (): TierDefinition[] => {
    const data = getLocalData<TierDefinition[]>(TIERS_KEY);
    if (!data || data.length === 0) {
        setLocalData(TIERS_KEY, DEFAULT_TIERS);
        return DEFAULT_TIERS;
    }
    // Ensure they are sorted
    return data.sort((a, b) => a.order - b.order);
};

export const saveTierDefinition = (tier: TierDefinition): void => {
    const tiers = getTierDefinitions();
    const idx = tiers.findIndex(t => t.id === tier.id);
    if (idx >= 0) tiers[idx] = tier;
    else tiers.push(tier);
    setLocalData(TIERS_KEY, tiers);
};

export const saveAllTierDefinitions = (tiers: TierDefinition[]): void => {
    setLocalData(TIERS_KEY, tiers);
};

export const deleteTierDefinition = (id: string): void => {
    const tiers = getTierDefinitions().filter(t => t.id !== id);
    setLocalData(TIERS_KEY, tiers);
};
