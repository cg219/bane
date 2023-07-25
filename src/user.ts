import { users } from "./models.ts";
import { removeUserSessions } from "./session.ts";
import { User, UserPassData } from "./types.ts";
import * as bcrypt from "bcrypt";

export default { getUser, removeUser, createUser }

export async function createUser({ email, password }: UserPassData) {
    const uuid = crypto.randomUUID();
    const hash = await bcrypt.hash(password, await bcrypt.genSalt());
    const user: User = {
        email: email.toLowerCase(),
        displayname: email,
        uuid,
        password: hash
    }

    await users().save(user);
    return uuid;
}

export async function getUser({ email, password }: UserPassData) {
    const user = await users().index('email').get(email.toLowerCase()) as User;
    const correctPass = await bcrypt.compare(password, user.password);

    if (!correctPass) throw new Error('Password incorrect');

    return user;
}

export async function removeUser({ email, password }: UserPassData) {
    const user = await getUser({ email, password });

    await users().remove(user.uuid);

    try {
        await removeUserSessions(user.uuid);
    } catch (_) { /**/ }
}
