import { isIP } from "node:net";

export const maskIp = (ip?: string) => {
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

export const iplookup = async (ip?: string) => {
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
