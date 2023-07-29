import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { createAccessTokens } from "../src/token.ts";
import * as jwt from "jsonwebtoken";

Deno.test('tokens', async (t) => {
    const uuid = crypto.randomUUID();
    const sessionUUID = crypto.randomUUID();
    const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'secret';
    const { refreshToken, accessToken } = createAccessTokens(sessionUUID, uuid);

    await t.step('create a refresh token', () => {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        assertEquals(decoded.uuid, sessionUUID);
    })

    await t.step('create a access token', () => {
        const decoded = jwt.verify(accessToken, JWT_SECRET);

        assertExists(decoded.userid);
        assertExists(decoded.uuid);
        assertEquals(decoded.uuid, sessionUUID);
        assertEquals(decoded.userid, uuid);
    })
})
