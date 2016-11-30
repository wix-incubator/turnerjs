define([
    'lodash',
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
], function (_, editorDriver, platformDriver) {
    'use strict'

    describe('editor namespace', function () {
        var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');
        var token = 'token';
        it('should open a panel w/ the given url, title and the proper width and height', function (done) {
            platformDriver.editor.openComponentPanel(appData, token, {
                componentRef: editorDriver.getCompById('comp-iraaof8y'),
                width: 372,
                height: 467,
                url: 'http://example.com',
                title: 'my name is John'
            }).then(function (response) {
                expect(response.result).toBe('ok')

                var title = response.dom.find('.panel-header-title')
                expect(title.text()).toBe('my name is John')

                var frame = response.dom.find('iframe')
                expect(frame.attr('src').indexOf('http://example.com')).toBe(0)
                expect(frame.width()).toBe(372)
                expect(frame.height()).toBe(467)
            }).then(done, done.fail)
        })

        it('should close an open platform panel', (done) => {
            var panelDescriptor = _.find(editorDriver.getOpenPanels(), {type: 'platform'});
            var panelToken = _.get(panelDescriptor, 'token');
            platformDriver.editor.closePanel(appData, panelToken);
            _.delay(() => {
                expect($(".comp-panel-frame").length).toBe(0);
                done();
            }, 1000);
        });

        it('should open modal panel', (done) => {
            platformDriver.editor.openModalPanel(appData, token, {
                panelType: 'modalPanel',
                width: '372',
                height: '467',
                url: 'http://example.com',
                title: 'my name is John'
            }).then(function (response) {
                expect(response.result).toBe('ok')
                var panelDescriptor = _.find(editorDriver.getOpenPanels(), {type: 'platform'});
                var panelToken = _.get(panelDescriptor, 'token');
                platformDriver.editor.closePanel(appData, panelToken);
            }).then(done, done.fail)
        });

        it('should open help panel', (done) => {
            platformDriver.editor.openHelpPanel(appData, token, {
                helpId: '23862857-e4f2-4205-87da-592e3cad64de'
            }).then(function (response) {
                var dom = response.dom;
                debugger;
                expect(dom.find('iframe')[0].src).toBe('https://www.wix.com/support/html5/widget/cb6480f3-768b-4737-ab8f-10fe2e4fa2ab/article/23862857-e4f2-4205-87da-592e3cad64de?&ownerId=066b3015-f5a6-49c8-b566-299453fcaa30&roles=wixStaff')
            }).then(done, done.fail)
        });

        xdescribe('open pages panel', function () {

            it('should open pages panel - if no tab is passed as props should open on page info tab', (done) => {
                editorDriver.closePagesPanel();
                editorDriver.waitForChangesApplied().then(function(){
                    platformDriver.editor.openPagesPanel('token', {
                        pageRef: editorDriver.getCurrentPageRef()
                    }).then(function (response) {
                        expect(response.result).toBe('ok')
                        var selectedTabText = document.getElementsByClassName('tab-label selected')[0].innerHTML;
                        expect(selectedTabText).toBe('Page Info')
                    }).then(done, done.fail)
                });
            });


            it('should open pages panel - should open selected tab if passed as props', (done) => {
                editorDriver.closePagesPanel();
            editorDriver.waitForChangesApplied().then(function(){
                    platformDriver.editor.openPagesPanel('token', {
                        pageRef: editorDriver.getCurrentPageRef(),
                        activeTabName: 'privacy'
                    }).then(function (response) {
                        expect(response.result).toBe('ok')
                        var selectedTabText = document.getElementsByClassName('tab-label selected')[0].innerHTML;
                        expect(selectedTabText).toBe('Permissions')
                    }).then(done, done.fail)
                });

            });

            it('dynamic page - should open pages panel - if no tab is passed as props should open on page info tab', (done) => {
                editorDriver.closePagesPanel()
            editorDriver.waitForChangesApplied().then(function(){
                    var pages = platformDriver.routers.pages.listConnectablePages('token');
                    var aStaticPageRef = pages[1].pageRef;
                    var routerDefinition = {
                        prefix: 'testRouterPrefix',
                        config: {
                            routerFunctionName: 'testRouterPrefix',
                            siteMapFunctionName: 'testRouterPrefix'
                        }
                    };
                    platformDriver.routers.add('token', routerDefinition).then(function (routerRef) {
                        platformDriver.routers.pages.connect('token', {
                            routerRef: routerRef,
                            pageRef: aStaticPageRef,
                            pageRoles: 'foo'
                        }).then(function () {
                            var routerData = platformDriver.routers.get('token', {routerRef: routerRef});
                            expect(routerData.pages).toEqual([{pageRef: aStaticPageRef, pageRoles: ['foo']}]);
                            platformDriver.editor.openPagesPanel('token', {
                                pageRef: aStaticPageRef
                            }).then(function (response) {
                                expect(response.result).toBe('ok')
                                var selectedTabText = document.getElementsByClassName('tab-label selected')[0].innerHTML;
                                expect(selectedTabText).toBe('Page Info')
                                platformDriver.routers.pages.disconnect('token', {
                                    routerRef: routerRef,
                                    pageRef: aStaticPageRef
                                }).then(done, done.fail)

                            })

                        });

                    });
                });
            });
        });


        it('should open tool panel', (done) => {
            platformDriver.editor.openToolPanel(appData, token, {
                url: 'http://example.com',
                width: 372,
                height: 467
            }).then(function (response) {
                expect(response.result).toBe('ok')
                var panelDescriptor = _.find(editorDriver.getOpenPanels(), {type: 'platform'});
                var panelToken = _.get(panelDescriptor, 'token');
                platformDriver.editor.closePanel(appData, panelToken);
            }).then(done, done.fail)
        });

        xit('should open full stage panel', (done) => {
            platformDriver.editor.openFullStagePanel(appData, token, {
                panelType: 'modalPanel',
                width: '372',
                height: '467',
                url: 'http://example.com',
                title: 'my name is John'
            }).then(function (response) {
                expect(response.result).toBe('ok')
                var panelDescriptor = _.find(editorDriver.getOpenPanels(), {type: 'platform'});
                var panelToken = _.get(panelDescriptor, 'token');
                platformDriver.editor.closePanel(appData, panelToken);
            }).then(done, done.fail)
        });

        it('should open media manager panel', (done) => {
            platformDriver.editor.openMediaPanel('token', {
                mediaType: 'IMAGE',
                isMultiSelect: true,
                callOnCancel: true
            }).then(function (response) {
                expect(response.result).toBe('ok')
            }).then(done, done.fail)
        });

        it('should open link panel', (done) => {
            platformDriver.editor.openLinkPanel(appData, token).then(function (response) {
                expect(response.result).toBe('ok')
            }).then(done, done.fail)
        });
    });
});
