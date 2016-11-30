describeExperiment({"OnlineClock": "New"}, 'OnlineClock', function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.common.components.onlineclock.viewer.OnlineClock')
        .resources('W.Data', 'W.ComponentLifecycle');

    function createComponent() {
        var that = this,
            builder;
        this.comp = null;
        this.mockData = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'OnlineClock'
        });
        this.mockProps = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'OnlineClockProperties'
        });

        builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.common.components.onlineclock.viewer.OnlineClock')
            .withSkin('wysiwyg.common.components.onlineclock.viewer.skins.OnlineClockBasicSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.comp = component;
                that.comp.setComponentProperties(that.mockProps);
            })
            .create();
    }

    beforeEach(function () {
        createComponent.call(this);

        waitsFor(function () {
            return this.comp !== null;
        }, 'OnlineClock component to be ready', 1000);
    });

    describe('Component test', function () {

        describe('Structure', function () {
            it('Skin part [time] should be defined', function () {
                expect(this.comp._skinParts.time).toBeDefined();
            });
            it('Skin part [date] should be defined', function () {
                expect(this.comp._skinParts.date).toBeDefined();
            });
        });

        describe('Functionality', function () {
            var comp,
                dataItem,
                propsItem;

            beforeEach(function () {
                comp = this.comp;
                dataItem = comp.getDataItem();
                propsItem = comp.getComponentProperties();
                dataItem.setFields({
                    timezone: '3'
                });
            });

            describe('DateTime', function () {
                var date;

                beforeEach(function () {
                    date = new Date(2013, 9, 23, 2, 1, 30);
                });

                it('should create time in correct format', function () {
                    var timeFormat = 'full_24',
                        timeFormatter = comp._makeTimeFormatter(timeFormat),
                        expected = '<span class="hours">02</span><span class="colon">:</span><span class="minutes">01</span><span class="colon">:</span><span class="seconds">30</span>',
                        actual = timeFormatter(date);

                    expect(actual).toBe(expected);
                });

                it('should create date in correct format', function () {
                    var dateFormat = 'monthfirst',
                        dateFormatter = comp._makeDateFormatter(dateFormat),
                        expected = 'October, 23',
                        actual = dateFormatter(date);

                    expect(actual).toBe(expected);
                });

                //expect(timerCallback).not.toHaveBeenCalled(); TODO _tick ???
            });

            describe('Viewer', function () {
                beforeEach(function () {
                    jasmine.Clock.useMock();
                    spyOn(comp, '_tick').andCallThrough();
                    comp._restartClock();
                });

                it('should tick the timer every second', function () {
                    jasmine.Clock.tick(1000);
                    expect(comp._tick).toHaveBeenCalled();
                });

                it('should restart timer on component rerender', function () {
                    var previousId = comp._timer,
                        currentId;

                    this.ComponentLifecycle["@testRenderNow"](comp);

                    currentId = comp._timer;

                    expect(currentId).not.toEqual(previousId);
                });

                it('should change time every minute', function () {
                    var previousTime = comp._skinParts.time.innerHTML,
                        currentTime;

                    spyOn(comp, '_getDate').andCallFake(function() {
                        return new Date(2099, 1, 1, 1, 1, 1);
                    });

                    jasmine.Clock.tick(60000);

                    currentTime = comp._skinParts.time.innerHTML;

                    expect(currentTime).not.toEqual(previousTime);
                });

                it('should change date every day', function () {
                    var previousDate = comp._skinParts.date.innerHTML,
                        currentDate;

                    spyOn(comp, '_getDate').andCallFake(function() {
                        return new Date(2099, 1, 1, 1, 1, 1);
                    });

                    jasmine.Clock.tick(60000 * 60 * 24);

                    currentDate = comp._skinParts.date.innerHTML;

                    expect(currentDate).not.toEqual(previousDate);
                });

            });
        });
    });
});