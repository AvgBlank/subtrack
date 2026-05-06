import { BAD_REQUEST, OK } from "@subtrack/shared/httpStatusCodes";
import type { RequestHandler } from "express";
import { z } from "zod";

import { IExportService } from "@/modules/exports/exports.service";
import { ExportType, MonthRange } from "@/modules/exports/exports.types";
import AppError from "@/utils/AppError";

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
  // xlsx removed — CSV only
  format: z.literal("csv"),
});

class ExportController {
  public constructor(private exportService: IExportService) {}

  public exportData: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const parsed = exportRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(BAD_REQUEST, "Invalid export parameters");
    }

    const { startMonth, startYear, endMonth, endYear, exportType } =
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

    const range: MonthRange = { startMonth, startYear, endMonth, endYear };
    const { csvContent, filename } = await this.generateCSV(
      userId,
      exportType,
      range,
      startMonth,
      startYear,
      endMonth,
      endYear,
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    res.status(OK).send(csvContent);
  };

  private async generateCSV(
    userId: string,
    exportType: ExportType,
    range: MonthRange,
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ): Promise<{ csvContent: string; filename: string }> {
    switch (exportType) {
      case "monthly-summary": {
        const csv = await this.exportService.getMonthlySummaryCSV(
          userId,
          range,
        );
        if (!csv) throw new AppError(BAD_REQUEST, "No data in selected range");
        return {
          csvContent: csv,
          filename: `monthly-summary-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`,
        };
      }
      case "recurring": {
        const csv = await this.exportService.getRecurringCSV(userId);
        if (!csv)
          throw new AppError(BAD_REQUEST, "No recurring transactions found");
        return { csvContent: csv, filename: "recurring-transactions.csv" };
      }
      case "one-time": {
        const csv = await this.exportService.getOneTimeCSV(userId, range);
        if (!csv) throw new AppError(BAD_REQUEST, "No data in selected range");
        return {
          csvContent: csv,
          filename: `one-time-transactions-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`,
        };
      }
      case "income": {
        const csv = await this.exportService.getIncomeCSV(userId);
        if (!csv) throw new AppError(BAD_REQUEST, "No income data found");
        return { csvContent: csv, filename: "income.csv" };
      }
      case "full": {
        const csv = await this.exportService.getFullCSV(userId, range);
        if (!csv) throw new AppError(BAD_REQUEST, "No data found to export");
        return {
          csvContent: csv,
          filename: `full-export-${startMonth}-${startYear}-to-${endMonth}-${endYear}.csv`,
        };
      }
    }
  }
}

export default ExportController;
