 🧠 Academic Twin

Academic Twin is an advanced AI-powered educational ecosystem that maintains a synchronized, live digital model of a student's cognitive state. By tracking what you know, what you *think* you know, and what you’ve forgotten, Academic Twin acts as a personalized co-pilot to optimize your learning velocity and maximize your academic potential.

---
 📋 Table of Contents

- [What is Academic Twin?](#-what-is-academic-twin)
- [Why Academic Twin?](#-why-academic-twin)
- [Core Features](#-core-features)
- [Available AI Agents](#-available-ai-agents)
- [Tech Stack](#-tech-stack)
- [How it Works](#-how-it-works)
- [Getting Started](#-getting-started)

---
 🧐 What is Academic Twin?

Academic Twin is a full-stack, AI-native platform designed to mirror a student's academic journey. Instead of acting as a static note repository or standard quiz app, it dynamically constructs a **Twin Knowledge Model** that keeps track of memory decay, actual concept mastery, topic dependencies, and confidence level discrepancies. It serves as your personal academic diagnostic tool, predictive advisor, and personalized strategist all in one interface.

---
🎯 Why Academic Twin?

Traditional learning management systems (LMS) treat every student the same and rely on retrospective testing (e.g., failing a test to realize you didn't know a topic). 

Academic Twin fixes this paradigm:
- **Combats the Illusion of Competence:** It flags topics where you feel overconfident but have low actual mastery.
- **Root-Cause Diagnostics:** It doesn't just tell you that you failed a quiz; it traces your failure back to a missing foundation or prerequisite topic.
- **Predictive Remediation:** It forecasts your risk of backlogs or low viva scores before they actually happen, allowing you to patch knowledge gaps in real-time.
- **Frictionless Sync:** Simply upload lecture audio or reading materials to automatically update your digital cognitive state.

🚀 Core Features

1. Twin Knowledge Model
Maintains a dynamic live map tracking concepts learned, concepts forgotten, confidence vs. mastery levels, and cross-topic dependencies.
2. Knowledge Gap DetectionPins down deep-seated learning deficiencies by targeting missing prerequisites and hidden conceptual misconceptions.Example: Weakness found in Differential Equations $\rightarrow$ Traced back to Poor Integration Fundamentals.
3. Illusion of Competence DetectorTracks what you THINK you know versus what you ACTUALLY know to eliminate blind spots.Example (Fourier Series): Confidence: 9/10 | Actual Mastery: 4/10 $\rightarrow$ Warning Triggered.
4. Dynamic Study Planner
   Generates personalized high-impact daily schedules based on upcoming exam dates, current mastery deficits, and available preparation windows.
5. Concept Dependency Mapping
Maps chronological inter-dependencies across subjects to forecast future bottlenecks before you encounter advanced curriculum.
Plaintext
Integration ──> Differential Equations ──> Laplace Transform
🤖 Available AI Agents
Academic Twin utilizes an interconnected multi-agent framework to evaluate, plan, and optimize your studies.
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/65a276d2-8468-4c52-b850-343628b8a5b1" />
💻 Tech Stack
Academic Twin is built using a modern, scalable, and highly responsive web architecture.
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/8c695dd8-c055-41c9-97f9-531234570cc3" />

⚙️ How It Works
1.Ingest: Drop your notes, reference papers, or a raw lecture voice memo into the Lecture Intelligence module.
2.Diagnose: Take a quick adaptive quiz or speak directly to the AI Viva Examiner.
3.Map: The system modifies your Twin Knowledge Model and updates your Semester Health Dashboard.
4.Execute: Follow your Dynamic Study Planner optimized by the Exam Strategy Generator to efficiently patch dependencies.
📐 High-Level Architecture Flow Diagram
<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/adfd3edc-ee7b-45d7-ae0b-9815b59faa3d" />


🛠️ Getting Started
Prerequisites
1.Node.js (v18.x or later)
2.npm / yarn / pnpm
3.A Supabase project instance
4.Google AI Studio API key (for Gemini 2.5 Pro)

Installation
1.Clone the repository:
Bash
   git clone [https://github.com/your-username/academic-twin.git](https://github.com/your-username/academic-twin.git)
   cd academic-twin
2.Install dependencies:

Bash
   npm install
   
3.Configure Environment Variables:
  Create a .env.local file in the root directory:

Code snippet
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_2.5_pro_api_key
4.Run the development server:
Bash
   npm run dev
Open http://localhost:3000 with your browser to experience Academic Twin.

Note on Compatibility: While this inline HTML style block works perfectly in most standard Markdown web views (like Notion, nat

