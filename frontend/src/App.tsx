import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'condition' | 'medication' | 'allergy' | 'general';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  takenToday: boolean;
}

export interface MedicalReport {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  status: 'Parsed' | 'Processing' | 'Failed';
  healthScoreEffect: number;
}

// Default demo data for sandbox/offline mode
const DEMO_REPORTS: MedicalReport[] = [
  { id: 'report-1', fileName: 'Metropolis_Lab_BloodPanel_Jun2024.pdf', uploadedAt: '2024-06-10', fileSize: '2.4 MB', status: 'Parsed', healthScoreEffect: 4 },
  { id: 'report-2', fileName: 'City_Hospital_Discharge_Summary_Jan2025.pdf', uploadedAt: '2025-01-15', fileSize: '1.2 MB', status: 'Parsed', healthScoreEffect: 4 }
];
const DEMO_CONDITIONS = ['Gastritis (Resolved)', 'Bronchitis (Resolved)', 'Seasonal Asthma'];
const DEMO_MEDICATIONS: Medication[] = [
  { id: 'med-1', name: 'Pantoprazole', dosage: '40mg', time: '08:00 AM', takenToday: false },
  { id: 'med-2', name: 'Albuterol Inhaler', dosage: '2 puffs', time: 'As needed', takenToday: false },
  { id: 'med-3', name: 'Multivitamin', dosage: '1 tablet', time: '09:00 AM', takenToday: false }
];
const DEMO_ALLERGIES = ['Penicillin (Severe)', 'Pollen'];
const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 'ev-1', date: 'June 10, 2024', title: 'Acute Gastritis Diagnosed', description: 'Metropolis Lab blood panel revealed acute gastric irritation. Prescribed Pantoprazole 40mg daily.', category: 'condition' },
  { id: 'ev-2', date: 'June 10, 2024', title: 'Pantoprazole 40mg Started', description: 'Oral proton pump inhibitor prescribed for 8 weeks to manage gastritis symptoms.', category: 'medication' },
  { id: 'ev-3', date: 'August 15, 2024', title: 'Gastritis Resolved', description: 'Follow-up confirmed gastritis has completely resolved. Pantoprazole continued at maintenance dose.', category: 'condition' },
  { id: 'ev-4', date: 'January 12, 2025', title: 'Acute Bronchitis Admission', description: 'Admitted to City Hospital for 3 days. Presented with severe cough, wheezing, and chest tightness.', category: 'condition' },
  { id: 'ev-5', date: 'January 15, 2025', title: 'Albuterol Inhaler Prescribed', description: 'Discharged with Albuterol Inhaler (2 puffs as needed) for residual bronchospasm.', category: 'medication' },
  { id: 'ev-6', date: 'January 15, 2025', title: 'Penicillin Allergy Flagged', description: 'Medical record flagged severe Penicillin allergy. Alternative antibiotics recommended.', category: 'allergy' },
  { id: 'ev-7', date: 'February 1, 2025', title: 'Seasonal Asthma Noted', description: 'Post-bronchitis follow-up identified seasonal asthma pattern. Monitoring recommended.', category: 'condition' }
];
const DEMO_CHAT: Array<{ sender: 'user' | 'ai'; text: string; time: string }> = [
  { sender: 'ai', text: 'Welcome to MediChron AI! I have loaded your medical timeline. You can ask me anything about your health history, medications, or conditions.', time: 'Now' }
];

function AppContent() {
  const { user, token, loading, isSandbox } = useAuth();
  const [isAppMode, setIsAppMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core application states
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([]);
  const [healthScore, setHealthScore] = useState<number>(88);

  // Loads demo data as fallback (for sandbox or when backend is unavailable)
  const loadDemoData = () => {
    setReports(DEMO_REPORTS);
    setConditions(DEMO_CONDITIONS);
    setMedications(DEMO_MEDICATIONS);
    setAllergies(DEMO_ALLERGIES);
    setTimelineEvents(DEMO_TIMELINE);
    setChatHistory(DEMO_CHAT);
    setHealthScore(88);
  };

  // Sync state with backend whenever user or token changes
  useEffect(() => {
    if (!user) {
      setReports([]);
      setConditions([]);
      setMedications([]);
      setAllergies([]);
      setTimelineEvents([]);
      setChatHistory([]);
      setHealthScore(88);
      setIsAppMode(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('http://localhost:5000/api/user-data', { headers });
        if (!res.ok) throw new Error('Failed to load user clinical profile data');
        const data = await res.json();
        
        setReports(data.reports);
        setConditions(data.conditions);
        setMedications(data.medications);
        setAllergies(data.allergies);
        setTimelineEvents(data.timelineEvents);
        setChatHistory(data.chatHistory);
        setHealthScore(data.healthScore);
      } catch (err) {
        console.warn('Backend unavailable, loading demo data:', err);
        loadDemoData();
      }
    };

    fetchUserData();
  }, [user, token]);

  // Triggered when a new report is uploaded
  const handleUploadReport = async (fileName: string, fileSize: string) => {
    const newReport: MedicalReport = {
      id: `report-${Date.now()}`,
      fileName,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize,
      status: 'Processing',
      healthScoreEffect: 0
    };
    setReports(prev => [...prev, newReport]);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fileName, fileSize })
      });
      if (!res.ok) throw new Error('Failed to submit report metadata');
      const immediateData = await res.json();
      setReports(immediateData.reports);

      setTimeout(async () => {
        const reloadRes = await fetch('http://localhost:5000/api/user-data', { headers });
        if (reloadRes.ok) {
          const updatedData = await reloadRes.json();
          setReports(updatedData.reports);
          setConditions(updatedData.conditions);
          setMedications(updatedData.medications);
          setAllergies(updatedData.allergies);
          setTimelineEvents(updatedData.timelineEvents);
          setHealthScore(updatedData.healthScore);
        }
      }, 2500);
    } catch (err) {
      // Fallback: mark as parsed locally after delay
      console.warn('Backend unavailable, simulating local parse:', err);
      setTimeout(() => {
        setReports(prev =>
          prev.map(r =>
            r.id === newReport.id ? { ...r, status: 'Parsed' as const, healthScoreEffect: 2 } : r
          )
        );
        setHealthScore(prev => Math.min(100, prev + 2));
      }, 2000);
    }
  };

  const handleResetData = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('http://localhost:5000/api/reset', {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('Failed to reset user records');
      const data = await res.json();
      
      setReports(data.reports);
      setConditions(data.conditions);
      setMedications(data.medications);
      setAllergies(data.allergies);
      setTimelineEvents(data.timelineEvents);
      setChatHistory(data.chatHistory);
      setHealthScore(data.healthScore);
    } catch (err) {
      console.warn('Backend unavailable, resetting to demo data locally:', err);
      loadDemoData();
    }
  };

  // Full-screen spinner while evaluating session keys
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wider uppercase text-teal-400/80">Checking Authentication...</span>
      </div>
    );
  }

  const handleLaunchClick = () => {
    if (user) {
      setIsAppMode(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker font-sans text-slate-800 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background ambient glowing circles */}
      <motion.div 
        animate={{
          x: [0, 90, -50, 0],
          y: [0, -80, 60, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="glow-circle w-[600px] h-[600px] bg-teal-300/15 top-[-150px] left-[-150px]"
      />
      <motion.div 
        animate={{
          x: [0, -100, 70, 0],
          y: [0, 90, -70, 0],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="glow-circle w-[700px] h-[700px] bg-purple-300/12 bottom-[-250px] right-[-250px]"
      />
      <motion.div 
        animate={{
          x: [0, 50, -60, 0],
          y: [0, 70, -40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="glow-circle w-[500px] h-[500px] bg-blue-300/8 top-[35%] left-[45%] -translate-x-1/2 -translate-y-1/2"
      />

      {/* Sandbox indicator banner */}
      {isSandbox && user && (
        <div className="w-full bg-amber-500/20 text-amber-300 border-b border-amber-500/30 text-center py-1.5 px-4 text-xs font-semibold relative z-50 flex items-center justify-center gap-1.5 backdrop-blur-sm">
          <span>Sandbox Mode enabled. Authentication bypassing active.</span>
        </div>
      )}

      {!isAppMode ? (
        <LandingPage onLaunchApp={handleLaunchClick} />
      ) : (
        <Dashboard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reports={reports}
          conditions={conditions}
          medications={medications}
          setMedications={setMedications}
          allergies={allergies}
          timelineEvents={timelineEvents}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          healthScore={healthScore}
          onUploadReport={handleUploadReport}
          onExitApp={() => setIsAppMode(false)}
          onReset={handleResetData}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAppMode(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
