
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

const MEMBER_NAMES = [
    "Daniel Negreanu", "Phil Ivey", "Vanessa Selbst", "Tom Dwan", "Jennifer Tilly", 
    "Doyle Brunson", "Liv Boeree", "Erik Seidel", "Justin Bonomo", "Bryn Kenney",
    "Stephen Chidwick", "David Peters", "Dan Smith", "Jason Koon", "Fedor Holz",
    "Steve O'Dwyer", "Adrian Mateos", "Sam Greenwood", "Cary Katz", "Isaac Haxton",
    "Mikita Badziakouski", "Dan Colman", "Phil Hellmuth", "Antonio Esfandiari", "Joe Hachem",
    "Chris Moneymaker", "Scotty Nguyen", "Patrik Antonius", "Gus Hansen", "Mike Matusow",
    "Doug Polk", "Felipe Ramos", "Maria Ho", "Kristen Foxen", "Alex Foxen",
    "Shaun Deeb", "Chris Ferguson", "John Juanda", "Barry Greenstein", "Huck Seed",
    "Dan Harrington", "T.J. Cloutier", "Men Nguyen", "Tony G", "Viktor Blom",
    "Tom Marchese", "Brian Rast", "Nick Schulman", "Jeremy Ausmus", "Chance Kornuth"
];

const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateMembers = (): Member[] => {
    return MEMBER_NAMES.map((name, index) => {
        const id = `m${index + 1}`;
        const firstName = name.split(' ')[0];
        const tier = index < 3 ? MembershipTier.DIAMOND : 
                     index < 10 ? MembershipTier.PLATINUM : 
                     index < 25 ? MembershipTier.GOLD :
                     index < 40 ? MembershipTier.SILVER : MembershipTier.BRONZE;
        
        // Random ID Generation
        const randomIdNumber = `A${100000000 + Math.floor(Math.random() * 900000000)}`;
        // 40% chance to have a passport number
        const randomPassport = Math.random() > 0.6 
            ? `P${10000000 + Math.floor(Math.random() * 90000000)}` 
            : undefined;

        // Random join date between Jan 1, 2022 and Today
        const joinDate = getRandomDate(new Date(2022, 0, 1), new Date());

        return {
            id,
            fullName: name,
            nickname: index % 3 === 0 ? firstName : undefined,
            club_id: `RFC-${1000 + index + 1}`,
            email: `${firstName.toLowerCase()}.${index}@poker.com`,
            phone: `555-01${String(index).padStart(2, '0')}`,
            age: 21 + Math.floor(Math.random() * 50),
            birthDate: '1980-01-01',
            gender: Math.random() > 0.8 ? 'Female' : 'Male',
            joinDate: joinDate,
            tier,
            status: index > 45 ? 'Pending Approval' : 'Activated',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            idNumber: randomIdNumber,
            passportNumber: randomPassport,
            idPhotoFrontUrl: MOCK_ID_FRONT,
            idPhotoBackUrl: MOCK_ID_BACK
        };
    });
};

export const SEED_MEMBERS: Member[] = generateMembers();
