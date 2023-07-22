import * as jwt from "jsonwebtoken";
import { getSession } from "./session.ts";
import { Session } from "./types.ts";

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'secret';

export default { createRefreshToken, createAccessToken, createTokens, decodeToken, refreshTokens }

export function createRefreshToken(sessionUUID: string) {
    try {
        return jwt.sign({ uuid: sessionUUID }, JWT_SECRET);
    } catch (error) { console.error(error) }
}

export function createAccessToken(sessionUUID: string, userID: string) {
    try {
        return jwt.sign({ uuid: sessionUUID, userid: userID }, JWT_SECRET);
    } catch (error) { console.error(error) }
}

export function createTokens(sessionUUID: string, userID: string) {
    return {
        accessToken: createAccessToken(sessionUUID, userID),
        refreshToken: createRefreshToken(sessionUUID)
    }
}

export async function refreshTokens(refreshToken: string) {
    try {
        const { uuid } = decodeToken(refreshToken);
        const session = await getSession(uuid);

        if (session.valid) {
            return createTokens(session.uuid, session.userid);
        }

    } catch(error) { console.error(error) }
}

export function decodeToken(token: string): Session {
    return jwt.verify(token, JWT_SECRET);
}
