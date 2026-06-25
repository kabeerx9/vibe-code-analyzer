import { UserButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Check,
  GitBranch,
  GitPullRequest,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { RepositoriesPanel } from "@/components/repositories";
import { StatusPill, familyTheme } from "@/components/family-primitives";
import { ApiError, getMe, type MeResponse } from "@/lib/api";

export const Route = createFileRoute("/_auth/home")({
  component: HomePage,
});

const workspaceMetrics = [
  { label: "Quality score", value: "92", detail: "Latest baseline", tone: "green" },
  { label: "Open findings", value: "18", detail: "Across tracked repos", tone: "orange" },
  { label: "Critical issues", value: "0", detail: "Release gate clear", tone: "green" },
  { label: "PR summaries", value: "24", detail: "Generated this month", tone: "blue" },
] as const;

const reviewQueue = [
  {
    title: "Authentication flow",
    path: "apps/server/src/auth.ts",
    status: "Ready",
    tone: "green",
    icon: ShieldCheck,
  },
  {
    title: "Repository imports",
    path: "apps/web/src/components/repositories.tsx",
    status: "Review",
    tone: "orange",
    icon: GitPullRequest,
  },
  {
    title: "Release guardrails",
    path: "packages/contracts/src/repositories.ts",
    status: "Healthy",
    tone: "blue",
    icon: GitBranch,
  },
] as const;

function HomePage() {
  const { user } = useUser();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Failed to load account");
      });
  }, []);

  const name =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "CodeAudit user";

  return (
    <div style={familyTheme} className="bg-[var(--family-canvas)] text-[var(--family-ink)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <section className="grid gap-6 rounded-[8px] border border-[var(--family-line)] bg-white p-5 shadow-[0_8px_28px_rgb(22_22_22/0.06)] lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              Command center
            </p>
            <h1 className="mt-3 max-w-2xl text-[48px] font-bold leading-[1.04] tracking-normal max-sm:text-[38px]">
              Code intelligence for the next release.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              Prioritize repository risk, review AI-generated findings, and keep release gates
              visible without leaving the workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <StatusPill tone="green">Release gate clear</StatusPill>
              <StatusPill tone="blue">PR context ready</StatusPill>
              <StatusPill tone="orange">18 findings queued</StatusPill>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4 lg:min-w-80">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--family-muted)]">Active account</p>
              <p className="mt-2 text-lg font-bold">{name}</p>
              <p className="mt-1 text-sm font-medium text-[var(--family-muted)]">
                {me?.email ?? "Loading account..."}
              </p>
              {error ? <p className="mt-2 text-sm font-bold text-[var(--family-red)]">{error}</p> : null}
            </div>
            <UserButton />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workspaceMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[8px] border border-[var(--family-line)] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-[var(--family-muted)]">{metric.label}</p>
                {metric.tone === "green" ? (
                  <Check className="size-4 text-[var(--family-green)]" />
                ) : metric.tone === "blue" ? (
                  <Sparkles className="size-4 text-[var(--family-blue-deep)]" />
                ) : (
                  <AlertTriangle className="size-4 text-[var(--family-orange)]" />
                )}
              </div>
              <p className="mt-4 text-[40px] font-bold leading-none">{metric.value}</p>
              <p className="mt-2 text-sm font-medium text-[var(--family-muted)]">{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
                  Review queue
                </p>
                <h2 className="mt-1 text-[20px] font-bold leading-[1.2]">Work that needs attention</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-[var(--family-green)]/12 text-[var(--family-green)]">
                <Activity className="size-5" />
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {reviewQueue.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="grid gap-3 rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[var(--family-blue-deep)]">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="mt-1 text-xs font-bold text-[var(--family-muted)]">{item.path}</p>
                      </div>
                    </div>
                    <StatusPill tone={item.tone}>{item.status}</StatusPill>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[8px] border border-[var(--family-line)] bg-[var(--family-ink)] p-3 shadow-[0_20px_48px_rgb(22_22_22/0.16)]">
            <div className="rounded-[6px] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--family-blue)] text-white">
                    <Radar className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Release snapshot</p>
                    <p className="text-xs font-bold text-[var(--family-muted)]">Generated from latest analysis</p>
                  </div>
                </div>
                <StatusPill tone="green">Stable</StatusPill>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["API", "Web", "Contracts"].map((item, index) => (
                  <div key={item} className="rounded-[8px] bg-[var(--family-canvas)] p-4">
                    <p className="text-xs font-bold text-[var(--family-muted)]">{item}</p>
                    <p className="mt-2 text-[28px] font-bold leading-none">{index === 1 ? "88" : "94"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[8px] border border-[var(--family-line)] p-4">
                <p className="text-sm font-bold">Next best action</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[var(--family-muted)]">
                  Review medium-severity performance findings before cutting the next web release.
                </p>
              </div>
            </div>
          </article>
        </section>

        <RepositoriesPanel />
      </div>
    </div>
  );
}
