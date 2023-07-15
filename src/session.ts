import { Session } from "../types.d.ts";

const kv = await Deno.openKv();
const SESSIONS = 'sessions_by_id';

export default { createSession, revokeSession, grantSession, removeSession }

export async function createSession(userid: string) {
    const uuid = crypto.randomUUID();
    const session: Session = {
        uuid,
        userid,
        valid: true,
        created: new Date().toUTCString(),
        updated: new Date().toUTCString()
    };

    await kv.set([SESSIONS, uuid], session);

    return session;
}

export async function removeSession(uuid: string) {
    const session = await kv.get<Session>([SESSIONS, uuid]);

    if (!session.value) return false;

    await kv.delete([SESSIONS, uuid]);

    return true;
}

export function revokeSession(uuid: string) { return updateSession(false, uuid) }
export function grantSession(uuid: string) { return updateSession(true, uuid) }

async function updateSession(valid: boolean, uuid: string) {
    const session = await kv.get<Session>([SESSIONS, uuid]);

    if (!session.value) return;

    const val = session.value;
    const newSession: Session = {
        ...val,
        updated: new Date().toUTCString(),
        valid
    }

    await kv.set([SESSIONS, uuid], newSession);

    return newSession;
}
