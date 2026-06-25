import { useAuth, useSignUp } from "@clerk/react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Check, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@codeaudit/ui/components/button";

import { AuditDashboardMockup } from "@/components/codeaudit-landing-page";
import { StatusPill, familyTheme } from "@/components/family-primitives";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { errors, fetchStatus, signUp } = useSignUp();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div style={familyTheme} className="flex min-h-[60vh] items-center justify-center bg-[var(--family-canvas)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--family-line)] border-t-[var(--family-ink)]" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/home" />;
  }

  async function handleGoogleSignUp() {
    if (!signUp) {
      return;
    }

    setIsRedirecting(true);
    setAuthError(null);

    try {
      const result = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: "/home",
        redirectCallbackUrl: "/sso-callback",
      });

      if (result.error) {
        setIsRedirecting(false);
        setAuthError(result.error.message);
      }
    } catch (err: unknown) {
      setIsRedirecting(false);
      setAuthError(err instanceof Error ? err.message : "Google sign-up failed");
    }
  }

  return (
    <div style={familyTheme} className="bg-[var(--family-canvas)] text-[var(--family-ink)]">
      <div className="mx-auto grid min-h-[calc(100vh-65px)] w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-12">
        <section className="flex flex-col justify-between gap-8 rounded-[8px] border border-[var(--family-line)] bg-white p-5 shadow-[0_8px_28px_rgb(22_22_22/0.06)] sm:p-8">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
              Start CodeAudit
            </p>
            <h1 className="mt-4 max-w-2xl text-[48px] font-bold leading-[1.04] tracking-normal max-sm:text-[38px]">
              Create the workspace your release reviews deserve.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              Use Google to create an account, connect a repository, and turn every analysis run
              into a clear action list.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <StatusPill tone="green">Fast setup</StatusPill>
              <StatusPill tone="blue">Repository analysis</StatusPill>
              <StatusPill tone="orange">Release signals</StatusPill>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Google login", icon: Sparkles },
                { label: "Risk summary", icon: ShieldCheck },
                { label: "PR workflow", icon: GitPullRequest },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4"
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-white text-[var(--family-blue-deep)]">
                      <Icon className="size-4" />
                    </span>
                    <p className="mt-3 text-sm font-bold">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <AuditDashboardMockup compact />
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[8px] border border-[var(--family-line)] bg-white p-5 shadow-[0_20px_48px_rgb(22_22_22/0.08)] sm:p-6">
            <div className="mb-6">
              <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
                Create account
              </p>
              <h2 className="mt-2 text-[32px] font-bold leading-[1.08]">Join CodeAudit.</h2>
              <p className="mt-3 text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
                Continue with Google to start your workspace.
              </p>
            </div>
            <Button
              type="button"
              disabled={fetchStatus === "fetching" || isRedirecting}
              onClick={() => void handleGoogleSignUp()}
              className="h-12 w-full gap-3 rounded-full border border-[var(--family-line)] bg-white px-5 text-sm font-bold text-[var(--family-ink)] shadow-[0_8px_28px_rgb(22_22_22/0.04)] hover:bg-[var(--family-soft)] disabled:opacity-60"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[var(--family-ink)] text-xs font-bold text-white">
                G
              </span>
              {isRedirecting ? "Opening Google..." : "Continue with Google"}
            </Button>
            {authError ?? errors.global?.[0]?.message ? (
              <div className="mt-4 rounded-[8px] border border-[var(--family-red)]/25 bg-[var(--family-red)]/10 p-3">
                <p className="text-sm font-bold text-[var(--family-red)]">
                  {authError ?? errors.global?.[0]?.message}
                </p>
              </div>
            ) : null}
            <div id="clerk-captcha" />
            <div className="mt-6 border-t border-[var(--family-line)] pt-5">
              <p className="text-sm font-medium text-[var(--family-muted)]">
                Already have an account?{" "}
                <Link to="/" className="font-bold text-[var(--family-ink)] underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
              <Link
                to="/landing-page"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--family-blue-deep)]"
              >
                See product tour
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
