export type Habit = {
    name: string;
    days?: number[];
    id: number;
    currentSequence: number;
    highestSequence: number;
    done?: boolean;
}

export type HabitInput = {
    name: string;
    days: number[];
}

export type CurrentActivities = {
    date: string;
    habits: Habit[]
}

export type NewHabitAndCurrentActivities = {
    newHabit: Habit;
    currentActivities?: CurrentActivities;
};

export type HabitsAndCurrenctActivities = {
    habits?: Habit[];
    currentActivities?: CurrentActivities;
}
