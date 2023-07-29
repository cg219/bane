import { createTokens } from "./token.ts";
import { createSession } from "./session.ts";
import { getUser, createUser, removeUser } from "./user.ts";
import { users } from "./models.ts";

export default { login, register, unregister }

export async function register(email: string, password: string) {
    const userExists = await doesUserExist(email);

    if (!userExists) throw new Error('Username already exists');

    const userid = await createUser({ email, password });
    const sessionToken = await createSession(userid);

    return createTokens(sessionToken.uuid, userid);
}

export async function unregister(email: string, password: string) {
    const userExists = await doesUserExist(email);

    if (!userExists) throw new Error('User not found');

    await removeUser({ email, password });
}

export async function login(email: string, password: string) {
    const user = await getUser({ email, password });

    if (!user) throw new Error('Login credentials re incorrect');

    const session = await createSession(user.uuid);

    return createTokens(session.uuid, user.uuid);
}

async function doesUserExist(email: string) {
    try { await users().index('email').get(email) }
    catch(_) {
        return true;
    }

    return false;
}
