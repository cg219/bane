import { removeUserSessions } from "./session.ts";
import { USERS, User, UserPassData } from "./types.ts";
import * as bcrypt from "bcrypt";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

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

    await kv.atomic()
        .set([USERS.ID, uuid], user)
        .set([USERS.EMAIL, user.email], user)
        .commit();

    return uuid;
}

export async function getUser({ email, password }: UserPassData) {
    const user = await kv.get<User>([USERS.EMAIL, email.toLowerCase()]);

    if (!user.value) throw new Error('User not found');

    const correctPass = await bcrypt.compare(password, user.value.password);

    if (!correctPass) throw new Error('Password incorrect');

    return user.value;
}

export async function removeUser({ email, password }: UserPassData) {
    const user = await getUser({ email, password });

    await kv.atomic()
        .delete([USERS.ID, user.uuid])
        .delete([USERS.EMAIL, user.email])
        .commit();

    await removeUserSessions(user.uuid);
}
