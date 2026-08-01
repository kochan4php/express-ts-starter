/**
 * @description This file contain all functions to interact with users table in PostgreSQL database
 * @author {Deo Sbrn}
 */
import { prisma } from '../../config/database';

async function getAllUsers(filter: any = {}): Promise<any[]> {
    return await prisma.user.findMany({ where: filter, select: { id: true, name: true, phoneNumber: true, email: true, avatar: true, bio: true, role: true } });
}

async function getOneUserById(id: string, selectedField: any = {}): Promise<any | null> {
    return await getOneUser({ id }, selectedField);
}

async function getOneUser(filter: any = {}, selectedField: any = {}, hidePassword: boolean = true): Promise<any | null> {
    const user = await prisma.user.findFirst({ where: filter });
    if (!user) return null;
    if (hidePassword) {
        const { password, ...rest } = user;
        return rest;
    }
    return user;
}

async function createUser(data: any): Promise<any> {
    return await prisma.user.create({ data });
}

async function updateOneUserById(id: string, data: any): Promise<any | null> {
    return await prisma.user.update({ where: { id }, data });
}

async function updateOneUser(filter: any, data: any): Promise<any> {
    return await prisma.user.updateMany({ where: filter, data });
}

async function deleteOneUser(filter: any): Promise<any> {
    return await prisma.user.deleteMany({ where: filter });
}

async function deleteOneUserById(id: string): Promise<any | null> {
    return await prisma.user.delete({ where: { id } });
}

export default {
    createUser,
    deleteOneUserById,
    getAllUsers,
    getOneUser,
    getOneUserById,
    updateOneUserById,
    deleteOneUser,
    updateOneUser,
};
