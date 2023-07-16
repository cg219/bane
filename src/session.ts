import { SESSIONS, Session } from "./types.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

export default { createSession, getSession, revokeSession, grantSession, removeSession }

export async function createSession(userid: string) {
    const uuid = crypto.randomUUID();
    const session: Session = {
        uuid,
        userid,
        valid: true,
        created: new Date().toUTCString(),
        updated: new Date().toUTCString()
    };

    await kv.atomic()
        .set([SESSIONS.ID, uuid], session)
        .set([SESSIONS.USER, userid, uuid], session)
        .commit()

    return session;
}

export async function getSession(uuid: string) {
    const session = await kv.get<Session>([SESSIONS.ID, uuid]);

    if (!session.value) throw new Error('Session not found');

    return session.value;
}

export async function removeUserSessions(userid: string) {
    const relatedSessions = kv.list<Session>({ prefix: [SESSIONS.USER, userid] });

    for await(const r of relatedSessions) {
        await removeSession(r.value.uuid)
    }

    return true;
}

export async function removeSession(uuid: string) {
    const session = await getSession(uuid);
    const relatedSessions = kv.list<Session>({ prefix: [SESSIONS.USER, session.userid] });
    const updateRelated = [];

    for await(const r of relatedSessions) {
        if (session.uuid == r.value.uuid) updateRelated.push(r.value);
    }

    const a = kv.atomic();

    a.delete([SESSIONS.ID, uuid]);

    updateRelated.forEach((s) => a.delete([SESSIONS.USER, s.userid, s.uuid]));

    await a.commit();

    return true;
}

export function revokeSession(uuid: string) { return updateSession(false, uuid) }
export function grantSession(uuid: string) { return updateSession(true, uuid) }

async function updateSession(valid: boolean, uuid: string) {
    const session = await getSession(uuid);
    const relatedSessions = kv.list<Session>({ prefix: [SESSIONS.USER, session.userid] });
    const updateRelated = [];

    for await(const r of relatedSessions) {
        if (session.uuid == r.value.uuid) updateRelated.push(r.value);
    }

    const newSession: Session = {
        ...session,
        updated: new Date().toUTCString(),
        valid
    }

    const a = kv.atomic();

    a.set([SESSIONS.ID, uuid], newSession);

    updateRelated.forEach((s) => a.set([SESSIONS.USER, s.userid, s.uuid], newSession));

    await a.commit();

    return newSession;
}
