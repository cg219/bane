import { register } from "../main.ts";
import { assertExists, assertEquals } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { User } from "../types.d.ts";
import * as bcrypt from "bcrypt";

const kv = await Deno.openKv('db/testdb');

Deno.test('registration', async (t) => {
    const USERS_BY_NAME = 'users_by_username';
    const USERS_BY_ID = 'users_by_uuid'
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
        const u = await kv.get<User>([USERS_BY_NAME, username.toLowerCase()]);

        if (!u.value) return;

        assertEquals(u.value.username, username.toString());
    })

    await t.step('is the password correct?', async () => {
        const u = await kv.get<User>([USERS_BY_NAME, username.toLowerCase()]);

        if (!u.value) return;

        const m = await bcrypt.compare(password, u.value.password);

        assertEquals(m, true);
    })

    await t.step('is user matchtching in indexes', async () => {
        const u1 = await kv.get<User>([USERS_BY_NAME, username.toLowerCase()]);

        if (!u1.value) return;

        const u2 = await kv.get<User>([USERS_BY_ID, u1.value.uuid]);

        if (!u2.value) return;

        assertEquals(JSON.stringify(u1.value), JSON.stringify(u2.value));
    })

    const u = await kv.get<User>([USERS_BY_NAME, username.toLowerCase()]);

    if (!u.value) return;

    await kv.delete([USERS_BY_NAME, u.value.username]);
    await kv.delete([USERS_BY_ID, u.value.uuid]);
})
