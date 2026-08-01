import { NextFunction, Response } from 'express';
import IRequest from '../types/i-request';
import { resFailed } from '../response';

export class IsAdminMiddleware {
    public async handle(req: IRequest, res: Response, next: NextFunction): Promise<void | Response> {
        if (req.user?.role.toLowerCase() === 'admin') {
            next();
            return;
        }

        return resFailed(res, 403, 'Forbidden');
    }
}

export default new IsAdminMiddleware().handle.bind(new IsAdminMiddleware());
