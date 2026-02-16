// app/chat/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, ArrowLeft, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// --- TYPES & HELPER (Reused) ---
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  language: string;
  tone: string;
  notes: string;
  image_url: string;
  theme: string;
  quick_questions: string[];
  color?: string;
  shadow?: string;
  bg?: string;
}

const getThemeStyles = (theme: string) => {
  const styles: Record<string, { color: string; shadow: string; bg: string }> = {
    rose: { color: 'bg-rose-500', shadow: 'shadow-rose-700', bg: 'bg-rose-50' },
    sky: { color: 'bg-sky-500', shadow: 'shadow-sky-700', bg: 'bg-sky-50' },
    teal: { color: 'bg-teal-500', shadow: 'shadow-teal-700', bg: 'bg-teal-50' },
    purple: { color: 'bg-purple-500', shadow: 'shadow-purple-700', bg: 'bg-purple-50' },
    indigo: { color: 'bg-indigo-500', shadow: 'shadow-indigo-700', bg: 'bg-indigo-50' },
    lime: { color: 'bg-lime-500', shadow: 'shadow-lime-700', bg: 'bg-lime-50' },
  };
  return styles[theme] || styles['teal'];
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DOCTOR DATA ---
  useEffect(() => {
    async function fetchDoctor() {
      if (!params.id) return;
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (data) {
          setDoctor({
            ...data,
            ...getThemeStyles(data.theme)
          });
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [params.id]);

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isSending || !doctor) return;

    setError(null);
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          doctorContext: doctor
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
        }

        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Auto-scroll
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages, isSending, error]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!doctor) return <div>Doctor not found.</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* SIDEBAR (Desktop) */}
      <div className={`hidden md:flex flex-col w-80 p-6 border-r-2 border-slate-200 ${doctor.bg}`}>
        <button 
          onClick={() => router.push('/')}
          className="self-start mb-8 p-3 rounded-xl bg-white border-2 border-slate-200 border-b-4 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="text-slate-400" size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-32 h-32 rounded-3xl ${doctor.color} ${doctor.shadow} shadow-[0_8px_0_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 overflow-hidden`}>
             <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-700">{doctor.name}</h2>
          <span className="px-3 py-1 rounded-full bg-white/50 text-slate-600 text-xs font-bold mt-2 border-2 border-slate-200/50">
            {doctor.specialty}
          </span>
          <div className="mt-8 w-full bg-white/60 p-4 rounded-2xl border-2 border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">About</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {doctor.notes}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-white">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-3 border-b-2 border-slate-100 bg-white">
          <button onClick={() => router.push('/')} className="mr-3 text-slate-400"><ArrowLeft size={20} /></button>
          <div className={`w-8 h-8 rounded-lg ${doctor.color} mr-2 overflow-hidden`}>
             <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">{doctor.name}</h3>
        </div>

        {/* MESSAGES */}
        <div id="chat-container" className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <MessageCircle size={48} className="mb-4 opacity-20 md:w-16 md:h-16" />
              <p className="font-bold text-base md:text-lg">Start speaking in Bangla...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex gap-2 md:gap-3 max-w-2xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
               {/* Avatar: Smaller on mobile (w-8 h-8) vs desktop (w-10 h-10) */}
               <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center border-b-4 overflow-hidden ${
                m.role === 'user' ? 'bg-slate-200 border-slate-300' : `${doctor.color} border-black/10`
              }`}>
                {m.role === 'user' ? (
                  <span className="font-bold text-slate-500 text-[10px] md:text-xs">ME</span> 
                ) : (
                  <img src={doctor.image_url} alt="doc" className="w-full h-full object-cover" />
                )}
              </div>
              
              {/* Message Bubble: Reduced padding on mobile (px-4 py-2) */}
              <div className={`px-4 py-2 md:px-5 md:py-3 rounded-2xl border-2 border-b-4 text-sm md:text-base font-medium leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white border-slate-200 text-slate-700 rounded-tr-none'
                  : `${doctor.bg} border-${doctor.color?.replace('bg-', '') || 'teal'}-200 text-slate-800 rounded-tl-none`
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}

          {/* Thinking Indicator */}
          {isSending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 md:gap-3 max-w-2xl">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0 border-b-4 ${doctor.color} border-black/10 overflow-hidden`}>
                <img src={doctor.image_url} alt="doc" className="w-full h-full object-cover" />
              </div>
              <div className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl border-2 border-b-4 ${doctor.bg} border-${doctor.color?.replace('bg-', '') || 'teal'}-200 rounded-tl-none flex items-center gap-1`}>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 mr-2">Thinking</span>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full" />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-md bg-red-50 border-2 border-red-200 rounded-xl p-3 md:p-4 flex flex-col items-center text-center space-y-2">
              <AlertCircle className="text-red-500 w-6 h-6 md:w-8 md:h-8" />
              <div className="text-red-500 font-bold text-sm">⚠️ Error</div>
              <p className="text-xs md:text-sm text-red-600">{error}</p>
              <button onClick={() => setMessages([])} className="mt-2 px-3 py-1.5 bg-white border-2 border-red-200 rounded-lg text-red-500 text-xs font-bold hover:bg-red-50">Retry</button>
            </motion.div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-3 md:p-6 border-t-2 border-slate-100 bg-white">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {doctor.quick_questions?.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                disabled={isSending}
                className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-slate-50 border-2 border-slate-200 border-b-4 text-slate-500 text-[10px] md:text-xs font-bold hover:bg-slate-100 hover:border-slate-300 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <input
              className="flex-1 bg-slate-100 border-2 border-slate-200 border-b-4 rounded-2xl px-4 py-2 md:px-5 md:py-3 text-sm md:text-base focus:outline-none focus:border-teal-400 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 transition-all disabled:opacity-70"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending} 
              placeholder={isSending ? "Please wait..." : "Type your symptoms..."}
            />
            <button 
              type="submit"
              disabled={isSending || !input.trim()}
              className="px-4 md:px-6 rounded-2xl bg-teal-500 border-b-4 border-teal-700 text-white font-bold hover:bg-teal-400 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:translate-y-0 transition-all flex items-center justify-center"
            >
              <Send size={18} className="md:w-5 md:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}