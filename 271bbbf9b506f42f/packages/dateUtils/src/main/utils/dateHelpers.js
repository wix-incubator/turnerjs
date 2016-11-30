define(["date-fns", 'dateUtils/utils/constants'], function (dateFns, constants) {
    'use strict';

    return {
        getDateByFormat: function (date, dateFormat) {
            return dateFns.format(date, dateFormat);
        },
        getStartDayOfTheWeek: function (date, options) {
            return dateFns.startOfWeek(date, options);
        },
        getStartDayOfTheMonth: function (date) {
            return dateFns.startOfMonth(date);
        },
        getDate: function (date) {
            return dateFns.getDate(date);
        },
        getDay: function (date) {
            return dateFns.getDay(date);
        },
        getStartOfDay: function (date) {
            return dateFns.startOfDay(date);
        },
        getYear: function (date) {
            return dateFns.getYear(date);
        },
        getStartOfToday: function () {
            return dateFns.startOfToday();
        },
        getISOWeek: function (date) {
            return dateFns.getISOWeek(date);
        },
        getDayNameMin: function (date) {
            return constants.DAY_NAMES.MIN[this.getDay(date)];
        },
        setYear: function (date, year) {
          return dateFns.setYear(date, year);
        },
        addDays: function (date, numOfDays) {
            return dateFns.addDays(date, numOfDays);
        },
        addWeeks: function (date, numOfWeeks) {
            return dateFns.addWeeks(date, numOfWeeks);
        },
        addMonths: function (date, numOfMonths) {
            return dateFns.addMonths(date, numOfMonths);
        },
        addYears: function (date, numOfYears) {
            return dateFns.addYears(date, numOfYears);
        },
        subMonths: function (date, numOfMonths) {
            return dateFns.subMonths(date, numOfMonths);
        },
        subYears: function (date, numOfYears) {
            return dateFns.subYears(date, numOfYears);
        },
        isSameDay: function (firstDate, secondDate) {
            return dateFns.isSameDay(firstDate, secondDate);
        },
        isSameMonth: function (firstDate, secondDate) {
            return dateFns.isSameMonth(firstDate, secondDate);
        },
        isBefore: function (dateToCompare, secondDate) {
            return dateFns.isBefore(dateToCompare, secondDate);
        },
        isAfter: function (dateToCompare, secondDate) {
            return dateFns.isAfter(dateToCompare, secondDate);
        },
        isEqual: function (firstDate, secondDate) {
            return dateFns.isEqual(firstDate, secondDate);
        }
    };
});
