import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw error when user is not authenticated
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Return user if authenticated, or undefined if not (don't throw error)
    return user || undefined;
  }
}
