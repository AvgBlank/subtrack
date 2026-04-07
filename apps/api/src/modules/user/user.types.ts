export type DBUserWithPassword = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  picture: string | null;
};

export type DBUser = Omit<DBUserWithPassword, "password">;
