
import { Member, TierDefinition } from '../../types';
import { SEED_MEMBERS } from '../mockData';
import { supabase, isSupabaseAvailable } from '../supabaseClient';
import { getLocalData, setLocalData, MEMBERS_KEY, TIERS_KEY } from './storage';
import type { Database } from '../../types/supabase';

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
    if (isSupabaseAvailable() && supabase) {
        try {
            console.log('Fetching members from Supabase...');
            const { data, error } = await supabase.from('members').select('*');
            
            if (error) {
                console.error("Supabase Error:", error.message);
                return getMembers(); // Fallback
            }

            if (data && data.length > 0) {
                // Map DB columns to Member model
                const mappedMembers: Member[] = data.map((row: any) => ({
                    id: row.id,
                    fullName: row.full_name || row.fullName || 'Unknown',
                    nickname: '', // Not in default DB schema yet
                    email: row.email || '',
                    phone: row.phone || '',
                    club_id: row.club_id || '',
                    status: (row.status as any) || 'Pending Approval',
                    tier: row.tier || '',
                    joinDate: row.join_date || row.created_at || new Date().toISOString(),
                    avatarUrl: row.avatar_url || '',
                    notes: row.notes || '',
                    // Client-side defaults for fields not currently in DB
                    age: 21,
                    gender: 'Prefer not to say',
                    birthDate: '',
                    isIdVerified: false,
                    idNumber: '',
                    passportNumber: '',
                    idPhotoFrontUrl: '',
                    idPhotoBackUrl: ''
                }));
                
                // Update local cache with fresh data
                setLocalData(MEMBERS_KEY, mappedMembers);
                return mappedMembers;
            }
        } catch (e) {
            console.error("Fetch Exception:", e);
        }
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
  if (isSupabaseAvailable() && supabase) {
      try {
          const memberData: Database['public']['Tables']['members']['Insert'] = {
              id: member.id,
              full_name: member.fullName,
              email: member.email,
              phone: member.phone || null,
              club_id: member.club_id || null,
              status: member.status,
              tier: member.tier || null,
              join_date: member.joinDate || null,
              avatar_url: member.avatarUrl || null,
              notes: member.notes || null,
          };

          // Cast to any to avoid TypeScript overload mismatch with Supabase definitions
          const { error } = await supabase.from('members').upsert(memberData as any);

          if (error) {
              console.error("Supabase Save Error:", error.message);
          } else {
              console.log("Member saved to Supabase");
          }
      } catch (err) {
          console.error("Supabase Save Exception:", err);
      }
  }
};

// --- Membership Tiers ---
const DEFAULT_TIERS: TierDefinition[] = [
    { id: 'Diamond', name: 'Diamond', color: '#22d3ee', order: 1, requirements: '10,000 Points', benefits: 'Access to private room\nFree food & drinks\nPriority waitlist' },
    { id: 'Platinum', name: 'Platinum', color: '#cbd5e1', order: 2, requirements: '5,000 Points', benefits: 'Free drinks\n2x Points multiplier' },
    { id: 'Gold', name: 'Gold', color: '#eab308', order: 3, requirements: '1,000 Points', benefits: '1.5x Points multiplier' },
    { id: 'Silver', name: 'Silver', color: '#9ca3af', order: 4, requirements: '500 Points', benefits: 'Standard earning rate' },
    { id: 'Bronze', name: 'Bronze', color: '#c2410c', order: 5, requirements: 'Sign up', benefits: 'Basic membership' },
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
