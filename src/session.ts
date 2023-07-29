import { sessions } from "./models.ts";

export default { createSession, getSession, revokeSession, grantSession, removeSession }

export type Session = {
    uuid: string;
    userid: string;
    valid: boolean;
    updated: string;
    created: string;
}

export async function createSession(userid: string) {
    const uuid = crypto.randomUUID();
    const session: Session = {
        uuid,
        userid,
        valid: true,
        created: new Date().toUTCString(),
        updated: new Date().toUTCString()
    };

    await sessions().save(session);
    return session;
}

export function getSession(uuid: string) {
    return sessions().get(uuid) as Promise<Session>;
}

export async function removeUserSessions(userid: string) {
    await sessions().index('userid').remove(userid);
    return true;
}

export async function removeSession(uuid: string) {
    await sessions().remove(uuid);
    return true;
}

export function revokeSession(uuid: string) { return updateSession(false, uuid) }
export function grantSession(uuid: string) { return updateSession(true, uuid) }

async function updateSession(valid: boolean, uuid: string) {
    const session = await getSession(uuid);
    const newSession: Session = {
        ...session,
        updated: new Date().toUTCString(),
        valid
    }

    await sessions().save(newSession);
    return newSession;
}
