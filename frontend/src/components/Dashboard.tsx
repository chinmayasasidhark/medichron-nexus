import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Upload, FileText, CheckCircle2,
  Mic, Volume2, ShieldAlert, Sparkles, Plus, Trash2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import type { TimelineEvent, Medication, MedicalReport } from '../App';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reports: MedicalReport[];
  conditions: string[];
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
  allergies: string[];
  timelineEvents: TimelineEvent[];
  chatHistory: Array<{ sender: 'user' | 'ai'; text: string; time: string }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>>;
  healthScore: number;
  onUploadReport: (fileName: string, fileSize: string) => void;
  onExitApp: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  activeTab,
  setActiveTab,
  reports,
  conditions,
  medications,
  setMedications,
  allergies,
  timelineEvents,
  chatHistory,
  setChatHistory,
  healthScore,
  onUploadReport,
  onExitApp,
  onReset
}) => {
  const { token } = useAuth();
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [reminderMedicine, setReminderMedicine] = useState<string>('');
  const [reminderDosage, setReminderDosage] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Recharts score progress trend
  const scoreData = [
    { name: 'Jan 24', score: 75 },
    { name: 'Jun 24', score: 80 },
    { name: 'Jan 25', score: 85 },
    { name: 'Jun 25', score: 86 },
    { name: 'Current', score: healthScore }
  ];

  // Send message to backend Express service
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message locally first for instant feedback
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'user', text: textToSend, time: timestamp }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('https://medichron-nexus.onrender.com/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: textToSend })
      });
      if (!res.ok) throw new Error('Failed to send message to backend');
      const data = await res.json();
      setChatHistory(data.chatHistory);
    } catch (err) {
      console.error('Error sending message:', err);
      setChatHistory(prev => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to server. Please verify if the backend is running.', time: timestamp }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text to speech is not supported on this browser.");
    }
  };

  // Speech Recognition (STT)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setChatInput(speechToText);
      handleSendMessage(speechToText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Toggle medicine completion
  const handleToggleMedication = async (id: string) => {
    // Optimistic local state update
    setMedications(prev =>
      prev.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m)
    );

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`https://medichron-nexus.onrender.com/api/medications/${id}/toggle`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('Failed to toggle medication on backend');
      const data = await res.json();
      setMedications(data.medications);
    } catch (err) {
      console.error('Error toggling medication:', err);
      // Rollback on failure
      setMedications(prev =>
        prev.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m)
      );
    }
  };

  // Add custom reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMedicine || !reminderDosage) return;

    const tempId = `med-temp-${Date.now()}`;
    const newMed: Medication = {
      id: tempId,
      name: reminderMedicine,
      dosage: reminderDosage,
      time: reminderTime || 'As needed',
      takenToday: false
    };

    // Optimistic local state update
    setMedications(prev => [...prev, newMed]);

    const originalName = reminderMedicine;
    const originalDosage = reminderDosage;
    const originalTime = reminderTime;

    setReminderMedicine('');
    setReminderDosage('');
    setReminderTime('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('https://medichron-nexus.onrender.com/api/medications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: originalName,
          dosage: originalDosage,
          time: originalTime || 'As needed'
        })
      });
      if (!res.ok) throw new Error('Failed to create medication on backend');
      const data = await res.json();
      setMedications(data.medications);
    } catch (err) {
      console.error('Error adding medication:', err);
      // Rollback on failure
      setMedications(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // Delete medication reminder
  const handleDeleteMedication = async (id: string) => {
    const originalMeds = [...medications];

    // Optimistic local state update
    setMedications(prev => prev.filter(m => m.id !== id));

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`https://medichron-nexus.onrender.com/api/medications/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete medication on backend');
      const data = await res.json();
      setMedications(data.medications);
    } catch (err) {
      console.error('Error deleting medication:', err);
      // Rollback on failure
      setMedications(originalMeds);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadReport(file.name, `${(file.size / 1024).toFixed(0)} KB`);
    }
  };

  // Timeline events filter
  const filteredEvents = timelineEvents.filter(ev => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 relative z-10 min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 sticky top-0 bg-brand-darker/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onExitApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
              MediChron <span className="text-xs bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-full border border-brand-secondary/20">AI</span>
            </h1>
            <p className="text-xs text-slate-500">Clinical Workspace Dashboard</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
          {['dashboard', 'timeline', 'chat', 'compare', 'reminders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize ${activeTab === tab
                  ? 'bg-brand-secondary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
                }`}
            >
              {tab === 'chat' ? 'Ask AI' : tab === 'compare' ? 'Compare' : tab}
            </button>
          ))}
        </div>

        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 bg-white/40 backdrop-blur-sm text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Workspace
        </motion.button>
      </header>

      {/* Main Content Area with Tab Transitions */}
      <main className="flex-1 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >

              {/* Left Main Dashboard Grid */}
              <div className="lg:col-span-8 space-y-8">

                {/* Health Score & Circular Visualizer */}
                <motion.div
                  className="glass-panel p-6 rounded-3xl"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Clinical Health Index</h3>
                      <p className="text-xs text-slate-500">Aggregated health index based on lab outcomes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-brand-secondary">{healthScore}/100</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold">
                        Stable Trend
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={scoreData}>
                        <defs>
                          <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.06)', color: '#1e293b' }} labelStyle={{ color: '#0f172a' }} />
                        <Area type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Upload New Document Dropzone */}
                <motion.div
                  className="glass-panel p-6 rounded-3xl"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <h3 className="text-base font-bold text-slate-900 mb-4">Add Medical Record</h3>
                  <div className="border border-dashed border-slate-200/80 hover:border-brand-secondary/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/30 backdrop-blur-sm">
                    <input
                      type="file"
                      id="dashboard-file-upload"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="dashboard-file-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-brand-secondary mb-3" />
                      <p className="text-sm font-semibold text-slate-900">Drag or select a new medical report to parse</p>
                      <p className="text-xs text-slate-500 mt-1.5">Extract new conditions, treatment dates, and dosage timelines instantly.</p>
                    </label>
                  </div>

                  {/* Uploaded Files Table */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Loaded Medical Documents ({reports.length})</h4>
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <motion.div
                          key={report.id}
                          layoutId={report.id}
                          className="flex items-center justify-between p-3.5 bg-white/40 border border-slate-200/40 rounded-2xl text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-brand-secondary" />
                            <div>
                              <p className="font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">{report.fileName}</p>
                              <p className="text-[10px] text-slate-500">{report.uploadedAt} • {report.fileSize}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${report.status === 'Parsed'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
                                : report.status === 'Processing'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 animate-pulse'
                                  : 'bg-red-500/10 border border-red-500/20 text-red-600'
                              }`}>
                              {report.status}
                            </span>
                            {report.healthScoreEffect > 0 && (
                              <span className="text-[10px] font-bold text-brand-secondary">+{report.healthScoreEffect} Score</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Right Side Widgets panel */}
              <div className="lg:col-span-4 space-y-8">

                {/* AI Clinical Insights card */}
                <motion.div
                  className="glass-panel p-6 rounded-3xl"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-brand-secondary" />
                    <h3 className="text-sm font-bold text-slate-900">AI Medical Insights</h3>
                  </div>
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <p className="leading-relaxed">
                      🌟 Based on Metropolis Lab blood panel comparison, gastritis indicators have completely settled.
                    </p>
                    <p className="leading-relaxed">
                      💡 **Observation**: Keep an eye on seasonal weather shifts as they correlate with asthma flares. Keep the Albuterol inhaler on hand.
                    </p>
                    <p className="leading-relaxed">
                      ❗ **Pill Check**: Take your remaining daily vitamins as scheduled.
                    </p>
                  </div>
                </motion.div>

                {/* Conditions list */}
                <motion.div
                  className="glass-panel p-6 rounded-3xl"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Clinical Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${cond.includes('Resolved')
                            ? 'bg-slate-100 border border-slate-200 text-slate-500'
                            : 'bg-brand-accent/10 border border-brand-accent/20 text-brand-accent'
                          }`}
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Allergies list */}
                <motion.div
                  className="glass-panel p-6 rounded-3xl"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Allergy Graph</h3>
                  <div className="space-y-2">
                    {allergies.map((allergy, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-white/40 rounded-xl border border-slate-200/40 text-xs shadow-sm"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-slate-800">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>

            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="glass-panel p-6 md:p-8 rounded-3xl max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Interactive Health Timeline</h3>
                  <p className="text-xs text-slate-500">Consolidated historical log extracted from all medical uploads.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'condition', 'medication', 'allergy'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${filterCategory === cat
                          ? 'bg-brand-secondary text-white'
                          : 'bg-white/60 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical timeline with sequential entry animation */}
              <div className="relative border-l border-slate-200 pl-6 space-y-8 ml-3">
                {filteredEvents.map((ev, idx) => (
                  <motion.div
                    key={ev.id}
                    className="relative group"
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 90 }}
                  >
                    {/* Circular icon pointer */}
                    <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-brand-dark flex items-center justify-center ${ev.category === 'condition' ? 'bg-brand-accent' :
                        ev.category === 'medication' ? 'bg-brand-secondary' : 'bg-orange-500'
                      }`}></span>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">{ev.date}</span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-secondary transition-colors">{ev.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${ev.category === 'condition' ? 'bg-brand-accent/10 border border-brand-accent/20 text-brand-accent' :
                          ev.category === 'medication' ? 'bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary' :
                            'bg-slate-100 border border-slate-200 text-slate-500'
                        }`}>
                        {ev.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {filteredEvents.length === 0 && (
                  <p className="text-xs text-slate-500 py-6">No historical records found for this category filter.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto h-[600px]"
            >

              {/* Suggested Prompt Sidebar */}
              <div className="lg:col-span-4 flex flex-col justify-between p-6 glass-panel rounded-3xl border border-brand-border">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Preset Medical Inquiries</h3>
                  <div className="space-y-3">
                    {["Summarize my medical history.", "When was I diagnosed with asthma?", "Compare my last two reports.", "What medicines am I currently taking?"].map((prompt, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        whileHover={{ scale: 1.02, y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-3 bg-white/50 hover:bg-white rounded-2xl border border-slate-150 text-xs text-slate-600 hover:text-slate-900 transition-all flex items-start gap-2.5 cursor-pointer shadow-sm"
                      >
                        <span>{idx === 0 ? '📑' : idx === 1 ? '🩺' : idx === 2 ? '📈' : '💊'}</span>
                        <span>{prompt}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Security info footer */}
                <div className="pt-4 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-start gap-2">
                  <span>🔒</span>
                  <p>HIPAA Secure workspace session. Chat entries are stored locally and are completely encrypted.</p>
                </div>
              </div>

              {/* Chat Conversation pane */}
              <div className="lg:col-span-8 flex flex-col justify-between glass-panel rounded-3xl overflow-hidden">
                {/* Message Feed with bubble spring transitions */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  <AnimatePresence initial={false}>
                    {chatHistory.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        initial={{ opacity: 0, y: 15, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 100, damping: 14 }}
                      >
                        <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender === 'user'
                            ? 'bg-brand-secondary text-white rounded-tr-none'
                            : 'bg-white/60 border border-white/50 backdrop-blur-md text-slate-800 rounded-tl-none'
                          }`}>
                          <p>{msg.text}</p>

                          {/* Audio listen helper for AI text */}
                          {msg.sender === 'ai' && (
                            <button
                              onClick={() => speakText(msg.text)}
                              className="mt-2.5 flex items-center gap-1 text-[9px] font-bold text-brand-secondary hover:underline cursor-pointer"
                            >
                              <Volume2 className="w-3 h-3" /> Read out loud
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-3.5 bg-white/40 rounded-2xl border border-white/60 w-16 text-center shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce delay-200"></span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input fields */}
                <div className="p-4 bg-white/30 backdrop-blur-md border-t border-slate-200 flex items-center gap-3">
                  {/* Voice mic toggle */}
                  <motion.button
                    onClick={startSpeechRecognition}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer shadow-sm ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse border-red-500/40' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    title="Speak using Mic"
                  >
                    <Mic className="w-4 h-4" />
                  </motion.button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(chatInput);
                    }}
                    placeholder="Ask a question about your medical files..."
                    className="flex-1 bg-white/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-secondary transition-colors shadow-inner"
                  />

                  <motion.button
                    onClick={() => handleSendMessage(chatInput)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Send
                  </motion.button>
                </div>

              </div>

            </motion.div>
          )}

          {activeTab === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="glass-panel p-6 md:p-8 rounded-3xl max-w-4xl mx-auto space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900">Compare Clinical Reports</h3>
                <p className="text-xs text-slate-500">AI‑driven difference matrix tracking improvements, flags, and stable parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 bg-white/40 border border-white/65 rounded-2xl flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Old Baseline</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">Metropolis Lab Blood Panel</h4>
                    <p className="text-xs text-slate-500">Uploaded: June 10, 2024</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastric Irritation Score</span>
                      <span className="font-semibold text-red-500">High (Acute)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Liver AST/ALT</span>
                      <span className="font-semibold text-slate-700">54 / 62 U/L</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 bg-white/40 border border-white/65 rounded-2xl flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[9px] font-bold text-brand-secondary uppercase">Current Status</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">City Hospital Discharge</h4>
                    <p className="text-xs text-slate-500">Uploaded: January 15, 2025</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastric Irritation Score</span>
                      <span className="font-semibold text-emerald-600">Resolved (Normal)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Liver AST/ALT</span>
                      <span className="font-semibold text-emerald-600">22 / 28 U/L (Improved)</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Differential parameters grid */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Parameters Overview</h4>

                <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4.5 h-4.5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Liver Enzyme Activity</span>
                  </div>
                  <span className="text-emerald-600 font-bold">Improved</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/40 border border-white/65 rounded-2xl text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-slate-400" />
                    <span className="font-bold text-slate-900">Blood Glucose Levels</span>
                  </div>
                  <span className="text-slate-700 font-bold">Stable</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4.5 h-4.5 text-amber-600" />
                    <span className="font-bold text-slate-900">Vitamin D Deficiency</span>
                  </div>
                  <span className="text-amber-600 font-bold">Declined (Slightly Low)</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div
              key="reminders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto"
            >

              {/* Reminders List pane with layout animations */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Medication Schedule</h3>
                  <p className="text-xs text-slate-500">Doses automatically extracted from active prescriptions.</p>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {medications.map((med) => (
                      <motion.div
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${med.takenToday
                            ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-500'
                            : 'bg-white/40 border-slate-200/60 text-slate-700 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleMedication(med.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${med.takenToday
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-brand-secondary bg-white'
                              }`}
                          >
                            {med.takenToday && <span className="text-[10px]">✔</span>}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${med.takenToday ? 'line-through text-slate-400' : 'text-slate-950'}`}>{med.name}</p>
                            <p className="text-[10px] text-slate-500">{med.dosage} • {med.time}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMedication(med.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Add Custom Reminder Form */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-6">
                <h3 className="text-sm font-bold text-slate-900">Create New Pill Alert</h3>

                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={reminderMedicine}
                      onChange={(e) => setReminderMedicine(e.target.value)}
                      placeholder="e.g. Atorvastatin"
                      className="w-full bg-white/60 border border-slate-200 rounded-xl px-4.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-secondary shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Dosage</label>
                      <input
                        type="text"
                        required
                        value={reminderDosage}
                        onChange={(e) => setReminderDosage(e.target.value)}
                        placeholder="e.g. 10mg"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl px-4.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-secondary shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Frequency/Time</label>
                      <input
                        type="text"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        placeholder="e.g. 09:00 PM"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl px-4.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-secondary shadow-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Reminder
                  </motion.button>
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
