import { account, ID } from './appwrite';
import { AppwriteUser } from '@/types';

export async function getCurrentUser(): Promise<AppwriteUser | null> {
  try {
    const user = await account.get();
    return user as unknown as AppwriteUser;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function register(name: string, email: string, password: string) {
  await account.create(ID.unique(), email, password, name);
  return login(email, password);
}

export async function logout() {
  return account.deleteSession('current');
}

export async function isAdmin(user: AppwriteUser | null): Promise<boolean> {
  return user?.labels?.includes('admin') ?? false;
}
