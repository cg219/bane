export type User = {
    uuid: string;
    username: string;
    displayname: string;
    password: string;
}

export type Session = {
    uuid: string;
    userid: string;
    valid: boolean;
    updated: string;
    created: string;
}

export type UserPassData = {
    username: string;
    password: string;
}

export enum USERS {
    ID = 'users_by_uuid',
    NAME = 'users_by_username'
}

export enum SESSIONS {
    ID = 'sessions_by_id',
    USER = 'sessions_by_userid'
}
