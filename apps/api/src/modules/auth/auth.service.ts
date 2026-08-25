import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

const DEFAULT_ROLE = "customer";
const BCRYPT_ROUNDS = 12;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private customers: CustomersService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const role = await this.prisma.client.role.findUnique({
      where: { slug: DEFAULT_ROLE },
    });
    if (!role) {
      throw new ConflictException(
        "Default role not seeded. Run: npm run db:seed",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.client.user.create({
      data: {
        id: uuidv7(),
        email: dto.email.toLowerCase(),
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: { create: { roleId: role.id } },
      },
      include: { roles: { include: { role: true } } },
    });

    await this.customers.ensureCustomer(user.id);

    const tokens = await this.issueTokens(user.id, user.email, [
      role.slug,
    ]);

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const user = await this.prisma.client.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        deletedAt: null,
        isActive: true,
      },
      include: { roles: { include: { role: true } } },
    });

    if (!user?.password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.customers.ensureCustomer(user.id);

    const roles = user.roles.map((r: { role: { slug: string } }) => r.role.slug);
    const tokens = await this.issueTokens(user.id, user.email, roles);

    if (meta?.userAgent || meta?.ip) {
      await this.prisma.client.device.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          userAgent: meta.userAgent,
          ipAddress: meta.ip,
        },
      });
    }

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  async socialLogin(provider: "google", idToken: string, meta?: { userAgent?: string; ip?: string }) {
    if (provider !== "google") {
      throw new UnauthorizedException("Unsupported provider");
    }

    if (!GOOGLE_CLIENT) {
      throw new UnauthorizedException("Google OAuth is not configured");
    }

    const ticket = await GOOGLE_CLIENT.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException("Google account could not be verified");
    }

    const email = payload.email.toLowerCase();
    let user = await this.prisma.client.user.findFirst({
      where: { email, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      const role = await this.prisma.client.role.findUnique({
        where: { slug: DEFAULT_ROLE },
      });
      if (!role) {
        throw new ConflictException(
          "Default role not seeded. Run: npm run db:seed",
        );
      }

      user = await this.prisma.client.user.create({
        data: {
          id: uuidv7(),
          email,
          firstName: payload.given_name ?? null,
          lastName: payload.family_name ?? null,
          avatarUrl: payload.picture ?? null,
          roles: { create: { roleId: role.id } },
        },
        include: { roles: { include: { role: true } } },
      });
      await this.customers.ensureCustomer(user.id);
    }

    const existingOAuth = await this.prisma.client.oAuthAccount.findFirst({
      where: { provider, providerUserId: payload.sub },
    });

    if (!existingOAuth) {
      await this.prisma.client.oAuthAccount.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          provider,
          providerUserId: payload.sub,
        },
      });
    }

    const roles = user.roles.map((r: { role: { slug: string } }) => r.role.slug);
    const tokens = await this.issueTokens(user.id, user.email, roles);

    if (meta?.userAgent || meta?.ip) {
      await this.prisma.client.device.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          userAgent: meta.userAgent,
          ipAddress: meta.ip,
        },
      });
    }

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { roles: { include: { role: true } } },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (
      stored.user.deletedAt ||
      !stored.user.isActive
    ) {
      throw new UnauthorizedException("User not available");
    }

    await this.prisma.client.refreshToken.delete({
      where: { id: stored.id },
    });

    const roles = stored.user.roles.map(
      (r: { role: { slug: string } }) => r.role.slug,
    );
    return this.issueTokens(stored.userId, stored.user.email, roles);
  }

  async logout(refreshToken: string) {
    await this.prisma.client.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: "Logged out successfully" };
  }

  async forgotPassword(email: string) {
    const generic = {
      message: "If that email is registered, you will receive reset instructions.",
    };
    const user = await this.prisma.client.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        isActive: true,
      },
    });
    if (!user) return generic;

    await this.prisma.client.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    await this.prisma.client.passwordResetToken.create({
      data: {
        id: uuidv7(),
        userId: user.id,
        tokenHash: this.hashResetToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const appUrl = (
      this.config.get<string>("NEXT_PUBLIC_APP_URL") ??
      this.config.get<string>("APP_URL") ??
      "http://localhost:3000"
    ).replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    this.logger.log(`Password reset link for ${user.email}: ${resetUrl}`);

    if (this.config.get<string>("NODE_ENV") === "production") {
      return generic;
    }
    return { ...generic, resetUrl };
  }

  async resetPassword(token: string, password: string) {
    const row = await this.prisma.client.passwordResetToken.findUnique({
      where: { tokenHash: this.hashResetToken(token) },
      include: { user: true },
    });
    if (
      !row ||
      row.usedAt ||
      row.expiresAt < new Date() ||
      row.user.deletedAt ||
      !row.user.isActive
    ) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id: row.userId },
        data: { password: passwordHash },
      }),
      this.prisma.client.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.client.refreshToken.deleteMany({ where: { userId: row.userId } }),
    ]);

    return { message: "Password updated. You can sign in with your new password." };
  }

  private hashResetToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.toUserResponse(user);
  }

  private async issueTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<AuthTokens> {
    const jti = uuidv7();
    const payload: JwtPayload = { sub: userId, email, roles, jti };

    const expiresIn = this.config.get<string>("JWT_EXPIRES_IN", "15m");
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_SECRET"),
      expiresIn: expiresIn as `${number}s` | `${number}m` | `${number}h` | `${number}d`,
    });

    const refreshToken = randomBytes(48).toString("hex");
    const refreshDays = this.parseRefreshExpiry();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.prisma.client.refreshToken.create({
      data: {
        id: uuidv7(),
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    await this.prisma.client.session.create({
      data: {
        id: uuidv7(),
        userId,
        token: jti,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseRefreshExpiry(): number {
    const raw = this.config.get<string>("JWT_REFRESH_EXPIRES_IN", "7d");
    const match = raw.match(/^(\d+)([dh])$/);
    if (!match) return 7;
    const value = parseInt(match[1], 10);
    return match[2] === "h" ? Math.ceil(value / 24) : value;
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: { role: { slug: string } }[];
  }): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((r) => r.role.slug),
    };
  }
}
