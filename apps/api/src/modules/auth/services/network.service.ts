import { isIP } from "node:net";

export interface INetworkService {
  maskIp(ip?: string): string;
  lookupIp(ip?: string): Promise<string>;
}

export class IpApiNetworkService implements INetworkService {
  public maskIp(ip?: string): string {
    if (!ip) return "Unknown";
    return ip.replace(/\.\d+$/, ".xxx");
  }

  private sanitizeIp(ip?: string): string | undefined {
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
  }

  public async lookupIp(ip?: string): Promise<string> {
    const sanitizedIp = this.sanitizeIp(ip);
    if (!sanitizedIp) {
      return "Unknown";
    }

    const base = new URL("http://ip-api.com/json/");
    base.pathname += sanitizedIp;

    if (base.hostname !== "ip-api.com") {
      return "Unknown";
    }

    try {
      const req = await fetch(base.toString());
      const data = await req.json();
      if (!req.ok || data.status !== "success") {
        return "Unknown";
      }

      const country = data.country || "Unknown";
      const city = data.city || "Unknown";
      const region = data.regionName || "Unknown";
      return `${city}, ${region}, ${country}`;
    } catch {
      return "Unknown";
    }
  }
}
