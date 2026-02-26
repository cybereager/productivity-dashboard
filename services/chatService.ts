import { ChatMessage } from '@/types';

const api = (path: string) => `/api/db${path}`;

export const chatService = {
  async getHistory(userId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${api('/chat')}?userId=${userId}`);
    const data = await res.json();
    return (data.documents || []).sort((a: ChatMessage, b: ChatMessage) =>
      new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
    );
  },

  async saveMessage(data: { userId: string; role: 'user' | 'assistant'; content: string }): Promise<ChatMessage> {
    const res = await fetch(api('/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async clearHistory(userId: string): Promise<void> {
    const messages = await chatService.getHistory(userId);
    await Promise.all(messages.map((m) => fetch(api(`/chat/${m.$id}`), { method: 'DELETE' })));
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
