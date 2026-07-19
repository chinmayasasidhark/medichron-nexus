import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Shield, Zap, Sparkles, UploadCloud, 
  ArrowRight, Brain, Clock, ShieldCheck, Heart, 
  CheckCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const { user, logout } = useAuth();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [simulatedFileName, setSimulatedFileName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startSimulatedUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startSimulatedUpload(e.target.files[0].name);
    }
  };

  const startSimulatedUpload = (name: string) => {
    setSimulatedFileName(name);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onLaunchApp();
        }, 600);
      }
    }, 150);
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 90, damping: 14 } 
    }
  };

  const scrollVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15, duration: 0.7 }
    }
  };

  return (
    <div className="w-full relative z-10">
      {/* Sticky Header */}
      <header className="sticky top-0 w-full glass-panel border-b border-brand-border/40 py-4 px-6 md:px-12 flex items-center justify-between z-50 backdrop-blur-md">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 10 }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-secondary/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              MediChron <span className="text-xs bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-full border border-brand-secondary/20">AI</span>
            </span>
            <p className="text-[9px] text-brand-muted">Powered by Gemini 2.5 Flash</p>
          </div>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-slate-900 transition-colors">AI Workflow</a>
          <a href="#testimonials" className="hover:text-slate-900 transition-colors">Reviews</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right mr-1">
              <span className="text-[11px] font-bold text-slate-700 leading-tight">
                Hi, {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <button 
                onClick={logout}
                className="text-[10px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-medium underline leading-tight animate-fade-in"
              >
                Sign Out
              </button>
            </div>
          )}
          <motion.button 
            onClick={onLaunchApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glow-btn bg-gradient-to-r from-brand-secondary to-brand-accent hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-secondary/15 cursor-pointer"
          >
            {user ? 'Enter Dashboard' : 'Launch Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-xs font-semibold uppercase tracking-wider"
            variants={itemVariants}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon MVP 1.0 Ready
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900"
            variants={itemVariants}
          >
            Your Health. <br />
            Every Moment. <br />
            <span className="text-gradient">One Intelligent Timeline.</span>
          </motion.h1>

          <motion.p 
            className="text-lg text-slate-600 max-w-xl"
            variants={itemVariants}
          >
            MediChron AI transforms scattered medical reports, lab slips, and prescriptions into a structured, chronological timeline. No folders, no confusion—just medical intelligence.
          </motion.p>

          {/* Quick Upload Dropzone directly in Hero (Glassmorphic) */}
          <motion.div className="w-full max-w-lg mt-4" variants={itemVariants}>
            <motion.div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              whileHover={{ y: -4, scale: 1.015, boxShadow: "0 20px 40px -15px rgba(20, 184, 166, 0.12)" }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              className={`w-full p-6 md:p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                dragActive 
                  ? 'border-brand-secondary bg-brand-secondary/5 shadow-lg shadow-brand-secondary/5' 
                  : 'border-slate-200/80 bg-white/40 backdrop-blur-md shadow-sm'
              }`}
            >
              <input 
                type="file" 
                id="hero-file-upload" 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={handleFileChange}
              />
              <label htmlFor="hero-file-upload" className="cursor-pointer w-full flex flex-col items-center justify-center">
                {!simulatedFileName ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100/80 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Drag & drop your medical report here</p>
                    <p className="text-xs text-brand-muted mt-1.5">Supports PDF, PNG, JPG up to 10MB</p>
                    <button className="mt-4 text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1">
                      Or browse files from your computer <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    <p className="text-sm font-bold text-slate-900 mb-2 truncate">Uploading: {simulatedFileName}</p>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-secondary to-brand-accent transition-all duration-150" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-brand-secondary mt-2 font-semibold">
                      {uploadProgress < 100 ? `Parsing Report ${uploadProgress}%...` : 'Success! Loading Timeline...'}
                    </p>
                  </div>
                )}
              </label>
            </motion.div>
          </motion.div>

          <motion.div className="flex flex-wrap gap-6 items-center pt-4" variants={itemVariants}>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-secondary" /> Private & Secure
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <CheckCircle className="w-4.5 h-4.5 text-brand-secondary" /> AI Extracted
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Zap className="w-4.5 h-4.5 text-brand-secondary" /> Instant Health Score
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Interactive Widget Graphic with continuous float animation */}
        <motion.div 
          className="lg:col-span-5 relative flex justify-center"
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' as const }}
        >
          <div className="w-full max-w-[400px] glass-panel rounded-3xl p-6 shadow-xl border border-brand-border/60 relative">
            <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] font-bold tracking-wider uppercase">
              Live Medical Memory
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">Overview Dashboard</span>
              </div>
              <span className="text-[10px] text-brand-muted">Updated Just Now</span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-slate-100 bg-slate-50/50 rounded-2xl mb-6 text-center">
              <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-slate-200" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" className="stroke-brand-secondary" strokeWidth="8" fill="transparent" strokeDasharray="301.6" strokeDashoffset="36.2" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-900">88</span>
                  <span className="text-[10px] font-semibold text-brand-muted">HEALTH SCORE</span>
                </div>
              </div>
              <p className="text-xs font-bold text-brand-secondary">+4 points since medical upload</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-brand-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-sm shadow-brand-accent"></span>
                  <span className="font-semibold text-slate-800">Active Condition</span>
                </div>
                <span className="text-slate-600 font-medium">Seasonal Asthma</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-brand-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary shadow-sm shadow-brand-secondary"></span>
                  <span className="font-semibold text-slate-800">Active Medication</span>
                </div>
                <span className="text-slate-600 font-medium">Pantoprazole 40mg</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Ticker */}
      <section className="w-full py-8 border-y border-brand-border/30 bg-slate-50/50 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap gap-16 text-xs md:text-sm font-bold tracking-widest text-slate-600 uppercase">
          <span>🛡️ HIPAA Secure & Compliant</span>
          <span>⚡ Gemini 2.5 Flash Engine</span>
          <span>🔒 End-to-End Encryption</span>
          <span>📊 Automatic Health Timelines</span>
          <span>💬 Smart Medical Assistant Chat</span>
          <span>📈 Patient & Doctor Shared Portals</span>
          <span>🛡️ HIPAA Secure & Compliant</span>
          <span>⚡ Gemini 2.5 Flash Engine</span>
          <span>🔒 End-to-End Encryption</span>
          <span>📊 Automatic Health Timelines</span>
          <span>💬 Smart Medical Assistant Chat</span>
          <span>📈 Patient & Doctor Shared Portals</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <motion.div 
          className="space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollVariants}
        >
          <h2 className="text-xs font-bold tracking-widest text-brand-secondary uppercase">Complete Intelligence</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900">What does MediChron AI do?</h3>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Instead of storing folders of medical papers, we read, parse, and categorize them into dynamic, interactive data graphs.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
        >
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(20, 184, 166, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-brand-secondary" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Intelligent Recall</h4>
              <p className="text-sm text-slate-600">
                Ask simple questions about your medical past instead of reading pages. Instantly retrieves allergies, treatments, and timelines.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(124, 58, 237, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-brand-accent" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Secure Sync</h4>
              <p className="text-sm text-slate-600">
                Keep all devices updated. Medical documents are stored using high-end AES-256 encryption. Only you hold the access key.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(59, 130, 246, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Custom Insights</h4>
              <p className="text-sm text-slate-600">
                Analyzes trends in blood samples, lipids, sugar levels, and scans. Keeps a watch on potential flags before they compound.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(124, 58, 237, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Report Comparison</h4>
              <p className="text-sm text-slate-600">
                Compare old lab results with new ones side by side. See what's Improved, Stable, or Declined automatically.
              </p>
            </div>
          </motion.div>

          {/* Card 5 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Medicine Reminders</h4>
              <p className="text-sm text-slate-600">
                Extracts prescription dosage instructions and generates checkable reminder systems so you never miss a pill.
              </p>
            </div>
          </motion.div>

          {/* Card 6 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 40px -15px rgba(249, 115, 22, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Voice Assistant</h4>
              <p className="text-sm text-slate-600">
                Talk directly to your health memory. Hands-free consultation summary checks using state-of-the-art TTS & STT capabilities.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* AI Workflow Section */}
      <section id="workflow" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-brand-border/30 text-center">
        <motion.div 
          className="space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollVariants}
        >
          <h2 className="text-xs font-bold tracking-widest text-brand-secondary uppercase">Under the Hood</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900">How MediChron Works</h3>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From raw reports to an organized medical brain using advanced intelligence blocks.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div className="p-5 glass-panel rounded-2xl flex flex-col items-center" variants={itemVariants}>
            <span className="text-2xl mb-2">📄</span>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Medical Report</h5>
            <p className="text-[10px] text-brand-muted mt-2">Patient uploads PDF, JPG, PNG files.</p>
          </motion.div>

          <motion.div className="text-brand-secondary font-bold text-lg hidden md:block" variants={itemVariants}>→</motion.div>

          <motion.div className="p-5 glass-panel rounded-2xl flex flex-col items-center" variants={itemVariants}>
            <span className="text-2xl mb-2">⚡</span>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Vision & OCR</h5>
            <p className="text-[10px] text-brand-muted mt-2">Gemini extracts all text content.</p>
          </motion.div>

          <motion.div className="text-brand-secondary font-bold text-lg hidden md:block" variants={itemVariants}>→</motion.div>

          <motion.div className="p-5 glass-panel rounded-2xl flex flex-col items-center" variants={itemVariants}>
            <span className="text-2xl mb-2">🧬</span>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Entity Extraction</h5>
            <p className="text-[10px] text-brand-muted mt-2">Finds diagnoses, doses, dates.</p>
          </motion.div>

          <motion.div className="text-brand-secondary font-bold text-lg hidden md:block" variants={itemVariants}>→</motion.div>

          <motion.div className="p-5 glass-panel rounded-2xl flex flex-col items-center" variants={itemVariants}>
            <span className="text-2xl mb-2">📊</span>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Timeline Generation</h5>
            <p className="text-[10px] text-brand-muted mt-2">Synthesizes timeline with databases.</p>
          </motion.div>

          <motion.div className="text-brand-secondary font-bold text-lg hidden md:block" variants={itemVariants}>→</motion.div>

          <motion.div className="p-5 glass-panel rounded-2xl flex flex-col items-center border border-brand-secondary/40 shadow-lg shadow-brand-secondary/5" variants={itemVariants}>
            <span className="text-2xl mb-2">🧠</span>
            <h5 className="text-xs font-bold text-brand-secondary uppercase tracking-wider">5. Health Timeline</h5>
            <p className="text-[10px] text-brand-muted mt-2">Memory timeline ready for chat/insights.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-brand-border/30">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollVariants}
        >
          <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase">Endorsements</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900">Loved by Doctors & Patients</h3>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 rounded-3xl border border-brand-border flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <p className="text-sm text-slate-600 italic mb-6">
              "As a neurologist, tracking a patient's historical diagnoses is critical. MediChron AI reduces our intake analysis time from 15 minutes to literally 30 seconds."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-secondary to-blue-500 flex items-center justify-center text-sm font-bold text-white">DP</div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Dr. Maya Patel</h5>
                <p className="text-[10px] text-brand-muted">Neurologist, City Hospital</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 rounded-3xl border border-brand-border flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <p className="text-sm text-slate-600 italic mb-6">
              "Being able to compare my cholesterol panels side-by-side without digging through emails has kept me highly motivated on my medication schedule."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-accent to-pink-500 flex items-center justify-center text-sm font-bold text-white">SK</div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Sarah Jenkins</h5>
                <p className="text-[10px] text-brand-muted">Chronic Asthma & Heart Patient</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 rounded-3xl border border-brand-border flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <p className="text-sm text-slate-600 italic mb-6">
              "The AI chat is incredible. I asked when my last tetanus booster was, and it scanned a handwritten lab slip from 2021 and got the date correct instantly!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center text-sm font-bold text-white">LG</div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Dr. Luis Gomez</h5>
                <p className="text-[10px] text-brand-muted">Emergency Medicine Specialist</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-brand-border/30 text-center">
        <motion.div 
          className="space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollVariants}
        >
          <h2 className="text-xs font-bold tracking-widest text-brand-secondary uppercase">Plans</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900">Simple, Transparent Pricing</h3>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Free Tier */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left border border-brand-border relative flex flex-col justify-between cursor-pointer" 
            variants={itemVariants}
          >
            <div>
              <h4 className="text-xl font-bold text-slate-900">Basic Timeline</h4>
              <p className="text-xs text-brand-muted mt-1">Perfect for keeping a single personal health profile.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-xs text-brand-muted"> / Free Forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 mb-8">
                <li className="flex items-center gap-2">✔ Upload up to 10 Reports</li>
                <li className="flex items-center gap-2">✔ Interactive Timeline</li>
                <li className="flex items-center gap-2">✔ Smart AI Medical Chat (Limited)</li>
              </ul>
            </div>
            <button 
              onClick={onLaunchApp}
              className="w-full py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center cursor-pointer"
            >
              Get Started
            </button>
          </motion.div>

          {/* Premium Tier */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -15px rgba(20, 184, 166, 0.12)" }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 rounded-3xl text-left border-2 border-brand-secondary relative flex flex-col justify-between shadow-lg shadow-brand-secondary/5 cursor-pointer" 
            variants={itemVariants}
          >
            <div className="absolute top-4 right-4 bg-brand-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Premium Care</h4>
              <p className="text-xs text-brand-muted mt-1">For advanced health tracking and complete families.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$12</span>
                <span className="text-xs text-brand-muted"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 mb-8">
                <li className="flex items-center gap-2">✔ Unlimited Report Uploads</li>
                <li className="flex items-center gap-2">✔ Multi-profile Family Graph</li>
                <li className="flex items-center gap-2">✔ Premium Gemini Chat (No Limits)</li>
                <li className="flex items-center gap-2">✔ PDF & Medical Record Comparison</li>
                <li className="flex items-center gap-2">✔ Smart Pill Reminders with Alerts</li>
              </ul>
            </div>
            <button 
              onClick={onLaunchApp}
              className="glow-btn w-full py-3 rounded-xl bg-gradient-to-r from-brand-secondary to-brand-accent text-xs font-bold text-white hover:opacity-90 transition-all text-center cursor-pointer shadow-md"
            >
              Unlock Premium
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-brand-border/30 bg-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-secondary to-brand-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">MediChron AI</span>
          </div>
          
          <p className="text-xs text-brand-muted">
            &copy; 2026 MediChron AI. Created for Health AI Hackathon. Built with Gemini & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
