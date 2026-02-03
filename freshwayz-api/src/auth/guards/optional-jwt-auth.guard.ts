
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // If error or no user, just return null (anonymous)
        // This allows the endpoint to be "public" but still identify the user if a valid token is provided.
        if (err || !user) {
            return null;
        }
        return user;
    }
}
