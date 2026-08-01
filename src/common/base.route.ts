import { Router } from 'express';

export abstract class BaseRoute {
    public router: Router;
    public path: string;

    protected constructor(path: string) {
        this.path = path;
        this.router = Router();
    }

    protected abstract initializeRoutes(): void;
}
