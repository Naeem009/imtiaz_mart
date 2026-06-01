import {
  ConflictException,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

const DEFAULT_ROLE = "customer";
const BCRYPT_ROUNDS = 12;

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

  async forgotPassword(_email: string) {
    throw new NotImplementedException(
      "Password reset email is not configured yet",
    );
  }

  async resetPassword(_token: string, _password: string) {
    throw new NotImplementedException(
      "Password reset is not configured yet",
    );
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
