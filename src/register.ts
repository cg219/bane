import { User } from "../types.d.ts";
import * as bcrypt from "bcrypt";
import { createSession } from "./session.ts";
import { createTokens } from "./token.ts";

const kv = await Deno.openKv();

export default { register };

export async function register(username: string, password: string) {
    const userExists = await doesUsernameExist(username);

    if (!userExists) throw new Error('Username already exists');

    const userid = await createUser(username, password);
    const sessionToken = await createSession(userid);

    return createTokens(sessionToken.uuid, userid);
}

async function doesUsernameExist(username: string) {
    const user = await kv.get(['users_by_username', username]);

    return user ? true : false;
}

async function createUser(username: string, password: string) {
    const a = await kv.atomic();
    const uuid = crypto.randomUUID();
    const hash = await bcrypt.hash(password, await bcrypt.genSalt());
    const user: User = {
        username: username.toLowerCase(),
        displayname: username,
        uuid,
        password: hash
    }

    a.set(['users_by_uuid', uuid], user);
    a.set(['users_by_username', user.username], user);

    await a.commit();

    return uuid;
}
