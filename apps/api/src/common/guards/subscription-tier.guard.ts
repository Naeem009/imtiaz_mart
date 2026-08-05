import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const vendorId = req.user?.vendorId;
    if (!vendorId) return false;

    try {
      // check vendor subscription tier; fallback to allowing if not found
      const prisma = req.app.get("PrismaService")?.client ?? (req.app.get("PrismaService") as any)?.client;
      if (!prisma) return true;
      const sub = await prisma.vendorSubscription.findUnique({ where: { vendorId } });
      if (!sub) return true;
      if (sub.tier === "STARTER") {
        throw new ForbiddenException("Subscription tier does not allow automation features");
      }
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return true;
    }
  }
}
