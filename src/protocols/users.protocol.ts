import { HistoryEntry } from "./history.protocol";
import { Habit, CurrentActivities } from "./habits.protocol";

export type UserData = {
    userId?: number;
    historyEntry?: HistoryEntry;
    habits?: Habit[];
    currentActivities?: CurrentActivities;
};
