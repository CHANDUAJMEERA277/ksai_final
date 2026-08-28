# KnowledgeStream AI (KSAI) — Complete Intelligence Platform

> **Repository**: [Final_KSAI](https://github.com/NaveenRoman/Final_KSAI)  
> **Production AI Learning Engine**: Unified Teaching, Multimodal Vision, Knowledge Graph, Adaptive Assessment, Personalized Learning Path, AI Mentor, Project AI Coach, Career Intelligence, Skill Passport, and College Intelligence.

---

## 🏛️ System Architecture

```
                            STUDENT
                               ↓
                      Learning Experience
                               ↓
               ┌─────────────────────────────┐
               │ 11–15 Teaching Intelligence │
               │   • Live AI Teacher         │
               │   • Universal Curriculum    │
               │   • Vision AI Teacher       │
               └──────────────┬──────────────┘
                              ↓
                      Knowledge Graph 16
                              ↓
                ┌─────────────┴─────────────┐
                ↓                           ↓
        Adaptive Assessment 17       Learning Path 18
                ↓                           ↓
                └─────────────┬─────────────┘
                              ↓
                        AI Mentor 19
                              ↓
                      Project Coach 20
                              ↓
                     Career Intelligence 21
                              ↓
                        Skill Passport 22
                              ↓
                     College Intelligence 23
```

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, KaTeX LaTeX math.
- **Backend Services**: Next.js API Routes (Edge/Node), Django AI Gateway / Orchestrator.
- **Database & ORM**: SQLite / PostgreSQL, Prisma ORM.
- **AI Models & Multimodal**: Google Gemini (Flash / Pro Vision), OpenAI GPT-4o models.
- **Authentication**: Better Auth, Session Cookie Management.

---

## 📦 Setup Instructions for Team

### 1. Clone the Repository
```bash
git clone https://github.com/NaveenRoman/Final_KSAI.git
cd Final_KSAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Local Environment Variables
Copy `.env.example` to `.env.local`:

**On Linux/macOS:**
```bash
cp .env.example .env.local
```

**On Windows (PowerShell / Command Prompt):**
```powershell
Copy-Item .env.example .env.local
# or
copy .env.example .env.local
```

Fill in the required API keys (Gemini / Better Auth) inside `.env.local`.

### 4. Database Setup (Prisma)
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Team Testing Checklist (Phases 11–23)

### Core Platform & Courses
- [ ] Authentication (Signup, Login, Sessions)
- [ ] Student Dashboard (`/dashboard`)
- [ ] Course Catalog (`/courses`)
- [ ] Python Course Track (`/courses/python`)
- [ ] C Programming Course Track (`/courses/c`)
- [ ] C++ OOP Course Track (`/courses/cpp`)
- [ ] Java Enterprise Course Track (`/courses/java`)

### Teaching & Pedagogical Intelligence (Phases 11–15)
- [ ] **LiveTeacher**: Inline sticky voice-enabled teacher, speech synthesis, speed controls
- [ ] **Ask AI**: In-lesson interactive Q&A assistant (scoped to lesson text)
- [ ] **Understanding Checkpoint**: Intelligent 0–100% score calculation
- [ ] **Evaluation Feedback**:
  - [ ] Correct answer appreciation & conceptual reinforcement
  - [ ] Partial answer percentage, what is correct, what is missing, and follow-up
  - [ ] Wrong answer correction and supportive guidance
  - [ ] "I don't know" supportive first-principles explanation
- [ ] **Automatic Recaps**:
  - [ ] Automatic Quick Recap (resumes from actual previous stopping point)
  - [ ] Automatic Daily Recap (aggregates actual daily learning events)
  - [ ] Automatic Chapter Recap (reviews chapter concepts & gaps)
- [ ] **Vision AI Teacher**: Safe drag-and-drop image upload (<=5MB), code screenshot & diagram analysis

### Intelligence Engine & Guidance (Phases 16–20)
- [ ] **Knowledge Graph (Phase 16)**: Canonical concept banks & prerequisite dependency mapping
- [ ] **Adaptive Assessment (Phase 17)**: Dynamic question difficulty selection (`EASY`, `MEDIUM`, `HARD`), fingerprint deduplication
- [ ] **Personalized Learning Path (Phase 18)**: Prerequisite gap detection, `RETEACH`/`PRACTICE`/`ADVANCE` recommendations
- [ ] **AI Mentor (Phase 19)**: Persistent strategic advisor with actionable next-step cards
- [ ] **Project AI Coach (Phase 20)**: Production blueprints (C, C++, Python, Java), gap analysis, `HINT`, `CODE_REVIEW`, `DEBUG`, `TESTING` modes

### Career, Skills & Institutional Intelligence (Phases 21–23)
- [ ] **Career Intelligence (Phase 21)**: Extensible tech roles, live readiness scoring, tailored roadmaps, interview prep
- [ ] **Skill Passport (Phase 22)**: Digital verified credentials, confidence scoring, proof audit trails
- [ ] **College Intelligence (Phase 23)**: Authorized institutional dashboard, concept bottleneck heatmaps, faculty insights, student privacy protection

### Course Isolation & Performance
- [ ] C only uses C concepts and assessments
- [ ] C++ only uses C++ concepts and assessments
- [ ] Python only uses Python concepts and assessments
- [ ] Java only uses Java concepts and assessments
- [ ] LiveTeacher response speed remains fast with zero duplicate API requests
- [ ] No overlapping chat UI elements
- [ ] Zero browser console errors
