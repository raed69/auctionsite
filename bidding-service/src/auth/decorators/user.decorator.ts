import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  userId: string;
  email: string;
  id?: string;
  sub?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Extract userId from various possible JWT payload formats
    const userId = user?.userId || user?.id || user?.sub;
    
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return {
      userId,
      email: user?.email,
      id: user?.id,
      sub: user?.sub,
    };
  },
);
