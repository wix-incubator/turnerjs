define(['tpaIntegrationEditor/driver/driver', 'jquery', 'jasmine-boot'], function (driver, $) {
    'use strict';

    describe('tpa refresh app handler', function () {
        var compId1 = 'comp-ib6nduee';
        var compId2 = 'comp-ib6ne2pd';
        var commmentsAppDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';

        describe('refreshApp', function(){
            it('should append parameters to tpa iframe', function (done) {
                var msgData = {
                    queryParams: {
                        param1: 'val1',
                        param2: 'val2'
                    }
                };
                driver.openSettingsPanel(commmentsAppDefId)
                    .then(function(){
                        return driver.refreshApp(compId1, msgData);
                    })
                    .then(function(){
                        var iframe = $('#preview')[0].contentWindow.document.querySelector('#' + compId1).querySelector('iframe');
                        expect(iframe.src).toContain('param1=val1');
                        expect(iframe.src).toContain('param2=val2');
                        done();
                    });
            });
        });

        describe('refreshAppByCompIds', function(){

            it('should append parameters to all the specified tpa component', function (done) {
                var msgData = {
                    queryParams: {
                        country: 'China'
                    },
                    compIds: [compId1, compId2]
                };
                driver.openSettingsPanel(commmentsAppDefId)
                    .then(function(){
                        return driver.refreshApp(compId1, msgData);
                    })
                    .then(function(){
                        var iframe = $('#preview')[0].contentWindow.document.querySelector('#' + compId1).querySelector('iframe');
                        expect(iframe.src).toContain('country=China');

                        var iframe2 = $('#preview')[0].contentWindow.document.querySelector('#' + compId2).querySelector('iframe');
                        expect(iframe2.src).toContain('country=China');
                        done();
                    });
            });

            it('should append parameters only to the specified tpa component', function (done) {
                var msgData = {
                    queryParams: {
                        name: 'Nina'
                    },
                    compIds: [compId1]
                };
                driver.openSettingsPanel(commmentsAppDefId)
                    .then(function () {
                        return driver.refreshApp(compId1, msgData);
                    })
                    .then(function () {
                        var iframe = $('#preview')[0].contentWindow.document.querySelector('#' + compId1).querySelector('iframe');
                        expect(iframe.src).toContain('name=Nina');

                        var iframe2 = $('#preview')[0].contentWindow.document.querySelector('#' + compId2).querySelector('iframe');
                        expect(iframe2.src).not.toContain('name=Nina');
                        done();
                    });
            });

            it('should not append parameters if no valid component id is given', function (done) {
                var invalidCompId = 'invalid-compId';

                var msgData = {
                    queryParams: {
                        colour: 'black'
                    },
                    compIds: [invalidCompId]
                };
                driver.openSettingsPanel(commmentsAppDefId)
                    .then(function () {
                        return driver.refreshApp(compId1, msgData);
                    })
                    .catch(function () {
                        var iframe = $('#preview')[0].contentWindow.document.querySelector('#' + compId1).querySelector('iframe');
                        expect(iframe.src).not.toContain('colour=black');

                        var iframe2 = $('#preview')[0].contentWindow.document.querySelector('#' + compId2).querySelector('iframe');
                        expect(iframe2.src).not.toContain('colour=black');
                        done();
                    });
            });

        });

    });
});