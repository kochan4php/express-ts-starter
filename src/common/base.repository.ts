export interface IBaseRepository<T> {
    findAll(filter?: any, options?: any): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    findOne(filter: any): Promise<T | null>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T>;
    delete(id: string): Promise<T>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
    constructor(protected readonly model: any) {}

    async findAll(filter: any = {}, options: any = {}): Promise<T[]> {
        return await this.model.findMany({ where: filter, ...options });
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findUnique({ where: { id } });
    }

    async findOne(filter: any): Promise<T | null> {
        return await this.model.findFirst({ where: filter });
    }

    async create(data: any): Promise<T> {
        return await this.model.create({ data });
    }

    async update(id: string, data: any): Promise<T> {
        return await this.model.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<T> {
        return await this.model.delete({ where: { id } });
    }
}
