import { DBUser } from "@/modules/user/user.types";

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

// Type with only ID
export type DBSessionId = {
  id: string;
};

// Type with ID and user
export type DBSessionWithUser = DBSessionId & {
  userAgent: string;
  expiresAt: Date;
  user: DBUser;
};
