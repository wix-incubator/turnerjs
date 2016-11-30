define(['lodash',
    'react',
    'reactDOM',
    'core',
    'testUtils',
    'dateUtils',
    'datePicker/subComponents/calendar'], function (_, React, ReactDOM, core, testUtils, dateUtils, calendar) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;
    var defaultProps = {
        id: "id",
        styleId: "styleId",
        dateUtils: dateUtils,
        calendarDate: new Date(2016, 6, 11),
        today: new Date(2016, 6, 16),
        isMobileView: false,
        isMobileDevice: false,
        siteWidth: 320,
        siteScrollingBlocker: {setSiteScrollingBlocked: _.noop},
        forceBackground: _.noop,
        disableForcedBackground: _.noop,
        closeCalendar: _.noop,
        onDateChange: _.noop,
        selectedDate: {},
        allowPastDates: true,
        allowFutureDates: true,
        disabledDates: [],
        disabledDaysOfWeek: [],
        minDate: new Date(2016, 6, 2).toISOString(),
        maxDate: new Date(2016, 6, 24).toISOString(),
        skin: 'wysiwyg.viewer.skins.CalendarDefaultSkin'
    };

    describe('calendar sub component', function () {
        var calendarComp;

        beforeEach(function () {
            calendarComp = renderCalendar();
        });

        function renderCalendar(propsOverrides) {
            var compProps = testUtils.santaTypesBuilder.getComponentProps(calendar, _.defaults(propsOverrides || {}, defaultProps));
            return testUtils.getComponentFromDefinition(calendar, compProps);
        }

        describe('getInitialState', function () {
            it('should init calendar date state to calendar date from props and set mobile state', function () {
                var initialState = calendarComp.getInitialState();

                expect(initialState.calendarDate).toEqual(calendarComp.props.calendarDate);
                expect(initialState.shouldShowYearSelection).toEqual(false);
                expect(initialState.$mobile).toEqual('notMobile');
            });

            it('should have $mobile - mobile if on mobile view', function () {
                var calendarInMobileView = renderCalendar({
                    isMobileView: true,
                    isMobileDevice: false
                });

                var initialState = calendarInMobileView.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });

            it('should have $mobile - mobile if on mobile device', function () {
                var calendarInMobileDevice = renderCalendar({
                    isMobileView: false,
                    isMobileDevice: true
                });

                var initialState = calendarInMobileDevice.getInitialState();

                expect(initialState.$mobile).toEqual('mobile');
            });
        });

        describe('componentWillReceiveProps', function () {
            it('should set calendar date in state if it is different in new props', function () {
                var newCalendarDate = {calendarDate: new Date(2015, 6, 11)};
                var nextProps = _.assign({}, calendarComp.props, newCalendarDate);
                spyOn(calendarComp, 'setState');

                calendarComp.componentWillReceiveProps(nextProps);

                expect(calendarComp.setState).toHaveBeenCalledWith(newCalendarDate);
            });

            it('should not set calendar date in state if it is the same in new props ', function () {
                var newCalendarDate = {calendarDate: calendarComp.state.calendarDate};
                var nextProps = _.assign({}, calendarComp.props, newCalendarDate);
                spyOn(calendarComp, 'setState');

                calendarComp.componentWillReceiveProps(nextProps);

                expect(calendarComp.setState).not.toHaveBeenCalled();
            });
        });

        describe('componentDidUpdate', function () {
            it('should scroll to current year option if should show year selection', function (done) {
                spyOn(calendarComp, 'scrollToCurrentYearOption');

                calendarComp.setState({shouldShowYearSelection: true}, function () {
                    calendarComp.componentDidUpdate();

                    expect(calendarComp.scrollToCurrentYearOption).toHaveBeenCalled();
                    done();
                });
            });

            it('should not scroll to current year option if should year selection', function (done) {
                spyOn(calendarComp, 'scrollToCurrentYearOption');

                calendarComp.setState({shouldShowYearSelection: false}, function () {
                    calendarComp.componentDidUpdate();

                    expect(calendarComp.scrollToCurrentYearOption).not.toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('previous year button', function () {
            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().previousYearNav.onClick).toEqual(calendarComp.subYear);
            });

            it('should invoke sub year func and set new calendar date accordingly upon click', function () {
                spyOn(calendarComp, 'setState');

                var btnClass = calendarComp.props.styleId + 'previousYearNav';
                var prevYearBtn = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);
                ReactTestUtils.Simulate.click(prevYearBtn);

                expect(calendarComp.setState).toHaveBeenCalledWith({calendarDate: new Date(2015, 6, 11)});
            });
        });

        describe('previous month button', function () {
            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().previousMonthNav.onClick).toEqual(calendarComp.subMonth);
            });

            it('should invoke sub month func and set new calendar date accordingly upon click', function () {
                spyOn(calendarComp, 'setState');

                var btnClass = calendarComp.props.styleId + 'previousMonthNav';
                var prevYearBtn = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);
                ReactTestUtils.Simulate.click(prevYearBtn);

                expect(calendarComp.setState).toHaveBeenCalledWith({calendarDate: new Date(2016, 5, 11)});
            });
        });

        describe('current month with year', function () {
            it('should show current month and year in MMMM YYYY format', function () {
                var secondCalendar = renderCalendar({calendarDate: new Date(2016, 9, 11)});

                expect(calendarComp.getSkinProperties().currentMonthWithYear.children).toEqual('July 2016');
                expect(secondCalendar.getSkinProperties().currentMonthWithYear.children).toEqual('October 2016');
            });

            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().currentMonthWithYear.onClick).toEqual(calendarComp.toggleYearSelection);
            });

            it('should invoke toggleYearSelection func and toggle year selection mode accordingly upon click', function (done) {
                var btnClass = calendarComp.props.styleId + 'currentMonthWithYear';
                var currentMonthWithYear = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);

                ReactTestUtils.Simulate.click(currentMonthWithYear);

                calendarComp.setState({}, function () {
                    expect(calendarComp.state.shouldShowYearSelection).toEqual(true);

                    spyOn(calendarComp, 'setState');
                    ReactTestUtils.Simulate.click(currentMonthWithYear);

                    expect(calendarComp.setState).toHaveBeenCalledWith({shouldShowYearSelection: false});
                    done();
                });
            });
        });

        describe('current month', function () {
            it('should show current month and year in MMMM format', function () {
                var secondCalendar = renderCalendar({calendarDate: new Date(2016, 9, 11)});

                expect(calendarComp.getSkinProperties().currentMonth.children).toEqual('July');
                expect(secondCalendar.getSkinProperties().currentMonth.children).toEqual('October');
            });
        });

        describe('current year', function () {
            it('should show current year in YYYY format', function () {
                var secondCalendar = renderCalendar({calendarDate: new Date(2016, 9, 11)});

                expect(calendarComp.getSkinProperties().currentYear.children).toEqual('2016');
                expect(secondCalendar.getSkinProperties().currentYear.children).toEqual('2016');
            });

            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().currentMonthWithYear.onClick).toEqual(calendarComp.toggleYearSelection);
            });

            it('should invoke toggleYearSelection func and toggle year selection mode accordingly upon click', function (done) {
                var btnClass = calendarComp.props.styleId + 'currentMonthWithYear';
                var currentMonthWithYear = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);

                ReactTestUtils.Simulate.click(currentMonthWithYear);

                calendarComp.setState({}, function () {
                    expect(calendarComp.state.shouldShowYearSelection).toEqual(true);

                    spyOn(calendarComp, 'setState');
                    ReactTestUtils.Simulate.click(currentMonthWithYear);

                    expect(calendarComp.setState).toHaveBeenCalledWith({shouldShowYearSelection: false});
                    done();
                });
            });
        });

        describe('previous year', function () {
            it('should previous year in YYYY format', function () {
                var secondCalendar = renderCalendar({calendarDate: new Date(2018, 9, 11)});

                expect(calendarComp.getSkinProperties().previousYear.children).toEqual('2015');
                expect(secondCalendar.getSkinProperties().previousYear.children).toEqual('2017');
            });
        });

        describe('next year', function () {
            it('should show next year in YYYY format', function () {
                var secondCalendar = renderCalendar({calendarDate: new Date(2018, 9, 11)});

                expect(calendarComp.getSkinProperties().nextYear.children).toEqual('2017');
                expect(secondCalendar.getSkinProperties().nextYear.children).toEqual('2019');
            });
        });

        describe('next month button', function () {
            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().nextMonthNav.onClick).toEqual(calendarComp.addMonth);
            });

            it('should invoke add month func and set new calendar date accordingly upon click', function () {
                spyOn(calendarComp, 'setState');

                var btnClass = calendarComp.props.styleId + 'nextMonthNav';
                var prevYearBtn = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);
                ReactTestUtils.Simulate.click(prevYearBtn);

                expect(calendarComp.setState).toHaveBeenCalledWith({calendarDate: new Date(2016, 7, 11)});
            });
        });

        describe('next year button', function () {
            it('should have correct click handler', function () {
                expect(calendarComp.getSkinProperties().nextYearNav.onClick).toEqual(calendarComp.addYear);
            });

            it('should invoke add year func and set new calendar date accordingly upon click', function () {
                spyOn(calendarComp, 'setState');

                var btnClass = calendarComp.props.styleId + 'nextYearNav';
                var prevYearBtn = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, btnClass);
                ReactTestUtils.Simulate.click(prevYearBtn);

                expect(calendarComp.setState).toHaveBeenCalledWith({calendarDate: new Date(2017, 6, 11)});
            });
        });

        describe('day names', function () {
            it('should generate day names correctly', function () {
                var EXPECTED_DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

                _.forEach(calendarComp.getSkinProperties().dayNames.children, function (dayName, dayIndex) {
                    expect(dayName.props.children).toEqual(EXPECTED_DAY_NAMES[dayIndex]);
                });
            });

            it('should not generate day names if in year selection mode', function (done) {
                calendarComp.setState({shouldShowYearSelection: true}, function () {
                    expect(calendarComp.getSkinProperties().dayNames).toBeNull();
                    done();
                });
            });
        });

        describe('month', function () {
            it('should pass correct props to month', function () {
                var month = calendarComp.getSkinProperties().month;

                expect(month.props.id).toEqual(calendarComp.props.id + 'month');
                expect(month.props.style).toEqual({});
                expect(month.props.dateUtils).toEqual(calendarComp.props.dateUtils);
                expect(month.props.today).toEqual(calendarComp.props.today);
                expect(month.props.calendarDate).toEqual(calendarComp.state.calendarDate);
                expect(month.props.onDateChange).toEqual(calendarComp.props.onDateChange);
                expect(month.props.closeCalendar).toEqual(calendarComp.props.closeCalendar);
                expect(month.props.selectedDate).toEqual(calendarComp.props.selectedDate);
                expect(month.props.disabledDates).toEqual(calendarComp.props.disabledDates);
                expect(month.props.disabledDaysOfWeek).toEqual(calendarComp.props.disabledDaysOfWeek);
                expect(month.props.allowPastDates).toEqual(calendarComp.props.allowPastDates);
                expect(month.props.allowFutureDates).toEqual(calendarComp.props.allowFutureDates);
                expect(month.props.minDate).toEqual(calendarComp.props.minDate);
                expect(month.props.maxDate).toEqual(calendarComp.props.maxDate);
            });

            it('should not generate month if in year selection mode', function (done) {
                calendarComp.setState({shouldShowYearSelection: true}, function () {
                    expect(calendarComp.getSkinProperties().month).toBeNull();
                    done();
                });
            });
        });

        describe('year options wrapper', function () {
            it('should have correct mouse wheel handler', function (done) {
                calendarComp.setState({shouldShowYearSelection: true}, function () {
                    expect(calendarComp.getSkinProperties().yearOptionsWrapper.onWheel).toEqual(calendarComp.blockOuterScroll);
                    done();
                });
            });

            it('should not generate year options wrapper if not in year selection mode', function (done) {
                calendarComp.setState({shouldShowYearSelection: false}, function () {
                    expect(calendarComp.getSkinProperties().yearOptionsWrapper).toBeNull();
                    done();
                });
            });

            it('should mark current calendar year as selected', function (done) {
                calendarComp.setState({shouldShowYearSelection: true}, function () {
                    var yearOptionClass = calendarComp.props.styleId + '_selected';
                    var yearOptionItem = ReactTestUtils.findRenderedDOMComponentWithClass(calendarComp, yearOptionClass);
                    var selectedYear = parseInt(ReactDOM.findDOMNode(yearOptionItem).textContent, 10);

                    expect(selectedYear).toEqual(calendarComp.state.calendarDate.getFullYear());
                    done();
                });
            });

            describe('year option item click', function () {
                it('should set calendar year to the one clicked and close year selection ', function (done) {
                    calendarComp.setState({shouldShowYearSelection: true}, function () {
                        spyOn(calendarComp, 'setState');

                        var yearOptionClass = calendarComp.props.styleId + '_year-option-item';
                        var yearOptionItem = ReactTestUtils.scryRenderedDOMComponentsWithClass(calendarComp, yearOptionClass)[30];
                        var clickedYear = parseInt(ReactDOM.findDOMNode(yearOptionItem).textContent, 10);
                        var expectedCalendarDate = new Date(calendarComp.state.calendarDate);
                        expectedCalendarDate.setYear(clickedYear);

                        ReactTestUtils.Simulate.click(yearOptionItem);

                        expect(calendarComp.setState).toHaveBeenCalledWith({
                            calendarDate: expectedCalendarDate,
                            shouldShowYearSelection: false
                        });
                        done();
                    });
                });
            });

        });

        describe('full screen overlay', function () {
            it('should call create overlay when in mobile state', function (done) {
                spyOn(core.componentUtils.fullScreenOverlay, 'createOverlay').and.returnValue({});

                calendarComp.setState({$mobile: 'mobile'}, function () {
                    expect(core.componentUtils.fullScreenOverlay.createOverlay).toHaveBeenCalled();
                    done();
                });
            });

            it('should not call create overlay when in non mobile state', function () {
                spyOn(core.componentUtils.fullScreenOverlay, 'createOverlay').and.returnValue({});

                expect(core.componentUtils.fullScreenOverlay.createOverlay).not.toHaveBeenCalled();
            });
        });
    });
});
