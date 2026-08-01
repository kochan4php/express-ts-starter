import { container } from 'tsyringe';
import { Gate } from './gate';

export const Abilities = {
    READ_ALL_USERS: 'read-all-users',
    READ_USER: 'read-user',
    UPDATE_USER: 'update-user',
    DELETE_USER: 'delete-user'
} as const;

export function registerAbilities(): void {
    const gate = container.resolve(Gate);

    gate.define(Abilities.READ_ALL_USERS, (user) => {
        return user.role === 'admin';
    });

    gate.define(Abilities.READ_USER, (user, targetUserId: string) => {
        return user.role === 'admin' || user.id === targetUserId;
    });

    gate.define(Abilities.UPDATE_USER, (user, targetUserId: string) => {
        return user.role === 'admin' || user.id === targetUserId;
    });

    gate.define(Abilities.DELETE_USER, (user, targetUserId: string) => {
        return user.role === 'admin' || user.id === targetUserId;
    });
}
