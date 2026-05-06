import { createAuthenticate } from "@/middleware/authenticate";
import ExportController from "@/modules/exports/exports.controller";
import { PrismaExportRepository } from "@/modules/exports/exports.repository";
import { ExportService } from "@/modules/exports/exports.service";

export function createExportsModule() {
  const exportRepository = new PrismaExportRepository();
  const exportService = new ExportService(exportRepository);
  const exportController = new ExportController(exportService);
  const authenticate = createAuthenticate();

  return { exportController, authenticate };
}
