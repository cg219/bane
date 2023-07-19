import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertEquals, assertExists, fail } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { createUser, getUser, removeUser } from "../src/user.ts";

Deno.test('users', async (t) => {
    const username = 'testuserrr';
    const password = 'judhfuru';

    await t.step('create a user', async () => {
        const uuid = await createUser({ username, password });

        assertEquals(typeof uuid === "string", true);
    })

    await t.step('get a user', async () => {
        const user = await getUser({ username, password });

        assertExists(user);
    })

    await t.step('remove a user', async () => {
        await removeUser({ username, password });

        try {
            await getUser({ username, password });
        } catch(e) {
            if (e.message != `User not found`) {
                fail();
            }
        }
    })

    try {
        await getUser({ username, password });
        await removeUser({ username, password });
    } catch (_) { /* catch */ }
})
