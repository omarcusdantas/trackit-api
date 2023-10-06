export function getWeekdayByUtc(utcOffset) {
    const offsetToMilliseconds = utcOffset * 3600000;
    const date = new Date();
    const utcDate = new Date(date.getTime() + offsetToMilliseconds);
    return utcDate.getUTCDay();
}

export function getDateByUtc(utcOffset) {
    const offsetToMilliseconds = utcOffset * 3600000;
    const date = new Date();
    const utcDate = new Date(date.getTime() + offsetToMilliseconds);

    const dateWidth = 2;
    const day = String(utcDate.getUTCDate()).padStart(dateWidth, "0");
    const month = String(utcDate.getUTCMonth() + 1).padStart(dateWidth, "0");
    const year = utcDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function getPreviousDate(utcOffset) {
    const offsetToMilliseconds = utcOffset * 3600000;
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const date = new Date();
    const previousDayDate = new Date(date.getTime() - oneDayInMilliseconds + offsetToMilliseconds);

    const day = String(previousDayDate.getUTCDate()).padStart(2, "0");
    const month = String(previousDayDate.getUTCMonth() + 1).padStart(2, "0");
    const year = previousDayDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export function utcWhereIsMidnight() {
    const currentZeroUTCHour = new Date().getUTCHours();
    let offset = 24 - currentZeroUTCHour;
    offset = ((offset + 12) % 24) - 12;
    return offset;
}
