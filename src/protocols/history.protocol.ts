export type HistoryEntry = {
    date: string;
    habits: {
        id: number;
        name: string;
        done: boolean;
    }[];
};

export type History = HistoryEntry[];
