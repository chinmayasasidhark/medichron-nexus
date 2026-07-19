# MediChron AI

> **Your Health. Every Moment. One Intelligent Timeline.**

MediChron AI is an AI-powered healthcare platform that transforms scattered medical reports into a structured, chronological health timeline. Instead of storing PDFs, MediChron extracts, organizes, and reasons over medical information to create a **Living Medical Memory** for patients and doctors.

## ✨ Features

- **📊 Interactive Health Timeline** — Chronological view of all diagnoses, medications, and allergies
- **🧠 AI Medical Chat** — Ask questions about your health history using natural language
- **📈 Report Comparison** — Side-by-side clinical report diff with improvement tracking
- **💊 Smart Pill Reminders** — Auto-extracted medication schedules with check-off tracking
- **🎤 Voice Assistant** — Hands-free TTS & STT for medical queries
- **🔒 HIPAA-Compliant Security** — End-to-end encryption with Firebase Authentication

## 🎨 Design

- **Advanced Glassmorphism** — Frosted glass panels with backdrop-blur refraction
- **Moving Background Blobs** — Continuous drifting color fields for visual depth
- **Framer Motion Animations** — Spring-driven micro-interactions and scroll-triggered entrances
- **Responsive Layout** — Mobile-first design that works on all screen sizes

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + Custom Glassmorphism |
| Animations | Framer Motion |
| Charts | Recharts |
| Auth | Firebase Authentication (with sandbox fallback) |
| Backend | Express.js (Node) |
| AI Engine | Google Gemini 2.5 Flash |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`

### Backend Setup (Optional)

```bash
cd backend
npm install
npm run dev
```

> **Note:** The frontend works fully in sandbox mode without the backend, loading demo medical data automatically.

## 📁 Project Structure

```
MediChron-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx    # Marketing landing page
│   │   │   ├── Dashboard.tsx      # Clinical workspace
│   │   │   └── AuthModal.tsx      # Login/signup modal
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Firebase auth provider
│   │   ├── App.tsx                # Root app with state management
│   │   └── index.css              # Glassmorphism design system
│   └── package.json
├── backend/
│   └── ...
└── README.md
```

## 📄 License

MIT License — Built for the Health AI Hackathon.

---

*Created with ❤️ by Nexus334023K — Powered by Gemini & Supabase*
