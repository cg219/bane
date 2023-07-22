export type User = {
    uuid: string;
    email: string;
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
    email: string;
    password: string;
}

export enum USERS {
    ID = 'users_by_uuid',
    EMAIL = 'users_by_email'
}

export enum SESSIONS {
    ID = 'sessions_by_id',
    USER = 'sessions_by_userid'
}
