define(['lodash', 'tpa/services/clientSpecMapService'], function(_, clientSpecMapService) {
    'use strict';

    describe('clientSpecMapService', function() {
        describe('getMainSectionWidgetData', function() {
            it('should return main section data', function() {
                var appData = {
                    widgets: {
                        widget1: {
                            tpaWidgetId: 'tpaWidgetId'
                        },
                        widget2: {
                            appPage: {
                                name: 'appPage',
                                hidden: false,
                                id: 'appPgae1'
                            }
                        }
                    }
                };

                expect(clientSpecMapService.getMainSectionWidgetData(appData)).toEqual(appData.widgets.widget2);
            });

            it('should not return main section data if there are no app pages', function() {
                var appData = {
                    widgets: {
                        widget1: {
                            tpaWidgetId: 'tpaWidgetId'
                        },
                        widget2: {
                            tpaWidgetId: 'tpaWidgetId1'
                        }
                    }
                };

                expect(clientSpecMapService.getMainSectionWidgetData(appData)).not.toBeDefined();
            });

            it('should not return main section data if there are only hidden pages', function() {
                var appData = {
                    widgets: {
                        widget1: {
                            appPage: {
                                name: 'appPage',
                                hidden: true,
                                id: 'appPgae1'
                            }
                        },
                        widget2: {
                            tpaWidgetId: 'tpaWidgetId1'
                        }
                    }
                };

                expect(clientSpecMapService.getMainSectionWidgetData(appData)).not.toBeDefined();

            });
        });
    });
});

