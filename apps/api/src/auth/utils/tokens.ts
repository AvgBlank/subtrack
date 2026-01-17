import { JWTPayload, jwtVerify, SignJWT } from "jose";
import {
  fifteenMinutesFromNow,
  thirtyDaysFromNow,
} from "@/shared/constants/dates";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "@/shared/constants/env";

interface Payload {
  userId: string;
  sessionId: string;
  exp: number;
}

const refreshTokenSecret = new TextEncoder().encode(REFRESH_TOKEN_SECRET);
const accessTokenSecret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);

export const generateRefreshToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setExpirationTime(thirtyDaysFromNow())
    .sign(refreshTokenSecret);
};

export const generateAccessToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setExpirationTime(fifteenMinutesFromNow())
    .sign(accessTokenSecret);
};

export const generateTokens = async (payload: JWTPayload) => {
  const refreshToken = await generateRefreshToken(payload);
  const accessToken = await generateAccessToken(payload);
  return { refreshToken, accessToken };
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

export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = (await jwtVerify(token, accessTokenSecret)) as {
      payload: Payload;
    };
    return payload;
  } catch {
    return null;
  }
};
