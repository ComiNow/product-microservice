import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly excludedRoutePatterns = [
    { pattern: /^\/$/, method: 'GET' },
    { pattern: /^\/api\/auth\/login$/, method: 'POST' },
    { pattern: /^\/api\/auth\/register$/, method: 'POST' },
    { pattern: /^\/api\/products$/, method: 'GET' },
    { pattern: /^\/api\/products\/\d+$/, method: 'GET' },
    { pattern: /^\/api\/products\/top-selling$/, method: 'GET' },
    { pattern: /^\/api\/categories$/, method: 'GET' },
    { pattern: /^\/api\/categories\/\d+$/, method: 'GET' },
    { pattern: /^\/api\/orders$/, method: 'POST' },
    { pattern: /^\/api\/tables\/id\/[0-9a-fA-F-]+$/, method: 'GET' },
    {
      pattern: /^\/api\/orders\/order-position-by-table\/[0-9a-fA-F-]+$/,
      method: 'GET',
    },
    {
      pattern: /^\/api\/orders\/paid-order-by-table\/[0-9a-fA-F-]+$/,
      method: 'GET',
    },
  ];

  constructor(
    @Inject(envs.natsServiceName) private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { path, method } = request;

    const isExcluded = this.excludedRoutePatterns.some(
      (route) => route.method === method && route.pattern.test(path),
    );

    if (isExcluded) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const { user, token: newToken } = await firstValueFrom(
        this.client.send('auth.verify.user', token),
      );
      request['user'] = user;
      request['token'] = newToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
