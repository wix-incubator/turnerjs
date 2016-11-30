define(['react',
    'lodash',
    'core',
    'santaProps',
    'datePicker/subComponents/day'], function (React, _, core, santaProps, day) {
    'use strict';

    /**
     * @class components.Month
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Month",
        propTypes: _.assign({
            id: React.PropTypes.string.isRequired,
            styleId: React.PropTypes.string.isRequired,
            dateUtils: React.PropTypes.object.isRequired,
            calendarDate: React.PropTypes.object.isRequired,
            today: React.PropTypes.object.isRequired,
            closeCalendar: React.PropTypes.func.isRequired,
            onDateChange: React.PropTypes.func.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            isMobileDevice: santaProps.Types.Device.isMobileDevice.isRequired,
            allowPastDates: React.PropTypes.bool,
            allowFutureDates: React.PropTypes.bool,
            disabledDates: React.PropTypes.arrayOf(React.PropTypes.string),
            disabledDaysOfWeek: React.PropTypes.arrayOf(React.PropTypes.number),
            minDate: React.PropTypes.string,
            maxDate: React.PropTypes.string,
            selectedDate: React.PropTypes.object
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(day)),
        statics: {
            useSantaTypes: true
        },
        mixins: [core.compMixins.skinBasedComp],
        getInitialState: function () {
            return {
                $mobile: this.props.isMobileDevice || this.props.isMobileView ? "mobile" : "notMobile"
            };
        },
        isWeekInMonth: function (startOfWeek) {
            var dateUtils = this.props.dateUtils;
            var calendarDate = this.props.calendarDate;
            var endOfWeek = dateUtils.helpers.addDays(startOfWeek, 6);

            return dateUtils.helpers.isSameMonth(startOfWeek, calendarDate) || dateUtils.helpers.isSameMonth(endOfWeek, calendarDate);
        },
        generateDays: function (startOfWeek) {
            var dateUtils = this.props.dateUtils;
            var isoWeek = dateUtils.helpers.getISOWeek(startOfWeek);

            return _(dateUtils.constants.NUMBER_OF_DAYS_IN_WEEK)
                .range()
                .map(function (dayOffset) {
                    return this.createChildComponent({}, 'wysiwyg.viewer.components.Day', 'day', {
                        id: this.props.id + 'week' + isoWeek + 'day' + dayOffset,
                        ref: this.props.id + 'week' + isoWeek + 'day' + dayOffset,
                        key: this.props.id + 'week' + isoWeek + 'day' + dayOffset,
                        style: {},
                        dateUtils: this.props.dateUtils,
                        day: dateUtils.helpers.addDays(startOfWeek, dayOffset),
                        today: this.props.today,
                        onDateChange: this.props.onDateChange,
                        closeCalendar: this.props.closeCalendar,
                        selectedDate: this.props.selectedDate,
                        calendarDate: this.props.calendarDate,
                        disabledDates: this.props.disabledDates,
                        disabledDaysOfWeek: this.props.disabledDaysOfWeek,
                        allowPastDates: this.props.allowPastDates,
                        allowFutureDates: this.props.allowFutureDates,
                        minDate: this.props.minDate,
                        maxDate: this.props.maxDate
                    });
                }, this)
                .value();
        },
        generateWeeks: function () {
            var dateUtils = this.props.dateUtils;
            var startDayOfTheMonth = dateUtils.helpers.getStartDayOfTheMonth(this.props.calendarDate);
            var startOfFirstWeekInMonth = dateUtils.helpers.getStartDayOfTheWeek(startDayOfTheMonth, {weekStartsOn: 1});

            return _(dateUtils.constants.MAX_NUMBER_OF_WEEKS)
                .range()
                .map(function (weekOffset) {
                    return this.props.dateUtils.helpers.addWeeks(startOfFirstWeekInMonth, weekOffset);
                }, this)
                .filter(function (weekDay) {
                    return this.isWeekInMonth(weekDay);
                }, this)
                .map(function (startOfWeek) {
                    return React.DOM.div({className: this.classSet({week: true})}, this.generateDays(startOfWeek));
                }, this)
                .value();
        },
        getSkinProperties: function () {
            return {
                '': {
                    children: this.generateWeeks()
                }
            };
        }
    };
});
