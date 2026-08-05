import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Placeholder: implement subscription tier checks here.
    // For now, allow access — enforcement must be added according to 06_SOCIAL_MEDIA_AUTOMATION_ENGINE.md
    return true;
  }
}
