import "https://deno.land/std@0.194.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { createAccessToken, createRefreshToken } from "../src/token.ts";
import * as jwt from "jsonwebtoken";

Deno.test('tokens', async (t) => {
    const uuid = crypto.randomUUID();
    const sessionUUID = crypto.randomUUID();
    const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'secret';

    await t.step('create a refresh token', () => {
        const token = createRefreshToken(sessionUUID);
        const decoded = jwt.verify(token, JWT_SECRET);

        assertEquals(decoded.uuid, sessionUUID);
    })

    await t.step('create a access token', () => {
        const token = createAccessToken(sessionUUID, uuid);
        const decoded = jwt.verify(token, JWT_SECRET);

        assertExists(decoded.userid);
        assertExists(decoded.uuid);
        assertEquals(decoded.uuid, sessionUUID);
        assertEquals(decoded.userid, uuid);
    })
})
