import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertExists, assertEquals } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { USERS, User } from "../src/types.ts";
import * as bcrypt from "bcrypt";
import { register } from "../src/register.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

Deno.test('registration', async (t) => {
    const username = 'TestUser';
    const password = 'zzCwHb4nddah665fRJ87';
    const user = await register(username, password);

    await t.step('was an access token created?', () => {
        assertExists(user.accessToken);
    })

    await t.step('was an refresh token created?', () => {
        assertExists(user.refreshToken);
    })

    await t.step('is the username correct?', async () => {
        const u = await kv.get<User>([USERS.NAME, username.toLowerCase()]);

        if (!u.value) throw new Error();

        assertEquals(u.value.username, username.toLowerCase());
    })

    await t.step('is the password correct?', async () => {
        const u = await kv.get<User>([USERS.NAME, username.toLowerCase()]);

        if (!u.value) throw new Error();

        const m = await bcrypt.compare(password, u.value.password);

        assertEquals(m, true);
    })

    await t.step('is user matchtching in indexes', async () => {
        const u1 = await kv.get<User>([USERS.NAME, username.toLowerCase()]);

        if (!u1.value) throw new Error();

        const u2 = await kv.get<User>([USERS.ID, u1.value.uuid]);

        if (!u2.value) throw new Error();

        assertEquals(JSON.stringify(u1.value), JSON.stringify(u2.value));
    })

    const u = await kv.get<User>([USERS.NAME, username.toLowerCase()]);

    if (u.value) {
        await kv.delete([USERS.NAME, u.value.username]);
        await kv.delete([USERS.ID, u.value.uuid]);
    }
})
