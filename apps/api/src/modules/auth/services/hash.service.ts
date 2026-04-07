import { hash, verify } from "argon2";

export interface IHashService {
  hash(password: string): Promise<string>;
  verify(hashedPassword: string, password: string): Promise<boolean>;
}

export class Argon2HashService implements IHashService {
  public async hash(password: string) {
    return await hash(password);
  }

  public async verify(hashedPassword: string, password: string) {
    return await verify(hashedPassword, password);
  }
}
