import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { thirtyDaysFromNow } from "@/shared/constants/dates";
import { REFRESH_TOKEN_SECRET } from "@/shared/constants/env";

interface Payload {
  userId: string;
  exp: number;
}

const refreshTokenSecret = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

export const generateRefreshToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setExpirationTime(thirtyDaysFromNow())
    .sign(refreshTokenSecret);
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const { payload } = (await jwtVerify(token, refreshTokenSecret)) as {
      payload: Payload;
    };
    return payload;
  } catch {
    return null;
  }
};
