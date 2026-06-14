import { useAuth } from "@clerk/react";
import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@codeaudit/ui/components/button";
import { cn } from "@codeaudit/ui/lib/utils";

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container-marketing flex h-16 items-center justify-between">
        <Link
          to={isSignedIn ? "/home" : "/"}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          CodeAudit
        </Link>
        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              to="/home"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Home
            </Link>
          ) : (
            <>
              <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Sign in
              </Link>
              <Link to="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
