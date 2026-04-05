import { UAParser } from "ua-parser-js";

export interface DeviceService {
  parse(userAgent?: string): { browser: string; os: string; device: string };
}

export class UaParserDeviceService implements DeviceService {
  public parse(userAgent: string = "Unknown") {
    const parsed = UAParser(userAgent);
    return {
      browser: parsed.browser.name || "Unknown",
      os: parsed.os.name || "Unknown",
      device: parsed.device.type || "Unknown",
    };
  }
}
