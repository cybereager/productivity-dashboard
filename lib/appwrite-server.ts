import { Client, Account, Databases, Users, ID } from 'node-appwrite';

// Server-side Appwrite client — uses API key, no CORS issues
function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  return {
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}

// Session client — uses session cookie from request
function createSessionClient(sessionToken: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setSession(sessionToken);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

export { createAdminClient, createSessionClient, ID };
