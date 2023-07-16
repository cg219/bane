import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertExists, assertEquals, assertNotEquals } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { SESSIONS, Session } from "../src/types.ts";
import * as bcrypt from "bcrypt";
import { createSession, getSession, grantSession, removeSession, revokeSession } from "../src/session.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

Deno.test('sessions', async (t) => {
    const userid = 'someuserid';
    const session = await createSession(userid);
    const sessions = kv.list<Session>({ prefix: [SESSIONS.USER, userid] }, { limit: 1});

    await t.step('does session exist?', async () => {
        const s = await kv.get<Session>([SESSIONS.ID, session.uuid]);

        assertExists(s.value);
    })

    await t.step('does session secondary index exist?', async () => {
        for await(const s of sessions) {
            assertExists(s.value);
        }
    })

    await t.step('update sessions', async (t) => {
        await t.step('was session invalidated?', async () => {
            const s = await revokeSession(session.uuid);

            assertEquals(s.valid, false);
        });

        await t.step('was session restored?', async () => {
            const s = await grantSession(session.uuid);

            assertEquals(s.valid, true);
        })

        await t.step('were secondary indexes updated?', async () => {
            const s = await kv.get<Session>([SESSIONS.ID, session.uuid]);
            const l = kv.list({ prefix: [SESSIONS.USER, session.userid] }, { limit: 1 });

            for await(const e of l) {
                assertEquals(JSON.stringify(e.value), JSON.stringify(s.value));
            }
        })
    })

    await t.step('remove sessions', async (t) => {
        const wasRemoved = await removeSession(session.uuid);

        await t.step('did method return correct true?', () => {
            assertEquals(wasRemoved, true);
        });

        await t.step('was session removed?', async () => {
            const s = await kv.get<Session>([SESSIONS.ID, session.uuid]);

            assertEquals(s.value, null);
        });

        await t.step('was secondary index removed?', async () => {
            const l = kv.list({ prefix: [SESSIONS.USER, session.userid] }, { limit: 1 });

            for await(const e of l) {
                assertEquals(e.value, null);
            }
        })
    })

    try {
        await getSession(session.uuid);
        await removeSession(session.uuid);
    } catch (_) { /* catch */ }
})
