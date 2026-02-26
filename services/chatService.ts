import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { ChatMessage } from '@/types';

export const chatService = {
  async getHistory(userId: string): Promise<ChatMessage[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.CHAT, [
      Query.equal('userId', userId),
      Query.orderAsc('$createdAt'),
      Query.limit(100),
    ]);
    return res.documents as unknown as ChatMessage[];
  },

  async saveMessage(data: {
    userId: string;
    role: 'user' | 'assistant';
    content: string;
  }): Promise<ChatMessage> {
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.CHAT, ID.unique(), data);
    return doc as unknown as ChatMessage;
  },

  async clearHistory(userId: string): Promise<void> {
    const messages = await chatService.getHistory(userId);
    await Promise.all(messages.map((m) => databases.deleteDocument(DB_ID, COLLECTIONS.CHAT, m.$id)));
  },

  async sendMessage(messages: { role: string; content: string }[]): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error('Failed to get AI response');
    const data = await res.json();
    return data.message?.content || 'Sorry, I could not respond right now.';
  },
};
