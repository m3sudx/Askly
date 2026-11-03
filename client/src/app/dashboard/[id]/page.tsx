"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLoading } from "@/components/spinner";
import { api } from "@/lib/api";
import type { Stats } from "@/lib/types";

const PERIODS = [7, 30, 90];
const CHART_HEIGHT = 150;

// The server only returns days that had activity, so fill in the empty days
function fillDays(daily: Stats["daily"], days: number) {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const today = new Date();
  const out: Stats["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? { day: key, questions: 0, unanswered: 0 });
  }
  return out;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex-[1_1_200px] rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-stone-900">{value}</p>
      <p className="mt-1 text-sm text-stone-500">{note}</p>
    </div>
  );
}

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<{ key: string; stats?: Stats; error?: string } | null>(null);

  const key = `${id}:${days}`;

  useEffect(() => {
    let cancelled = false;
    api<Stats>(`/api/stats?tenantId=${id}&days=${days}`)
      .then((stats) => {
        if (!cancelled) setResult({ key: `${id}:${days}`, stats });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: `${id}:${days}`, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id, days]);

  const loading = result?.key !== key;
  const stats = loading ? undefined : result?.stats;
  const error = loading ? undefined : result?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-stone-900">Overview</h1>
        <div role="group" aria-label="Time period" className="flex overflow-hidden rounded-lg border border-stone-200 bg-white">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={days === p}
              onClick={() => setDays(p)}
              className={`px-4 py-2.5 text-sm ${
                days === p ? "bg-teal-700 font-semibold text-white" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {p} days
            </button>
          ))}
        </div>
      </div>

      {loading && <PageLoading />}
      {error && <p role="alert" className="text-red-700">{error}</p>}

      {stats && <Content stats={stats} days={days} />}
    </div>
  );
}

function Content({ stats, days }: { stats: Stats; days: number }) {
  const { totals, feedback } = stats;
  const bars = fillDays(stats.daily, days);
  const max = Math.max(1, ...bars.map((b) => b.questions));
  const ratings = feedback.up + feedback.down;

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Questions"
          value={String(totals.questions)}
          note={`${totals.conversations} conversations`}
        />
        <StatCard
          label="Answer rate"
          value={stats.answerRate === null ? "–" : `${Math.round(stats.answerRate * 100)}%`}
          note={`${totals.answered} answered · ${totals.unanswered} not found`}
        />
        <StatCard
          label="Average response"
          value={stats.avgLatencyMs === null ? "–" : `${(stats.avgLatencyMs / 1000).toFixed(1)} s`}
          note="Search plus answer"
        />
        <StatCard
          label="Helpful ratings"
          value={ratings === 0 ? "–" : `${Math.round((feedback.up / ratings) * 100)}%`}
          note={`${feedback.up} up · ${feedback.down} down`}
        />
      </div>

      <section aria-label="Questions per day" className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-900">Questions per day</h2>
          <div className="flex gap-4 text-sm text-stone-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-sm bg-teal-700" />
              Answered
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-sm bg-amber-600" />
              Not found
            </span>
          </div>
        </div>

        <div
          role="img"
          aria-label={`Bar chart of questions per day over the last ${days} days. ${totals.questions} questions in total.`}
          className="mt-5 flex items-end gap-px border-b border-stone-200"
          style={{ height: CHART_HEIGHT }}
        >
          {bars.map((b) => {
            const answered = b.questions - b.unanswered; // includes the rare failed replies
            return (
              <div
                key={b.day}
                title={`${b.day}: ${b.questions} questions, ${b.unanswered} not found`}
                className="flex min-w-0 flex-1 flex-col justify-end gap-px"
              >
                <div className="rounded-t-sm bg-amber-600" style={{ height: (b.unanswered / max) * CHART_HEIGHT }} />
                <div className="rounded-t-sm bg-teal-700" style={{ height: (answered / max) * CHART_HEIGHT }} />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-stone-500">
          <span>{bars[0].day}</span>
          <span>{bars[bars.length - 1].day}</span>
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-4">
        <section aria-label="Unanswered questions" className="min-w-0 flex-[1_1_360px] rounded-xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Unanswered questions</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Needs attention
            </span>
          </div>
          <p className="mt-1.5 text-sm text-stone-500">
            Visitors asked these, but your documents do not cover them yet.
          </p>
          {stats.unansweredQuestions.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">Nothing here. Every question was answered.</p>
          ) : (
            <ul className="mt-4">
              {stats.unansweredQuestions.map((q) => (
                <li key={`${q.conversation_id}-${q.asked_at}`} className="border-t border-stone-100 py-3.5">
                  <p className="font-medium text-stone-900">{q.question}</p>
                  <p className="text-sm text-stone-500">{formatDate(q.asked_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Downvoted answers" className="min-w-0 flex-[1_1_360px] rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Downvoted answers</h2>
          <p className="mt-1.5 text-sm text-stone-500">Answers visitors marked as not helpful.</p>
          {stats.downvotedAnswers.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">No downvotes in this period.</p>
          ) : (
            <ul className="mt-4">
              {stats.downvotedAnswers.map((a) => (
                <li key={a.message_id} className="border-t border-stone-100 py-3.5">
                  <p className="text-sm text-stone-500">Visitor asked</p>
                  <p className="font-medium text-stone-900">{a.question}</p>
                  <p className="mt-2 rounded-lg bg-[#faf8f5] px-3 py-2.5 text-sm text-stone-700">{a.answer}</p>
                  {a.comment && (
                    <p className="mt-2 text-sm text-amber-800">Comment: &quot;{a.comment}&quot;</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}