import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions");
    }
    return true;
  }
}
