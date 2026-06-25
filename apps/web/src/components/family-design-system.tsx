import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  FileText,
  Globe,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Button } from "@codeaudit/ui/components/button";
import { Checkbox } from "@codeaudit/ui/components/checkbox";
import { Input } from "@codeaudit/ui/components/input";
import { cn } from "@codeaudit/ui/lib/utils";

export type FamilyStyle = CSSProperties & { [key: `--family-${string}`]: string };

export type ColorToken = {
  name: string;
  variable: `--family-${string}`;
  value: string;
  usage: string;
  className: string;
};

export type TextToken = {
  name: string;
  value: string;
  sample: string;
  className: string;
};

export type MetricToken = {
  name: string;
  value: string;
  usage: string;
};

export const familyTheme: FamilyStyle = {
  "--family-canvas": "#fbfaf7",
  "--family-surface": "#ffffff",
  "--family-soft": "#f5f4f0",
  "--family-ink": "#161616",
  "--family-muted": "#6f746f",
  "--family-line": "#ebe8df",
  "--family-blue": "#48baff",
  "--family-blue-deep": "#178fe7",
  "--family-green": "#18c875",
  "--family-orange": "#ff9f1a",
  "--family-red": "#ff553b",
  "--family-yellow": "#ffd66e",
  "--family-purple": "#8f6cff",
};

export const colorTokens: ColorToken[] = [
  {
    name: "Canvas",
    variable: "--family-canvas",
    value: "#FBFAF7",
    usage: "Warm page background",
    className: "bg-[var(--family-canvas)]",
  },
  {
    name: "Surface",
    variable: "--family-surface",
    value: "#FFFFFF",
    usage: "Cards and phone screens",
    className: "bg-[var(--family-surface)]",
  },
  {
    name: "Ink",
    variable: "--family-ink",
    value: "#161616",
    usage: "Text and primary pills",
    className: "bg-[var(--family-ink)]",
  },
  {
    name: "Sky",
    variable: "--family-blue",
    value: "#48BAFF",
    usage: "Mascot, links, focus states",
    className: "bg-[var(--family-blue)]",
  },
  {
    name: "Leaf",
    variable: "--family-green",
    value: "#18C875",
    usage: "Success and receiving",
    className: "bg-[var(--family-green)]",
  },
  {
    name: "Coin",
    variable: "--family-orange",
    value: "#FF9F1A",
    usage: "Coins and highlights",
    className: "bg-[var(--family-orange)]",
  },
  {
    name: "Alert",
    variable: "--family-red",
    value: "#FF553B",
    usage: "Warnings and send states",
    className: "bg-[var(--family-red)]",
  },
  {
    name: "Glow",
    variable: "--family-yellow",
    value: "#FFD66E",
    usage: "Badges and celebratory accents",
    className: "bg-[var(--family-yellow)]",
  },
];

export const textTokens: TextToken[] = [
  {
    name: "Display",
    value: "48px / 1.04 / 700",
    sample: "Your favorite wallet",
    className: "text-[48px] font-bold leading-[1.04] tracking-normal max-sm:text-[38px]",
  },
  {
    name: "Section",
    value: "32px / 1.08 / 700",
    sample: "Send, receive, swap.",
    className: "text-[32px] font-bold leading-[1.08] tracking-normal",
  },
  {
    name: "Title",
    value: "20px / 1.2 / 700",
    sample: "Relentless protection.",
    className: "text-[20px] font-bold leading-[1.2] tracking-normal",
  },
  {
    name: "Body",
    value: "15px / 1.6 / 500",
    sample: "Friendly, precise content for product moments.",
    className: "text-[15px] font-medium leading-[1.6] tracking-normal text-[var(--family-muted)]",
  },
  {
    name: "Caption",
    value: "12px / 1.5 / 700",
    sample: "SYSTEM TOKEN",
    className: "text-[12px] font-bold uppercase leading-[1.5] tracking-normal text-[var(--family-blue-deep)]",
  },
];

export const spacingTokens: MetricToken[] = [
  { name: "2xs", value: "4px", usage: "Icon gaps" },
  { name: "xs", value: "8px", usage: "Pill padding, row gaps" },
  { name: "sm", value: "12px", usage: "Compact component padding" },
  { name: "md", value: "20px", usage: "Cards and panels" },
  { name: "lg", value: "32px", usage: "Section groups" },
  { name: "xl", value: "64px", usage: "Page rhythm" },
];

export const radiusTokens: MetricToken[] = [
  { name: "Sharp", value: "0px", usage: "Rule lines and charts" },
  { name: "Control", value: "6px", usage: "Inputs and small controls" },
  { name: "Card", value: "8px", usage: "Cards and feature tiles" },
  { name: "Pill", value: "999px", usage: "Buttons and status chips" },
];

export const shadowTokens: MetricToken[] = [
  { name: "Soft", value: "0 8px 28px rgb(22 22 22 / 0.06)", usage: "Elevated panels" },
  { name: "Device", value: "0 20px 48px rgb(22 22 22 / 0.16)", usage: "Phone mockups" },
  { name: "Inset", value: "inset 0 0 0 1px rgb(22 22 22 / 0.06)", usage: "Subtle controls" },
];

export const navItems = ["Overview", "Tokens", "Components", "Patterns"];

export const productCards = [
  {
    label: "Connect",
    title: "Link accounts",
    text: "A calm setup card with a tiny success state.",
    icon: Wallet,
    tone: "bg-[var(--family-blue)]",
  },
  {
    label: "Receive",
    title: "Share wallet",
    text: "QR and address moments stay compact.",
    icon: Zap,
    tone: "bg-[var(--family-green)]",
  },
  {
    label: "Protect",
    title: "Scan activity",
    text: "Security copy is short, explicit, and friendly.",
    icon: Shield,
    tone: "bg-[var(--family-red)]",
  },
];

export const faqItems = [
  "Is Family safe?",
  "Can I switch from another wallet?",
  "What networks does Family support?",
];

export const walletRows = [
  { name: "Ethereum", amount: "$3,420.22", delta: "+4.2%", tone: "bg-[var(--family-blue)]" },
  { name: "Optimism", amount: "$842.10", delta: "+2.8%", tone: "bg-[var(--family-red)]" },
  { name: "USDC", amount: "$540.00", delta: "0.0%", tone: "bg-[var(--family-green)]" },
  { name: "Base", amount: "$221.45", delta: "+8.1%", tone: "bg-[var(--family-purple)]" },
];

export const formFields = [
  {
    label: "Wallet label",
    value: "Family vault",
    helper: "Shown in account switchers and activity threads.",
    state: "default",
  },
  {
    label: "ENS or address",
    value: "vitalik.eth",
    helper: "Resolved on Ethereum mainnet.",
    state: "success",
  },
  {
    label: "Spending limit",
    value: "$25,000",
    helper: "Limit cannot exceed the organization policy.",
    state: "error",
  },
];

export const tabItems = [
  { label: "Assets", count: "12", active: true },
  { label: "NFTs", count: "48", active: false },
  { label: "Activity", count: "9", active: false },
];

export const tableRows = [
  { name: "Ethereum", network: "Mainnet", risk: "Low", volume: "$12,450", status: "Synced" },
  { name: "Optimism", network: "Layer 2", risk: "Medium", volume: "$4,210", status: "Review" },
  { name: "Base", network: "Layer 2", risk: "Low", volume: "$2,880", status: "Synced" },
];

export const alertItems = [
  {
    title: "Backup complete",
    text: "Recovery details are encrypted and saved.",
    icon: Check,
    tone: "text-[var(--family-green)] bg-[var(--family-green)]/10 border-[var(--family-green)]/25",
  },
  {
    title: "Address risk found",
    text: "Review the destination before sending.",
    icon: AlertTriangle,
    tone: "text-[var(--family-red)] bg-[var(--family-red)]/10 border-[var(--family-red)]/25",
  },
];

export const toastItems = [
  { title: "Copied address", text: "0x9f...28b is ready to paste.", icon: Copy },
  { title: "Download started", text: "Family iOS build is queued.", icon: Download },
];

export function DesignSystemPage() {
  return (
    <div style={familyTheme} className="bg-[var(--family-canvas)] text-[var(--family-ink)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 py-8 sm:px-8 lg:px-12">
        <HeroSection />

        <section id="tokens" className="grid gap-8">
          <SectionHeading
            eyebrow="Design tokens"
            title="A compact system pulled from the reference."
            description="The palette uses a warm canvas, crisp black text, soft dividers, and bright accent colors for product moments."
          />
          <ColorTokens />
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <TypeScale />
            <MetricTokens />
          </div>
        </section>

        <section id="components" className="grid gap-8">
          <SectionHeading
            eyebrow="Components"
            title="Reusable pieces built with those tokens."
            description="Buttons, cards, wallet rows, phone shells, FAQ rows, and mascot moments share the same spacing, type, and color decisions."
          />
          <ComponentShowcase />
        </section>

        <section id="patterns" className="grid gap-8 pb-10">
          <SectionHeading
            eyebrow="Page patterns"
            title="Marketing sections with product detail."
            description="The reference alternates quiet white space with tiny screenshots, short copy, and a little illustrated motion."
          />
          <PatternShowcase />
        </section>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-[8px] border border-[var(--family-line)] bg-[var(--family-surface)] px-5 py-6 shadow-[0_8px_28px_rgb(22_22_22/0.06)] sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-5 border-b border-[var(--family-line)] pb-5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="grid size-7 place-items-center rounded-[6px] bg-[var(--family-ink)] text-white">
            F
          </span>
          Family DS
        </div>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--family-muted)] md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[var(--family-ink)]">
              {item}
            </a>
          ))}
        </nav>
        <Button className="h-9 bg-[var(--family-ink)] px-4 text-white hover:bg-black">
          Get started
          <ArrowRight />
        </Button>
      </div>

      <div className="grid items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div className="max-w-xl">
          <p className="mb-4 text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
            Reference-led UI kit
          </p>
          <h1 className="text-[48px] font-bold leading-[1.04] tracking-normal text-[var(--family-ink)] max-sm:text-[38px]">
            Your favorite crypto wallet, rebuilt as a design system.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
            A one-page token board and component playground inspired by the attached Family screenshot:
            friendly, precise, bright, and product-first.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <FamilyButton>Download app</FamilyButton>
            <FamilyButton variant="secondary">
              Watch the demo
              <ChevronRight className="size-4" />
            </FamilyButton>
          </div>
        </div>

        <div className="relative min-h-[420px]">
          <DecorativeScatter />
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 max-sm:left-[42%]">
            <PhoneMockup />
          </div>
          <div className="absolute bottom-4 right-2 z-20 sm:right-8">
            <Mascot />
          </div>
          <div className="absolute bottom-10 left-0 z-20 w-44 rounded-[8px] border border-[var(--family-line)] bg-white p-4 shadow-[0_8px_28px_rgb(22_22_22/0.06)] sm:left-8">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Backing up</span>
              <span className="text-[var(--family-green)]">98%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--family-soft)]">
              <div className="h-2 w-[82%] rounded-full bg-[var(--family-green)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[0.45fr_1fr] sm:items-end">
      <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
        {eyebrow}
      </p>
      <div>
        <h2 className="max-w-2xl text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--family-ink)]">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ColorTokens() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {colorTokens.map((token) => (
        <article
          key={token.variable}
          className="rounded-[8px] border border-[var(--family-line)] bg-white p-4 shadow-[0_8px_28px_rgb(22_22_22/0.04)]"
        >
          <div className={cn("h-24 rounded-[6px] border border-black/5", token.className)} />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold">{token.name}</h3>
              <p className="mt-1 text-xs font-semibold text-[var(--family-muted)]">{token.variable}</p>
            </div>
            <code className="rounded-full bg-[var(--family-soft)] px-2 py-1 text-xs font-bold">
              {token.value}
            </code>
          </div>
          <p className="mt-3 text-sm font-medium leading-6 text-[var(--family-muted)]">{token.usage}</p>
        </article>
      ))}
    </div>
  );
}

export function TypeScale() {
  return (
    <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
      <h3 className="text-[20px] font-bold leading-[1.2]">Typography</h3>
      <div className="mt-5 grid gap-4">
        {textTokens.map((token) => (
          <div
            key={token.name}
            className="grid gap-3 border-t border-[var(--family-line)] pt-4 md:grid-cols-[150px_1fr]"
          >
            <div>
              <p className="text-sm font-bold">{token.name}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--family-muted)]">{token.value}</p>
            </div>
            <p className={token.className}>{token.sample}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function MetricTokens() {
  return (
    <div className="grid gap-5">
      <TokenList title="Spacing" tokens={spacingTokens} />
      <TokenList title="Radius" tokens={radiusTokens} />
      <TokenList title="Elevation" tokens={shadowTokens} />
    </div>
  );
}

export function TokenList({ title, tokens }: { title: string; tokens: MetricToken[] }) {
  return (
    <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
      <h3 className="text-[20px] font-bold leading-[1.2]">{title}</h3>
      <div className="mt-4 divide-y divide-[var(--family-line)]">
        {tokens.map((token) => (
          <div key={`${title}-${token.name}`} className="grid grid-cols-[80px_1fr] gap-4 py-3">
            <div>
              <p className="text-sm font-bold">{token.name}</p>
              <code className="text-xs font-bold text-[var(--family-blue-deep)]">{token.value}</code>
            </div>
            <p className="text-sm font-medium leading-6 text-[var(--family-muted)]">{token.usage}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ComponentShowcase() {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              Controls
            </p>
            <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Buttons, inputs, choices</h3>
          </div>
          <span className="rounded-full bg-[var(--family-yellow)] px-3 py-1 text-xs font-bold">
            8px cards
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <FamilyButton>Primary</FamilyButton>
          <FamilyButton variant="secondary">Secondary</FamilyButton>
          <FamilyButton variant="success">
            Synced
            <Check className="size-4" />
          </FamilyButton>
          <FamilyButton variant="danger">
            Send
            <Send className="size-4" />
          </FamilyButton>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Wallet name
            <Input
              value="Family vault"
              readOnly
              className="border-[var(--family-line)] bg-[var(--family-soft)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Search pattern
            <span className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--family-muted)]" />
              <Input
                value="ENS, address, contact"
                readOnly
                className="border-[var(--family-line)] bg-white pl-10"
              />
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-[8px] bg-[var(--family-soft)] p-4">
          <label className="flex items-center gap-3 text-sm font-bold">
            <Checkbox checked readOnly className="rounded-[3px] border-[var(--family-ink)]" />
            Backup enabled
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-[var(--family-muted)]">
            <Checkbox readOnly className="rounded-[3px]" />
            Hide dust
          </label>
        </div>
      </article>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
          Product cards
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {productCards.map((card) => (
            <ProductCard key={card.title} {...card} />
          ))}
        </div>
        <div className="mt-5 rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--family-blue)] text-white">
              <Lock className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold">Relentless protection</h4>
              <p className="text-sm font-medium text-[var(--family-muted)]">
                Short security copy paired with reassuring checks.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["Cloud backup", "Spam firewall", "Keychain lock", "Risk alerts"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm font-bold text-[var(--family-blue-deep)]">
                <Check className="size-4" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </article>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5 lg:col-span-2">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
              Wallet module
            </p>
            <h3 className="mt-2 text-[32px] font-bold leading-[1.08]">Watch the wallets you care about.</h3>
            <p className="mt-4 text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              The product pattern keeps dense financial details approachable with small rows, soft
              separators, and color used only for meaning.
            </p>
            <div className="mt-6 grid gap-2">
              {["Live activity", "ENS-friendly names", "Portfolio snapshots"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm font-bold text-[var(--family-green)]">
                  <Check className="size-4" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
            <MiniActivityCard />
            <PhoneMockup variant="wallet" />
          </div>
        </div>
      </article>

      <SystemPrimitives />
    </div>
  );
}

export function SystemPrimitives() {
  return (
    <>
      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5 lg:col-span-2">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              Dialog
            </p>
            <h3 className="mt-2 text-[32px] font-bold leading-[1.08]">Confirmation and focused tasks.</h3>
            <p className="mt-4 text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              Dialogs use the same 8px surface radius, a dim canvas overlay, one clear title, and
              paired primary-secondary actions.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill tone="blue">Focus trap</StatusPill>
              <StatusPill tone="green">Clear action</StatusPill>
              <StatusPill tone="orange">Esc dismiss</StatusPill>
            </div>
          </div>
          <DialogPreview />
        </div>
      </article>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
          Form
        </p>
        <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Field states and submit row</h3>
        <FormPreview />
      </article>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-orange)]">
          Navigation
        </p>
        <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Tabs, filters, and menu actions</h3>
        <NavigationPreview />
      </article>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5 lg:col-span-2">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <DataTablePreview />
          <FeedbackPreview />
        </div>
      </article>
    </>
  );
}

export function DialogPreview() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-5">
      <div className="absolute inset-0 bg-[var(--family-ink)]/10" />
      <div
        role="dialog"
        aria-label="Confirm send preview"
        className="relative mx-auto mt-8 max-w-md rounded-[8px] border border-[var(--family-line)] bg-white p-5 shadow-[0_20px_48px_rgb(22_22_22/0.16)]"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center rounded-full bg-[var(--family-red)]/10 text-[var(--family-red)]">
            <Send className="size-5" />
          </span>
          <button
            type="button"
            aria-label="Close preview dialog"
            className="grid size-8 place-items-center rounded-full text-[var(--family-muted)] hover:bg-[var(--family-soft)]"
          >
            <X className="size-4" />
          </button>
        </div>
        <h4 className="mt-5 text-[20px] font-bold leading-[1.2]">Send 0.42 ETH?</h4>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--family-muted)]">
          This transfer goes to vitalik.eth on Ethereum mainnet. Network fees are estimated before
          confirmation.
        </p>
        <div className="mt-5 rounded-[8px] bg-[var(--family-soft)] p-4">
          <div className="flex items-center justify-between gap-4 text-sm font-bold">
            <span>Destination</span>
            <span className="text-[var(--family-muted)]">0xd8d...6045</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm font-bold">
            <span>Network fee</span>
            <span className="text-[var(--family-green)]">$2.18</span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <FamilyButton variant="secondary">Cancel</FamilyButton>
          <FamilyButton variant="danger">Confirm send</FamilyButton>
        </div>
      </div>
    </div>
  );
}

export function FormPreview() {
  return (
    <form className="mt-5 grid gap-4">
      {formFields.map((field) => (
        <label key={field.label} className="grid gap-2 text-sm font-bold">
          {field.label}
          <Input
            value={field.value}
            readOnly
            aria-invalid={field.state === "error"}
            className={cn(
              "border-[var(--family-line)] bg-white",
              field.state === "success" && "border-[var(--family-green)] bg-[var(--family-green)]/5",
              field.state === "error" && "border-[var(--family-red)] bg-[var(--family-red)]/5",
            )}
          />
          <span
            className={cn(
              "text-xs font-bold text-[var(--family-muted)]",
              field.state === "success" && "text-[var(--family-green)]",
              field.state === "error" && "text-[var(--family-red)]",
            )}
          >
            {field.helper}
          </span>
        </label>
      ))}
      <label className="grid gap-2 text-sm font-bold">
        Network
        <select
          value="base"
          disabled
          className="h-10 rounded-[6px] border border-[var(--family-line)] bg-[var(--family-soft)] px-4 text-sm font-bold text-[var(--family-ink)]"
        >
          <option value="base">Base</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Notes
        <textarea
          value="Treasury transfer for June payroll."
          readOnly
          rows={3}
          className="min-h-24 resize-none rounded-[6px] border border-[var(--family-line)] bg-white px-4 py-3 text-sm font-medium leading-6 outline-none"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[var(--family-soft)] p-4">
        <label className="flex items-center gap-3 text-sm font-bold">
          <Checkbox checked readOnly className="rounded-[3px]" />
          Require approval
        </label>
        <FamilyButton>Save policy</FamilyButton>
      </div>
    </form>
  );
}

export function NavigationPreview() {
  return (
    <div className="mt-5 grid gap-5">
      <div className="flex rounded-full bg-[var(--family-soft)] p-1">
        {tabItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold",
              item.active ? "bg-white shadow-[0_8px_28px_rgb(22_22_22/0.06)]" : "text-[var(--family-muted)]",
            )}
          >
            {item.label}
            <span className="rounded-full bg-[var(--family-canvas)] px-2 py-0.5 text-xs">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active icon={<Globe className="size-4" />}>
          All networks
        </FilterChip>
        <FilterChip icon={<Calendar className="size-4" />}>30 days</FilterChip>
        <FilterChip icon={<SlidersHorizontal className="size-4" />}>Filters</FilterChip>
      </div>

      <div className="rounded-[8px] border border-[var(--family-line)]">
        {["Account", "Security", "Notifications"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-bold",
              index > 0 && "border-t border-[var(--family-line)]",
            )}
          >
            <span className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--family-soft)]">
                {index === 0 ? <Wallet className="size-4" /> : index === 1 ? <Shield className="size-4" /> : <Bell className="size-4" />}
              </span>
              {item}
            </span>
            <ChevronRight className="size-4 text-[var(--family-muted)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function DataTablePreview() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
            Data display
          </p>
          <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Table, row actions, status</h3>
        </div>
        <FamilyButton variant="secondary">
          <Plus className="size-4" />
          Add network
        </FamilyButton>
      </div>
      <div className="mt-5 overflow-hidden rounded-[8px] border border-[var(--family-line)]">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.7fr_0.8fr_44px] gap-3 bg-[var(--family-soft)] px-4 py-3 text-xs font-bold uppercase text-[var(--family-muted)] max-md:hidden">
          <span>Asset</span>
          <span>Network</span>
          <span>Risk</span>
          <span>Volume</span>
          <span />
        </div>
        {tableRows.map((row) => (
          <div
            key={row.name}
            className="grid gap-3 border-t border-[var(--family-line)] px-4 py-4 text-sm font-bold md:grid-cols-[1.1fr_0.8fr_0.7fr_0.8fr_44px] md:items-center"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[var(--family-blue)]/10 text-[var(--family-blue-deep)]">
                <CreditCard className="size-4" />
              </span>
              {row.name}
            </span>
            <span className="text-[var(--family-muted)]">{row.network}</span>
            <span>
              <StatusPill tone={row.risk === "Low" ? "green" : "orange"}>{row.risk}</StatusPill>
            </span>
            <span>{row.volume}</span>
            <button
              type="button"
              aria-label={`${row.name} actions`}
              className="grid size-9 place-items-center rounded-full hover:bg-[var(--family-soft)]"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedbackPreview() {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-red)]">
        Feedback
      </p>
      <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Alerts, toast, empty state</h3>
      <div className="mt-5 grid gap-3">
        {alertItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className={cn("rounded-[8px] border p-4", item.tone)}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[var(--family-ink)]">{item.title}</h4>
                  <p className="mt-1 text-sm font-medium leading-6 text-[var(--family-muted)]">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        {toastItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-[8px] border border-[var(--family-line)] bg-white p-4 shadow-[0_8px_28px_rgb(22_22_22/0.06)]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--family-soft)]">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="mt-1 text-sm font-medium leading-6 text-[var(--family-muted)]">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[8px] border border-dashed border-[var(--family-line)] bg-[var(--family-canvas)] p-5 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-[var(--family-blue-deep)]">
          <FileText className="size-5" />
        </span>
        <h4 className="mt-3 text-sm font-bold">No activity yet</h4>
        <p className="mt-1 text-sm font-medium leading-6 text-[var(--family-muted)]">
          Empty states explain the next useful action.
        </p>
      </div>
    </div>
  );
}

export function ProductCard({
  label,
  title,
  text,
  icon: Icon,
  tone,
}: {
  label: string;
  title: string;
  text: string;
  icon: typeof Wallet;
  tone: string;
}) {
  return (
    <div className="rounded-[8px] border border-[var(--family-line)] bg-white p-4">
      <div className={cn("grid size-10 place-items-center rounded-full text-white", tone)}>
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase text-[var(--family-muted)]">{label}</p>
      <h4 className="mt-1 text-base font-bold">{title}</h4>
      <p className="mt-2 text-sm font-medium leading-6 text-[var(--family-muted)]">{text}</p>
    </div>
  );
}

export function StatusPill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "blue" | "green" | "orange" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold",
        tone === "blue" && "bg-[var(--family-blue)]/12 text-[var(--family-blue-deep)]",
        tone === "green" && "bg-[var(--family-green)]/12 text-[var(--family-green)]",
        tone === "orange" && "bg-[var(--family-orange)]/15 text-[var(--family-orange)]",
        tone === "red" && "bg-[var(--family-red)]/12 text-[var(--family-red)]",
      )}
    >
      {children}
    </span>
  );
}

export function FilterChip({
  active = false,
  children,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold",
        active
          ? "border-[var(--family-ink)] bg-[var(--family-ink)] text-white"
          : "border-[var(--family-line)] bg-white text-[var(--family-ink)] hover:bg-[var(--family-soft)]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function PatternShowcase() {
  return (
    <div className="grid gap-5">
      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex justify-center">
            <PhoneMockup variant="nft" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-orange)]">
              Experience NFTs
            </p>
            <h3 className="mt-2 text-[32px] font-bold leading-[1.08]">
              The best way to experience NFTs.
            </h3>
            <p className="mt-4 max-w-xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              A product story block pairs one crisp device with short, benefit-led copy and colorful
              proof points.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {["Multiple chains", "Live offers", "Hidden spam", "Rich attributes"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm font-bold">
                  <span className="size-2 rounded-full bg-[var(--family-orange)]" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
          <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
            Details that matter
          </p>
          <div className="mt-4 grid gap-4">
            <DetailRow title="Token previews" icon={<Sparkles className="size-4" />} />
            <DetailRow title="Transaction analysis" icon={<Shield className="size-4" />} />
            <DetailRow title="Activity threads" icon={<Zap className="size-4" />} />
          </div>
        </article>

        <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
          <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-red)]">
            FAQ rows
          </p>
          <div className="mt-4 divide-y divide-[var(--family-line)]">
            {faqItems.map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold"
              >
                {item}
                <ChevronRight className="size-4 text-[var(--family-red)]" />
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="overflow-hidden rounded-[8px] border border-[var(--family-line)] bg-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
              Explore Family
            </p>
            <h3 className="mt-2 text-[32px] font-bold leading-[1.08]">A friendly footer pattern.</h3>
            <p className="mt-4 max-w-xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
              The close uses a simple CTA, a bright illustration, and a quiet link system instead of
              a heavy footer block.
            </p>
            <FamilyButton className="mt-6">Download for iOS</FamilyButton>
          </div>
          <div className="relative min-h-[220px]">
            <DecorativeScatter compact />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <Mascot />
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-[var(--family-line)] px-5 py-4 text-xs font-bold text-[var(--family-muted)] sm:grid-cols-4">
          <span>Developers</span>
          <span>Resources</span>
          <span>Company</span>
          <span>Social</span>
        </div>
      </article>
    </div>
  );
}

export function DetailRow({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--family-blue)] text-white">
            {icon}
          </span>
          <div>
            <h4 className="text-sm font-bold">{title}</h4>
            <p className="mt-1 text-sm font-medium text-[var(--family-muted)]">
              Compact evidence, clear state, no extra decoration.
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-[var(--family-green)]">+2.4%</span>
      </div>
    </div>
  );
}

export function MiniActivityCard() {
  return (
    <div className="rounded-[8px] border border-[var(--family-line)] bg-[var(--family-canvas)] p-4 shadow-[0_8px_28px_rgb(22_22_22/0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--family-muted)]">Best trader</p>
          <h4 className="mt-1 text-lg font-bold">0x9f...28b</h4>
        </div>
        <span className="rounded-full bg-[var(--family-green)] px-3 py-1 text-xs font-bold text-white">
          Live
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {walletRows.slice(0, 3).map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={cn("size-7 rounded-full", row.tone)} />
              <span className="text-sm font-bold">{row.name}</span>
            </div>
            <span className="text-sm font-bold text-[var(--family-green)]">{row.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhoneMockup({ variant = "home" }: { variant?: "home" | "wallet" | "nft" }) {
  return (
    <div className="mx-auto w-[220px] rounded-[32px] border-[9px] border-[var(--family-ink)] bg-[var(--family-ink)] shadow-[0_20px_48px_rgb(22_22_22/0.16)]">
      <div className="relative min-h-[430px] overflow-hidden rounded-[22px] bg-white">
        <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-[var(--family-ink)]" />
        <div className="px-4 pb-4 pt-10">
          {variant === "nft" ? <NftScreen /> : variant === "wallet" ? <WalletScreen /> : <HomeScreen />}
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <div>
      <div className="rounded-[8px] bg-[var(--family-blue)] p-4 text-white">
        <p className="text-xs font-bold opacity-80">Family wallet</p>
        <p className="mt-2 text-2xl font-bold">$12,482</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Send", "bg-[var(--family-red)]"],
          ["Receive", "bg-[var(--family-green)]"],
          ["Swap", "bg-[var(--family-orange)]"],
        ].map(([label, tone]) => (
          <div key={label} className="rounded-[8px] bg-[var(--family-soft)] p-2 text-center">
            <span className={cn("mx-auto block size-7 rounded-full", tone)} />
            <p className="mt-2 text-[11px] font-bold">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {walletRows.map((row) => (
          <div key={row.name} className="flex items-center justify-between rounded-[8px] bg-[var(--family-soft)] p-3">
            <div className="flex items-center gap-2">
              <span className={cn("size-7 rounded-full", row.tone)} />
              <span className="text-xs font-bold">{row.name}</span>
            </div>
            <span className="text-xs font-bold">{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletScreen() {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[var(--family-muted)]">Watching</p>
      <h4 className="mt-1 text-xl font-bold">Vitalik.eth</h4>
      <div className="mt-4 space-y-2">
        {walletRows.map((row) => (
          <div key={row.name} className="flex items-center justify-between rounded-[8px] border border-[var(--family-line)] p-3">
            <div className="flex items-center gap-2">
              <span className={cn("size-7 rounded-full", row.tone)} />
              <div>
                <p className="text-xs font-bold">{row.name}</p>
                <p className="text-[10px] font-bold text-[var(--family-muted)]">{row.delta}</p>
              </div>
            </div>
            <span className="text-xs font-bold">{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NftScreen() {
  const bars = [
    "bg-[var(--family-orange)]",
    "bg-[var(--family-blue)]",
    "bg-[var(--family-red)]",
    "bg-[var(--family-yellow)]",
    "bg-[var(--family-purple)]",
    "bg-[var(--family-green)]",
    "bg-[var(--family-ink)]",
    "bg-[var(--family-orange)]",
  ];

  return (
    <div>
      <div className="grid h-56 grid-cols-8 gap-1 overflow-hidden rounded-[8px] bg-[var(--family-soft)] p-2">
        {bars.map((bar, index) => (
          <span key={`${bar}-${index}`} className={cn("rounded-full", bar)} />
        ))}
      </div>
      <h4 className="mt-4 text-xl font-bold">Segment</h4>
      <p className="mt-2 text-xs font-bold leading-5 text-[var(--family-muted)]">
        A clear NFT detail screen with attributes, ownership, and actions.
      </p>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-[var(--family-soft)] px-3 py-2 text-xs font-bold">Offer</span>
        <span className="rounded-full bg-[var(--family-ink)] px-3 py-2 text-xs font-bold text-white">
          Send
        </span>
      </div>
    </div>
  );
}

export function Mascot() {
  return (
    <div aria-hidden="true" className="relative h-40 w-44">
      <span className="absolute left-10 top-4 size-24 rounded-[28px] bg-[var(--family-blue)]" />
      <span className="absolute left-6 top-9 size-8 rounded-full bg-[var(--family-blue)]" />
      <span className="absolute right-8 top-9 size-8 rounded-full bg-[var(--family-blue)]" />
      <span className="absolute left-[70px] top-[54px] h-3 w-3 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute left-[96px] top-[54px] h-3 w-3 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute left-[76px] top-[76px] h-4 w-8 rounded-b-full border-b-4 border-[var(--family-ink)]" />
      <span className="absolute bottom-5 left-[62px] h-12 w-4 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute bottom-5 right-[58px] h-12 w-4 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute bottom-0 left-[52px] h-4 w-10 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute bottom-0 right-[46px] h-4 w-10 rounded-full bg-[var(--family-ink)]" />
      <span className="absolute left-2 top-20 size-5 rounded-full bg-[var(--family-yellow)]" />
      <span className="absolute right-0 top-16 size-4 rounded-full bg-[var(--family-green)]" />
    </div>
  );
}

export function DecorativeScatter({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "scale-75" : "";

  return (
    <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden", sizeClass)}>
      <span className="absolute left-6 top-10 size-10 rounded-full bg-[var(--family-yellow)]" />
      <span className="absolute left-20 top-24 size-5 rounded-full bg-[var(--family-red)]" />
      <span className="absolute right-8 top-12 size-8 rounded-full bg-[var(--family-green)]" />
      <span className="absolute right-24 top-28 size-12 rounded-[8px] bg-[var(--family-orange)] rotate-12" />
      <span className="absolute bottom-20 left-16 size-7 rounded-full bg-[var(--family-blue)]" />
      <span className="absolute bottom-28 right-16 size-5 rounded-full bg-[var(--family-red)]" />
      <span className="absolute bottom-8 right-36 size-10 rounded-[8px] bg-[var(--family-yellow)] -rotate-12" />
      <span className="absolute left-1/3 top-12 h-16 w-3 rotate-45 rounded-full bg-[var(--family-blue)]" />
      <span className="absolute right-1/3 bottom-16 h-12 w-3 -rotate-45 rounded-full bg-[var(--family-green)]" />
    </div>
  );
}

export function FamilyButton({
  children,
  variant = "primary",
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
}) {
  return (
    <Button
      className={cn(
        "h-11 gap-2 rounded-full px-5 text-sm font-bold",
        variant === "primary" && "bg-[var(--family-ink)] text-white hover:bg-black",
        variant === "secondary" &&
          "border border-[var(--family-line)] bg-white text-[var(--family-ink)] hover:bg-[var(--family-soft)]",
        variant === "success" && "bg-[var(--family-green)] text-white hover:bg-[var(--family-green)]/90",
        variant === "danger" && "bg-[var(--family-red)] text-white hover:bg-[var(--family-red)]/90",
        className,
      )}
    >
      {children}
    </Button>
  );
}
