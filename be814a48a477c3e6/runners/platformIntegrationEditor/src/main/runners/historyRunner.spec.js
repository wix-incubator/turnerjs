define([
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
], function (editorDriver, platformDriver) {
    'use strict';

    describe('history namespace', function () {

        describe('history.add', function () {
            it('history add should add entry to undo stack', function (done) {
                var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');

                var routerDefinition = {
                    prefix: 'foo1',
                    config: {
                        routerFunctionName: 'foo1',
                        siteMapFunctionName: 'foo2'
                    }
                };
                platformDriver.routers.add(appData, 'token', routerDefinition).then(function (routerRef) {

                    var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                    expect(routerData).toEqual(_.assign(routerDefinition, {pages: []}));

                    var snapshotLabel = 'routerWasAdd';
                    platformDriver.history.add(appData, 'mockToken', {label: snapshotLabel});
                    editorDriver.undo();
                    editorDriver.waitForChangesApplied().then(function () {
                        routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});

                        expect(routerData).not.toBeDefined();
                        done();
                    });

                });
            });

        });


    });

});
