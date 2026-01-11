import { Response } from "express";
import { NODE_ENV } from "@/shared/constants/env";
import { thirtyDaysFromNow } from "@/shared/constants/dates";

const secure = NODE_ENV === "production";
const sameSite = NODE_ENV === "production" ? "none" : "lax";

export const setAuthCookie = (res: Response, refreshToken: string | null) => {
  if (refreshToken)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite,
      secure,
      expires: thirtyDaysFromNow(),
    });
};

export const deleteAuthCookie = (res: Response) => {
  res.clearCookie("refreshToken");
};
