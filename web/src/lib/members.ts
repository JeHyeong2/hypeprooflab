export type MemberRole = 'admin' | 'author' | 'spectator';

export interface MemberInfo {
  email: string;
  displayName: string;
  role: MemberRole;
}

const KNOWN_MEMBERS: MemberInfo[] = [
  { email: 'jayleekr0125@gmail.com', displayName: 'Jay', role: 'admin' },
  { email: 'kiwonam96@gmail.com', displayName: 'Kiwon', role: 'author' },
  { email: 'tj456852@gmail.com', displayName: 'TJ', role: 'author' },
  { email: 'jkimak1124@gmail.com', displayName: 'Ryan', role: 'author' },
  { email: 'jysin0102@gmail.com', displayName: 'JY', role: 'author' },
  { email: 'xoqhdgh@gmail.com', displayName: 'BH', role: 'author' },
];

const memberMap = new Map(KNOWN_MEMBERS.map(m => [m.email.toLowerCase(), m]));

export function getMemberByEmail(email: string): MemberInfo | undefined {
  return memberMap.get(email.toLowerCase());
}

export function getRoleForEmail(email: string): MemberRole {
  return getMemberByEmail(email)?.role ?? 'spectator';
}

export function isKnownMember(email: string): boolean {
  return memberMap.has(email.toLowerCase());
}

export { KNOWN_MEMBERS };
