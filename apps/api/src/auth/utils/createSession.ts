import { thirtyDaysFromNow } from "@/shared/constants/dates";
import prisma from "@/shared/lib/db";
import { UAParser } from "ua-parser-js";
import { isIP } from "node:net";

import { Request } from "express";

const maskIp = (ip?: string) => {
  if (!ip) return "Unknown";

  return ip.replace(/\.\d+$/, ".xxx");
};

const sanitizeIp = (ip?: string) => {
  if (!ip) return undefined;

  // Some proxies set multiple IPs in headers like "x-forwarded-for"
  const firstPart = ip.split(",")[0]?.trim();
  if (!firstPart) {
    return undefined;
  }

  if (isIP(firstPart) === 0) {
    return undefined;
  }
  return firstPart;
};

const iplookup = async (ip?: string) => {
  const sanitizedIp = sanitizeIp(ip);
  if (!sanitizedIp) {
    return "Unknown";
  }

  const base = new URL("http://ip-api.com/json/");
  base.pathname += sanitizedIp;

  // Extra safety: ensure host is exactly what you expect
  if (base.hostname !== "ip-api.com") {
    return "Unknown";
  }

  const req = await fetch(base.toString());

  const data = await req.json();
  if (!req.ok || data.status !== "success") {
    return "Unknown";
  }

  const country = data.country || "Unknown";
  const city = data.city || "Unknown";
  const region = data.regionName || "Unknown";
  return `${city}, ${region}, ${country}`;
};

const getHeader = (req: Request, headerName: string): string | undefined => {
  const headerValue = req.headers[headerName.toLowerCase()];
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }
  return headerValue;
};

const createSession = async (
  userId: string,
  userAgent: string = "Unknown",
  req: Request,
) => {
  const parsed = UAParser(userAgent);

  const userInfo = {
    browser: parsed.browser.name || "Unknown",
    os: parsed.os.name || "Unknown",
    device: parsed.device.type || "Unknown",
  };

  const ip =
    getHeader(req, "cf-connecting-ip") ||
    getHeader(req, "x-real-ip") ||
    getHeader(req, "x-forwarded-for") ||
    req.socket.remoteAddress ||
    undefined;

  const ipInfo = {
    ipAddress: maskIp(ip),
    location: await iplookup(ip),
  };

  return prisma.session.create({
    data: {
      userId,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
      ...userInfo,
      ...ipInfo,
    },
  });
};
export default createSession;
