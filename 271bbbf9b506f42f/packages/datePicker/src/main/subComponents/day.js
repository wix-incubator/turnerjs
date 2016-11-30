define(['lodash', 'react', 'core', 'santaProps'], function (_, React, core, santaProps) {
    'use strict';

    /**
     * @class components.Day
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Day",
        propTypes: {
            id: React.PropTypes.string.isRequired,
            styleId: React.PropTypes.string.isRequired,
            dateUtils: React.PropTypes.object.isRequired,
            day: React.PropTypes.object.isRequired,
            today: React.PropTypes.object.isRequired,
            calendarDate: React.PropTypes.object.isRequired,
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
        },
        statics: {
            useSantaTypes: true
        },
        mixins: [core.compMixins.skinBasedComp],
        getInitialState: function () {
            return {
                $mobile: this.props.isMobileDevice || this.props.isMobileView ? "mobile" : "notMobile"
            };
        },
        componentWillMount: function () {
            this.isDisabled = this.isDayDisabled(this.props);
        },
        componentWillReceiveProps: function (nextProps) {
            this.isDisabled = this.isDayDisabled(nextProps);
        },
        isSpecificDateDisable: function (props) {
            return _.some(props.disabledDates, function (disabledDate) {
                return props.dateUtils.helpers.isSameDay(props.day, new Date(disabledDate));
            });
        },
        isWeekDayDisable: function (props) {
            return _.includes(props.disabledDaysOfWeek, props.dateUtils.helpers.getDay(props.day));
        },
        isDisallowedPastDate: function (props) {
            return _.isBoolean(props.allowPastDates) && !props.allowPastDates &&
                props.dateUtils.helpers.isBefore(props.day, props.today);
        },
        isDisallowedFutureDate: function (props) {
            return _.isBoolean(props.allowFutureDates) && !props.allowFutureDates &&
                props.dateUtils.helpers.isAfter(props.day, props.today);
        },
        isBeforeMinDate: function (props) {
            var dateUtils = props.dateUtils.helpers;
            var startOfMinDate = dateUtils.getStartOfDay(new Date(props.minDate));

            return props.minDate && dateUtils.isBefore(props.day, startOfMinDate);
        },
        isAfterMaxDate: function (props) {
            return props.maxDate && props.dateUtils.helpers.isAfter(props.day, new Date(props.maxDate));
        },
        isDayDisabled: function (props) {
            return this.isSpecificDateDisable(props) ||
                this.isWeekDayDisable(props) ||
                this.isDisallowedPastDate(props) ||
                this.isDisallowedFutureDate(props) ||
                this.isBeforeMinDate(props) ||
                this.isAfterMaxDate(props);
        },
        getCssClasses: function () {
            var dateUtils = this.props.dateUtils;
            var day = this.props.day;

            var selectedClassSet = {};
            if (!dateUtils.helpers.isSameMonth(day, this.props.calendarDate)) {
                selectedClassSet.hidden = true;
            } else if (this.isDisabled) {
                selectedClassSet.disabled = true;
            } else if (dateUtils.helpers.isSameDay(day, this.props.selectedDate)) {
                selectedClassSet.selected = true;
            } else if (dateUtils.helpers.isSameDay(day, this.props.today)) {
                selectedClassSet.today = true;
            }

            return this.classSet(selectedClassSet);
        },
        handleDayClick: function () {
            this.props.onDateChange(this.props.day);
            this.props.closeCalendar();
        },
        getSkinProperties: function () {
            return {
                '': {
                    onMouseDown: this.isDisabled ? null : this.handleDayClick,
                    className: this.getCssClasses()
                },
                'dayContent': {
                    children: this.props.dateUtils.helpers.getDate(this.props.day)
                }
            };
        }
    };
});
