'use client'
import { useRef, useState } from 'react';
import MessageBubble from '@/components/MessageBubble';
import { Bot, Send } from 'lucide-react';

const STAGES = [
  'Searching for resources...',
  'Getting resources...',
  'Analyzing current data...',
  'Generating final response...'
];

const shouldShowStages = (msg: string) => {
  const trivial = [
    'hi', 'hello', 'hey', 'sup',
    'who are you', 'generate image', 'draw me', 'create picture',
    'tell me a joke', 'sing', 'dance'
  ];
  return !trivial.some(p => msg.toLowerCase().includes(p));
};

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const showStages = shouldShowStages(userMsg);
    const stageCount = showStages ? STAGES.length : 0;

    if (showStages) {
      for (const stage of STAGES) {
        setMessages((prev) => [...prev, { role: 'assistant', content: stage }]);
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      fullMessage += decoder.decode(value);
      // Collapse consecutive newlines
      const compacted = fullMessage.replace(/\n{2,}/g, '\n');
      setMessages((prev) => [
        ...prev.slice(0, newMessages.length + stageCount),
        { role: 'assistant', content: compacted },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AskForge</h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} role={msg.role} content={msg.content} />
          ))}
          
          {loading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none rounded-xl"
                placeholder="Ask about research papers, stock analysis, and more..."
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AskForge can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
