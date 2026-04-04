import { SessionRepository } from "@/modules/auth/repositories/session.repository";
import { thirtyDaysFromNow } from "@/shared/constants/dates";
import { UAParser } from "ua-parser-js";
import { iplookup, maskIp } from "@/modules/auth/services/ip.service";

export class SessionService {
  public constructor(private sessionRepo: SessionRepository) {}

  public async createSession(
    userId: string,
    userAgent: string = "Unknown",
    ip?: string,
  ) {
    const parsed = UAParser(userAgent);

    const userInfo = {
      browser: parsed.browser.name || "Unknown",
      os: parsed.os.name || "Unknown",
      device: parsed.device.type || "Unknown",
    };

    const ipInfo = {
      ipAddress: maskIp(ip),
      location: await iplookup(ip),
    };

    return this.sessionRepo.create({
      userId,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
      ...userInfo,
      ...ipInfo,
    });
  }
}
