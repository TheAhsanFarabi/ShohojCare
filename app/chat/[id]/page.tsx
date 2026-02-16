// app/chat/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, ArrowLeft, MessageCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & HELPER ---
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
  const [showInfo, setShowInfo] = useState(false); // Mobile info toggle
  const chatEndRef = useRef<HTMLDivElement>(null);

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
          setDoctor({ ...data, ...getThemeStyles(data.theme) });
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

      if (!response.ok) throw new Error('Failed to connect to doctor.');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantMessage += decoder.decode(value);
        }
        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!doctor) return <div className="p-10 text-center font-bold">Doctor not found.</div>;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white font-sans text-slate-900">
      
      {/* SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex flex-col w-80 p-6 border-r-2 border-slate-200 ${doctor.bg}`}>
        <button 
          onClick={() => router.push('/')}
          className="self-start mb-8 p-3 rounded-xl bg-white border-2 border-slate-200 border-b-4 hover:bg-slate-50 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="text-slate-400" size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-32 h-32 rounded-3xl ${doctor.color} ${doctor.shadow} shadow-[0_8px_0_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 overflow-hidden`}>
             <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-700">{doctor.name}</h2>
          <span className="px-3 py-1 rounded-full bg-white/50 text-slate-600 text-xs font-bold mt-2 border-2 border-slate-200/50 uppercase tracking-tighter">
            {doctor.specialty}
          </span>
          <div className="mt-8 w-full bg-white/60 p-4 rounded-2xl border-2 border-slate-100 text-left">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">About</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {doctor.notes}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-white">
        
        {/* Mobile Header - Optimized for Android */}
        <header className="md:hidden flex items-center justify-between p-3 border-b-2 border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center">
            <button onClick={() => router.push('/')} className="p-2 mr-1 text-slate-400 active:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className={`w-10 h-10 rounded-xl ${doctor.color} mr-3 overflow-hidden shadow-sm`}>
               <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-none">{doctor.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{doctor.specialty}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-slate-400 active:bg-slate-100 rounded-full"
          >
            <Info size={20} />
          </button>
        </header>

        {/* Mobile Info Dropdown */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-50 border-b-2 border-slate-200 overflow-hidden px-5 py-4"
            >
              <p className="text-xs text-slate-600 leading-snug">{doctor.notes}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES - Improved Padding for Mobile */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <MessageCircle size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-center">Start speaking in Bangla...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex gap-2.5 max-w-[90%] md:max-w-2xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
               <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl shrink-0 flex items-center justify-center border-b-2 md:border-b-4 overflow-hidden ${
                m.role === 'user' ? 'bg-slate-200 border-slate-300' : `${doctor.color} border-black/10`
              }`}>
                {m.role === 'user' ? (
                  <span className="font-black text-slate-500 text-[10px]">ME</span> 
                ) : (
                  <img src={doctor.image_url} alt="doc" className="w-full h-full object-cover" />
                )}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl border-2 border-b-4 text-[15px] md:text-base font-medium leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white border-slate-200 text-slate-700 rounded-tr-none'
                  : `${doctor.bg} border-${doctor.color?.replace('bg-', '') || 'teal'}-200 text-slate-800 rounded-tl-none`
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}

          {isSending && (
            <div className="flex gap-2.5 max-w-2xl">
              <div className={`w-8 h-8 rounded-lg shrink-0 border-b-2 ${doctor.color} border-black/10 overflow-hidden`}>
                <img src={doctor.image_url} alt="doc" className="w-full h-full object-cover" />
              </div>
              <div className={`px-4 py-3 rounded-2xl border-2 border-b-4 ${doctor.bg} border-${doctor.color?.replace('bg-', '') || 'teal'}-200 rounded-tl-none flex items-center gap-1`}>
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT AREA - Sticky Bottom & Safe Area aware */}
        <div className="p-3 md:p-6 border-t-2 border-slate-100 bg-white pb-[env(safe-area-inset-bottom,1rem)]">
          {/* Quick Questions - Better Mobile Scroll */}
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar -mx-1 px-1">
            {doctor.quick_questions?.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-50 border-2 border-slate-200 border-b-4 text-slate-500 text-[13px] font-bold active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
            className="flex gap-2"
          >
            <input
              className="flex-1 bg-slate-100 border-2 border-slate-200 border-b-4 rounded-2xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white text-slate-700 font-medium placeholder:text-slate-400 transition-all text-[16px]" // text-16px prevents iOS zoom, better for Android too
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending} 
              placeholder={isSending ? "Processing..." : "Describe symptoms..."}
            />
            <button 
              type="submit"
              disabled={isSending || !input.trim()}
              className="w-12 h-12 flex items-center justify-center shrink-0 rounded-2xl bg-teal-500 border-b-4 border-teal-700 text-white active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}