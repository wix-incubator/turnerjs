define(['lodash', 'testUtils'],
    function (_, testUtils) {
    'use strict';

    describe('dynamicColorsAspect', function() {
        beforeEach(function() {
            this.siteAPI = testUtils.mockFactory.mockSiteAPI();
            this.dynamicColorsAspect = this.siteAPI.getSiteAspect('dynamicColorElements');
        });

        describe('updating component information', function() {
            it('should set the component info on first update', function() {
                var info = {
                    brightness: 50
                };
                this.dynamicColorsAspect.updateInformation('test-id', info);

                expect(this.dynamicColorsAspect.getInformation('test-id')).toEqual(_.assign({id: 'test-id'}, info));
            });

            it('should merge new information', function() {
                var info = {
                    brightness: 50,
                    color: '#fff'
                };
                this.dynamicColorsAspect.updateInformation('test-id', info);
                this.dynamicColorsAspect.updateInformation('test-id', {color: '#aaa'});

                var expectedInfo = {
                    id: 'test-id',
                    brightness: info.brightness,
                    color: '#aaa'
                };
                expect(this.dynamicColorsAspect.getInformation('test-id')).toEqual(expectedInfo);
            });
        });

        describe('retrieving information of a component that is in measureMap', function() {
            beforeEach(function() {
                this.siteData = this.siteAPI.getSiteData();
                this.siteData.addMeasureMap({
                    absoluteTop: {
                        'test-id': 10
                    },
                    height: {
                        'test-id': 10
                    },
                    absoluteLeft: {
                        'test-id': 100
                    },
                    width: {
                        'test-id': 100
                    }
                });
            });

            it('should contain layout', function() {
                this.dynamicColorsAspect.updateInformation('test-id', {brightness: 50});

                expect(this.dynamicColorsAspect.getInformation('test-id')).toEqual({
                    id: 'test-id',
                    brightness: 50,
                    top: 10,
                    height: 10,
                    left: 100,
                    width: 100
                });
            });
        });

        describe('notifying observers', function() {
            beforeEach(function() {
                this.observerCallback = jasmine.createSpy('observer');
                this.dynamicColorsAspect.registerObserver(this.observerCallback);
            });

            afterEach(function() {
                delete this.info;
            });

            it('should always notify with an array of update infos', function() {
                var info = {
                    brightness: 50
                };

                this.dynamicColorsAspect.updateInformation('test-id', info);

                var expectedResult = [{
                    id: 'test-id',
                    brightness: info.brightness
                }];
                expect(this.observerCallback).toHaveBeenCalledWith(expectedResult);
            });

            it('should notify on updated information only', function() {
                var comp1Info = {
                    brightness: 2
                };
                var comp2Info = {
                    brightness: 2
                };

                this.dynamicColorsAspect.updateInformation('test-id1', comp1Info);
                this.dynamicColorsAspect.updateInformation('test-id2', comp2Info);

                var expectedResult = [{
                    id: 'test-id2',
                    brightness: comp2Info.brightness
                }];
                expect(this.observerCallback.calls.mostRecent().args[0]).toEqual(expectedResult);
            });

            it('should not notify unregistered observers', function() {
                this.dynamicColorsAspect.unregisterObserver(this.observerCallback);
                var info = {
                    brightness: 50
                };

                this.dynamicColorsAspect.updateInformation('test-id', info);

                expect(this.observerCallback).not.toHaveBeenCalled();
            });
        });
    });
});
