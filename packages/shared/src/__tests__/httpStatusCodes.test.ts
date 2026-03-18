import { describe, it, expect } from "bun:test";
import * as httpStatusCodes from "../httpStatusCodes";

describe("HTTP Status Codes", () => {
  it("should match standard HTTP status codes", () => {
    expect(httpStatusCodes.OK).toBe(200);
    expect(httpStatusCodes.CREATED).toBe(201);
    expect(httpStatusCodes.BAD_REQUEST).toBe(400);
    expect(httpStatusCodes.UNAUTHORIZED).toBe(401);
    expect(httpStatusCodes.FORBIDDEN).toBe(403);
    expect(httpStatusCodes.NOT_FOUND).toBe(404);
    expect(httpStatusCodes.CONFLICT).toBe(409);
    expect(httpStatusCodes.UNPROCESSABLE_CONTENT).toBe(422);
    expect(httpStatusCodes.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
