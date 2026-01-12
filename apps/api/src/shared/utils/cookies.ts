import { CookieOptions, Response } from "express";
import { NODE_ENV } from "@/shared/constants/env";
import { thirtyDays, thirtyDaysFromNow } from "@/shared/constants/dates";

const secure = NODE_ENV === "production";
const sameSite = NODE_ENV === "production" ? "none" : "lax";
const path = "/";

const defaults: CookieOptions = {
  httpOnly: true,
  sameSite,
  secure,
  path,
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
