"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Doc } from "@/lib/types";

const STATUS_STYLES: Record<Doc["status"], string> = {
  ready: "bg-teal-50 text-teal-800",
  processing: "bg-amber-100 text-amber-800",
  pending: "bg-stone-100 text-stone-700",
  failed: "bg-red-50 text-red-800",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();

  // the list
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [listError, setListError] = useState("");
  const [reload, setReload] = useState(0);

  // the add form
  const [mode, setMode] = useState<"text" | "url">("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<Doc[]>(`/api/documents?tenantId=${id}`)
      .then((list) => {
        if (cancelled) return;
        setDocs(list);
        setListError("");
      })
      .catch((e: Error) => {
        if (!cancelled) setListError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reload]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setAdding(true);

    const cleanTitle = title.trim() || undefined;
    const body =
      mode === "text"
        ? { tenantId: id, sourceType: "text", title: cleanTitle, content: text }
        : { tenantId: id, sourceType: "url", title: cleanTitle, url };

    try {
      await api<Doc>("/api/documents", { method: "POST", body: JSON.stringify(body) });
      setTitle("");
      setText("");
      setUrl("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
      setReload((n) => n + 1); // refresh the list either way: a failed document still appears
    }
  }

  async function handleDelete(doc: Doc) {
    const name = doc.title ?? doc.source_url ?? "this document";
    if (!window.confirm(`Delete "${name}"? The assistant will stop using its content.`)) return;
    try {
      await api<void>(`/api/documents/${doc.id}?tenantId=${id}`, { method: "DELETE" });
      setReload((n) => n + 1);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Documents</h1>
        <p className="mt-1 text-stone-500">
          Add text or a web page. Askly splits it into passages the assistant can search.
        </p>
      </div>

      <form onSubmit={handleAdd} className="rounded-xl border border-stone-200 bg-white p-6">
        <div role="group" aria-label="Source type" className="inline-flex overflow-hidden rounded-lg border border-stone-200">
          {(["text", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`px-4 py-2.5 text-sm ${
                mode === m ? "bg-teal-700 font-semibold text-white" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {m === "text" ? "Paste text" : "Web page link"}
            </button>
          ))}
        </div>

        <label htmlFor="doc-title" className="mt-5 block text-sm font-medium text-stone-700">
          Title <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <input
          id="doc-title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Opening hours and prices"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
        />

        {mode === "text" ? (
          <>
            <label htmlFor="doc-text" className="mt-4 block text-sm font-medium text-stone-700">
              Text
            </label>
            <textarea
              id="doc-text"
              required
              rows={8}
              maxLength={100000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
            />
          </>
        ) : (
          <>
            <label htmlFor="doc-url" className="mt-4 block text-sm font-medium text-stone-700">
              Page address
            </label>
            <input
              id="doc-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/about"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
            />
          </>
        )}

        {formError && <p role="alert" className="mt-4 text-sm text-red-700">{formError}</p>}

        <button
          type="submit"
          disabled={adding}
          className="mt-5 rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {adding ? "Adding… this can take a few seconds" : "Add document"}
        </button>
      </form>

      <section aria-label="Your documents" className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Your documents</h2>

        {listError && <p role="alert" className="mt-3 text-sm text-red-700">{listError}</p>}
        {!listError && docs === null && <p className="mt-3 text-stone-600">Loading…</p>}
        {docs?.length === 0 && (
          <p className="mt-3 text-stone-600">No documents yet. Add your first one above.</p>
        )}

        <ul className="mt-2">
          {docs?.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 py-4 first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {d.title ?? d.source_url ?? "Untitled"}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-stone-500">
                  <span>{d.source_type === "url" ? "Web page" : "Text"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(d.created_at)}</span>
                </p>
                {d.source_url && (
                  <a
                    href={d.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-sm text-teal-700 hover:underline"
                  >
                    {d.source_url}
                  </a>
                )}
                {d.status === "failed" && d.error && (
                  <p className="mt-1 text-sm text-red-700">{d.error}</p>
                )}
              </div>

              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[d.status]}`}>
                {d.status}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(d)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}