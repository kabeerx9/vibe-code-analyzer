import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  FileCode,
  GitBranch,
  GitPullRequest,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@codeaudit/ui/lib/utils";

import { StatusPill, familyTheme } from "@/components/family-primitives";

const auditStats = [
  { label: "Quality score", value: "92", tone: "text-[var(--family-green)]" },
  { label: "Critical risks", value: "0", tone: "text-[var(--family-green)]" },
  { label: "PR checks", value: "18", tone: "text-[var(--family-blue-deep)]" },
];

const heroFindings = [
  {
    title: "Auth middleware bypass",
    meta: "apps/server/src/auth.ts",
    severity: "High",
    tone: "red",
  },
  {
    title: "N+1 repository query",
    meta: "apps/web/src/routes/home.tsx",
    severity: "Medium",
    tone: "orange",
  },
  {
    title: "Dead branch in validation",
    meta: "packages/contracts/src/index.ts",
    severity: "Low",
    tone: "green",
  },
] as const;

const featureCards = [
  {
    title: "Repository intelligence",
    text: "Track code health, risk hotspots, and recent analysis runs from one compact workspace.",
    icon: FileCode,
    tone: "bg-[var(--family-blue)]",
  },
  {
    title: "PR review signals",
    text: "Surface issues before merge with plain-language context and suggested next steps.",
    icon: GitPullRequest,
    tone: "bg-[var(--family-green)]",
  },
  {
    title: "Security scanning",
    text: "Prioritize risky changes with severity, ownership, and file-level evidence.",
    icon: ShieldCheck,
    tone: "bg-[var(--family-red)]",
  },
];

const workflowSteps = [
  "Connect a repository",
  "Run the first analysis",
  "Review prioritized findings",
  "Ship with quality gates",
];

const proofRows = [
  { label: "Average review time", value: "12 min", detail: "from push to summary" },
  { label: "Signal density", value: "4.8x", detail: "fewer low-value findings" },
  { label: "Supported workflows", value: "API + UI", detail: "for product teams" },
];

export function CodeAuditLandingPage() {
  return (
    <div style={familyTheme} className="bg-[var(--family-canvas)] text-[var(--family-ink)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <section className="grid min-h-[calc(100vh-156px)] items-center gap-10 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:py-10">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              CodeAudit platform
            </p>
            <h1 className="mt-4 max-w-2xl text-[48px] font-bold leading-[1.04] tracking-normal max-sm:text-[38px]">
              AI code analysis for teams that ship carefully.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              Turn every repository into a readable risk map: security findings, quality signals,
              PR context, and release confidence in one focused workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/sign-up"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--family-ink)] px-5 text-sm font-bold text-white hover:bg-black"
              >
                Start analyzing
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--family-line)] bg-white px-5 text-sm font-bold text-[var(--family-ink)] hover:bg-[var(--family-soft)]"
              >
                Sign in
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <StatusPill tone="green">Secure by default</StatusPill>
              <StatusPill tone="blue">PR-ready summaries</StatusPill>
              <StatusPill tone="orange">Actionable findings</StatusPill>
            </div>
          </div>

          <div className="relative lg:-mr-8">
            <AuditDashboardMockup />
            <div className="absolute -bottom-5 left-5 hidden rounded-[8px] border border-[var(--family-line)] bg-white p-4 shadow-[0_8px_28px_rgb(22_22_22/0.06)] sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[var(--family-green)]/12 text-[var(--family-green)]">
                  <Check className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Ready to merge</p>
                  <p className="text-xs font-bold text-[var(--family-muted)]">4 checks passed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[8px] border border-[var(--family-line)] bg-white p-5"
              >
                <span className={cn("grid size-11 place-items-center rounded-full text-white", feature.tone)}>
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 text-[20px] font-bold leading-[1.2]">{feature.title}</h2>
                <p className="mt-3 text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
                  {feature.text}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 border-y border-[var(--family-line)] py-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
              Workflow
            </p>
            <h2 className="mt-2 max-w-md text-[32px] font-bold leading-[1.08]">
              From connected repo to merge decision.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              CodeAudit keeps the loop short: run analysis, read the evidence, and turn findings
              into clear engineering work.
            </p>
          </div>
          <div className="grid gap-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center justify-between gap-4 rounded-[8px] border border-[var(--family-line)] bg-white p-4"
              >
                <span className="flex items-center gap-3 text-sm font-bold">
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--family-ink)] text-xs text-white">
                    {index + 1}
                  </span>
                  {step}
                </span>
                {index < workflowSteps.length - 1 ? (
                  <ChevronRight className="size-4 text-[var(--family-muted)]" />
                ) : (
                  <Check className="size-4 text-[var(--family-green)]" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-red)]">
              Finding detail
            </p>
            <div className="mt-5 rounded-[8px] bg-[var(--family-canvas)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-bold leading-[1.2]">Unsafe token verification</h2>
                  <p className="mt-2 text-sm font-medium text-[var(--family-muted)]">
                    apps/server/src/services/auth-service.ts
                  </p>
                </div>
                <StatusPill tone="red">Critical</StatusPill>
              </div>
              <p className="mt-4 text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
                The JWT verifier accepts unsigned payloads when the provider metadata request fails.
                Require a successful key lookup before decoding claims.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Recommendation label="Impact" value="Account takeover risk" />
                <Recommendation label="Fix" value="Fail closed on key fetch" />
              </div>
            </div>
          </article>

          <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              Proof points
            </p>
            <div className="mt-4 divide-y divide-[var(--family-line)]">
              {proofRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                  <div>
                    <p className="text-sm font-bold">{row.label}</p>
                    <p className="mt-1 text-sm font-medium text-[var(--family-muted)]">{row.detail}</p>
                  </div>
                  <p className="text-[20px] font-bold leading-[1.2]">{row.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 border-t border-[var(--family-line)] py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-orange)]">
              Ready when your repo is
            </p>
            <h2 className="mt-2 text-[32px] font-bold leading-[1.08]">Start with one repository.</h2>
            <p className="mt-3 max-w-2xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              Connect a codebase, run an analysis, and see exactly where engineering attention is needed.
            </p>
          </div>
          <Link
            to="/sign-up"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--family-ink)] px-5 text-sm font-bold text-white hover:bg-black"
          >
            Create account
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

export function AuditDashboardMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-[var(--family-line)] bg-[var(--family-ink)] p-3 shadow-[0_20px_48px_rgb(22_22_22/0.16)]",
        compact ? "max-w-xl" : "w-full",
      )}
    >
      <div className="rounded-[6px] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--family-line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--family-blue)] text-white">
              <Radar className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">codeaudit/web</p>
              <p className="text-xs font-bold text-[var(--family-muted)]">main · analyzed 4m ago</p>
            </div>
          </div>
          <StatusPill tone="green">Healthy</StatusPill>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {auditStats.map((stat) => (
            <div key={stat.label} className="rounded-[8px] bg-[var(--family-canvas)] p-3">
              <p className="text-xs font-bold text-[var(--family-muted)]">{stat.label}</p>
              <p className={cn("mt-1 text-[28px] font-bold leading-none", stat.tone)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          {heroFindings.map((finding) => (
            <div
              key={finding.title}
              className="grid gap-3 rounded-[8px] border border-[var(--family-line)] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--family-soft)]">
                  {finding.tone === "red" ? (
                    <AlertTriangle className="size-4 text-[var(--family-red)]" />
                  ) : finding.tone === "orange" ? (
                    <Zap className="size-4 text-[var(--family-orange)]" />
                  ) : (
                    <Check className="size-4 text-[var(--family-green)]" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-bold">{finding.title}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--family-muted)]">{finding.meta}</p>
                </div>
              </div>
              <StatusPill tone={finding.tone}>{finding.severity}</StatusPill>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 rounded-[8px] bg-[var(--family-canvas)] p-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--family-blue)]/12 text-[var(--family-blue-deep)]">
              <GitBranch className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold">Release gate</p>
              <p className="text-xs font-bold text-[var(--family-muted)]">2 approvals required</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--family-green)]/12 text-[var(--family-green)]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold">AI summary</p>
              <p className="text-xs font-bold text-[var(--family-muted)]">Action list generated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Recommendation({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--family-line)] bg-white p-4">
      <p className="text-xs font-bold uppercase text-[var(--family-muted)]">{label}</p>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
