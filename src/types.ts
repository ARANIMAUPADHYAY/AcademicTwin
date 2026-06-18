/**
 * Types modeling the Academic Twin - Student Brain State
 */

export interface TopicNode {
  id: string;
  name: string;
  confidence: number; // Student's rated confidence: 1-10 (0 means unrated)
  actualMastery: number; // Evaluated mastery: 1-10 (0 means not tested yet)
  status: 'strong' | 'weak' | 'untested';
  category: string; // e.g. "DBMS", "OS", "CN"
  lastTested?: string;
  details?: string;
}

export interface KnowledgeMap {
  [subject: string]: {
    name: string;
    topics: TopicNode[];
  };
}

export interface ConfidenceQuestion {
  id: number;
  question: string;
  idealKeypoints: string[];
}

export interface ConfidenceTestState {
  subject: string;
  topicId: string;
  topicName: string;
  ratedConfidence: number;
  questions: ConfidenceQuestion[];
  currentQuestionIndex: number;
  answers: string[];
  isSubmittingAnswers: boolean;
  testResult?: {
    actualMastery: number;
    gap: number; // ratedConfidence - actualMastery
    explanation: string;
    detailedFeedback: string[];
  };
}

export interface VivaMessage {
  sender: 'examiner' | 'student';
  text: string;
  timestamp: string;
  scoreFeedback?: string; // Optional real-time feedback on student conceptual clarity
}

export interface VivaState {
  subject: string;
  status: 'idle' | 'questioning' | 'completed';
  messages: VivaMessage[];
  currentQuestionCount: number;
  maxQuestions: number;
  score?: {
    conceptualClarity: number; // 1-10
    communication: number; // 1-10
    confidence: number; // 1-10
    overallRating: string;
    examinerRemarks: string;
  };
}

export interface ExamWarRoomState {
  examName: string;
  daysRemaining: number;
  syllabusCompletionProbability: number; // 0-100 percentage
  highRiskTopics: string[];
  safeTopics: string[];
  criticalActions: string[];
  estimatedStudyHoursRequired: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LectureData {
  id: string;
  title: string;
  date: string;
  subject: string;
  summary: string;
  notesMarkdown: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  importantTopics: string[];
  transcribedText?: string;
}

export interface SemesterManagerStats {
  attendance: {
    [subject: string]: {
      name: string;
      percentage: number;
      attended: number;
      total: number;
      minRequired: number;
      bunkAllowance: number; // How many classes they can bunk safely
    };
  };
  assignments: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    weight: number; // Percentage impact on GPA
  }[];
  exams: {
    id: string;
    title: string;
    subject: string;
    date: string;
    weight: number;
  }[];
  overallRiskScore: number; // Overall risk of academic damage/failure (0-100%)
  riskReasons: string[];
  riskRemedies: string[];
}
