export function getWeekday (timezone) {
    const date = new Date();
    const localizedDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    return localizedDate.getDay();
}

export function getDate (timezone) {
    const date = new Date();
    const localizedDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));

    const day = String(localizedDate.getDate()).padStart(2, "0");
    const month = String(localizedDate.getMonth() + 1).padStart(2, "0");
    const year = localizedDate.getFullYear();

    return `${day}/${month}/${year}`;
}