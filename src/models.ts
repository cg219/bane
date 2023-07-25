import { kvdb } from "./kv/mod.ts"
import { Session, User } from "./types.ts";

const kv = await Deno.openKv(Deno.env.get('TEST_DB'));

export const users = () => kvdb<User>(kv)
    .name('users')
    .primary('uuid')
    .secondary('email')
    .create()

export const sessions = () => kvdb<Session>(kv)
    .name('sessions')
    .primary('uuid')
    .secondary('userid')
    .create()
