export type User = {
    uuid: string;
    email: string;
    displayname: string;
    password: string;
    [key: string]: string;
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
