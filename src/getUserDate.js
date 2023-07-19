export function getWeekday (timezone) {
    const date = new Date();
    const localizedDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    return localizedDate.getDay();
}