import { UserButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ApiError, getMe, type MeResponse } from "@/lib/api";
import { ExampleProjectsPanel } from "@/components/example-projects";

export const Route = createFileRoute("/_auth/home")({
  component: HomePage,
});

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
    "there";

  return (
    <div className="container-marketing flex flex-col gap-10 py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-heading-lg tracking-tight text-foreground">
            Welcome back, {name}
          </h1>
          <p className="text-subtitle text-steel">
            Your AI-powered code analysis workspace.
          </p>
        </div>
        <UserButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-4xl bg-brand-coral p-8 text-white">
          <p className="text-display-lg tracking-tight">Analyze</p>
          <p className="mt-2 text-sm text-white/80">Deep code intelligence</p>
        </div>
        <div className="rounded-4xl bg-brand-magenta p-8 text-white">
          <p className="text-heading-lg tracking-tight">Review</p>
          <p className="mt-2 text-sm text-white/80">Automated PR insights</p>
        </div>
        <div className="rounded-4xl bg-brand-blue p-8 text-white">
          <p className="text-heading-lg tracking-tight">Secure</p>
          <p className="mt-2 text-sm text-white/80">Security vulnerability scan</p>
        </div>
        <div className="rounded-4xl bg-brand-purple p-8 text-white">
          <p className="text-heading-lg tracking-tight">Ship</p>
          <p className="mt-2 text-sm text-white/80">Quality gates &amp; metrics</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-body-sm-medium text-steel">Signed-in account</p>
        <p className="mt-1 text-base font-semibold text-foreground">{me?.email ?? "Loading..."}</p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <ExampleProjectsPanel />
    </div>
  );
}
