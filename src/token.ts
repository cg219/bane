import * as jwt from "jsonwebtoken";
import { Session, getSession } from "./session.ts";

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'secret';

export default { createAccessTokens, decodeToken, refreshTokens }

function createRefreshToken(sessionUUID: string) {
    try {
        return jwt.sign({ uuid: sessionUUID }, JWT_SECRET);
    } catch (error) { console.error(error) }
}

function createAccessToken(sessionUUID: string, userID: string) {
    try {
        return jwt.sign({ uuid: sessionUUID, userid: userID }, JWT_SECRET);
    } catch (error) { console.error(error) }
}

export function createAccessTokens(sessionUUID: string, userID: string) {
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
            return createAccessTokens(session.uuid, session.userid);
        }

    } catch(error) { console.error(error) }
}

function decodeToken(token: string): Session {
    return jwt.verify(token, JWT_SECRET);
}
