import { Client, Account, Databases, Storage, ID, Query, Teams } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export { ID, Query };
export default client;

// Collection IDs
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const COLLECTIONS = {
  TASKS: process.env.NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID || '',
  JOBS: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID || '',
  PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || '',
  HABITS: process.env.NEXT_PUBLIC_APPWRITE_HABITS_COLLECTION_ID || '',
  BUDGET: process.env.NEXT_PUBLIC_APPWRITE_BUDGET_COLLECTION_ID || '',
  CHAT: process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID || '',
};
