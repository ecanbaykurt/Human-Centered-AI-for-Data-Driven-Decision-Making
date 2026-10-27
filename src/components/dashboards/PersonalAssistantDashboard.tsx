"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Plus } from "lucide-react";
import type { Challenge } from "@/data/challenges";
import {
  personalAssistantEmails,
  personalAssistantEvents,
} from "@/data/sampleData";
import DashboardShell, { Panel, StatusPill } from "./DashboardShell";

const TASK_KEY = "decisionlab-personal-tasks-v1";

type Task = { id: string; text: string; done: boolean };

const DEFAULT_TASKS: Task[] = [
  { id: "seed-1", text: "Review project update email", done: false },
  { id: "seed-2", text: "Prep partner sync notes", done: false },
  { id: "seed-3", text: "Confirm workshop materials", done: false },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, i) => {
        if (typeof item === "string") {
          return { id: `legacy-${i}`, text: item, done: false };
        }
        if (
          item &&
          typeof item === "object" &&
          "text" in item &&
          typeof (item as Task).text === "string"
        ) {
          const t = item as Task;
          return {
            id: t.id || `t-${i}`,
            text: t.text,
            done: Boolean(t.done),
          };
        }
        return null;
      })
      .filter((t): t is Task => Boolean(t));
  } catch {
    return [];
  }
}

export default function PersonalAssistantDashboard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Seed defaults only on first visit (no stored key yet).
    if (localStorage.getItem(TASK_KEY) === null) {
      setTasks(DEFAULT_TASKS);
    } else {
      setTasks(loadTasks());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  function addTask(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, text, done: false },
    ]);
    setDraft("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  const needsReply = personalAssistantEmails.filter(
    (m) => m.status === "Needs reply",
  ).length;

  return (
    <DashboardShell
      challenge={challenge}
      title="Personal work assistant"
      banner="Demo mode. The inbox and calendar below are fictional. No accounts are connected and no AI service is running. The focus list is saved only in this browser."
    >
      <section className="mb-6 rounded-[18px] border border-border bg-gradient-to-br from-soft-purple via-surface to-[#f8fff0] p-6 sm:p-8">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden />
          Your workday, clearer
        </div>
        <h2 className="mt-3 text-[clamp(36px,6vw,56px)] font-extrabold tracking-[-0.05em] text-ink">
          Good morning.
        </h2>
        <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-muted">
          {challenge.problem} Today: {needsReply} messages need a reply and{" "}
          {personalAssistantEvents.length} meetings are on the calendar.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel tag="Inbox / sample" title="Messages to review">
          <ul className="divide-y divide-border-soft">
            {personalAssistantEmails.map((email) => (
              <li
                key={email.id}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">{email.subject}</span>
                    {email.priority === "high" ? (
                      <StatusPill tone="danger">High</StatusPill>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {email.from} · {email.preview}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-soft">
                    {formatTime(email.receivedAt)}
                  </p>
                </div>
                <StatusPill
                  tone={
                    email.status === "Needs reply"
                      ? "warn"
                      : email.status === "Archived"
                        ? "ok"
                        : "default"
                  }
                >
                  {email.status}
                </StatusPill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel tag="Calendar / sample" title="Upcoming today">
          <ul className="divide-y divide-border-soft">
            {personalAssistantEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-bold text-ink">{ev.title}</div>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {formatTime(ev.startsAt)} – {formatTime(ev.endsAt)} ·{" "}
                    {ev.location}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-soft">
                    With {ev.with}
                  </p>
                </div>
                <StatusPill tone="lime">{ev.status}</StatusPill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel tag="Focus list" title="Priorities">
          <form onSubmit={addTask} className="mb-4 flex gap-2">
            <input
              className="field-control flex-1"
              placeholder="Add a priority"
              maxLength={120}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="New priority"
            />
            <button type="submit" className="btn-primary shrink-0 px-4 py-0">
              <Plus size={16} aria-hidden />
              Add
            </button>
          </form>
          <ul className="space-y-2">
            {tasks.length === 0 ? (
              <li className="text-[13px] text-muted">No priorities yet.</li>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-[10px] border border-border-soft bg-surface-input px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-pressed={task.done}
                    aria-label={
                      task.done ? `Mark “${task.text}” open` : `Complete “${task.text}”`
                    }
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      task.done
                        ? "border-purple bg-purple text-white"
                        : "border-border bg-surface text-transparent hover:border-purple"
                    }`}
                  >
                    <Check size={14} />
                  </button>
                  <span
                    className={`flex-1 text-[14px] ${
                      task.done ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {task.text}
                  </span>
                </li>
              ))
            )}
          </ul>
          <p className="mt-3 text-[12px] text-muted-soft">
            Saved in this browser only ({TASK_KEY}).
          </p>
        </Panel>

        <Panel tag="Next steps" title="Make it real">
          <p className="text-[14px] leading-relaxed text-muted">
            Start with fictional data. Before connecting mail or calendar, review
            OAuth scopes, consent, and server-side token storage. Never put
            secrets in client code.
          </p>
          <ul className="mt-4 space-y-2 text-[13px] text-ink">
            <li className="flex gap-2">
              <span className="text-purple">→</span>
              Keep the morning view useful with sample messages first
            </li>
            <li className="flex gap-2">
              <span className="text-purple">→</span>
              Design read-only access before any send or write actions
            </li>
            <li className="flex gap-2">
              <span className="text-purple">→</span>
              Require explicit confirmation for drafts that leave the device
            </li>
          </ul>
          <a
            href="https://developers.google.com/workspace/guides/create-credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-5 inline-flex"
          >
            Google Workspace credentials docs ↗
          </a>
        </Panel>
      </div>
    </DashboardShell>
  );
}
