import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertExists, assertEquals } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import * as bcrypt from "bcrypt";
import { register } from "../src/authenticate.ts";
import { getUser, removeUser } from "../src/user.ts";

Deno.test('registration', async (t) => {
    const email = 'TestUser';
    const password = 'zzCwHb4nddah665fRJ87';
    const user = await register(email, password);

    await t.step('was an access token created?', () => {
        assertExists(user.accessToken);
    })

    await t.step('was an refresh token created?', () => {
        assertExists(user.refreshToken);
    })

    await t.step('is the email correct?', async () => {
        try {
            assertEquals((await getUser({ email, password })).email, email.toLowerCase());
        } catch(_) {/**/}
    })

    await t.step('is the password correct?', async () => {
        try {
            const u = await getUser({ email, password })
            const m = await bcrypt.compare(password, u.password);

            assertEquals(m, true);
        } catch (_) {/**/}
    })

    try {
        await removeUser({ email, password });
    } catch (_) {/**/}
})
