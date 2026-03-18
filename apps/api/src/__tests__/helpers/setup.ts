import { mock } from "bun:test";
import { Server } from "http";
import app from "../../app";

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

export const MOCK_VALID_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJzZXNzaW9uSWQiOiJ0ZXN0LXNlc3Npb24taWQiLCJleHAiOjk5OTk5OTk5OTl9.vb9oOdU8u8wO43ZBUL2NYk0sXf40sEupPGcP65YqGI3el7gCtmRRUMAgg6qpmQrBa_YgpUcy-3f0l337vwJ__g";
export const MOCK_VALID_REFRESH_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJzZXNzaW9uSWQiOiJ0ZXN0LXNlc3Npb24taWQiLCJleHAiOjk5OTk5OTk5OTl9.Fq7u_JaKjQ_v9iGNIcPnwuHtuQG46QcHXv51c-IV02SHWIk5COQ-AONboQ-2fkmLAojsaqYujwtvm9fr_26QNw";
