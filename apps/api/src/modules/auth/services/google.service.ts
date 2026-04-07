import { INTERNAL_SERVER_ERROR } from "@subtrack/shared/httpStatusCodes";

import AppError from "@/utils/AppError";

export interface IGoogleOAuthService {
  getUserFromCode(code: string): Promise<{
    email?: string;
    name?: string;
    picture?: string;
  }>;
}

export class GoogleOAuthService implements IGoogleOAuthService {
  private googleClientId: string;
  private googleClientSecret: string;
  private googleRedirectUri: string;

  constructor(
    googleClientId: string,
    googleClientSecret: string,
    googleRedirectUri: string,
  ) {
    this.googleClientId = googleClientId;
    this.googleClientSecret = googleClientSecret;
    this.googleRedirectUri = googleRedirectUri;
  }

  public async getUserFromCode(code: string) {
    // Exchange code for access token
    const { access_token } = (await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: this.googleRedirectUri,
        }),
      },
    ).then((res) => res.json())) as { access_token?: string };
    if (!access_token) {
      throw new AppError(INTERNAL_SERVER_ERROR, "Failed to get access token");
    }

    // Get user info from Google
    const { email, name, picture } = (await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    ).then((res) => res.json())) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    return { email, name, picture };
  }
}
