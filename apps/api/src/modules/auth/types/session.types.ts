export type DBSession = {
  userId: string;
  userAgent: string;
  ipAddress: string;
  location: string;
  browser: string;
  os: string;
  device: string;
  expiresAt: Date;
};
