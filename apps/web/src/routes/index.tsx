import { SignIn, useAuth } from "@clerk/react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

import { clerkAppearance } from "@/lib/clerk-appearance";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-hero-display tracking-tight text-foreground max-md:text-heading-lg">
            CodeAudit
          </h1>
          <p className="text-subtitle text-steel">Intelligence for every codebase.</p>
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignIn
            routing="path"
            path="/"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/home"
            appearance={clerkAppearance}
          />
        </div>
        <p className="text-sm text-steel">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
