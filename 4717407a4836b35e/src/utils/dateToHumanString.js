import moment from 'moment';

function format(date) {
    let now = moment();

    if (now.diff(date, 'days') <= 3) {
        return `[${date.from(now)}]`;
    }
    if (date.isSame(now, 'week')) {
        return 'ddd';
    }
    if (now.startOf('week').diff(date, 'week', true) <= 1) {
        return '[Last] ddd'
    }
    if (date.isSame(moment(), 'year')) {
        return 'MMM DD';
    }
    return 'MMM DD, YYYY';
}

export default function(timestamp) {
    let date = moment(parseInt(timestamp));

    //return date.calendar(null, {
    //    sameDay: '[Today]',
    //    lastDay: '[Yesterday]',
    //    lastWeek: format.bind(null, date),
    //    sameElse: format.bind(null, date)
    //});

    return date.format('DD MMM YYYY');
};