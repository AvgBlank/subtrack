import { CONFLICT, UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";

import { IGoogleOAuthService } from "@/modules/auth/services/google.service";
import { IHashService } from "@/modules/auth/services/hash.service";
import { ISessionService } from "@/modules/auth/services/session.service";
import { ITokenService } from "@/modules/auth/services/token.service";
import { IUserRepository } from "@/modules/user/user.repository";
import { DBUser } from "@/modules/user/user.types";
import AppError from "@/utils/AppError";

export interface IAuthService {
  handleRegister(data: {
    name: string;
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{
    user: DBUser;
    refreshToken: string;
    accessToken: string;
  }>;

  handleLogin(data: {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{
    user: DBUser;
    refreshToken: string;
    accessToken: string;
  }>;

  handleGoogleOAuth(data: {
    code: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{
    user: DBUser;
    refreshToken: string;
    accessToken: string;
  }>;
}

class AuthService implements IAuthService {
  public constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private sessionService: ISessionService,
    private tokenService: ITokenService,
    private googleOAuthService: IGoogleOAuthService,
  ) {}

  public async handleRegister(data: {
    name: string;
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { name, email, password, ip, userAgent } = data;

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

  public async handleLogin(data: {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { email, password, ip, userAgent } = data;

    // Find user
    const user = await this.userRepository.getByEmailWithPassword(
      email.toLowerCase(),
    );
    if (!user) throw new AppError(CONFLICT, "Invalid credentials");

    // Check for OAuth users (users without password)
    if (!user.password)
      throw new AppError(
        CONFLICT,
        "Please login with Google and then set a password",
      );

    // Check password
    const isPasswordValid = await this.hashService.verify(
      user.password,
      password,
    );
    if (!isPasswordValid) throw new AppError(CONFLICT, "Invalid credentials");

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
    return {
      refreshToken,
      accessToken,
      user: {
        ...user,
        password: undefined,
      },
    };
  }

  public async handleGoogleOAuth(data: {
    code: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { code, userAgent, ip } = data;

    // Fetch user info from Google
    const { email, name, picture } =
      await this.googleOAuthService.getUserFromCode(code);
    if (!email) {
      throw new AppError(UNAUTHORIZED, "No email provided");
    }

    // Check if user exists or create new user
    let user = await this.userRepository.getByEmail(email.toLowerCase());
    if (!user) {
      user = await this.userRepository.create({
        name: name ?? "Unknown User",
        email: email.toLowerCase(),
        password: null,
        picture,
      });
    }

    // Update picture if not set and exists
    if (user && !user.picture && picture) {
      user = await this.userRepository.updatePicture(user.id, picture);
    }

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
