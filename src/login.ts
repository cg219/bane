import { User } from "../types.d.ts";
import * as bcrypt from "bcrypt";
import { createTokens } from "./token.ts";
import { createSession } from "./session.ts";

const kv = await Deno.openKv();

export default { login }

export async function login(username: string, password: string) {
    const user = await getUser(username, password);

    if (!user) return;

    const session = await createSession(user.uuid);

    return createTokens(session.uuid, user.uuid);
}

async function getUser(username: string, password: string) {
    const user = await kv.get<User>(['users_by_username', username.toLowerCase()]);

    if (!user.value) return;

    const correctPass = await bcrypt.compare(password, user.value.password);

    if (!correctPass) return;

    return user.value;
}
