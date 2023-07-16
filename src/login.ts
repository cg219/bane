import { User } from "./types.ts";
import * as bcrypt from "bcrypt";
import { createTokens } from "./token.ts";
import { createSession } from "./session.ts";
import { getUser } from "./user.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

export default { login }

export async function login(username: string, password: string) {
    const user = await getUser({ username, password });

    if (!user) return;

    const session = await createSession(user.uuid);

    return createTokens(session.uuid, user.uuid);
}
