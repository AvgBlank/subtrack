"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  FileType,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ExportType =
  | "monthly-summary"
  | "recurring"
  | "one-time"
  | "income"
  | "full";

type ExportFormat = "csv" | "xlsx";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const EXPORT_TYPES: {
  value: ExportType;
  label: string;
  description: string;
}[] = [
  {
    value: "monthly-summary",
    label: "Monthly Summary",
    description: "Income, expenses, and remaining cash per month",
  },
  {
    value: "recurring",
    label: "Recurring Details",
    description: "All bills and subscriptions with normalized amounts",
  },
  {
    value: "one-time",
    label: "One-time Transactions",
    description: "Individual expense entries in date range",
  },
  {
    value: "income",
    label: "Income",
    description: "All income sources and amounts",
  },
  {
    value: "full",
    label: "Full Export",
    description: "Everything above in one file",
  },
];

// Generate years from 2024 to current year + 1
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);

export default function ExportsPage() {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const [startMonth, setStartMonth] = useState(threeMonthsAgo.getMonth() + 1);
  const [startYear, setStartYear] = useState(threeMonthsAgo.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [exportType, setExportType] = useState<ExportType>("monthly-summary");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    // Validate date range
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth - 1, 1);

    if (startDate > endDate) {
      toast.error("Invalid date range", {
        description: "Start date must be before end date",
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(`${BASE_API_URL}/api/exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          startMonth,
          startYear,
          endMonth,
          endYear,
          exportType,
          format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Export failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `export.${format}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Export ready", {
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 dark:bg-cyan-500/10">
          <Download className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Exports</h1>
          <p className="text-sm text-muted-foreground">
            Download your financial data
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
        <CardHeader className="border-b border-border/50 bg-white/50 dark:bg-black/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Date Range</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Start Month
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={startMonth.toString()}
                    onValueChange={(v) => setStartMonth(Number(v))}
                  >
                    <SelectTrigger className="flex-1 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startYear.toString()}
                    onValueChange={(v) => setStartYear(Number(v))}
                  >
                    <SelectTrigger className="w-24 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  End Month
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={endMonth.toString()}
                    onValueChange={(v) => setEndMonth(Number(v))}
                  >
                    <SelectTrigger className="flex-1 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={endYear.toString()}
                    onValueChange={(v) => setEndYear(Number(v))}
                  >
                    <SelectTrigger className="w-24 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Export Type</Label>
            </div>
            <RadioGroup
              value={exportType}
              onValueChange={(v: string) => setExportType(v as ExportType)}
              className="space-y-2"
            >
              {EXPORT_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`flex items-start space-x-3 rounded-lg border bg-background/50 p-3 transition-all hover:bg-muted/50 ${
                    exportType === type.value
                      ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                      : "border-border/50"
                  }`}
                >
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={type.value}
                      className="cursor-pointer font-medium"
                    >
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  {exportType === type.value && (
                    <CheckCircle2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v: string) => setFormat(v as ExportFormat)}
              className="flex gap-4"
            >
              <div
                className={`flex items-center space-x-2 rounded-lg border bg-background/50 px-4 py-2 transition-all ${
                  format === "csv"
                    ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                    : "border-border/50"
                }`}
              >
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 rounded-lg border bg-background/50 px-4 py-2 transition-all ${
                  format === "xlsx"
                    ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                    : "border-border/50"
                }`}
              >
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="cursor-pointer">
                  Excel (XLSX)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            size="lg"
          >
            {isExporting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
