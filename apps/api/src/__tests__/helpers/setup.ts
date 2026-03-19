import { mock } from "bun:test";
import { Server } from "http";
import app from "../../app";
import { generateTokens } from "@/auth/utils/tokens";

// Mock env constants that we need
mock.module("../../shared/constants/env", () => ({
  NODE_ENV: "test",
  PORT: 0,
  APP_ORIGIN: "http://localhost:3000",
  DATABASE_URL: "dummy",
  REFRESH_TOKEN_SECRET: "refresh_secret",
  ACCESS_TOKEN_SECRET: "access_secret",
  GOOGLE_CLIENT_ID: "client_id",
  GOOGLE_CLIENT_SECRET: "client_secret",
  GOOGLE_REDIRECT_URI: "redirect_uri",
}));

// Provide a test server helper
export const createTestServer = () => {
  return new Promise<{ server: Server; url: string }>((resolve) => {
    const server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "string" ? addr : addr?.port;
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
};

export const {
  accessToken: MOCK_VALID_TOKEN,
  refreshToken: MOCK_VALID_REFRESH_TOKEN,
} = await generateTokens({
  userId: "user-id",
  sessionId: "test-session-id",
});
