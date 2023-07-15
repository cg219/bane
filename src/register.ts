/// <reference lib="deno.unstable" />

import { User } from "../types.d.ts";

const kv = await Deno.openKv();

export async function register(username: string, password: string) {
    const userExists = await doesUsernameExist(username);

    if (!userExists) throw new Error('Username already exists');

    await createUser(username, password);
    // check if username exists
        // return error if exists
    // save new user
    // create session
    // return jwts for accessTooken and refreshToken
}

async function doesUsernameExist(username: string) {
    const user = await kv.get(['users_by_username', username]);

    return user ? true : false;
}

async function createUser(username: string, password: string) {
    const a = await kv.atomic();
    const id = "000";
    const user: User = {
        username: username.toLowerCase(),
        displayname: username,
        uuid: id,
        password
    }

    a.set(['users_by_id', id], user);
    a.set(['users_by_username'], user.username);

    await a.commit();
}
