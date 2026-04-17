import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
  
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header');
      }
  
      const [type, token] = authHeader.split(' ');
  
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid token format');
      }
  
      try {
        const decoded = this.jwtService.verify(token);
        request.user = decoded; // attach user to request
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
  