
import { Member, MembershipTier, RoleDefinition } from '../../types';

export const MOCK_ID_FRONT = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/ddccc3f2-2aa9-4e92-9578-41d035af66ea.jpg';
export const MOCK_ID_BACK = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/4f3bafb8-502b-400f-ab63-a819044e2621.jpg';

export const SEED_ROLES: RoleDefinition[] = [
    {
        id: 'role_admin',
        name: 'Admin',
        description: 'Full access to all system modules and configurations.',
        isSystem: true,
        permissions: {
            dashboard: 'edit',
            members: 'edit',
            tables: 'edit',
            tournaments: 'edit',
            structures: 'edit',
            clocks: 'edit',
            settings: 'edit'
        }
    },
    {
        id: 'role_operator',
        name: 'Operator',
        description: 'Can run tournaments and manage tables, but restricted from system settings.',
        isSystem: false,
        permissions: {
            dashboard: 'view',
            members: 'view', // Can see members but not edit profiles
            tables: 'edit', // Can open/close tables
            tournaments: 'edit', // Can run tournaments
            structures: 'view', // Can see but not change structures
            clocks: 'edit', // Can run clocks
            settings: 'no_access'
        }
    },
    {
        id: 'role_viewer',
        name: 'Viewer',
        description: 'Read-only access for staff to view live status.',
        isSystem: false,
        permissions: {
            dashboard: 'view',
            members: 'no_access',
            tables: 'view',
            tournaments: 'view',
            structures: 'view',
            clocks: 'view',
            settings: 'no_access'
        }
    }
];

export const SEED_MEMBERS: Member[] = [
  { id: 'm1', fullName: 'Daniel Negreanu', nickname: 'Kid Poker', club_id: 'RFC-1001', email: 'dnegs@gg.com', phone: '555-0101', age: 48, birthDate: '1975-07-26', gender: 'Male', joinDate: '2023-01-15', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Negreanu&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm2', fullName: 'Phil Ivey', nickname: 'The Tiger Woods of Poker', club_id: 'RFC-1002', email: 'ivey@poker.com', phone: '555-0102', age: 46, birthDate: '1977-02-01', gender: 'Male', joinDate: '2023-01-20', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Phil+Ivey&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm3', fullName: 'Vanessa Selbst', nickname: 'V. Selbst', club_id: 'RFC-1003', email: 'v.selbst@law.com', phone: '555-0103', age: 38, birthDate: '1984-07-09', gender: 'Female', joinDate: '2023-02-10', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Vanessa+Selbst&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm4', fullName: 'Tom Dwan', nickname: 'durrrr', club_id: 'RFC-1004', email: 'durrrr@online.com', phone: '555-0104', age: 36, birthDate: '1986-07-30', gender: 'Male', joinDate: '2023-03-05', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Tom+Dwan&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm5', fullName: 'Jennifer Tilly', nickname: 'The Unabombshell', club_id: 'RFC-1005', email: 'jtilly@hollywood.com', phone: '555-0105', age: 64, birthDate: '1958-09-16', gender: 'Female', joinDate: '2023-04-12', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Jennifer+Tilly&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm6', fullName: 'Doyle Brunson', nickname: 'Texas Dolly', club_id: 'RFC-0001', email: 'doyle@legend.com', phone: '555-0106', age: 89, birthDate: '1933-08-10', gender: 'Male', joinDate: '2022-12-01', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Doyle+Brunson&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm7', fullName: 'Liv Boeree', nickname: 'Iron Maiden', club_id: 'RFC-1007', email: 'liv@science.com', phone: '555-0107', age: 38, birthDate: '1984-07-18', gender: 'Female', joinDate: '2023-05-20', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Liv+Boeree&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
  { id: 'm8', fullName: 'Erik Seidel', nickname: 'Seiborg', club_id: 'RFC-1008', email: 'seiborg@quiet.com', phone: '555-0108', age: 63, birthDate: '1959-11-06', gender: 'Male', joinDate: '2023-01-05', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Erik+Seidel&background=random', idPhotoFrontUrl: MOCK_ID_FRONT, idPhotoBackUrl: MOCK_ID_BACK },
];
