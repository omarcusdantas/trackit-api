export function getWeekday(utcOffset) {
    const offsetToMilliseconds = 3600000;
    const date = new Date();
    const utcDate = new Date(date.getTime() + utcOffset * offsetToMilliseconds);
    return utcDate.getUTCDay();
}

export function getDate(utcOffset) {
    const offsetToMilliseconds = 3600000;
    const date = new Date();
    const utcDate = new Date(date.getTime() + utcOffset * offsetToMilliseconds);

    const day = String(utcDate.getUTCDate()).padStart(2, "0");
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const year = utcDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function getPreviousDate(utcOffset) {
    const offsetToMilliseconds = 3600000;
    const oneDayMilliseconds = 24 * 60 * 60 * 1000;
    const date = new Date();
    const previousDayDate = new Date(date.getTime() - oneDayMilliseconds + utcOffset * offsetToMilliseconds);

    const day = String(previousDayDate.getUTCDate()).padStart(2, "0");
    const month = String(previousDayDate.getUTCMonth() + 1).padStart(2, "0");
    const year = previousDayDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function dayTurnedOffset() {
    const currentUTCHour = new Date().getUTCHours();
    let offset = 24 - currentUTCHour;
    offset = ((offset + 12) % 24) - 12;
    return offset;
}
