"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Download,
  IndianRupee,
  PiggyBank,
  Repeat,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: IndianRupee,
      title: "Track Income",
      description:
        "Monitor all your income sources with normalized monthly amounts for accurate budgeting.",
    },
    {
      icon: Repeat,
      title: "Recurring Expenses",
      description:
        "Manage bills and subscriptions with any frequency - daily, weekly, monthly, or yearly.",
    },
    {
      icon: CreditCard,
      title: "One-time Expenses",
      description:
        "Log individual purchases and categorize them for better spending insights.",
    },
    {
      icon: Target,
      title: "Savings Goals",
      description:
        "Set financial goals with target dates and track your progress automatically.",
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description:
        "Beautiful charts showing cash flow trends, category breakdowns, and spending patterns.",
    },
    {
      icon: Download,
      title: "Smart Exports",
      description:
        "Export to CSV or Excel with smart formulas that automatically calculate totals.",
    },
  ];

  const dashboardFeatures = [
    {
      icon: Wallet,
      title: "Remaining Cash",
      description:
        "See exactly what you have left after all expenses and savings.",
    },
    {
      icon: ShoppingCart,
      title: "Can I Spend This?",
      description:
        "Quick check if you can afford a purchase without breaking budget.",
    },
    {
      icon: PiggyBank,
      title: "Savings Snapshot",
      description:
        "Track multiple savings goals with progress bars and timelines.",
    },
    {
      icon: TrendingUp,
      title: "Month Comparison",
      description:
        "Compare spending across months with radar charts and trends.",
    },
  ];

  const pricingFeatures = [
    "Unlimited income sources",
    "Unlimited recurring expenses",
    "Unlimited one-time entries",
    "Multiple savings goals",
    "Full analytics dashboard",
    "CSV & Excel exports",
    "Dark mode support",
    "Mobile responsive",
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt="Subtrack"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Subtrack
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="sm:size-default">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Take control of your{" "}
            <span className="bg-linear-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              finances
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Track your income, manage recurring bills and subscriptions, set
            savings goals, and visualize your spending patterns — all in one
            beautiful dashboard.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 rounded-3xl bg-linear-to-r from-chart-1/20 via-chart-2/20 to-chart-3/20 blur-2xl" />
          <div className="relative rounded-2xl border bg-card p-4 shadow-2xl">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Income",
                  value: "₹85,000",
                  icon: IndianRupee,
                  color: "text-emerald-600 dark:text-emerald-400",
                  iconBg: "bg-emerald-500/10",
                },
                {
                  label: "Recurring",
                  value: "₹32,450",
                  icon: Repeat,
                  color: "text-blue-600 dark:text-blue-400",
                  iconBg: "bg-blue-500/10",
                },
                {
                  label: "One-time",
                  value: "₹8,200",
                  icon: CreditCard,
                  color: "text-orange-600 dark:text-orange-400",
                  iconBg: "bg-orange-500/10",
                },
                {
                  label: "Remaining",
                  value: "₹29,350",
                  icon: Wallet,
                  color: "text-emerald-600 dark:text-emerald-400",
                  iconBg: "bg-violet-500/10",
                  iconColor: "text-violet-600 dark:text-violet-400",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {card.label}
                      </span>
                      <p className={`text-2xl font-bold ${card.color}`}>
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}
                    >
                      <card.icon
                        className={`h-4 w-4 ${card.iconColor || card.color}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm md:col-span-2 dark:from-slate-500/5 dark:to-slate-600/5">
                <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Cash Flow Trend</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex h-32 items-end justify-around gap-2">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="w-full rounded-t bg-linear-to-t from-chart-1 to-chart-2"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
                <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Savings Goals</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { name: "Emergency Fund", progress: 65 },
                      { name: "Vacation", progress: 42 },
                      { name: "New Laptop", progress: 88 },
                    ].map((goal) => (
                      <div key={goal.name}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{goal.name}</span>
                          <span className="text-muted-foreground">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-chart-1 to-chart-2"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Everything you need to manage money
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Subtrack gives you complete visibility into your finances with
              powerful tracking, analysis, and export tools.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 bg-background shadow-sm"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              A dashboard that actually helps
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              No clutter, no confusion. Just the insights you need to make
              better financial decisions every day.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {dashboardFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-chart-1/20 to-chart-2/20">
                  <feature.icon className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold">
                Visualize your spending with beautiful charts
              </h2>
              <p className="mb-6 text-muted-foreground">
                Our analytics dashboard gives you deep insights into your
                financial habits with interactive charts and comparisons.
              </p>
              <ul className="space-y-3">
                {[
                  "Cash flow trends over 3, 6, or 12 months",
                  "Category-wise expense breakdowns",
                  "Month-over-month comparisons",
                  "Savings progress tracking",
                  "Bills vs subscriptions analysis",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-r from-chart-3/20 to-chart-4/20 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-lg backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
                  <div className="border-b border-border/50 bg-white/50 p-3 dark:bg-black/20">
                    <p className="text-sm text-muted-foreground">
                      Expense Breakdown
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="relative mx-auto h-24 w-24">
                      <svg
                        viewBox="0 0 100 100"
                        className="h-full w-full -rotate-90"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="20"
                          className="text-chart-1"
                          strokeDasharray="125.6 251.2"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="20"
                          className="text-chart-2"
                          strokeDasharray="75.4 251.2"
                          strokeDashoffset="-125.6"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="20"
                          className="text-chart-3"
                          strokeDasharray="50.2 251.2"
                          strokeDashoffset="-201"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-lg backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
                  <div className="border-b border-border/50 bg-white/50 p-3 dark:bg-black/20">
                    <p className="text-sm text-muted-foreground">
                      Monthly Trend
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="flex h-24 items-end justify-around gap-1">
                      {[30, 45, 60, 40, 75, 55].map((h, i) => (
                        <div
                          key={i}
                          className="w-3 rounded-t bg-chart-2"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-lg backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
                  <div className="border-b border-border/50 bg-white/50 p-3 dark:bg-black/20">
                    <p className="text-sm text-muted-foreground">
                      Category Comparison
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {[
                        { name: "Utilities", width: "75%" },
                        { name: "Entertainment", width: "45%" },
                        { name: "Food", width: "60%" },
                      ].map((cat) => (
                        <div key={cat.name} className="flex items-center gap-2">
                          <span className="w-20 text-xs">{cat.name}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-linear-to-r from-chart-4 to-chart-5"
                              style={{ width: cat.width }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export Feature */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-linear-to-r from-chart-1/10 to-chart-5/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-lg backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
                  <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-semibold">Export Options</span>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    {[
                      {
                        name: "Monthly Summary",
                        desc: "Income & expenses per month",
                      },
                      {
                        name: "Recurring Details",
                        desc: "Bills & subscriptions",
                      },
                      {
                        name: "One-time Transactions",
                        desc: "Individual expenses",
                      },
                      { name: "Full Export", desc: "Everything in one file" },
                    ].map((opt) => (
                      <div
                        key={opt.name}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{opt.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="rounded bg-muted px-2 py-1 text-xs">
                            CSV
                          </span>
                          <span className="rounded bg-cyan-500/10 px-2 py-1 text-xs text-cyan-600 dark:text-cyan-400">
                            XLSX
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="mb-4 text-3xl font-bold">
                Export with smart Excel formulas
              </h2>
              <p className="mb-6 text-muted-foreground">
                Take your data anywhere. Export to CSV for simple viewing, or
                Excel with automatic SUM, AVERAGE, and cross-sheet formulas that
                update when you edit.
              </p>
              <ul className="space-y-3">
                {[
                  "Auto-calculated totals and averages",
                  "Cross-sheet references that link data",
                  "Active vs inactive summaries",
                  "Custom date range selection",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Subtrack is completely free. No hidden fees, no premium tiers, no
              limits.
            </p>
          </div>
          <div className="mx-auto max-w-md">
            <Card className="relative overflow-hidden border-2 border-primary">
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Forever Free
                </span>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {pricingFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold">Ready to take control?</h2>
            <p className="mb-8 text-muted-foreground">
              Join users who have simplified their finances with Subtrack. Start
              tracking today — it only takes a minute to sign up.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/favicon.svg"
                alt="Subtrack"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                Subtrack
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Subtrack. Manage your finances with
              ease.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
