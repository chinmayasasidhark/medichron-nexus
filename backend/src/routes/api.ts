import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  getUserData,
  updateUserData,
  resetUserData,
  MedicalReport,
  TimelineEvent,
  Medication
} from '../db/userDb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// GET /api/user-data
router.get('/user-data', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const userData = getUserData(uid);
  return res.json(userData);
});

// POST /api/reports
router.post('/reports', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { fileName, fileSize } = req.body;

  if (!fileName || !fileSize) {
    return res.status(400).json({ error: 'fileName and fileSize are required' });
  }

  const userData = getUserData(uid);
  const newReportId = `rep-${Date.now()}`;
  const newReport: MedicalReport = {
    id: newReportId,
    fileName,
    uploadedAt: new Date().toISOString().split('T')[0],
    fileSize,
    status: 'Processing',
    healthScoreEffect: 0,
  };

  const updatedReports = [newReport, ...userData.reports];
  updateUserData(uid, { reports: updatedReports });

  // Simulate server-side AI parsing in the background (similar to the frontend timeout)
  setTimeout(() => {
    const currentData = getUserData(uid);
    
    // 1. Update report status to Parsed
    const finalReports = currentData.reports.map((r) =>
      r.id === newReportId ? { ...r, status: 'Parsed' as const, healthScoreEffect: 4 } : r
    );

    // 2. Extracted medical details from parsing simulation
    const updatedConditions = [...currentData.conditions];
    if (!updatedConditions.includes('Hyperlipidemia (Mild)')) {
      updatedConditions.push('Hyperlipidemia (Mild)');
    }

    const updatedMedications = [...currentData.medications];
    if (!updatedMedications.some(m => m.name === 'Atorvastatin')) {
      updatedMedications.push({
        id: `med-${Date.now()}`,
        name: 'Atorvastatin',
        dosage: '10mg',
        time: '09:00 PM',
        takenToday: false
      });
    }

    const updatedAllergies = [...currentData.allergies];
    if (!updatedAllergies.includes('Sulfa Drugs')) {
      updatedAllergies.push('Sulfa Drugs');
    }

    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: 'Hyperlipidemia Diagnosis & Medication Start',
      description: 'Extracted from uploaded report. Mildly elevated LDL cholesterol. Initiated Atorvastatin 10mg.',
      category: 'condition'
    };
    const updatedEvents = [newEvent, ...currentData.timelineEvents];

    updateUserData(uid, {
      reports: finalReports,
      conditions: updatedConditions,
      medications: updatedMedications,
      allergies: updatedAllergies,
      timelineEvents: updatedEvents,
      healthScore: Math.min(100, currentData.healthScore + 4)
    });
  }, 2000);

  // Return the immediate state (Processing)
  return res.json(getUserData(uid));
});

// POST /api/medications/:id/toggle
router.post('/medications/:id/toggle', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { id } = req.params;

  const userData = getUserData(uid);
  const updatedMedications = userData.medications.map((med) =>
    med.id === id ? { ...med, takenToday: !med.takenToday } : med
  );

  const updatedData = updateUserData(uid, { medications: updatedMedications });
  return res.json(updatedData);
});

// POST /api/medications
router.post('/medications', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { name, dosage, time } = req.body;

  if (!name || !dosage) {
    return res.status(400).json({ error: 'name and dosage are required' });
  }

  const userData = getUserData(uid);
  const newMed: Medication = {
    id: `med-${Date.now()}`,
    name,
    dosage,
    time: time || 'As needed',
    takenToday: false
  };

  const updatedData = updateUserData(uid, {
    medications: [...userData.medications, newMed]
  });
  return res.json(updatedData);
});

// DELETE /api/medications/:id
router.delete('/medications/:id', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { id } = req.params;

  const userData = getUserData(uid);
  const updatedMedications = userData.medications.filter((med) => med.id !== id);

  const updatedData = updateUserData(uid, { medications: updatedMedications });
  return res.json(updatedData);
});

// Helper for mock fallback responses
function getMockAiResponse(text: string, userData: any): string {
  const query = text.toLowerCase();
  if (query.includes('medication') || query.includes('pill') || query.includes('drug') || query.includes('dose')) {
    const list = userData.medications.map((m: any) => `- **${m.name}** (${m.dosage}) scheduled for ${m.time}`).join('\n');
    return `Based on your records, you are currently taking:\n${list}\n\nDo you want me to log compliance or check for potential contraindications?`;
  } else if (query.includes('report') || query.includes('file') || query.includes('upload') || query.includes('pdf')) {
    const docs = userData.reports.map((r: any) => `- **${r.fileName}** (Uploaded: ${r.uploadedAt}, Status: ${r.status})`).join('\n');
    return `Here are your uploaded medical files:\n${docs}\n\nI parse clinical notes to update your timeline automatically. Let me know if you want detailed highlights from any specific document!`;
  } else if (query.includes('allergy') || query.includes('allergies')) {
    const list = userData.allergies.map((a: any) => `- **${a}**`).join('\n');
    return `According to your files, you have the following allergies registered:\n${list}\n\nRemember to alert your clinicians regarding these sensitivities prior to receiving prescriptions.`;
  } else if (query.includes('timeline') || query.includes('history') || query.includes('happen') || query.includes('asthma')) {
    const recent = userData.timelineEvents.slice(0, 3).map((e: any) => `- *${e.date}*: **${e.title}** - ${e.description}`).join('\n');
    return `Here are the key occurrences in your health timeline:\n${recent}\n\nWould you like me to filter events by category or compile a report?`;
  } else if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
    return `Hello! I'm MediChron AI. I see you have **${userData.conditions.length}** health conditions tracked and **${userData.medications.length}** active medications. How can I help you manage your medical timeline today?`;
  } else {
    return `I've analyzed your medical timeline and health profile. You have active conditions like **${userData.conditions.join(', ')}** and a current health score of **${userData.healthScore}**. Let me know if you need specific details about your treatment dates, drug schedules, or diagnostic reports.`;
  }
}

// POST /api/chat
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const userData = getUserData(uid);
  
  // Format current time (HH:MM AM/PM)
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timestamp = `${hours}:${minutes} ${ampm}`;

  const userMsg = { sender: 'user' as const, text, time: timestamp };
  const updatedHistory = [...userData.chatHistory, userMsg];

  // Determine AI response: Real Gemini vs Fallback Simulation
  let aiText = '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // System Prompt supplying the LLM with user context
      const systemPrompt = `You are MediChron AI, an advanced medical timeline assistant.
You help users explore and understand their clinical history based on their records.

Here is the user's clinical profile:
- Health Score: ${userData.healthScore}/100
- Conditions: ${userData.conditions.join(', ') || 'None'}
- Allergies: ${userData.allergies.join(', ') || 'None'}
- Active Medications:
${userData.medications.map(m => `  * ${m.name} (${m.dosage}) scheduled for ${m.time} - Taken today: ${m.takenToday ? 'Yes' : 'No'}`).join('\n') || '  * None'}
- Timeline Events:
${userData.timelineEvents.map(e => `  * ${e.date}: [${e.category.toUpperCase()}] ${e.title} - ${e.description}`).join('\n') || '  * None'}
- Uploaded Reports:
${userData.reports.map(r => `  * ${r.fileName} (Uploaded: ${r.uploadedAt}, Status: ${r.status})`).join('\n') || '  * None'}

Instructions:
1. Provide accurate, helpful answers referencing their medical history when appropriate.
2. Maintain a highly professional, compassionate, and reassuring clinical assistant tone.
3. If they ask about symptoms, give supportive information but remind them to consult their doctor for clinical diagnoses.
4. Keep answers concise and readable. Use markdown formatting.`;

      // Format history for Gemini
      const historyList = userData.chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: historyList,
        systemInstruction: systemPrompt
      });

      const result = await chat.sendMessage(text);
      aiText = result.response.text();
    } catch (apiError) {
      console.error('Gemini API Error, falling back to simulated model:', apiError);
      aiText = getMockAiResponse(text, userData);
    }
  } else {
    aiText = getMockAiResponse(text, userData);
  }

  const aiMsg = { sender: 'ai' as const, text: aiText, time: timestamp };
  const finalHistory = [...updatedHistory, aiMsg];

  updateUserData(uid, { chatHistory: finalHistory });
  return res.json(getUserData(uid));
});

// POST /api/reset
router.post('/reset', (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const resetData = resetUserData(uid);
  return res.json(resetData);
});

export default router;
