import { Request, Response } from 'express';
import { resSuccess } from '../../common/response';

export class CoreController {
    public async index(_: Request, res: Response): Promise<Response> {
        const message = 'Hello from Node.js + Express.js + TypeScript Starter';
        return resSuccess(res, 200, message, {
            docs: 'https://github.com/kochan4php/express-ts-starter',
        });
    }
}
