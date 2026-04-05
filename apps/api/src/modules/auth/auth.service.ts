import { CONFLICT } from "@subtrack/shared/httpStatusCodes";

import { HashService } from "@/modules/auth/services/hash.service";
import { ISessionService } from "@/modules/auth/services/session.service";
import { TokenService } from "@/modules/auth/services/token.service";
import { UserRepository } from "@/modules/user/user.repository";
import AppError from "@/utils/AppError";

class AuthService {
  public constructor(
    private userRepository: UserRepository,
    private hashService: HashService,
    private sessionService: ISessionService,
    private tokenService: TokenService,
  ) {}

  public async handleRegister(
    name: string,
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ) {
    // Check if user already exists
    const existingUser = await this.userRepository.getByEmail(
      email.toLowerCase(),
    );
    if (existingUser) throw new AppError(CONFLICT, "User already exists");

    // Create user
    const hashedPassword = await this.hashService.hash(password);
    const user = await this.userRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create session
    const session = await this.sessionService.createSession(
      user.id,
      userAgent,
      ip,
    );

    // Generate tokens (access & refresh)
    const payload = {
      userId: user.id,
      sessionId: session.id,
    };
    const { refreshToken, accessToken } =
      await this.tokenService.generateTokens(payload);
    return { user, refreshToken, accessToken };
  }
}

export default AuthService;
