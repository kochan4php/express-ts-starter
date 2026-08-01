import { NextFunction, Response } from 'express';
import IRequest from '../types/i-request';
import { AccessTokenHelper } from '../utils/jwt/helpers/access-token.helper';
import { resFailed } from '../response';
import { Logger } from '../utils/logger';

export class AuthMiddleware {
    public async handle(req: IRequest, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) return resFailed(res, 401, 'Token invalid');

            try {
                await AccessTokenHelper.verifyAccessToken(token);
                const decoded = AccessTokenHelper.getUserPayloadFromAccessToken(token) as any;
                req.user = decoded;

                next();
                return;
            } catch (error: any) {
                Logger.error('AuthMiddleware.handle', error.message);
                return resFailed(res, 401, 'Token invalid');
            }
        } catch (error: any) {
            Logger.error('AuthMiddleware.handle', error.message);
            return resFailed(res, 401, 'Unauthorized');
        }
    }
}

export default new AuthMiddleware().handle.bind(new AuthMiddleware());
