import { USERS } from "./types.ts";
import { createSession } from "./session.ts";
import { createTokens } from "./token.ts";
import { createUser, removeUser } from "./user.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

export default { register };

export async function register(username: string, password: string) {
    const userExists = await doesUsernameExist(username);

    if (!userExists) throw new Error('Username already exists');

    const userid = await createUser({ username, password });
    const sessionToken = await createSession(userid);

    return createTokens(sessionToken.uuid, userid);
}

export async function unregister(username: string, password: string) {
    const userExists = await doesUsernameExist(username);

    if (!userExists) throw new Error('User not found');

    await removeUser({ username, password });
}

async function doesUsernameExist(username: string) {
    const user = await kv.get([USERS.NAME, username]);

    return user ? true : false;
}
