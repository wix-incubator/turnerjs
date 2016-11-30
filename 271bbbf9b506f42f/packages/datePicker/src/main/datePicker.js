define([
    'datePicker/subComponents/datePickerComp',
    'datePicker/subComponents/calendar',
    'datePicker/subComponents/month',
    'datePicker/subComponents/day'
], function (datePicker, calendar, month, day) {
    'use strict';

    return {
        datePicker: datePicker,
        calendar: calendar,
        month: month,
        day: day
    };
});
