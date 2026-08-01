import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodIssue } from 'zod';
import { ValidationError } from '../errors/AppError';

export class ValidateMiddleware {
    public static handle(schema: ZodObject<any>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                return next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const message = (error as any).errors.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
                    return next(new ValidationError(message));
                }
                return next(error);
            }
        };
    }
}

export const validate = ValidateMiddleware.handle;
