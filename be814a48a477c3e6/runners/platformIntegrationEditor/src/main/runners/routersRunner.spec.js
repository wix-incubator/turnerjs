define([
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
], function (editorDriver, platformDriver) {
    'use strict';

    describe('routers namespace', function () {
        var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');

        describe('listConnectablePages', function () {
            it('should get all connectable page - when no dynamic pages return all pages except home page', function () {
                var pages = platformDriver.routers.pages.listConnectablePages('token');
                expect(pages.length).toBe(4);
                var pageTitles = _.map(pages, 'pageData.title');
                expect(pageTitles).toEqual(['Page 3', 'Page 2', 'Contact', 'Page 4'])
                ;
                expect(pageTitles).not.toContain("Home");
            });

            it('should return only static pages i.e., not a page that is connected to a router', function (done) {
                var pages = platformDriver.routers.pages.listConnectablePages('token');
                var routerDefinition = {
                    prefix: 'foo',
                    config: {
                        routerFunctionName: 'foo1',
                        siteMapFunctionName: 'foo2'
                    }
                };
                platformDriver.routers.add(appData, 'token', routerDefinition).then(function (routerRef) {
                    var aStaticPageRef = pages[0].pageRef;
                    platformDriver.routers.pages.connect(appData, 'token', {
                        routerRef: routerRef,
                        pageRef: aStaticPageRef,
                        pageRoles: 'foo'
                    }).then(function () {
                        pages = platformDriver.routers.pages.listConnectablePages('token');
                        expect(pages.length).toBe(3);
                        var pageRefIds = _.map(pages, 'pageRef.id');
                        expect(pageRefIds).not.toContain(aStaticPageRef.id);
                        platformDriver.routers.pages.disconnect(appData, 'token', {
                            routerRef: routerRef,
                            pageRef: aStaticPageRef
                        }).then(function () {
                            pages = platformDriver.routers.pages.listConnectablePages('token');
                            expect(pages.length).toBe(4);
                            done();
                        });
                    });

                });
            });


        });

        describe('routers.add', function () {
            it('should add a router', function (done) {
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
                    done();
                });
            });

        });

        describe('routers.remove', function () {
            it('should remove a router', function (done) {
                var routerDefinition = {
                    prefix: 'foo2',
                    config: {
                        routerFunctionName: 'foo1',
                        siteMapFunctionName: 'foo2'
                    }
                };
                platformDriver.routers.add(appData, 'token', routerDefinition).then(function (routerRef) {
                    var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                    expect(routerData).toEqual(_.assign(routerDefinition, {pages: []}));
                    platformDriver.routers.remove(appData, 'token', {routerRef: routerRef}).then(function () {
                        routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                        expect(routerData).toBeUndefined();
                        done();
                    });

                });
            });

        });


        describe('routers.update', function () {
            it('should update router prefix', function (done) {
                var routerDefinition = {
                    prefix: 'foo3',
                    config: {
                        routerFunctionName: 'foo3',
                        siteMapFunctionName: 'foo3'
                    }
                };
                platformDriver.routers.add(appData, 'token', routerDefinition).then(function (routerRef) {
                    var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                    expect(routerData).toEqual(_.assign(routerDefinition, {pages: []}));
                    platformDriver.routers.update(appData, 'token', {
                        routerRef: routerRef,
                        prefix: 'updatePrefixFoo3'
                    }).then(function () {
                        routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                        expect(routerData.prefix).toEqual('updatePrefixFoo3');
                        done();
                    });

                });
            });

        });

        describe('routers.pages', function () {
            var pages = platformDriver.routers.pages.listConnectablePages('token');
            var aStaticPageRef = pages[1].pageRef;
            var routerPointer, addedPageRef;
            it('routers.pages.connect - should connect existing page to router', function (done) {
                var routerDefinition = {
                    prefix: 'foo4',
                    config: {
                        routerFunctionName: 'foo4',
                        siteMapFunctionName: 'foo4'
                    }
                };
                platformDriver.routers.add(appData, 'token', routerDefinition).then(function (routerRef) {
                    routerPointer = routerRef;
                    platformDriver.routers.pages.connect(appData, 'token', {
                        routerRef: routerRef,
                        pageRef: aStaticPageRef,
                        pageRoles: 'foo'
                    }).then(function () {
                        var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerRef});
                        expect(routerData.pages).toEqual([{pageRef: aStaticPageRef, pageRoles: ['foo']}]);

                        done();
                    });

                });
            });

            it('routers.pages.disconnect - should disconnect page from router', function (done) {
                pages = platformDriver.routers.pages.listConnectablePages('token');
                expect(pages).not.toContain(aStaticPageRef.id);
                var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                expect(routerData.pages.length).toEqual(1);
                platformDriver.routers.pages.disconnect(appData, 'token', {
                    routerRef: routerPointer,
                    pageRef: aStaticPageRef
                }).then(function () {
                    var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                    expect(routerData.pages).toEqual([]);
                    pages = platformDriver.routers.pages.listConnectablePages('token');
                    var pageRefIds = _.map(pages, 'pageRef.id');
                    expect(pageRefIds).toContain(aStaticPageRef.id);
                    done();

                });
            });

            it('routers.pages.add - add new page under router', function (done) {
                var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                expect(routerData.pages).toEqual([]);
                platformDriver.routers.pages.add(appData, 'token', {
                    routerRef: routerPointer,
                    pageRoles: ['mockPageRole'],
                    pageTitle: 'mockPageTitle'
                }).then(function (pageRef) {
                    addedPageRef = pageRef;
                    routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                    expect(routerData.pages).toEqual([{pageRef: addedPageRef, pageRoles: ['mockPageRole']}]);
                    done();

                });
            });

            it('routers.pages.delete - deletes page', function (done) {
                pages = platformDriver.routers.pages.listConnectablePages('token');
                var pageRefIds = _.map(pages, 'pageRef.id');
                expect(pageRefIds).not.toContain(addedPageRef.id);
                var routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                expect(routerData.pages).toEqual([{pageRef: addedPageRef, pageRoles: ['mockPageRole']}]);
                platformDriver.routers.pages.delete(appData, 'token', {
                    routerRef: routerPointer,
                    pageRef: addedPageRef
                }).then(function () {
                    routerData = platformDriver.routers.get(appData, 'token', {routerRef: routerPointer});
                    expect(routerData.pages).toEqual([]);
                    done();

                });
            });

        });

    });

});
