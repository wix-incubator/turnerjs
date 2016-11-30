define([
    'react',
    'reactDOM',
    'lodash',
    'core',
    'santaProps',
    'datePicker/subComponents/month'], function (React, ReactDOM, _, core, santaProps, month) {
    'use strict';

    /**
     * @class components.Calendar
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Calendar",
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
            siteWidth: santaProps.Types.siteWidth.isRequired,
            siteScrollingBlocker: santaProps.Types.SiteAspects.siteScrollingBlocker.isRequired,
            forceBackground: santaProps.Types.forceBackground.isRequired,
            disableForcedBackground: santaProps.Types.disableForcedBackground.isRequired,
            allowPastDates: React.PropTypes.bool,
            allowFutureDates: React.PropTypes.bool,
            disabledDates: React.PropTypes.arrayOf(React.PropTypes.string),
            disabledDaysOfWeek: React.PropTypes.arrayOf(React.PropTypes.number),
            minDate: React.PropTypes.string,
            maxDate: React.PropTypes.string,
            selectedDate: React.PropTypes.object
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(month)),
        statics: {
            useSantaTypes: true
        },
        mixins: [core.compMixins.skinBasedComp, core.compMixins.blockOuterScrollMixin],
        getInitialState: function () {
            return {
                calendarDate: this.props.calendarDate,
                shouldShowYearSelection: false,
                $mobile: this.props.isMobileDevice || this.props.isMobileView ? "mobile" : "notMobile"
            };
        },
        componentWillReceiveProps: function (nextProps) {
            if (!this.props.dateUtils.helpers.isEqual(this.props.calendarDate, nextProps.calendarDate)) {
                this.setState({
                    calendarDate: nextProps.calendarDate
                });
            }
        },
        componentDidUpdate: function () {
            if (this.state.shouldShowYearSelection) {
                this.scrollToCurrentYearOption();
            }
        },
        generateDayNames: function () {
            var dateUtils = this.props.dateUtils;
            var startOfWeek = dateUtils.helpers.getStartDayOfTheWeek(this.state.calendarDate, {weekStartsOn: 1});

            return _(dateUtils.constants.NUMBER_OF_DAYS_IN_WEEK)
                .range()
                .map(function (dayIndex) {
                    var day = this.props.dateUtils.helpers.addDays(startOfWeek, dayIndex);

                    return React.DOM.div({className: this.classSet({'day-name': true})},
                        this.props.dateUtils.helpers.getDayNameMin(day));
                }, this)
                .value();
        },
        generateMonth: function () {
            return this.createChildComponent({}, 'wysiwyg.viewer.components.Month', 'month', {
                id: this.props.id + 'month',
                ref: this.props.id + 'month',
                style: {},
                dateUtils: this.props.dateUtils,
                selectedDate: this.props.selectedDate,
                calendarDate: this.state.calendarDate,
                today: this.props.today,
                onDateChange: this.props.onDateChange,
                closeCalendar: this.props.closeCalendar,
                disabledDates: this.props.disabledDates,
                disabledDaysOfWeek: this.props.disabledDaysOfWeek,
                allowPastDates: this.props.allowPastDates,
                allowFutureDates: this.props.allowFutureDates,
                minDate: this.props.minDate,
                maxDate: this.props.maxDate
            });
        },
        setYear: function (year) {
            this.setState({
                calendarDate: this.props.dateUtils.helpers.setYear(this.state.calendarDate, year),
                shouldShowYearSelection: false
            });
        },
        subYear: function () {
            this.setState({
                calendarDate: this.props.dateUtils.helpers.subYears(this.state.calendarDate, 1)
            });
        },
        subMonth: function () {
            this.setState({
                calendarDate: this.props.dateUtils.helpers.subMonths(this.state.calendarDate, 1)
            });
        },
        addMonth: function () {
            this.setState({
                calendarDate: this.props.dateUtils.helpers.addMonths(this.state.calendarDate, 1)
            });
        },
        addYear: function () {
            this.setState({
                calendarDate: this.props.dateUtils.helpers.addYears(this.state.calendarDate, 1)
            });
        },
        getCurrentMonth: function (mobileFormat, nonMobileFormat) {
            var dateFormat = this.state.$mobile === "mobile" ? mobileFormat : nonMobileFormat;
            return this.props.dateUtils.helpers.getDateByFormat(this.state.calendarDate, dateFormat);
        },
        toggleYearSelection: function () {
            this.setState({shouldShowYearSelection: !this.state.shouldShowYearSelection});
        },
        scrollToCurrentYearOption: function () {
            var yearOptionsWrapper = ReactDOM.findDOMNode(this.refs.yearOptionsWrapper);
            var selectedYearOptionItem = ReactDOM.findDOMNode(this.refs.selectedYearOptionItem);

            if (selectedYearOptionItem) {
                yearOptionsWrapper.scrollTop = selectedYearOptionItem.offsetTop -
                    yearOptionsWrapper.offsetHeight / 2 + selectedYearOptionItem.offsetHeight / 2;
            }
        },
        generateYearOption: function (year) {
            var isSelectedYear = this.props.dateUtils.helpers.getYear(this.state.calendarDate) === year;
            var yearOptionItemProps = {
                onClick: this.setYear.bind(this, year),
                className: this.classSet({
                    'year-option-item': true,
                    selected: isSelectedYear
                }),
                key: 'year' + year,
                ref: isSelectedYear ? 'selectedYearOptionItem' : null
            };

            return React.DOM.li(yearOptionItemProps, React.DOM.span({className: this.classSet({'year-content': true})}, year));
        },
        generateYearOptionsList: function () {
            var dateConstants = this.props.dateUtils.constants;
            var yearOptions = _(dateConstants.MIN_YEAR_OPTION_ITEM)
                .range(dateConstants.MAX_YEAR_OPTION_ITEM)
                .map(this.generateYearOption)
                .value();

            return React.DOM.ul({
                ref: 'yearOptionsList',
                className: this.classSet({'year-options-list': true})
            }, yearOptions);
        },
        createOverlay: function (refs) {
            return core.componentUtils.fullScreenOverlay.createOverlay(refs, {
                siteWidth: this.props.siteWidth,
                siteScrollingBlocker: this.props.siteScrollingBlocker,
                forceBackground: this.props.forceBackground,
                disableForcedBackground: this.props.disableForcedBackground,
                isMobileDevice: this.props.isMobileDevice,
                overlayBackgroundOpacity: '0.7'
            });
        }, getSkinProperties: function () {
            var refs = {
                previousYearNav: {
                    onClick: this.subYear
                },
                previousMonthNav: {
                    onClick: this.subMonth
                },
                currentMonthWithYear: {
                    onClick: this.toggleYearSelection,
                    children: this.getCurrentMonth(this.props.dateUtils.constants.DATE_FORMAT.MMM_YYYY,
                        this.props.dateUtils.constants.DATE_FORMAT.MMMM_YYYY)
                },
                currentMonth: {
                    children: this.getCurrentMonth(this.props.dateUtils.constants.DATE_FORMAT.MMM,
                        this.props.dateUtils.constants.DATE_FORMAT.MMMM)
                },
                previousYear: {
                    children: this.props.dateUtils.helpers.getDateByFormat(
                        this.props.dateUtils.helpers.subYears(this.state.calendarDate, 1),
                        this.props.dateUtils.constants.DATE_FORMAT.YYYY
                    )
                },
                currentYear: {
                    onClick: this.toggleYearSelection,
                    children: this.props.dateUtils.helpers.getDateByFormat(
                        this.state.calendarDate,
                        this.props.dateUtils.constants.DATE_FORMAT.YYYY)
                },
                nextYear: {
                    children: this.props.dateUtils.helpers.getDateByFormat(
                        this.props.dateUtils.helpers.addYears(this.state.calendarDate, 1),
                        this.props.dateUtils.constants.DATE_FORMAT.YYYY
                    )
                },
                nextMonthNav: {
                    onClick: this.addMonth
                },
                nextYearNav: {
                    onClick: this.addYear
                },
                dayNames: this.state.shouldShowYearSelection ? null : {children: this.generateDayNames()},
                month: this.state.shouldShowYearSelection ? null : this.generateMonth(),
                yearOptionsWrapper: this.state.shouldShowYearSelection ? {
                    onWheel: this.blockOuterScroll,
                    children: this.generateYearOptionsList()
                } : null
            };

            return this.state.$mobile === "mobile" ? this.createOverlay(refs) : refs;
        }
    };
});
