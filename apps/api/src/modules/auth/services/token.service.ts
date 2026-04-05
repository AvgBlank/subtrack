import { JWTPayload, SignJWT } from "jose";

import { fifteenMinutesFromNow, thirtyDaysFromNow } from "@/constants/dates";

interface Payload {
  userId: string;
  sessionId: string;
  exp?: number;
}

export interface TokenService {
  generateRefreshToken(payload: Payload): Promise<string>;
  generateAccessToken(payload: Payload): Promise<string>;
  generateTokens(
    payload: Payload,
  ): Promise<{ refreshToken: string; accessToken: string }>;
}

export class JoseTokenService implements TokenService {
  private refreshTokenSecret: Uint8Array;
  private accessTokenSecret: Uint8Array;

  public constructor(
    refreshTokenSecretString: string,
    accessTokenSecretString: string,
  ) {
    this.refreshTokenSecret = new TextEncoder().encode(
      refreshTokenSecretString,
    );
    this.accessTokenSecret = new TextEncoder().encode(accessTokenSecretString);
  }

  private toJWTPayload(payload: Payload): JWTPayload {
    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
    };
  }

  public async generateRefreshToken(payload: Payload) {
    return await new SignJWT(this.toJWTPayload(payload))
      .setProtectedHeader({ alg: "HS512" })
      .setExpirationTime(thirtyDaysFromNow())
      .sign(this.refreshTokenSecret);
  }

  public async generateAccessToken(payload: Payload) {
    return await new SignJWT(this.toJWTPayload(payload))
      .setProtectedHeader({ alg: "HS512" })
      .setExpirationTime(fifteenMinutesFromNow())
      .sign(this.accessTokenSecret);
  }

  public async generateTokens(payload: Payload) {
    const refreshToken = await this.generateRefreshToken(payload);
    const accessToken = await this.generateAccessToken(payload);
    return { refreshToken, accessToken };
  }
}
