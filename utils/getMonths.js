module.exports.getMonths = () => {

    const date = new Date();
    let thisMonth = date.getMonth();
    let nextMonth = date.getMonth() + 1;
    let nextNextMonth = date.getMonth() + 2;

    const cnvMonth = (month) => {
        if (month == 0) return "January";
        if (month == 1) return "February";
        if (month == 2) return "March";
        if (month == 3) return "April";
        if (month == 4) return "May";
        if (month == 5) return "June";
        if (month == 6) return "July";
        if (month == 7) return "August";
        if (month == 8) return "September";
        if (month == 9) return "October";
        if (month == 10) return "November";
        if (month == 11) return "December";
    }

    thisMonth = cnvMonth(thisMonth);
    nextMonth = cnvMonth(nextMonth);
    nextNextMonth = cnvMonth(nextNextMonth);

    return [thisMonth, nextMonth, nextNextMonth];
}