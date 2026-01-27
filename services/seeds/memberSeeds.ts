
import { Member, MembershipTier, RoleDefinition } from '../../types';

export const MOCK_ID_FRONT = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/ddccc3f2-2aa9-4e92-9578-41d035af66ea.jpg';
export const MOCK_ID_BACK = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/4f3bafb8-502b-400f-ab63-a819044e2621.jpg';

// --- BACKUP ENGLISH DATA ---
export const SEED_ROLES_EN: RoleDefinition[] = [
    {
        id: 'role_admin',
        name: 'Admin',
        description: 'Full access to all system modules and configurations.',
        isSystem: true,
        permissions: { dashboard: 'edit', members: 'edit', tables: 'edit', tournaments: 'edit', structures: 'edit', clocks: 'edit', settings: 'edit' }
    },
    {
        id: 'role_viewer',
        name: 'Viewer',
        description: 'Read-only access for staff to view live status.',
        isSystem: true,
        permissions: { dashboard: 'view', members: 'no_access', tables: 'view', tournaments: 'view', structures: 'view', clocks: 'view', settings: 'no_access' }
    }
];

export const MEMBER_NAMES_EN = [
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

// --- ACTIVE CHINESE DATA ---

export const SEED_ROLES: RoleDefinition[] = [
    {
        id: 'role_admin',
        name: '管理員',
        description: '擁有所有系統模組與設定的完整存取權限。',
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
        id: 'role_viewer',
        name: '檢視者',
        description: '僅供員工查看即時狀態的唯讀權限。',
        isSystem: true,
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
    "陳小明", "林志玲", "周杰倫", "蔡依林", "張惠妹",
    "五月天", "王力宏", "徐若瑄", "蕭敬騰", "田馥甄",
    "羅志祥", "楊丞琳", "吳宗憲", "小S", "蔡康永",
    "林俊傑", "鄧紫棋", "陳奕迅", "張學友", "劉德華",
    "郭富城", "黎明", "王菲", "謝霆鋒", "張柏芝",
    "古天樂", "梁朝偉", "劉嘉玲", "周潤發", "成龍",
    "李連杰", "甄子丹", "洪金寶", "吳京", "章子怡",
    "鞏俐", "范冰冰", "李冰冰", "趙薇", "周迅",
    "黃曉明", "Angelababy", "楊冪", "迪麗熱巴", "趙麗穎",
    "胡歌", "霍建華", "彭于晏", "阮經天", "許光漢"
];

const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateMembers = (names: string[]): Member[] => {
    return names.map((name, index) => {
        const id = `m${index + 1}`;
        const firstName = name.length > 2 ? name.substring(1) : name; // Simple logic for nickname
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
        
        // New logic: 90% active, 10% pending
        const isActive = index <= 45;
        const status = isActive ? 'Activated' : 'Pending Approval';

        return {
            id,
            fullName: name,
            nickname: index % 3 === 0 ? firstName : undefined,
            club_id: `RFC-${1000 + index + 1}`,
            email: `member.${index+1}@poker.com`,
            phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            age: 21 + Math.floor(Math.random() * 50),
            birthDate: '1980-01-01',
            gender: Math.random() > 0.8 ? 'Female' : 'Male',
            joinDate: joinDate,
            tier,
            status,
            isIdVerified: isActive, // Active members have verified IDs
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            idNumber: randomIdNumber,
            passportNumber: randomPassport,
            idPhotoFrontUrl: MOCK_ID_FRONT,
            idPhotoBackUrl: MOCK_ID_BACK
        };
    });
};

export const SEED_MEMBERS: Member[] = generateMembers(MEMBER_NAMES);
export const SEED_MEMBERS_EN: Member[] = generateMembers(MEMBER_NAMES_EN);
