# AI-Powered Code Audit SaaS Plan

## Product Thesis

Build a SaaS product that lets a developer submit a GitHub repository and receive a launch-readiness audit that feels like a senior engineer reviewed the project before release.

The wedge is not "AI scans your code." The stronger positioning is:

> Turn noisy static-analysis output into a prioritized launch-readiness review with clear fixes.

The first customers are developers, indie hackers, small agencies, and startup teams shipping AI-generated or quickly assembled applications. They need to know what is risky before they put the app in front of users.

## Target Customer

Primary:

- Indie hackers building SaaS products quickly.
- Developers using AI coding tools heavily.
- Agencies that want a pre-delivery quality report for client projects.
- Non-senior technical founders who need a second set of eyes.

Secondary:

- Startup teams before launch.
- Freelancers validating handoff quality.
- Engineering managers reviewing outsourced work.

## Core User Promise

After submitting a repository, the user should understand:

1. Whether the application is safe enough to launch.
2. Which issues matter most.
3. Which issues can wait.
4. Why each issue is risky.
5. How to fix the highest-priority problems.

## Product Scope

### Full Product Vision

The mature product should support:

- Public and private GitHub repositories.
- Security scanning.
- Secret detection.
- Dependency vulnerability analysis.
- Maintainability and code-quality analysis.
- Architecture review.
- Framework-aware checks for common stacks.
- Performance checks where the app can be safely built or inspected.
- Web report.
- PDF export.
- Historical reports.
- Team access.
- Billing and credits.
- Optional remediation suggestions.

### V1 Scope

V1 should be deliberately narrower:

- Public GitHub repositories only.
- GitHub URL submission.
- Background analysis jobs.
- Gitleaks for secret detection.
- Semgrep for security and code-pattern detection.
- Dependency vulnerability checks for the most common JavaScript package managers.
- Basic repository metrics for maintainability.
- AI-generated explanations based only on collected evidence.
- Web report.
- Launch readiness score.
- Prioritized top findings.

Defer private repositories, deep app execution, Lighthouse, pull request comments, automatic fixes, and complex team billing.

## Core Architecture

```text
Web App
  |
  | submits repo URL, views report
  v
Fastify API
  |
  | creates job, stores status
  v
PostgreSQL <---- Worker updates reports/findings
  ^
  |
BullMQ + Redis
  |
  | background job
  v
Worker Service
  |
  | clones repo into isolated workspace
  | runs static tools
  | normalizes findings
  | asks AI to summarize and prioritize
  v
Report
```

## Services

### Web App

Responsibilities:

- Authentication UI.
- Repository submission form.
- Job status page.
- Report list.
- Report detail page.
- PDF download entry point when added.

Recommended stack:

- Vite.
- React.
- TanStack Router.
- TanStack Query.
- Existing shared UI package.

### Backend API

Responsibilities:

- Authenticate users.
- Validate submitted GitHub URLs.
- Create analysis jobs.
- Return job status.
- Return report data.
- Enforce ownership.
- Handle billing or credit checks later.

Recommended stack:

- Fastify.
- Shared contract schemas.
- PostgreSQL through the existing database package.

### Queue

Responsibilities:

- Process analysis jobs asynchronously.
- Retry failed jobs.
- Track job progress.
- Prevent long API requests.

Recommended stack:

- BullMQ.
- Redis.

### Worker

Responsibilities:

- Claim queued jobs.
- Clone public repositories.
- Run scanners.
- Collect repository metrics.
- Normalize raw tool output.
- Call AI model for explanations and prioritization.
- Persist findings and report sections.
- Clean up temporary workspaces.

The worker should be separate from the API process so expensive analysis does not affect user-facing requests.

## Isolation And Safety

Treat every submitted repository as untrusted.

V1 should avoid running arbitrary application code. Do not run `npm install`, package scripts, tests, build commands, or postinstall hooks by default. Prefer static analysis that reads files without executing the repository.

Minimum safety rules:

- Clone into a temporary directory.
- Enforce maximum repository size.
- Enforce maximum file count.
- Enforce job timeout.
- Disable network access for scanner containers where possible.
- Do not mount production secrets into scanner environments.
- Delete workspaces after each job.
- Store only normalized findings, not full repository contents.

Docker isolation helps, but it should not be treated as a complete security boundary by itself. Keep the first version static and conservative.

## Analysis Strategy

AI should not be the primary detector.

Static tools should produce evidence first:

- File path.
- Line number if available.
- Rule ID.
- Severity.
- Message.
- Raw metadata.
- Confidence.

AI should only transform evidence into a readable report:

- Explain why the issue matters.
- Clarify impact.
- Recommend fix order.
- Suggest remediation.
- Generate executive summary.

The AI layer must not invent findings. If a claim cannot be tied to evidence, it should not appear as a finding.

## Initial Analysis Tools

### Gitleaks

Purpose:

- Detect hardcoded secrets.
- Detect API keys.
- Detect credentials accidentally committed.

Output handling:

- Treat verified-looking secrets as high or critical.
- Redact secret values before storing.
- Store path, line, detector type, and fingerprint.

### Semgrep

Purpose:

- Detect dangerous code patterns.
- Detect common security mistakes.
- Detect framework-specific issues.

Output handling:

- Start with conservative rulesets.
- Avoid overwhelming users with low-confidence warnings.
- Map Semgrep severity into product severity.

### Dependency Vulnerability Scanner

Purpose:

- Detect known vulnerable dependencies.

V1 options:

- OSV Scanner.
- Trivy filesystem scan.
- Package-manager-specific audit where safe and offline-friendly.

Avoid commands that execute lifecycle scripts.

### Custom Repository Metrics

Purpose:

- Provide maintainability signals without needing heavy language-specific analyzers.

Useful V1 metrics:

- Largest files.
- Files over a line-count threshold.
- Functions or components over a rough size threshold where feasible.
- Dependency count.
- Missing lockfile.
- Missing tests.
- Large environment example files.
- Suspicious committed build artifacts.
- TODO/FIXME density.

These should be presented as signals, not absolute proof of poor architecture.

## Report Model

Each report should contain:

- Executive summary.
- Launch readiness verdict.
- Launch readiness score.
- Top issues to fix first.
- Security section.
- Secrets section.
- Dependency section.
- Maintainability section.
- Evidence appendix.

Each finding should contain:

- Title.
- Category.
- Severity.
- Confidence.
- File path.
- Line number when available.
- Evidence source.
- Why it matters.
- Potential impact.
- Recommended fix.
- Optional example remediation.

## Launch Readiness Score

The score should be transparent and boring.

Example:

- Start from 100.
- Critical issue: minus 25.
- High issue: minus 12.
- Medium issue: minus 5.
- Low issue: minus 1.
- Cap repeated similar findings so one noisy rule does not destroy the score.
- Force "Do not launch" if leaked secrets are detected.

Suggested verdicts:

- `Ready`: no critical issues and limited high-risk findings.
- `Needs fixes`: meaningful issues exist, but no obvious launch blocker.
- `Do not launch`: secrets, critical vulnerabilities, or severe auth/security findings.

The report should explain the score inputs so users trust it.

## Data Model

Likely core entities:

- `User`
- `Repository`
- `AnalysisJob`
- `Report`
- `Finding`
- `CreditLedgerEntry` later
- `Payment` or `Purchase` later

Suggested job statuses:

- `queued`
- `cloning`
- `scanning`
- `summarizing`
- `completed`
- `failed`
- `cancelled`

Suggested finding categories:

- `security`
- `secret`
- `dependency`
- `performance`
- `architecture`
- `maintainability`

Suggested severities:

- `critical`
- `high`
- `medium`
- `low`
- `info`

## API Surface

V1 endpoints:

- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/:id`
- `GET /api/reports/:id/findings`
- `GET /api/jobs/:id`

Later endpoints:

- `POST /api/reports/:id/pdf`
- `GET /api/reports/:id/pdf`
- `POST /api/billing/checkout`
- `POST /api/webhooks/payment-provider`
- `POST /api/github/private-repo-connect`

## UX Principles

The report viewer should prioritize decisions, not raw scanner noise.

The first screen should show:

- Verdict.
- Score.
- Top 5 issues.
- Category breakdown.
- Job metadata.

Then users can drill into sections.

For each finding, show:

- Severity.
- File path and line.
- Plain-English explanation.
- Fix guidance.
- Source tool.

Avoid making the user read huge raw JSON outputs.

## Monetization

Potential pricing:

- One free small public repo audit.
- Pay-per-report credits.
- Monthly credits for frequent users.
- Agency plan for PDF branding and client reports.

Do not overbuild billing before the report quality is proven. A manual or simple payment flow is acceptable until users consistently value the output.

## Differentiation

Existing tools usually produce lists of warnings. This product should produce a launch decision and fix order.

Differentiators:

- Senior-engineer style prioritization.
- Evidence-backed AI explanations.
- Launch readiness verdict.
- PDF suitable for clients or stakeholders.
- Opinionated focus on AI-generated application risk.

## Key Risks

### False Confidence

Risk:

- Users may treat the audit as a guarantee.

Mitigation:

- Clearly label it as automated static analysis.
- Show what was and was not checked.
- Preserve evidence for each finding.

### AI Hallucination

Risk:

- AI may invent issues or overstate impact.

Mitigation:

- Require every finding to map to tool evidence.
- Use schemas for AI output.
- Reject uncited claims.

### Scanner Noise

Risk:

- Reports become overwhelming.

Mitigation:

- Deduplicate findings.
- Group related findings.
- Prioritize top issues.
- Hide low-value findings behind an appendix.

### Unsafe Repository Execution

Risk:

- Submitted repositories may contain malicious code.

Mitigation:

- Avoid executing repo code in V1.
- Use static scanning.
- Run workers in isolated environments.
- Enforce strict limits and cleanup.

### Too Broad A Product

Risk:

- Trying to review every language and framework deeply will slow shipping.

Mitigation:

- Start with JavaScript/TypeScript-heavy repositories.
- Add other ecosystems after the core workflow works.

## Product Milestones

### Milestone 1: Local Prototype

- Submit public GitHub URL.
- Clone repository locally.
- Run Gitleaks and Semgrep manually or through a worker.
- Store normalized findings.
- Generate a basic AI summary.
- Render a simple report page.

### Milestone 2: Real V1

- Authenticated users.
- Persistent reports.
- Background queue.
- Worker isolation and cleanup.
- Report detail page.
- Launch readiness score.
- Basic credit or usage limit.

### Milestone 3: Paid Beta

- Payment flow.
- PDF export.
- Report history.
- Better dependency scanning.
- Email notification when report is ready.
- Improved scanner tuning.

### Milestone 4: Expansion

- Private repositories.
- GitHub App integration.
- Pull request audits.
- Framework-specific checks.
- Lighthouse or build-based checks in stricter sandboxes.
- Team accounts.

## Definition Of Success

V1 succeeds if a user can submit a public repo and receive a report that reliably answers:

1. Is this safe enough to launch?
2. What are the highest-risk issues?
3. What should I fix first?
4. How do I fix those issues?
5. What would a senior engineer criticize?

If the product answers those five questions clearly, it is valuable even before advanced features exist.
