import type { RequestHandler } from "express";
import { z } from "zod";
import * as exportServices from "@/exports/exports.services";
import AppError from "@/shared/utils/AppError";
import { BAD_REQUEST, OK } from "@subtrack/shared/httpStatusCodes";

const exportRequestSchema = z.object({
  startMonth: z.number().min(1).max(12),
  startYear: z.number().min(2000).max(2100),
  endMonth: z.number().min(1).max(12),
  endYear: z.number().min(2000).max(2100),
  exportType: z.enum([
    "monthly-summary",
    "recurring",
    "one-time",
    "income",
    "full",
  ]),
  format: z.enum(["csv", "xlsx"]),
});

export const exportData: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const parsed = exportRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(BAD_REQUEST, "Invalid export parameters");
  }

  const { startMonth, startYear, endMonth, endYear, exportType, format } =
    parsed.data;

  // Validate date range
  const startDate = new Date(startYear, startMonth - 1, 1);
  const endDate = new Date(endYear, endMonth - 1, 1);
  if (startDate > endDate) {
    throw new AppError(
      BAD_REQUEST,
      "Invalid date range: start date must be before end date",
    );
  }

  const range = { startMonth, startYear, endMonth, endYear };

  if (format === "csv") {
    let csvContent = "";
    let filename = "";

    switch (exportType) {
      case "monthly-summary": {
        const data = await exportServices.getMonthlySummaryData(userId, range);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No data in selected range");
        }
        csvContent = exportServices.generateMonthlySummaryCSV(data);
        filename = `monthly-summary-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`;
        break;
      }
      case "recurring": {
        const data = await exportServices.getRecurringData(userId);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No recurring transactions found");
        }
        csvContent = exportServices.generateRecurringCSV(data);
        filename = `recurring-transactions.csv`;
        break;
      }
      case "one-time": {
        const data = await exportServices.getOneTimeData(userId, range);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No data in selected range");
        }
        csvContent = exportServices.generateOneTimeCSV(data);
        filename = `one-time-transactions-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`;
        break;
      }
      case "income": {
        const data = await exportServices.getIncomeData(userId);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No income data found");
        }
        csvContent = exportServices.generateIncomeCSV(data);
        filename = `income.csv`;
        break;
      }
      case "full": {
        // For full export as CSV, combine all into a single response with multiple sections
        const [monthlySummary, recurring, oneTime, income] = await Promise.all([
          exportServices.getMonthlySummaryData(userId, range),
          exportServices.getRecurringData(userId),
          exportServices.getOneTimeData(userId, range),
          exportServices.getIncomeData(userId),
        ]);

        const sections = [];

        if (monthlySummary.length > 0) {
          sections.push("=== MONTHLY SUMMARY ===");
          sections.push(
            exportServices.generateMonthlySummaryCSV(monthlySummary),
          );
        }

        if (recurring.length > 0) {
          sections.push("\n=== RECURRING TRANSACTIONS ===");
          sections.push(exportServices.generateRecurringCSV(recurring));
        }

        if (oneTime.length > 0) {
          sections.push("\n=== ONE-TIME TRANSACTIONS ===");
          sections.push(exportServices.generateOneTimeCSV(oneTime));
        }

        if (income.length > 0) {
          sections.push("\n=== INCOME ===");
          sections.push(exportServices.generateIncomeCSV(income));
        }

        if (sections.length === 0) {
          throw new AppError(BAD_REQUEST, "No data found to export");
        }

        csvContent = sections.join("\n");
        filename = `full-export-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`;
        break;
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(OK).send(csvContent);
  } else {
    // XLSX format - use xlsx library with formulas
    const XLSX = await import("xlsx");
    type WorkSheet = ReturnType<typeof XLSX.utils.aoa_to_sheet>;

    // Helper to create Monthly Summary with formulas
    // When isFullExport=true, Income and Recurring reference other sheets
    const createMonthlySummarySheet = (
      data: exportServices.MonthlySummaryRow[],
      isFullExport: boolean = false,
      recurringDataLength: number = 0,
      incomeDataLength: number = 0,
    ): WorkSheet => {
      // Headers: Month, Year, Income, Recurring, OneTime, Total (formula), Savings, Remaining (formula)
      const headers = [
        "Month",
        "Year",
        "Income",
        "Recurring Expenses",
        "One-time Expenses",
        "Total Expenses",
        "Savings Required",
        "Remaining Cash",
      ];

      // In full export, reference the "Active Total" rows from other sheets
      // Recurring: Active Total is at row (dataLength + 5), column E
      // Income: Active Total is at row (dataLength + 3), column B
      const recurringActiveRow = recurringDataLength + 5;
      const incomeActiveRow = incomeDataLength + 3;

      const rows: (string | number | { f: string })[][] = [headers];

      for (let i = 0; i < data.length; i++) {
        const rowNum = i + 2; // Excel row (1-indexed, after header)
        const row = data[i];

        if (isFullExport) {
          // Reference other sheets for Income and Recurring
          rows.push([
            row.month,
            row.year,
            { f: `Income!B${incomeActiveRow}` }, // Income from Income sheet
            { f: `Recurring!E${recurringActiveRow}` }, // Recurring from Recurring sheet (Active Total)
            row.oneTimeExpenses, // One-time stays as data (varies by month)
            { f: `D${rowNum}+E${rowNum}` }, // Total = Recurring + OneTime
            row.savingsRequired,
            { f: `C${rowNum}-F${rowNum}-G${rowNum}` }, // Remaining = Income - Total - Savings
          ]);
        } else {
          rows.push([
            row.month,
            row.year,
            row.income,
            row.recurringExpenses,
            row.oneTimeExpenses,
            { f: `D${rowNum}+E${rowNum}` }, // Total = Recurring + OneTime
            row.savingsRequired,
            { f: `C${rowNum}-F${rowNum}-G${rowNum}` }, // Remaining = Income - Total - Savings
          ]);
        }
      }

      // Add totals row
      const totalRow = data.length + 2;
      rows.push([
        "TOTAL",
        "",
        { f: `SUM(C2:C${totalRow - 1})` },
        { f: `SUM(D2:D${totalRow - 1})` },
        { f: `SUM(E2:E${totalRow - 1})` },
        { f: `SUM(F2:F${totalRow - 1})` },
        { f: `SUM(G2:G${totalRow - 1})` },
        { f: `SUM(H2:H${totalRow - 1})` },
      ]);

      // Add averages row
      rows.push([
        "AVERAGE",
        "",
        { f: `AVERAGE(C2:C${totalRow - 1})` },
        { f: `AVERAGE(D2:D${totalRow - 1})` },
        { f: `AVERAGE(E2:E${totalRow - 1})` },
        { f: `AVERAGE(F2:F${totalRow - 1})` },
        { f: `AVERAGE(G2:G${totalRow - 1})` },
        { f: `AVERAGE(H2:H${totalRow - 1})` },
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Set column widths
      ws["!cols"] = [
        { wch: 12 },
        { wch: 6 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 16 },
        { wch: 15 },
      ];

      return ws;
    };

    // Helper to create Recurring sheet with formulas
    const createRecurringSheet = (
      data: exportServices.RecurringExportRow[],
    ): WorkSheet => {
      const headers = [
        "Name",
        "Type",
        "Category",
        "Frequency",
        "Amount",
        "Monthly Amount",
        "Status",
      ];

      const rows: (string | number | { f: string })[][] = [headers];

      for (const row of data) {
        rows.push([
          row.name,
          row.type,
          row.category,
          row.frequency,
          row.amount,
          row.normalizedMonthlyAmount,
          row.status,
        ]);
      }

      // Add totals
      const totalRow = data.length + 2;
      rows.push([
        "TOTAL",
        "",
        "",
        "",
        { f: `SUM(E2:E${totalRow - 1})` },
        { f: `SUM(F2:F${totalRow - 1})` },
        "",
      ]);

      // Count by status
      rows.push([]);
      rows.push(["Summary", "", "", "", "", "", ""]);
      rows.push([
        "Active Count",
        { f: `COUNTIF(G2:G${totalRow - 1},"Active")` },
        "",
        "Active Total",
        { f: `SUMIF(G2:G${totalRow - 1},"Active",F2:F${totalRow - 1})` },
        "",
        "",
      ]);
      rows.push([
        "Inactive Count",
        { f: `COUNTIF(G2:G${totalRow - 1},"Inactive")` },
        "",
        "Inactive Total",
        { f: `SUMIF(G2:G${totalRow - 1},"Inactive",F2:F${totalRow - 1})` },
        "",
        "",
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [
        { wch: 25 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 10 },
      ];

      return ws;
    };

    // Helper to create One-Time sheet with formulas
    const createOneTimeSheet = (
      data: exportServices.OneTimeExportRow[],
    ): WorkSheet => {
      const headers = ["Name", "Category", "Amount", "Date"];

      const rows: (string | number | { f: string })[][] = [headers];

      for (const row of data) {
        rows.push([row.name, row.category, row.amount, row.date]);
      }

      // Add totals
      const totalRow = data.length + 2;
      rows.push(["TOTAL", "", { f: `SUM(C2:C${totalRow - 1})` }, ""]);

      // Transaction count
      rows.push(["Count", { f: `COUNTA(A2:A${totalRow - 1})` }, "", ""]);

      // Average per transaction
      rows.push(["Average", "", { f: `AVERAGE(C2:C${totalRow - 1})` }, ""]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];

      return ws;
    };

    // Helper to create Income sheet with formulas
    const createIncomeSheet = (
      data: exportServices.IncomeExportRow[],
    ): WorkSheet => {
      const headers = ["Source", "Amount", "Date", "Status"];

      const rows: (string | number | { f: string })[][] = [headers];

      for (const row of data) {
        rows.push([row.source, row.amount, row.date, row.status]);
      }

      // Add totals
      const totalRow = data.length + 2;
      rows.push(["TOTAL", { f: `SUM(B2:B${totalRow - 1})` }, "", ""]);

      // Active income total
      rows.push([
        "Active Total",
        { f: `SUMIF(D2:D${totalRow - 1},"Active",B2:B${totalRow - 1})` },
        "",
        "",
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];

      return ws;
    };

    // Helper to create Dashboard sheet with cross-sheet references
    const createDashboardSheet = (
      hasMonthly: boolean,
      hasRecurring: boolean,
      hasOneTime: boolean,
      hasIncome: boolean,
      monthlyDataLength: number,
      recurringDataLength: number,
      oneTimeDataLength: number,
      incomeDataLength: number,
    ): WorkSheet => {
      const rows: (string | number | { f: string })[][] = [];

      rows.push(["FINANCIAL DASHBOARD", "", ""]);
      rows.push([]);
      rows.push(["Category", "Value", "Notes"]);

      if (hasIncome) {
        const incomeTotal = incomeDataLength + 2;
        rows.push([
          "Total Income (All)",
          { f: `Income!B${incomeTotal}` },
          "Sum of all income sources",
        ]);
        rows.push([
          "Active Monthly Income",
          { f: `Income!B${incomeTotal + 1}` },
          "Only active sources",
        ]);
      }

      rows.push([]);

      if (hasRecurring) {
        const recurringTotal = recurringDataLength + 2;
        rows.push([
          "Monthly Recurring Expenses",
          { f: `Recurring!F${recurringTotal}` },
          "Bills + Subscriptions (normalized)",
        ]);
        rows.push([
          "Active Recurring Only",
          { f: `Recurring!E${recurringTotal + 4}` },
          "Excluding inactive items",
        ]);
      }

      if (hasOneTime) {
        const oneTimeTotal = oneTimeDataLength + 2;
        rows.push([
          "One-Time Expenses (Period)",
          { f: `'One-Time'!C${oneTimeTotal}` },
          "Total for selected date range",
        ]);
        rows.push([
          "Average One-Time Expense",
          { f: `'One-Time'!C${oneTimeTotal + 2}` },
          "Per transaction",
        ]);
      }

      rows.push([]);

      if (hasMonthly) {
        const monthlyTotal = monthlyDataLength + 2;
        rows.push([
          "Period Total Expenses",
          { f: `'Monthly Summary'!F${monthlyTotal}` },
          "All expenses in period",
        ]);
        rows.push([
          "Period Net Cash Flow",
          { f: `'Monthly Summary'!H${monthlyTotal}` },
          "After savings",
        ]);
        rows.push([
          "Avg Monthly Expenses",
          { f: `'Monthly Summary'!F${monthlyTotal + 1}` },
          "Average per month",
        ]);
        rows.push([
          "Avg Monthly Remaining",
          { f: `'Monthly Summary'!H${monthlyTotal + 1}` },
          "Average leftover",
        ]);
      }

      rows.push([]);
      rows.push(["KEY METRICS", "", ""]);

      if (hasIncome && hasRecurring) {
        const incomeTotal = incomeDataLength + 2;
        const recurringTotal = recurringDataLength + 2;
        rows.push([
          "Savings Rate",
          {
            f: `IF(Income!B${incomeTotal + 1}>0,(Income!B${incomeTotal + 1}-Recurring!F${recurringTotal})/Income!B${incomeTotal + 1}*100,0)`,
          },
          "% of active income after recurring",
        ]);
      }

      if (hasMonthly && monthlyDataLength > 0) {
        const monthlyTotal = monthlyDataLength + 2;
        rows.push([
          "Expense Ratio",
          {
            f: `IF('Monthly Summary'!C${monthlyTotal}>0,'Monthly Summary'!F${monthlyTotal}/'Monthly Summary'!C${monthlyTotal}*100,0)`,
          },
          "% of income spent",
        ]);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 30 }];

      return ws;
    };

    const workbook = XLSX.utils.book_new();

    switch (exportType) {
      case "monthly-summary": {
        const data = await exportServices.getMonthlySummaryData(userId, range);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No data in selected range");
        }
        const ws = createMonthlySummarySheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, "Monthly Summary");
        break;
      }
      case "recurring": {
        const data = await exportServices.getRecurringData(userId);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No recurring transactions found");
        }
        const ws = createRecurringSheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, "Recurring");
        break;
      }
      case "one-time": {
        const data = await exportServices.getOneTimeData(userId, range);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No data in selected range");
        }
        const ws = createOneTimeSheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, "One-Time");
        break;
      }
      case "income": {
        const data = await exportServices.getIncomeData(userId);
        if (data.length === 0) {
          throw new AppError(BAD_REQUEST, "No income data found");
        }
        const ws = createIncomeSheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, "Income");
        break;
      }
      case "full": {
        const [monthlySummary, recurring, oneTime, income] = await Promise.all([
          exportServices.getMonthlySummaryData(userId, range),
          exportServices.getRecurringData(userId),
          exportServices.getOneTimeData(userId, range),
          exportServices.getIncomeData(userId),
        ]);

        let hasData = false;
        const hasMonthly = monthlySummary.length > 0;
        const hasRecurring = recurring.length > 0;
        const hasOneTime = oneTime.length > 0;
        const hasIncome = income.length > 0;

        // Create Dashboard sheet first (appears first in workbook)
        if (hasMonthly || hasRecurring || hasOneTime || hasIncome) {
          const dashboardWs = createDashboardSheet(
            hasMonthly,
            hasRecurring,
            hasOneTime,
            hasIncome,
            monthlySummary.length,
            recurring.length,
            oneTime.length,
            income.length,
          );
          XLSX.utils.book_append_sheet(workbook, dashboardWs, "Dashboard");
          hasData = true;
        }

        if (hasMonthly) {
          // Pass cross-sheet info so Monthly Summary references Income and Recurring sheets
          const ws = createMonthlySummarySheet(
            monthlySummary,
            true, // isFullExport
            hasRecurring ? recurring.length : 0,
            hasIncome ? income.length : 0,
          );
          XLSX.utils.book_append_sheet(workbook, ws, "Monthly Summary");
        }

        if (hasRecurring) {
          const ws = createRecurringSheet(recurring);
          XLSX.utils.book_append_sheet(workbook, ws, "Recurring");
        }

        if (hasOneTime) {
          const ws = createOneTimeSheet(oneTime);
          XLSX.utils.book_append_sheet(workbook, ws, "One-Time");
        }

        if (hasIncome) {
          const ws = createIncomeSheet(income);
          XLSX.utils.book_append_sheet(workbook, ws, "Income");
        }

        if (!hasData) {
          throw new AppError(BAD_REQUEST, "No data found to export");
        }
        break;
      }
    }

    const filename =
      exportType === "full"
        ? `full-export-${startMonth}-${startYear}-to-${endMonth}-${endYear}.xlsx`
        : `${exportType}-${startMonth}-${startYear}-to-${endMonth}-${endYear}.xlsx`;

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(OK).send(buffer);
  }
};
