import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    if (!request.headers.authorization?.startsWith("Bearer ")) {
      return true;
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<T>(err: Error | null, user: T): T {
    return user;
  }
}
