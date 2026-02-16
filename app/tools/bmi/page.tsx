// app/tools/bmi/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Info, RefreshCw, Weight } from 'lucide-react';
import Link from 'next/link';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('bg-slate-100');
  const [textColor, setTextColor] = useState('text-slate-800');
  const [tip, setTip] = useState('');

  const calculateBMI = () => {
    if (!weight || !heightFeet) return;

    // Default inches to 0 if empty
    const inches = heightInches ? parseInt(heightInches) : 0;
    const totalInches = (parseInt(heightFeet) * 12) + inches;
    
    // Convert to meters
    const heightMeters = totalInches * 0.0254;
    
    // Calculate BMI
    const weightKg = parseFloat(weight);
    const bmiValue = weightKg / (heightMeters * heightMeters);
    const roundedBMI = parseFloat(bmiValue.toFixed(1));

    setBmi(roundedBMI);

    // Determine Status, Color, and Tips
    if (roundedBMI < 18.5) {
      setStatus('Underweight (ওজন কম)');
      setColor('bg-blue-50 border-blue-200');
      setTextColor('text-blue-600');
      setTip('আপনার পুষ্টিকর খাবার বেশি খাওয়া প্রয়োজন। চিকিৎসকের পরামর্শ নিন।');
    } else if (roundedBMI >= 18.5 && roundedBMI < 24.9) {
      setStatus('Normal Weight (সুস্থ ওজন)');
      setColor('bg-green-50 border-green-200');
      setTextColor('text-green-600');
      setTip('চমৎকার! আপনার ওজন ঠিক আছে। সুষম খাবার ও ব্যায়াম চালিয়ে যান।');
    } else if (roundedBMI >= 25 && roundedBMI < 29.9) {
      setStatus('Overweight (অতিরিক্ত ওজন)');
      setColor('bg-orange-50 border-orange-200');
      setTextColor('text-orange-600');
      setTip('মিষ্টি ও চর্বিযুক্ত খাবার কমিয়ে ব্যায়াম শুরু করুন।');
    } else {
      setStatus('Obese (স্থূলতা)');
      setColor('bg-red-50 border-red-200');
      setTextColor('text-red-600');
      setTip('আপনার স্বাস্থ্যের ঝুঁকি আছে। দ্রুত ডাক্তারের পরামর্শ নিন এবং ডায়েট কন্ট্রোল করুন।');
    }
  };

  const reset = () => {
    setBmi(null);
    setWeight('');
    setHeightFeet('');
    setHeightInches('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />

      {/* --- TOP LEFT HOME BUTTON --- */}
      <div className="absolute top-8 left-8 z-30">
        <Link href="/">
          <motion.div 
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-500 font-bold rounded-2xl border-2 border-slate-100 border-b-[4px] active:border-b-0 active:translate-y-1 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
            Home
          </motion.div>
        </Link>
      </div>

      <motion.div 
        layout
        className="bg-white p-8 rounded-[45px] shadow-2xl w-full max-w-md border-2 border-slate-100 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 text-white rounded-2xl mb-4 shadow-lg shadow-teal-100">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Body Mass Index</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">ShohojCare Tool</p>
        </div>

        <AnimatePresence mode="wait">
          {!bmi ? (
            <motion.div 
              key="inputs"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Weight Card */}
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 border-b-[6px] focus-within:border-teal-400 focus-within:bg-white transition-all">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-400 text-xs font-black uppercase tracking-widest">Weight (KG)</label>
                  <Weight size={18} className="text-slate-300" />
                </div>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="00"
                  className="w-full bg-transparent text-5xl font-black text-slate-800 focus:outline-none placeholder:text-slate-200"
                />
              </div>

              {/* Height Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 border-b-[6px] focus-within:border-teal-400 focus-within:bg-white transition-all">
                  <label className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2">Feet</label>
                  <input 
                    type="number" 
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="5"
                    className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none placeholder:text-slate-200"
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 border-b-[6px] focus-within:border-teal-400 focus-within:bg-white transition-all">
                  <label className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2">Inches</label>
                  <input 
                    type="number" 
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="8"
                    className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none placeholder:text-slate-200"
                  />
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={calculateBMI}
                disabled={!weight || !heightFeet}
                className="w-full bg-teal-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-100 border-b-[6px] border-teal-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 text-lg"
              >
                CALCULATE NOW
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* COLOR INDICATOR BAR */}
              <div className="relative w-full h-8 bg-slate-100 rounded-full mb-8 flex overflow-hidden border-2 border-slate-50">
                <div className="h-full bg-blue-400 w-[18.5%]" title="Underweight" />
                <div className="h-full bg-green-400 w-[6.5%]" title="Normal" />
                <div className="h-full bg-orange-400 w-[5%]" title="Overweight" />
                <div className="h-full bg-red-400 flex-1" title="Obese" />
                
                {/* Result Marker Sign */}
                <motion.div 
                  initial={{ left: "0%" }}
                  animate={{ left: `${Math.min(Math.max((bmi! / 40) * 100, 5), 95)}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                  className="absolute top-[-8px] -ml-3 text-2xl"
                >
                  📍
                </motion.div>
              </div>

              <div className="mb-8">
                <h2 className="text-7xl font-black text-slate-800 leading-none">{bmi}</h2>
                <span className="text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase block mt-2">BMI Score</span>
              </div>

              {/* Status Sign Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-8 rounded-[35px] border-2 border-b-[8px] mb-8 ${color}`}
              >
                <div className="text-4xl mb-2">
                  {bmi! < 18.5 ? '🥣' : bmi! < 25 ? '✅' : bmi! < 30 ? '⚠️' : '🚨'}
                </div>
                <h3 className={`text-2xl font-black mb-3 ${textColor}`}>{status}</h3>
                <div className="flex gap-4 items-center bg-white/50 p-4 rounded-2xl text-left border border-white/50">
                  <Info className={`shrink-0 w-6 h-6 ${textColor}`} />
                  <p className="text-sm font-bold text-slate-700 leading-snug">{tip}</p>
                </div>
              </motion.div>

              <button 
                onClick={reset}
                className="group flex items-center justify-center gap-3 w-full py-5 rounded-3xl font-black text-slate-400 hover:text-teal-500 transition-all border-2 border-transparent hover:border-teal-100"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
                CALCULATE AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}