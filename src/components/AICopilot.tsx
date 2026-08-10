import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  Copy, 
  Check, 
  Building2, 
  ShieldAlert, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ChatMessage, Complaint } from '../types';

interface AICopilotProps {
  complaints: Complaint[];
}

const SAMPLE_PROMPTS = [
  'Summarize critical emergency complaints requiring urgent dispatch',
  'Analyze financial cost variance and estimated vs actual repair expenditure',
  'Which tickets are at risk of SLA breach across wards?',
  'Which field officer currently has the highest workload and open tickets?',
  'Draft an executive daily briefing report for the Mayor'
];

export const AICopilot: React.FC<AICopilotProps> = ({ complaints }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am **AI Smart Civic AI**, your intelligent municipal operational copilot. I am currently connected live to **${complaints.length} registered civic complaints** across all city wards.

How can I assist you today? You can ask me to:
- **Triage & summarize** urgent critical tickets
- **Analyze department workloads** and backlog statistics
- **Draft operational reports** for field officers or executive leadership`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to query AI copilot:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error connecting to the AI Assistant service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>AI Copilot Assistant</span>
            <span className="text-xs bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              Gemini 3.6 Flash
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ask natural language questions about active complaints, department workloads, and dispatch priorities.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto items-center space-x-2 px-3 py-1.5 text-xs text-slate-300">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">{complaints.length} Complaints Connected</span>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Suggested Operational Queries:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">{p}</span>
              <Send className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Canvas */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 h-[480px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Scrollable Message List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md ring-1 ring-white/10'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-200" />}
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 relative group ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] opacity-60">
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.text, m.id)}
                      className="hover:opacity-100 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-cyan-200 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>AI Smart Civic AI is analyzing live complaint metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about complaints, departments, priority dispatch..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </form>

      </div>

    </div>
  );
};
