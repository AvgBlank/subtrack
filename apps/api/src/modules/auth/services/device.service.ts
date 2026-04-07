import { UAParser } from "ua-parser-js";

export interface IDeviceService {
  parse(userAgent?: string): { browser: string; os: string; device: string };
}

export class UaParserDeviceService implements IDeviceService {
  public parse(userAgent: string = "Unknown") {
    const parsed = UAParser(userAgent);
    return {
      browser: parsed.browser.name || "Unknown",
      os: parsed.os.name || "Unknown",
      device: parsed.device.type || "Unknown",
    };
  }
}
