import { createFileRoute } from "@tanstack/react-router";

import { DesignSystemPage } from "@/components/family-design-system";

export const Route = createFileRoute("/design-system")({
  component: DesignSystemPage,
  head: () => ({
    meta: [
      {
        title: "Family Design System | CodeAudit",
      },
    ],
  }),
});
