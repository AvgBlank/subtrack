import { CookieOptions, Response } from "express";

import { thirtyDays, thirtyDaysFromNow } from "@/constants/dates";
import env from "@/constants/env";

const secure = env.get("NODE_ENV") === "production";
const sameSite = env.get("NODE_ENV") === "production" ? "none" : "lax";
const REFRESH_PATH = "/api/auth/refresh";

const defaults: CookieOptions = {
  httpOnly: true,
  sameSite,
  secure,
  path: REFRESH_PATH,
};

export const setAuthCookie = (res: Response, refreshToken: string | null) => {
  if (refreshToken)
    res.cookie("refreshToken", refreshToken, {
      ...defaults,
      maxAge: thirtyDays(),
      expires: thirtyDaysFromNow(),
    });
};

export const deleteAuthCookie = (res: Response) => {
  res.clearCookie("refreshToken", defaults);
};
