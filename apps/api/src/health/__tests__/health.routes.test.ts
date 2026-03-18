import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createTestServer } from "../../__tests__/helpers/setup";

describe("Health Router Integration", () => {
  let server: any;
  let url: string;

  beforeAll(async () => {
    const testServer = await createTestServer();
    server = testServer.server;
    url = testServer.url;
  });

  afterAll(() => {
    server.close();
  });

  it("GET / should return 200 Healthy", async () => {
    const response = await fetch(`${url}/`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("Healthy");
  });

  it("GET /health should return 200 Healthy", async () => {
    const response = await fetch(`${url}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("Healthy");
  });
});
