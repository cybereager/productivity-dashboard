'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    chatService.getHistory(user.$id)
      .then(setMessages)
      .catch(() => toast.error('Failed to load chat history'))
      .finally(() => setFetching(false));
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || loading) return;
    const content = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      $id: Date.now().toString(),
      userId: user.$id,
      role: 'user',
      content,
      $createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      await chatService.saveMessage({ userId: user.$id, role: 'user', content });

      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatService.sendMessage(history);

      const aiMsg = await chatService.saveMessage({ userId: user.$id, role: 'assistant', content: reply });
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await chatService.clearHistory(user.$id);
    setMessages([]);
    toast.success('Chat history cleared');
  };

  const suggestions = [
    'Help me prioritize my tasks for today',
    'How do I build better habits?',
    'Tips for a successful job interview',
    'How to manage my budget better?',
  ];

  return (
    <div className="flex flex-col h-full p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Sparkles className="w-7 h-7 text-blue-400" />AI Assistant</h1>
          <p className="text-slate-400 mt-1">Your personal productivity coach</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" />Clear history
          </Button>
        )}
      </div>

      <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fetching ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}><div className="h-12 w-48 bg-slate-800 rounded-xl animate-pulse" /></div>)}</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">How can I help you today?</h3>
                <p className="text-slate-400 text-sm mt-1">Ask me anything about productivity, tasks, or habits</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="text-left text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-colors border border-slate-700">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.$id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-300" />}
                </div>
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Bot className="w-4 h-4 text-slate-300" /></div>
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about productivity..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
