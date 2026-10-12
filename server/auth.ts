import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { OFFICIAL_TEACHERS_LIST } from '../src/data/teachersData';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserAccount {
  id: string;
  username: string; // email for admin/teacher, student code for students (e.g. SPA-3A1-01)
  role: UserRole;
  displayName: string;
  className?: string; // For students
  grade?: number; // For students
  assignedClasses?: string[]; // For teachers
  passwordHash: string;
  salt: string;
  createdAt: number;
  avatar: string;
  isStudentCodeLogin?: boolean;
  phone?: string;
  stt?: number;
  position?: string;
  birthDate?: string;
  gender?: string;
  ethnicity?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: number;
}

// Password hashing using Node.js crypto PBKDF2 with unique salt
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
}

// Pre-seeded secure users: Admin, Teachers, and Students
const initialUsers: UserAccount[] = [];

export const ALL_35_CLASSES = [
  '1A1', '1A2', '1A3', '1A4', '1A5', '1A6', '1A7',
  '2A1', '2A2', '2A3', '2A4', '2A5', '2A6', '2A7',
  '3A1', '3A2', '3A3', '3A4', '3A5', '3A6', '3A7',
  '4A1', '4A2', '4A3', '4A4', '4A5', '4A6', '4A7',
  '5A1', '5A2', '5A3', '5A4', '5A5', '5A6', '5A7',
];

function bootstrapUsers() {
  // 1. Cán Bộ Quản Lý & Quản Trị Viên Duy Nhất: Thầy Bùi Xuân Thành (buithanhsapa / buithanhsapa)
  const bghCred = hashPassword('buithanhsapa');
  initialUsers.push({
    id: 'user-admin-buithanh',
    username: 'buithanhsapa',
    role: 'admin',
    displayName: 'Thầy Bùi Xuân Thành – Cán bộ quản lý & Quản trị viên',
    avatar: '👨‍💼',
    assignedClasses: ALL_35_CLASSES,
    passwordHash: bghCred.hash,
    salt: bghCred.salt,
    createdAt: Date.now(),
  });

  // Đăng ký đúng 35 giáo viên chính thức tương ứng 35 lớp học
  const defaultTeacherCred = hashPassword('GiaoVien@123');
  const defaultAdminCred = hashPassword('Admin@123');

  for (const t of OFFICIAL_TEACHERS_LIST) {
    if (t.email === 'buithanhsapa' || t.id === 'user-admin-buithanh') {
      const buithanhUser = initialUsers.find(u => u.id === 'user-admin-buithanh');
      if (buithanhUser) {
        buithanhUser.phone = t.phone;
        buithanhUser.stt = t.stt;
        buithanhUser.position = t.position;
        buithanhUser.birthDate = t.birthDate;
        buithanhUser.gender = t.gender;
        buithanhUser.ethnicity = t.ethnicity;
      }
      continue;
    }

    const cred = t.role === 'admin' ? defaultAdminCred : defaultTeacherCred;
    initialUsers.push({
      id: t.id,
      username: t.email,
      role: t.role,
      displayName: t.name,
      avatar: t.avatar || (t.role === 'admin' ? '👩‍💼' : '👩‍🏫'),
      assignedClasses: t.assignedClasses || [],
      phone: t.phone,
      stt: t.stt,
      position: t.position,
      birthDate: t.birthDate,
      gender: t.gender,
      ethnicity: t.ethnicity,
      passwordHash: cred.hash,
      salt: cred.salt,
      createdAt: Date.now(),
    });
  }

  // 3. Học sinh mẫu 1 (Student) - Bé Mầm Xanh
  const student1Cred = hashPassword('1234');
  initialUsers.push({
    id: 'user-student-mamxanh',
    username: 'SPA-3A1-01',
    role: 'student',
    displayName: 'Bé Mầm Xanh',
    className: '3A1',
    grade: 3,
    avatar: '🌱',
    isStudentCodeLogin: true,
    passwordHash: student1Cred.hash,
    salt: student1Cred.salt,
    createdAt: Date.now(),
  });

  // 4. Học sinh mẫu 2 (Student) - Sóc Nâu
  const student2Cred = hashPassword('2345');
  initialUsers.push({
    id: 'user-student-socnau',
    username: 'SPA-3A1-02',
    role: 'student',
    displayName: 'Sóc Nâu',
    className: '3A1',
    grade: 3,
    avatar: '🐿️',
    isStudentCodeLogin: true,
    passwordHash: student2Cred.hash,
    salt: student2Cred.salt,
    createdAt: Date.now(),
  });

  // 5. Học sinh mẫu 3 (Student) - Đại Bàng Sa Pa
  const student3Cred = hashPassword('5678');
  initialUsers.push({
    id: 'user-student-daibang',
    username: 'SPA-5A1-01',
    role: 'student',
    displayName: 'Đại Bàng Sa Pa',
    className: '5A1',
    grade: 5,
    avatar: '🦅',
    isStudentCodeLogin: true,
    passwordHash: student3Cred.hash,
    salt: student3Cred.salt,
    createdAt: Date.now(),
  });
}

bootstrapUsers();

// In-memory Auth Stores (ready for syncing to Firestore when provisioned)
export const usersStore: Map<string, UserAccount> = new Map(initialUsers.map(u => [u.id, u]));
export const sessionsStore: Map<string, AuthSession> = new Map();

export function resetUsersToAdminOnly() {
  usersStore.clear();
  sessionsStore.clear();
  bootstrapUsers();
  for (const u of initialUsers) {
    usersStore.set(u.id, u);
  }
  const adminUser = usersStore.get('user-admin-buithanh')!;
  return sanitizeUser(adminUser);
}

// Helper to sanitize user object for client response (stripping password hash & salt)
export function sanitizeUser(user: UserAccount) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

export function createSession(user: UserAccount): string {
  const token = 'sess_' + crypto.randomBytes(32).toString('hex');
  const session: AuthSession = {
    token,
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  sessionsStore.set(token, session);
  return token;
}

export function revokeSession(token: string) {
  sessionsStore.delete(token);
}

export function getSession(token: string): (AuthSession & { user: UserAccount }) | null {
  const session = sessionsStore.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessionsStore.delete(token);
    return null;
  }
  const user = usersStore.get(session.userId);
  if (!user) return null;
  return { ...session, user };
}

// Express Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
  sessionToken?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const sessionData = getSession(token);
  if (sessionData) {
    req.user = sessionData.user;
    req.sessionToken = token;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để truy cập tài nguyên này.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yêu cầu đăng nhập.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này.' });
    }
    next();
  };
}
