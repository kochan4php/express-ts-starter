/**
 * @description This file contain all functions to interact with sessions table in PostgreSQL database
 * @author {Deo Sbrn}
 */
import { prisma } from '../../config/database';

async function getAllSessions(filter: any = {}): Promise<any[]> {
    return await prisma.session.findMany({ where: filter });
}

async function getOneSessionById(id: string, selectedField: any = {}): Promise<any | null> {
    return await getOneSession({ id }, selectedField);
}

async function getOneSession(filter: any = {}, selectedField: any = {}): Promise<any | null> {
    return await prisma.session.findFirst({ where: filter });
}

async function createSession(data: any): Promise<any> {
    return await prisma.session.create({ data });
}

async function updateOneSessionById(id: string, data: any): Promise<any | null> {
    return await prisma.session.update({ where: { id }, data });
}

async function updateOneSession(filter: any, data: any): Promise<any> {
    return await prisma.session.updateMany({ where: filter, data });
}

async function deleteOneSession(filter: any): Promise<any> {
    return await prisma.session.deleteMany({ where: filter });
}

async function deleteOneSessionById(id: string): Promise<any | null> {
    return await prisma.session.delete({ where: { id } });
}

async function revokeSession(sessionId: string): Promise<void> {
    await prisma.session.delete({ where: { id: sessionId } });
}

export default {
    createSession,
    deleteOneSession,
    deleteOneSessionById,
    getAllSessions,
    getOneSession,
    getOneSessionById,
    revokeSession,
    updateOneSession,
    updateOneSessionById,
};
