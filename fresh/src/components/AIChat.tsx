import React, { useEffect, useRef, useState } from 'react';
import {
  getSessionKey,
  login as aiLogin,
  sendMessageToAI,
  clearSessionKey,
} from '../lib/freshAIService.js';

type Message = { from: 'user' | 'ai' | 'system'; text: string };

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionKey(getSessionKey());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoggingIn(true);
    try {
      const key = await aiLogin(username, password);
      setSessionKey(key);
      setMessages((m) => [
        ...m,
        { from: 'system', text: 'Logged in to FreshAI successfully.' },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);
    const userText = input.trim();
    setMessages((m) => [...m, { from: 'user', text: userText }]);
    setInput('');
    setSending(true);
    try {
      const response = await sendMessageToAI(userText);
      setMessages((m) => [...m, { from: 'ai', text: response }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      setMessages((m) => [
        ...m,
        { from: 'system', text: `Error: ${err?.message || 'unknown'}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    clearSessionKey();
    setSessionKey(null);
    setMessages([{ from: 'system', text: 'Logged out.' }]);
  };

  if (!sessionKey) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">FreshAI Login</h3>
        <form onSubmit={handleLogin} className="space-y-2">
          <input
            className="w-full p-2 border rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loggingIn}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-200 rounded"
              onClick={() => {
                // Try to use an existing session if present in localStorage
                const k = getSessionKey();
                if (k) setSessionKey(k);
              }}
            >
              Use existing session
            </button>
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto border rounded">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">FreshAI Chat</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-sm px-2 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="h-64 overflow-auto p-2 bg-gray-50 rounded mb-3">
        {messages.length === 0 && (
          <div className="text-gray-500">Start the conversation with FreshAI.</div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-2 max-w-[80%] p-2 rounded ${
              m.from === 'user' ? 'bg-blue-100 ml-auto text-right' : m.from === 'ai' ? 'bg-gray-100' : 'bg-yellow-100'
            }`}
          >
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!sending) handleSend();
            }
          }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>

      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
