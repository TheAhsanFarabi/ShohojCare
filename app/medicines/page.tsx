// app/medicines/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Pill, Thermometer, Activity, Zap, Frown } from 'lucide-react';
import Link from 'next/link';

// --- TYPES ---
interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  description: string;
  price: string;
  type: string;
  image_url: string;
  symptoms: string[];
}

// Symptom Options with Colors
const SYMPTOMS = [
  { label: 'জ্বর (Fever)', value: 'জ্বর', color: 'bg-rose-100 text-rose-600', icon: <Thermometer /> },
  { label: 'গ্যাস্ট্রিক (Gastric)', value: 'গ্যাস্ট্রিক', color: 'bg-orange-100 text-orange-600', icon: <Activity /> },
  { label: 'সর্দি/কাশি (Cold)', value: 'সর্দি', color: 'bg-sky-100 text-sky-600', icon: <Zap /> },
  { label: 'মাথা ব্যথা (Headache)', value: 'মাথা ব্যথা', color: 'bg-indigo-100 text-indigo-600', icon: <Frown /> },
  { label: 'ডায়রিয়া (Diarrhea)', value: 'ডায়রিয়া', color: 'bg-emerald-100 text-emerald-600', icon: <Pill /> },
  { label: 'পুড়ে যাওয়া (Burn)', value: 'পুড়ে যাওয়া', color: 'bg-red-100 text-red-600', icon: <Thermometer /> },
];

export default function MedicineWizard() {
  const [step, setStep] = useState<'welcome' | 'symptom' | 'loading' | 'results'>('welcome');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMeds, setFilteredMeds] = useState<Medicine[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch Data Once on Load
  useEffect(() => {
    async function fetchMeds() {
      try {
        setIsLoadingData(true);
        const { data, error } = await supabase
          .from('medicines')
          .select('*');
        
        if (error) {
          const errorMsg = `Supabase fetch error: ${error.message}`;
          console.error(errorMsg);
          setDataError(errorMsg);
          return;
        }

        if (data) {
          console.log('Medicines fetched successfully:', data);
          console.log('Total medicines:', data.length);
          setMedicines(data as Medicine[]);
          setDataError(null);
        } else {
          console.warn('No data returned from Supabase');
        }
      } catch (err) {
        const errorMsg = `An error occurred while fetching medicines: ${err instanceof Error ? err.message : String(err)}`;
        console.error(errorMsg);
        setDataError(errorMsg);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMeds();
  }, []);

  // Handle Symptom Selection
  const handleSelect = (symptom: string) => {
    setSelectedSymptom(symptom);
    setStep('loading');
    
    // Fake "Thinking" Delay for UX
    setTimeout(() => {
      const results = medicines.filter(m => {
        if (!m.symptoms) return false;
        
        // Handle if symptoms is a string (JSON), array, or other format
        let symptomsArray: string[] = [];
        if (typeof m.symptoms === 'string') {
          try {
            symptomsArray = JSON.parse(m.symptoms);
          } catch {
            symptomsArray = [m.symptoms];
          }
        } else if (Array.isArray(m.symptoms)) {
          symptomsArray = m.symptoms;
        }
        
        return symptomsArray.includes(symptom);
      });
      
      console.log(`Filtered results for "${symptom}":`, results.length);
      setFilteredMeds(results);
      setStep('results');
    }, 1500);
  };

  const reset = () => {
    setStep('welcome');
    setSelectedSymptom('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-hidden flex flex-col relative">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-50 rounded-full blur-3xl -z-10" />

      {/* --- BACK BUTTON (Always Visible) --- */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-teal-600 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Exit
        </Link>
      </div>

      {/* ERROR DISPLAY */}
      {dataError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-bold flex items-center gap-3"
        >
          <span>⚠️</span>
          <div>
            <p className="font-bold">Data Loading Error</p>
            <p className="text-sm text-red-600">{dataError}</p>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* LOADING MEDICINES DATA */}
          {isLoadingData && step === 'welcome' && (
            <motion.div
              key="data-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-700">Loading Medicines...</h3>
            </motion.div>
          )}

          {/* SCREEN 1: WELCOME */}
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-100"
              >
                <Pill size={40} />
              </motion.div>
              <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Shohoj<span className="text-teal-500">Meds</span></h1>
              <p className="text-slate-500 text-lg mb-10">
                I can help you find the right medicine.<br/>Just answer one simple question.
              </p>
              
              {dataError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-bold">
                  Failed to load medicines. Please refresh the page.
                </div>
              )}

              {medicines.length === 0 && !isLoadingData && !dataError && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 text-sm font-bold">
                  No medicines found in database. Please add medicines first.
                </div>
              )}

              <button 
                onClick={() => setStep('symptom')}
                disabled={isLoadingData || dataError !== null || medicines.length === 0}
                className={`px-8 py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center gap-3 mx-auto transition-all ${
                  isLoadingData || dataError !== null || medicines.length === 0
                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'
                }`}
              >
                Start Checkup <ArrowRight />
              </button>
            </motion.div>
          )}

          {/* SCREEN 2: SYMPTOM QUESTION */}
          {step === 'symptom' && (
            <motion.div 
              key="symptom"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-8">What is bothering you?</h2>
              <div className="grid grid-cols-2 gap-4">
                {SYMPTOMS.map((s) => (
                  <motion.button
                    key={s.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(s.value)}
                    className={`p-6 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-slate-200 shadow-sm hover:shadow-md transition-all ${s.color}`}
                  >
                    <div className="scale-125">{s.icon}</div>
                    <span className="font-bold text-sm md:text-base">{s.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: LOADING */}
          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-700">Analyzing Symptoms...</h3>
              <p className="text-slate-400">Finding the best match for "{selectedSymptom}"</p>
            </motion.div>
          )}

          {/* SCREEN 4: RESULTS */}
          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
                  <CheckCircle size={16} /> Found {filteredMeds.length} suggestions
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Recommended Medicines</h2>
              </div>

              <div className="space-y-4 mb-8 h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                {filteredMeds.length > 0 ? filteredMeds.map((med) => (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={med.id}
                    className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex gap-4 items-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-xl shrink-0 overflow-hidden">
                      <img src={med.image_url} alt={med.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-800">{med.name}</h3>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">{med.type}</span>
                      </div>
                      <p className="text-teal-600 text-xs font-semibold mb-1">{med.generic_name}</p>
                      <p className="text-slate-400 text-sm line-clamp-1">{med.description}</p>
                      <p className="text-slate-800 font-bold text-sm mt-2">{med.price}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center p-8 bg-slate-50 rounded-3xl">
                    <p className="text-slate-400 font-bold">No medicines found in database.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={reset}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
              >
                <RefreshCw size={20} /> Check Another Symptom
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}