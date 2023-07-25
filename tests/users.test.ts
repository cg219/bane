import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assert, assertEquals, assertExists } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { createUser, getUser, removeUser } from "../src/user.ts";

Deno.test('users', async (t) => {
    const email = 'testuserrr';
    const password = 'judhfuru';

    await t.step('create a user', async () => {
        const uuid = await createUser({ email, password });

        assertEquals(typeof uuid === "string", true);
    })

    await t.step('get a user', async () => {
        const user = await getUser({ email, password });

        assertExists(user);
    })

    await t.step('remove a user', async () => {
        await removeUser({ email, password });

        try {
            await getUser({ email, password });
        } catch(e) {
            if (e.message != `No values found`) {
                assert(true);
            }
        }
    })

    try {
        await getUser({ email, password });
        await removeUser({ email, password });
    } catch (_) { /* catch */ }
})
