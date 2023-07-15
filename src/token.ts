import * as jwt from "jsonwebtoken";

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'secret';

export default { createRefreshToken, createAccessToken, createTokens }

export function createRefreshToken(sessionUUID: string) {
    try {
        return jwt.sign({ uuid: sessionUUID}, JWT_SECRET);
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
