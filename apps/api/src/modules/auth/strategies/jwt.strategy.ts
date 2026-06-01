import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.client.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
        isActive: true,
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((ur: { role: { slug: string } }) => ur.role.slug),
      jti: payload.jti,
    };
  }
}
