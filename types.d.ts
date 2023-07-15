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
