export type SignupData = {
    name: string;
    email: string;
    password: string;
    utcOffset: number;
    lastWeekday?: number;
};

export type SigninData = {
    email: string;
    password: string;
};

export type User = {
    _id: string;
    name: string;
    email: string;
    password: string;
    utcOffset: number;
    lastWeekday: number;
};
