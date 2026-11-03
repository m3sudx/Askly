export type Tenant = {
  id: string;
  name: string;
  public_key: string;
  allowed_domains: string[];
  default_language: "en" | "am";
  created_at: string;
};

export type Stats = {
  periodDays: number;
  totals: {
    conversations: number;
    questions: number;
    answered: number;
    unanswered: number;
    failed: number;
  };
  answerRate: number | null;
  avgLatencyMs: number | null;
  tokens: { prompt: number; completion: number };
  feedback: { up: number; down: number };
  unansweredQuestions: { question: string; asked_at: string; conversation_id: string }[];
  downvotedAnswers: {
    message_id: string;
    question: string;
    answer: string;
    comment: string | null;
    rated_at: string;
  }[];
  daily: { day: string; questions: number; unanswered: number }[];
};

export type Doc = {
  id: string;
  source_type: "url" | "pdf" | "text";
  source_url: string | null;
  title: string | null;
  status: "pending" | "processing" | "ready" | "failed";
  error: string | null;
  created_at: string;
};