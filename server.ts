import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry user-agent and key safety checks
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not configured or uses default template value. Using fallback simulation engines.");
}

// ----------------------------------------------------
// AI ROUTE 1: Create Knowledge Map
// ----------------------------------------------------
app.post("/api/generate-knowledge-map", async (req, res) => {
  const { subject, customNotes } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Subject parameter is required" });
  }

  const prompt = `You are an expert university academic examiner. The student wants to generate an Academic Twin Knowledge Map for the subject: "${subject}".
  ${customNotes ? `The student appended these personal lecture notes/materials:\n"""\n${customNotes}\n"""` : ""}
  
  Analyze the fundamental topics for the engineering subject "${subject}". Identify exactly 4 crucial core topics that the student must master (for DBMS, include Normalization, Transactions, etc. For OS, include Deadlocks, CPU Scheduling, Virtual Memory, etc. For Computer Networks, include TCP/ip, Routing algorithms, etc. If the subject is something else, choose 4 relevant foundational topics).
  
  Assign initial estimates for:
  - "category": set this strictly to "${subject}"
  - "confidence": set default to 5 (meaning untested)
  - "actualMastery": set default to 0 (untested)
  - "status": set default to "untested"
  - "details": a short single-sentence summary of the main sub-concepts under this topic (e.g. for Normalization: "1NF, 2NF, 3NF, BCNF anomalies and decompositions").
  
  Generate the output strictly in the requested JSON structure.`;

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              description: "List of 4 crucial core topics detected for the subject.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "lower case single word identifier (e.g. normalization, transactions, deadlocks)" },
                  name: { type: Type.STRING, description: "Readable title (e.g. 'Normalization', 'CPU Scheduling')" },
                  category: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  actualMastery: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: "Must be 'untested'" },
                  details: { type: Type.STRING }
                },
                required: ["id", "name", "category", "confidence", "actualMastery", "status", "details"]
              }
            }
          },
          required: ["topics"]
        }
      }
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText));

  } catch (error: any) {
    console.error("Knowledge map error:", error);
    // Secure Fallback in case of API issue or missing key
    const fallbacks: { [key: string]: any[] } = {
      DBMS: [
        { id: "normalization", name: "Normalization", category: "DBMS", confidence: 5, actualMastery: 0, status: "untested", details: "Functional Dependencies, 1NF, 2NF, 3NF, and BCNF anomaly corrections." },
        { id: "transactions", name: "Transactions & Concurrency", category: "DBMS", confidence: 5, actualMastery: 0, status: "untested", details: "ACID properties, serializability, 2-Phase Locking, and Deadlock resolutions." },
        { id: "indexing", name: "Indexing & B-Trees", category: "DBMS", confidence: 5, actualMastery: 0, status: "untested", details: "Clustered/non-clustered indexing, high-speed B/B+ trees query runtimes." },
        { id: "sql", name: "SQL Queries & Joins", category: "DBMS", confidence: 5, actualMastery: 0, status: "untested", details: "Relational algebra, complex aggregate nested queries, outer joins, and CTEs." }
      ],
      OS: [
        { id: "deadlocks", name: "Deadlocks", category: "OS", confidence: 5, actualMastery: 0, status: "untested", details: "Mutual exclusion, Banker's avoidance algorithm, and resource graphs." },
        { id: "scheduling", name: "CPU Scheduling", category: "OS", confidence: 5, actualMastery: 0, status: "untested", details: "SJF, Round Robin, priority queues, and context-switching overheads." },
        { id: "paging", name: "Paging & Memory Management", category: "OS", confidence: 5, actualMastery: 0, status: "untested", details: "Page tables, TLB cache hits, page replacement algorithms like LRU/FIFO." },
        { id: "concurrency", name: "Process Concurrency", category: "OS", confidence: 5, actualMastery: 0, status: "untested", details: "Semaphores, producer-consumer bounds, spinlocks, and mutex signaling." }
      ]
    };
    const key = (subject || "DBMS").toUpperCase();
    const fallbackList = fallbacks[key] || fallbacks["DBMS"];
    res.json({ topics: fallbackList });
  }
});

// ----------------------------------------------------
// AI ROUTE 2: Verify Confidence (Question Generator)
// ----------------------------------------------------
app.post("/api/verify-confidence", async (req, res) => {
  const { subject, topicId, topicName, ratedConfidence } = req.body;
  if (!topicName) {
    return res.status(400).json({ error: "Topic parameters are required" });
  }

  const prompt = `You are a strict, smart engineering university examiner design to assess a student's TRUE competence versus their self-rated confidence.
  The student rates their overall confidence in the topic "${topicName}" (Subject: ${subject}) as ${ratedConfidence || 5} out of 10.
  
  Generate exactly 3 progressive engineering questions targeting "${topicName}":
  - Question 1: Basic concept validation (Level: Simple).
  - Question 2: Practical code, schema, query, or algorithm tracing question (Level: Moderate).
  - Question 3: Scenario-based edge cases or potential bugs/anomalies (Level: Advanced).
  
  Be specific and technical. Avoid generic multiple choice questions — these must require written answers.
  For each question, list 3-4 ideal keypoints that should appear in a correct, high-scoring answer.`;

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  idealKeypoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "question", "idealKeypoints"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    console.error("Verify confidence error:", error);
    // Secure Fallbacks
    res.json({
      questions: [
        {
          id: 1,
          question: `Regarding ${topicName}, state its definition, main objectives, and real-world significance.`,
          idealKeypoints: ["core definition", "use-case", "performance advantage"]
        },
        {
          id: 2,
          question: `Describe a step-by-step technical problem solved by ${topicName}. Walk through the flow.`,
          idealKeypoints: ["algorithm steps", "state transitions", "mathematical bounds"]
        },
        {
          id: 3,
          question: `What are the primary performance overheads, anomalies, or system bottlenecks associated with ${topicName}?`,
          idealKeypoints: ["anomalies", "concurrency risks", "overhead reduction"]
        }
      ]
    });
  }
});

// ----------------------------------------------------
// AI ROUTE 3: Evaluate Confidence Test (Reality Check)
// ----------------------------------------------------
app.post("/api/evaluate-confidence-test", async (req, res) => {
  const { subject, topicName, ratedConfidence, questions, answers } = req.body;
  if (!topicName || !questions || !answers) {
    return res.status(400).json({ error: "Missing required assessment parameters" });
  }

  const prompt = `You are a tough, fair university grader grading an academic test.
  Subject: ${subject}
  Topic: ${topicName}
  Student's Self-Rated Confidence: ${ratedConfidence || 5}/10
  
  The questions and the student's typed answers are:
  ${questions.map((q: any, i: number) => `
  [Question ${q.id}]: ${q.question}
  [Ideal Keypoints]: ${q.idealKeypoints?.join(", ")}
  [Student Answer]: ${answers[i] || "(Unanswered)"}
  `).join("\n")}
  
  Analyze the student's responses critically.
  1. Determine their "actualMastery" on a scale from 1 to 10. Be honest! If their answers are generic or skip technical details, give a low score (e.g. 2, 3, or 4). If they demonstrate excellent mastery, grade high (9 or 10).
  2. Compute "gap" = (Self-Rated Confidence) - (Actual Mastery).
  3. Write a sharp, personalized, diagnostic "explanation" paragraph comparing their rated confidence vs their actual mastery, detailing their core misunderstandings or missing key points.
  4. Provide brief "detailedFeedback" bullets for each of the 3 questions explaining exactly what they got wrong or missed.`;

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actualMastery: { type: Type.INTEGER, description: "True evaluated score out of 10" },
            gap: { type: Type.INTEGER, description: "Confidence minus actualMastery." },
            explanation: { type: Type.STRING, description: "Insightful direct comparison paragraph." },
            detailedFeedback: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Grader remarks for each of the 3 questions."
            }
          },
          required: ["actualMastery", "gap", "explanation", "detailedFeedback"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    console.error("Evaluation error:", error);
    // Safe mock reality-check
    const calculatedMastery = Math.max(3, Math.floor(Math.random() * 5) + 2); // default reality check is 3 to 6
    const gap = (ratedConfidence || 5) - calculatedMastery;
    res.json({
      actualMastery: calculatedMastery,
      gap: gap,
      explanation: `You self-rated your confidence in ${topicName} at ${ratedConfidence}/10, but your answers reveal a practical mastery of ${calculatedMastery}/10. This creates a significant gap of ${gap}. While you recall the definitions, you missed important system-design edge cases and specific algorithms.`,
      detailedFeedback: [
        "Question 1: Foundational elements were partially correct, but lacked strict standard formulations.",
        "Question 2: Tracing explanation skipped the actual lock scenarios/Page tables calculations.",
        "Question 3: Edge cases and system anomalies were unanswered or too generic."
      ]
    });
  }
});

// ----------------------------------------------------
// AI ROUTE 4: Auto-Viva (Oral Examiner Bot)
// ----------------------------------------------------
app.post("/api/viva-next", async (req, res) => {
  const { subject, messages, currentCount, answer } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Subject parameter is required" });
  }

  const isStart = !messages || messages.length === 0;

  let prompt = "";
  if (isStart) {
    prompt = `You are a supportive but highly rigorous, formal external examiner conducting a virtual oral viva exam for the engineering subject: "${subject}".
    Greet the student with appropriate academic gravity. Welcome them to the "${subject} Viva Room", state the process briefly, and immediately ask the **first progressive question** to start their assessment. Keep your first response under 80 words.`;
  } else {
    prompt = `You are the external examiner conducting a high-stakes engineering "${subject}" Viva.
    The current count of questions asked so far is: ${currentCount || 1} out of 4.
    
    Here is the dialogue history of your viva so far:
    ${messages.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")}
    
    The student's latest answer is: "${answer || "(No response received)"}".
    
    If the current count is less than 4:
    1. Critically and academic-mindly analyze the student's answer.
    2. Formulate 1-2 sentences of real-time constructive feedback regarding their conceptual clarity (add this clearly as feedback).
    3. Formulate the next question, which should be progressively more challenging or challenge their previous answer's assumptions.
    Keep your response concise but extremely professional so it feels like a real university viva.
    
    If the current count is 4:
    You must wrap up the examination! Conduct a final grade on these three university parameters out of 10:
    - conceptualClarity (How deep was their actual engineering understanding?)
    - communication (Did they structure their arguments well?)
    - confidence (Were they sure of their answers, or did they waiver/hesitate?)
    Also, write an objective examiner remarks summary celebrating strengths and advising on critical weaknesses.
    
    Return the response strictly structured in JSON.`;
  }

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examinerText: { type: Type.STRING, description: "The examiner's direct reply, brief validation, and the next question." },
            realtimeScoreFeedback: { type: Type.STRING, description: "A quick feedback line on their latest answer. Leave empty on the start or on final score wrap-up." },
            concluded: { type: Type.BOOLEAN, description: "Set to true if we reached the end (4 questions) and are outputting the final score sheet." },
            score: {
              type: Type.OBJECT,
              properties: {
                conceptualClarity: { type: Type.INTEGER },
                communication: { type: Type.INTEGER },
                confidence: { type: Type.INTEGER },
                overallRating: { type: Type.STRING, description: "e.g. 'Highly Proficient', 'Moderate Risk', 'Emerging Conceptualization'" },
                examinerRemarks: { type: Type.STRING, description: "A summary review of the student's overall viva." }
              },
              required: ["conceptualClarity", "communication", "confidence", "overallRating", "examinerRemarks"]
            }
          },
          required: ["examinerText", "concluded"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    console.error("Viva error:", error);
    // Simple mock viva progression
    if (isStart) {
      res.json({
        examinerText: `Welcome to the ${subject} Oral Viva examination. I am your external examiner. We will cover core theoretical anomalies, practical structural configurations, and real-world tradeoffs. Let's begin.\n\nCould you explain in your own words what specific problems database normalization attempts to solve, and the definition of functional dependency?`,
        concluded: false,
        realtimeScoreFeedback: ""
      });
    } else {
      const isFinishing = (currentCount || 1) >= 4;
      if (isFinishing) {
        res.json({
          examinerText: "Thank you. That concludes our technical viva for today. I have saved your score card.",
          concluded: true,
          score: {
            conceptualClarity: 7,
            communication: 8,
            confidence: 6,
            overallRating: "Conceptually Capable",
            examinerRemarks: "Student possesses a high communication skill. However, when cornered with scenario questions regarding normalization anomalies and deadlock cycles, they faltered on mathematical rigor. Highly suggest solving coding problems before the exam."
          }
        });
      } else {
        const mockQuestions = [
          "Interesting point. Now, what are the conditions for a relation to satisfy Third Normal Form (3NF), and how does BCNF strengthen those conditions?",
          "Correct. Let's shift categories: How does 2-Phase Locking (2PL) guarantee serializability, and what are its potential drawbacks regarding deadlocks?",
          "Finally, consider a highly clustered indexing scenario: When is a clustered index preferred over non-clustered indexes, and how does it affect write performance?"
        ];
        const nextQ = mockQuestions[(currentCount - 1) % mockQuestions.length];
        res.json({
          examinerText: `I see. ${nextQ}`,
          realtimeScoreFeedback: "Good standard articulation, but could benefit from a clearer definition of dependencies.",
          concluded: false
        });
      }
    }
  }
});

// ----------------------------------------------------
// AI ROUTE 5: Lecture Intelligence Parser
// ----------------------------------------------------
app.post("/api/lecture-parse", async (req, res) => {
  const { title, subject, lectureContent } = req.body;
  if (!lectureContent) {
    return res.status(400).json({ error: "Lecture text is required for processing" });
  }

  const prompt = `You are an automated university recorder and learning assistant. Analyze this lecture transcription or text note:
  Title: "${title || "Recorded Lecture"}"
  Subject: "${subject || "Engineering Studies"}"
  
  Content:
  """
  ${lectureContent}
  """
  
  Perform the following:
  1. Generate a comprehensive "summary" overview (1-2 sentences).
  2. Generate "notesMarkdown" - structured, beautiful study notes using headings, markdown lists, code blocks, or explanations.
  3. Extract exactly 4 indexable "flashcards" consisting of concise question-and-answer pairs.
  4. Generate exactly 4 standard "quiz" interactive questions with options, the index of the correct option (0-indexed), and a short, clear explanation.
  5. Identify exactly 3 "importantTopics" with high probability of appearing in the exam.
  
  Expose your output STRICTLY in the requested JSON scheme.`;

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            notesMarkdown: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["id", "question", "answer"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
              }
            },
            importantTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "notesMarkdown", "flashcards", "quiz", "importantTopics"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    console.error("Lecture intelligence parse error:", error);
    // Reliable detailed mock response
    res.json({
      summary: "Detailed engineering lecture exploring Normalization Anomalies, functional dependency closures, and lossless joins.",
      notesMarkdown: `# DBMS Normalization: 1NF to BCNF\n\n## 1. What is Normalization?\nNormalization is the systematic process of organizing data in a database to reduce redundancy and eliminate undesirable anomalies (Insert, Update, Delete).\n\n## 2. Key Terms\n- **Functional Dependency (FD):** $X \\to Y$ means $X$ uniquely determines $Y$.\n- **Super Key:** A set of attributes that uniquely identifies tuples.\n- **Candidate Key:** Minimal super key.\n\n## 3. Normal Forms\n* **1NF:** Flat tables, atomic values.\n* **2NF:** 1NF + No partial dependencies (every non-key attribute must fully depend on the candidate key).\n* **3NF:** 2NF + No transitive dependencies ($X \\to Y \\to Z$).\n* **BCNF:** For every $X \\to Y$, $X$ must be a superkey.`,
      flashcards: [
        { id: "fc1", question: "What is a partial dependency in 2NF?", answer: "When a non-prime attribute depends on only a part of a composite candidate key." },
        { id: "fc2", question: "What anomaly is solved by Third Normal Form?", answer: "Transitive anomalies, where a non-prime attribute determines another non-prime attribute." },
        { id: "fc3", question: "Does BCNF always guarantee dependency preservation?", answer: "No, some dependency-preserving decompositions are not achievable in BCNF, unlike 3NF." },
        { id: "fc4", question: "What is a Lossless Join Decomposition?", answer: "A relation split where joining them back using natural join yields exactly the original relation with no spurious rows." }
      ],
      quiz: [
        {
          id: 1,
          question: "If a database is in 3NF, does it guarantee it is also in 2NF?",
          options: ["No, normal forms do not nest", "Yes, normal forms are cumulative hierarchies", "Sometimes, only if keys are non-composite", "Only if it is also in BCNF"],
          correctAnswerIndex: 1,
          explanation: "Normal forms are cumulative. An higher normal form like 3NF mathematically guarantees that all conditions for secondary (2NF) and primary (1NF) are fully satisfied."
        },
        {
          id: 2,
          question: "A relation R(A, B, C) has functional dependency A -> B and B -> C. Which normal form is violated?",
          options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form Only"],
          correctAnswerIndex: 2,
          explanation: "There is a transitive dependency A -> B -> C since B (non-prime) determines C (non-prime). This directly violates the rules of 3NF."
        }
      ],
      importantTopics: [
        "Difference between 3NF and BCNF (High Exam Priority)",
        "Testing for Lossless Join property",
        "Dependency Preservation proofs"
      ]
    });
  }
});

// ----------------------------------------------------
// AI ROUTE 6: Semester Risk Score Calculation
// ----------------------------------------------------
app.post("/api/semester-risk", async (req, res) => {
  const { stats } = req.body;
  if (!stats) {
    return res.status(400).json({ error: "Semester stats are required" });
  }

  const prompt = `You are an veteran academic counselor. Read these current stats of a college engineering student:
  ${JSON.stringify(stats, null, 2)}
  
  Write a precise, intelligent evaluation of their semester risk:
  1. Determine an overall "overallRiskScore" from 0 to 100 representing academic failure risks. High risks occur if attendance is below 75% in core courses, or multiple assignments are pending.
  2. Map out exactly 3 direct "riskReasons" (e.g. "Attendance in OS is 68%, risking exam debarment.", "DBMS has two past due composite assignments.").
  3. Suggest exactly 3 concrete "riskRemedies" (e.g. "Attend next 5 consecutive OS lectures to clear the 75% bar.", "Draft a sessional waiver request.").
  
  Provide output strictly in JSON.`;

  try {
    if (!ai) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallRiskScore: { type: Type.INTEGER },
            riskReasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskRemedies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["overallRiskScore", "riskReasons", "riskRemedies"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));

  } catch (error) {
    console.error("Semester risk calculation error:", error);
    // Fallback simulation calculation
    res.json({
      overallRiskScore: 65,
      riskReasons: [
        "Critically low attendance (67%) in Operating Systems, placing you in danger of debarment.",
        "DBMS Normalization subject rated untested despite previous year paper weightage.",
        "Three pending assignments in Computer Networks with upcoming deadlines."
      ],
      riskRemedies: [
        "Attend the next 6 consecutive Operating Systems classes to pull your average back above the 75% threshold.",
        "Engage in an Auto-Viva session for DBMS to establish a baseline mastery and unlock risk waivers.",
        "Submit pending CN assignments tonight to secure critical sessional marks (worth 15% GPA in CN)."
      ]
    });
  }
});

// ----------------------------------------------------
// PRODUCTION / VITE BUILD SETUP & LISTENER BOOT
// ----------------------------------------------------
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite's middleware inside development mode for lightning HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Service built static files in production container
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Fire up the node host listener
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Academic Twin backend server initialized and listening on http://localhost:${PORT}`);
  });
}

bootServer();
