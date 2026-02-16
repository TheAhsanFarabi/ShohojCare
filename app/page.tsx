// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { Loader2, ArrowRight, Pill, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// --- TYPES ---
export interface Doctor {
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

// --- HELPER: Map DB Theme Strings to Tailwind Classes ---
export const getThemeStyles = (theme: string) => {
  const styles: Record<string, { color: string; shadow: string; bg: string }> = {
    rose: { color: 'bg-rose-500', shadow: 'shadow-rose-700', bg: 'bg-rose-50' },
    sky: { color: 'bg-sky-500', shadow: 'shadow-sky-700', bg: 'bg-sky-50' },
    teal: { color: 'bg-teal-500', shadow: 'shadow-teal-700', bg: 'bg-teal-50' },
    purple: { color: 'bg-purple-500', shadow: 'shadow-purple-700', bg: 'bg-purple-50' },
    indigo: { color: 'bg-indigo-500', shadow: 'shadow-indigo-700', bg: 'bg-indigo-50' },
    lime: { color: 'bg-lime-500', shadow: 'shadow-lime-700', bg: 'bg-lime-50' },
  };
  return styles[theme] || styles['teal']; // Fallback
};

// --- HELPER: Generate Specific Help Text Based on Specialty ---
const getHelpText = (specialty: string) => {
  switch (specialty) {
    case 'Cardiologist': return 'হৃদরোগ ও রক্তচাপ নিয়ে পরামর্শ দিতে পারি।';
    case 'Pediatrician': return 'শিশুর স্বাস্থ্য ও যত্ন নিয়ে সাহায্য করতে পারি।';
    case 'General Medicine': return 'জ্বর, সর্দি ও যেকোনো সাধারণ অসুখে পরামর্শ দিন।';
    case 'Dermatologist': return 'ত্বক, ব্রণ ও চুলের সমস্যায় সমাধান দিতে পারি।';
    case 'Neurologist': return 'মাথাব্যথা ও স্নায়ুর সমস্যায় সঠিক পরামর্শ দিব।';
    case 'Nutritionist': return 'সুস্থ থাকতে সঠিক ডায়েট চার্ট করে দিতে পারি।';
    default: return 'আপনার শারীরিক সুস্থতায় পরামর্শ দিতে প্রস্তুত।';
  }
};

export default function LandingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const { data, error } = await supabase.from('doctors').select('*');
        if (error) throw error;
        if (data) {
          const formatted = data.map((doc: any) => ({
            ...doc,
            ...getThemeStyles(doc.theme)
          }));
          setDoctors(formatted);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading ShohojCare...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b-2 border-slate-100 pb-16 pt-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-bold text-sm mb-6 border border-teal-100"
          >
            🚀 AI-Powered Healthcare Assistant
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight leading-tight"
          >
            Shohoj<span className="text-teal-500">Care</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-10"
          >
            Instant medical advice in Bangla. Choose a specialist below or check your health tools.
          </motion.p>

          {/* --- ACTION BUTTONS (Medicine & BMI) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-4"
          >
            {/* Medicine Button */}
            <Link href="/medicines">
               <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-100 text-teal-600 font-bold rounded-2xl hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm">
                 <Pill size={20} />
                 Medicine Info
               </button>
            </Link>

            {/* BMI Button */}
            <Link href="/tools/bmi">
               <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-100 text-teal-600 font-bold rounded-2xl hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm">
                 <Activity size={20} />
                 Check BMI
               </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- DOCTORS LIST --- */}
      <main className="max-w-6xl mx-auto p-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {doctors.map((doc) => (
            <Link key={doc.id} href={`/chat/${doc.id}`} className="block">
              <motion.div
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  idle: { scale: 1, y: 0 },
                  hover: { scale: 1.01, y: -4 },
                  tap: { scale: 0.99, y: 0 }
                }}
                className={`
                  relative group cursor-pointer
                  flex flex-row items-center text-left p-6 gap-6
                  bg-white rounded-3xl 
                  border-2 border-slate-200 border-b-[6px]
                  hover:border-teal-400 active:border-b-2 active:mt-1
                  transition-all duration-200 ease-out w-full
                `}
              >
                {/* FLOATING BANGLA MESSAGE (Static Text) */}
                <div className="absolute -top-14 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-20 pointer-events-none w-full max-w-sm">
                   <div className="bg-slate-800 text-white text-xs font-medium py-3 px-4 rounded-xl shadow-xl relative leading-relaxed">
                      
                      {/* Name Line */}
                      <div className="font-bold text-teal-300 mb-1">
                         👋 আসসালামু আলাইকুম, আমি {doc.name}
                      </div>
                      
                      {/* Help Text Line */}
                      <div className="opacity-90">
                         {getHelpText(doc.specialty)}
                      </div>

                      {/* Little Triangle Arrow */}
                      <div className="absolute -bottom-1 left-8 w-4 h-4 bg-slate-800 transform rotate-45"></div>
                   </div>
                </div>

                {/* BIG IMAGE LEFT */}
                <div className={`w-32 h-32 shrink-0 rounded-2xl ${doc.color} flex items-center justify-center shadow-inner overflow-hidden relative group-hover:shadow-lg transition-all`}>
                  <img 
                    src={doc.image_url} 
                    alt={doc.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                {/* RIGHT SIDE TEXT */}
                <div className="flex-1 flex flex-col items-start h-full justify-center min-w-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${doc.bg} text-slate-600`}>
                    {doc.specialty}
                  </span>
                  <h3 className="font-bold text-slate-700 text-xl mb-1 leading-tight truncate w-full">{doc.name}</h3>
                  <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4">
                    {doc.notes}
                  </p>
                  
                  <div className="mt-auto inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-100 font-bold text-slate-400 text-xs uppercase tracking-wider group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    Start Chat <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
