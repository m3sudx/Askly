import { supabase } from "../../config/supabase.js";
import { AppError } from "../../util/error.js";

export async function getStats(tenantId: string, days: number) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const args = { p_tenant: tenantId, p_since: since };

  const [overview, unanswered, downvoted, daily] = await Promise.all([
    supabase.rpc("dashboard_overview", args),
    supabase.rpc("unanswered_questions", { ...args, p_limit: 20 }),
    supabase.rpc("downvoted_answers", { ...args, p_limit: 20 }),
    supabase.rpc("daily_activity", args),
  ]);

  for (const r of [overview, unanswered, downvoted, daily]) {
    if (r.error) throw new AppError(r.error.message, 500);
  }

  const o = (overview.data?.[0] ?? {}) as Record<string, number | string | null>;
  const num = (v: number | string | null | undefined) => Number(v ?? 0);

  const questions = num(o.questions);
  const failed = num(o.failed);
  const answered = num(o.answered);
  const countable = questions - failed; // errors on our side aren't a content problem

  return {
    periodDays: days,
    totals: {
      conversations: num(o.conversations),
      questions,
      answered,
      unanswered: num(o.unanswered),
      failed,
    },
    answerRate: countable > 0 ? Number((answered / countable).toFixed(3)) : null,
    avgLatencyMs: o.avg_latency_ms == null ? null : Math.round(num(o.avg_latency_ms)),
    tokens: { prompt: num(o.prompt_tokens), completion: num(o.completion_tokens) },
    feedback: { up: num(o.thumbs_up), down: num(o.thumbs_down) },
    unansweredQuestions: unanswered.data ?? [],
    downvotedAnswers: downvoted.data ?? [],
    daily: daily.data ?? [],
  };
}