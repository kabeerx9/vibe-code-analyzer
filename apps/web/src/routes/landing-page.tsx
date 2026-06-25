import { createFileRoute } from "@tanstack/react-router";

import { CodeAuditLandingPage } from "@/components/codeaudit-landing-page";

export const Route = createFileRoute("/landing-page")({
  component: CodeAuditLandingPage,
  head: () => ({
    meta: [
      {
        title: "CodeAudit Landing Page",
      },
      {
        name: "description",
        content: "AI code analysis for teams that ship carefully.",
      },
    ],
  }),
});
