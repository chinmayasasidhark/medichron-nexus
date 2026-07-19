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

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export interface UserHealthData {
  reports: MedicalReport[];
  conditions: string[];
  medications: Medication[];
  allergies: string[];
  timelineEvents: TimelineEvent[];
  chatHistory: ChatMessage[];
  healthScore: number;
}

// In-memory data store mapping firebase uid -> UserHealthData
const db = new Map<string, UserHealthData>();

// Standard initial mock data seed
export const getInitialData = (): UserHealthData => ({
  reports: [
    {
      id: 'rep-1',
      fileName: 'City_Hospital_Discharge_Summary_Jan2025.pdf',
      uploadedAt: '2025-01-15',
      fileSize: '1.2 MB',
      status: 'Parsed',
      healthScoreEffect: 4,
    },
    {
      id: 'rep-2',
      fileName: 'Metropolis_Lab_Blood_Panel_June2024.pdf',
      uploadedAt: '2024-06-10',
      fileSize: '450 KB',
      status: 'Parsed',
      healthScoreEffect: 0,
    }
  ],
  conditions: [
    'Gastritis (Resolved)',
    'Bronchitis (Resolved)',
    'Seasonal Asthma'
  ],
  medications: [
    { id: 'med-1', name: 'Albuterol Inhaler', dosage: '1-2 puffs as needed', time: 'As needed', takenToday: false },
    { id: 'med-2', name: 'Pantoprazole', dosage: '40mg', time: '08:00 AM', takenToday: true },
    { id: 'med-3', name: 'Vitamin D3', dosage: '2000 IU', time: '12:00 PM', takenToday: false }
  ],
  allergies: [
    'Penicillin (Severe)',
    'Pollen'
  ],
  timelineEvents: [
    {
      id: 'ev-1',
      date: '2024-06-10',
      title: 'Acute Gastritis Diagnosis',
      description: 'Presented with stomach irritation. Prescribed Pantoprazole 40mg daily.',
      category: 'condition'
    },
    {
      id: 'ev-2',
      date: '2024-06-12',
      title: 'Medication Started: Pantoprazole',
      description: 'Dosage: 40mg once daily before breakfast.',
      category: 'medication'
    },
    {
      id: 'ev-3',
      date: '2025-01-15',
      title: 'Hospital Admission: Acute Bronchitis',
      description: 'Admitted to City Hospital with chest congestion and fever. Discharged after 3 days. Recovered.',
      category: 'condition'
    },
    {
      id: 'ev-4',
      date: '2025-01-16',
      title: 'Medication Started: Albuterol',
      description: 'Inhaler prescribed for persistent wheezing post-bronchitis.',
      category: 'medication'
    }
  ],
  chatHistory: [
    { sender: 'ai', text: 'Hello! I am MediChron AI, your intelligent health timeline assistant. Ask me anything about your uploaded medical records, past conditions, or treatments.', time: '12:00 PM' }
  ],
  healthScore: 88
});

export const getUserData = (uid: string): UserHealthData => {
  if (!db.has(uid)) {
    db.set(uid, getInitialData());
  }
  return db.get(uid)!;
};

export const updateUserData = (uid: string, data: Partial<UserHealthData>): UserHealthData => {
  const current = getUserData(uid);
  const updated = { ...current, ...data };
  db.set(uid, updated);
  return updated;
};

export const resetUserData = (uid: string): UserHealthData => {
  const initial = getInitialData();
  db.set(uid, initial);
  return initial;
};
