import { Router } from "express";
import * as exportsController from "@/exports/exports.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const exportsRouter = Router()
  .use(authenticate)
  .post("/", exportsController.exportData);

export default exportsRouter;
