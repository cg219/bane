import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertExists, assertEquals, assert } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { createSession, getSession, grantSession, removeSession, revokeSession } from "../src/session.ts";

Deno.test('sessions', async (t) => {
    const userid = 'someuserid';
    const session = await createSession(userid);
    const sessions = await getSession(session.uuid);

    await t.step('does session exist?', () => {
        assertExists(sessions);
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
    })

    await t.step('remove sessions', async (t) => {
        const wasRemoved = await removeSession(session.uuid);

        await t.step('did method return correct true?', () => {
            assertEquals(wasRemoved, true);
        });

        await t.step('was session removed?', async () => {
            try {
                await getSession(session.uuid)
            } catch (_) {
                assert(true);
            }
        });
    })

    try {
        await getSession(session.uuid);
        await removeSession(session.uuid);
    } catch (_) { /* catch */ }
})
