import { thirtyDaysFromNow } from "@/constants/dates";
import { ISessionRepository } from "@/modules/auth/repositories/session.repository";
import { IDeviceService } from "@/modules/auth/services/device.service";
import { INetworkService } from "@/modules/auth/services/network.service";

export interface ISessionService {
  createSession(
    userId: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ id: string }>;
}

export class SessionService implements ISessionService {
  public constructor(
    private sessionRepo: ISessionRepository,
    private networkService: INetworkService,
    private deviceService: IDeviceService,
  ) {}

  public async createSession(
    userId: string,
    userAgent: string = "Unknown",
    ip?: string,
  ) {
    const userInfo = this.deviceService.parse(userAgent);

    const ipInfo = {
      ipAddress: this.networkService.maskIp(ip),
      location: await this.networkService.lookupIp(ip),
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
