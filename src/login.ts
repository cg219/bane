import { createTokens } from "./token.ts";
import { createSession } from "./session.ts";
import { getUser } from "./user.ts";

export default { login }

export async function login(username: string, password: string) {
    const user = await getUser({ username, password });

    if (!user) return;

    const session = await createSession(user.uuid);

    return createTokens(session.uuid, user.uuid);
}
