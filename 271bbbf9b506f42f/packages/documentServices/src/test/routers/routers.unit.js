define([
    'lodash',
    'utils',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/routers/routers',
    'documentServices/page/page',
    'documentServices/menu/menu',
    'documentServices/routers/routersGetters',
    'documentServices/constants/constants',
    'documentServices/platform/platform'
], function (_,
             utils,
             testUtils,
             privateServicesHelper,
             routers, page, menu, routersGetters, constants, platform) {
    'use strict';

    var recipesRouter = {
        prefix: 'recipes',
        appDefinitionId:'dataBinding',
        config: ''
    };

    var savedRecipesRouter = {
        prefix: 'recipes',
        appDefinitionId:'dataBinding',
        config: '',
        pages: {
            pageRole1: 'c1dmp'
        }
    };

    var savedEmployeesRouter = {
        prefix: 'employees',
        appDefinitionId:'dataBinding',
        config: ''
    };

    var dbConfig = {a: {b: 1}, c: 0};

    var savedDBRouter = {
        prefix: 'employees',
        appDefinitionId:'dataBinding',
        config: JSON.stringify(dbConfig)
    };

    function getMockRouters() {
        return {
            configMap: {
                1: savedRecipesRouter,
                4: savedEmployeesRouter,
                6: savedDBRouter
            }
        };
    }


    function createMockPrivateServicesWithRouters(routersData, rootData, pageIdToAddData) {
        var siteModel;
        if (routersData) {
            siteModel = testUtils.mockFactory.mockSiteModel({
                routers: routersData
            });
        }
        var siteData = testUtils.mockFactory.mockSiteData(siteModel, true)
            .addPageWithDefaults('page1')
            .addPageWithDefaults('page2')
            .addPageWithDefaults('page3');
        if (rootData && pageIdToAddData) {
            siteData = siteData.withRootData(pageIdToAddData, rootData);
        }
        return {
            ps: privateServicesHelper.mockPrivateServicesWithRealDAL(siteData),
            siteData: siteData
        };
    }

    describe('routers', function () {
        it('routers should be defined', function () {
            expect(routers).toBeDefined();
        });

        describe('Add router', function () {
            describe('When adding new router:', function () {
                describe('valid router:', function () {

                    it('Should add a new router when routers are undefined:', function () {
                        //do not! do not pass default routers!
                        var ps = createMockPrivateServicesWithRouters().ps;
                        var routerPointer = routers.getRouterPointer(ps);
                        var newRouterPointer = routers.add(ps, routerPointer, recipesRouter);
                        var savedRouter = ps.dal.get(newRouterPointer);

                        expect(savedRouter).toEqual(recipesRouter);
                    });
                    it('Should add a new router when routers are empty:', function () {
                        //pass empty object
                        var ps = createMockPrivateServicesWithRouters({}).ps;
                        var routerPointer = routers.getRouterPointer(ps);
                        var newRouterPointer = routers.add(ps, routerPointer, recipesRouter);
                        var savedRouter = ps.dal.get(newRouterPointer);

                        expect(savedRouter).toEqual(recipesRouter);
                    });

                    it('Should add a new router when routers are defined:', function () {
                        var mockRouters = {
                            configMap: {
                                4: savedEmployeesRouter
                            }
                        };

                        var ps = createMockPrivateServicesWithRouters(mockRouters).ps;
                        var routerPointer = routers.getRouterPointer(ps);
                        var newRouterPointer = routers.add(ps, routerPointer, recipesRouter);
                        var savedRouter = ps.dal.get(newRouterPointer);

                        expect(savedRouter).toEqual(recipesRouter);
                    });
                });

                describe('not valid router:', function () {

                    it('Should throw an error when adding new router without prefix', function () {
                        var ps = createMockPrivateServicesWithRouters({}).ps;

                        expect(function () {
                            var routerPointer = routers.getRouterPointer(ps);
                            routers.add(ps, routerPointer, {});
                        }).toThrow(new Error("Router not valid - Missing prefix."));
                    });

                    it('Should throw an error when adding new router without appDefinitionId', function () {
                        var ps = createMockPrivateServicesWithRouters({}).ps;

                        expect(function () {
                            var routerPointer = routers.getRouterPointer(ps);
                            routers.add(ps, routerPointer, {prefix: 'bla'});
                        }).toThrow(new Error("Router not valid - Missing appDefinitionId."));
                    });

                    it('Should throw an error when adding new router with existing prefix', function () {
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;

                        expect(function () {
                            var routerPointer = routers.getRouterPointer(ps);
                            routers.add(ps, routerPointer, recipesRouter);
                        }).toThrow(new Error("Router not valid - Prefix: recipes, already exist"));
                    });

                    it('Should throw an error when adding new router with prefix already used as pageSEOUri', function () {
                        var mocks = createMockPrivateServicesWithRouters({});
                        var ps = mocks.ps;

                        mocks.siteData.addPageWithData('page1', {pageUriSEO: 'puppets'});

                        expect(function () {
                            var routerPointer = routers.getRouterPointer(ps);
                            routers.add(ps, routerPointer, {prefix: 'puppets', appDefinitionId: 85});
                        }).toThrow(new Error("Router not valid - Page Uri SEO: puppets, already exist."));
                    });

                    it('Should throw an error when adding a new router with pages', function () {
                        var ps = createMockPrivateServicesWithRouters({}).ps;

                        expect(function () {
                            var routerPointer = routers.getRouterPointer(ps);
                            routers.add(ps, routerPointer, savedRecipesRouter);
                        }).toThrow(new Error("Router not valid - pages should not be on the router object"));
                    });

                });
            });
        });

        describe('Get router:', function () {
            describe('By Ref:', function () {
                describe('When getting a router by valid routerRef:', function () {
                    it('Should return the router prefix and config', function () {
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;

                        var routerPointer = ps.pointers.routers.getRouterPointer('1');
                        expect(routers.get.byRef(ps, routerPointer)).toEqual({
                            prefix: 'recipes',
                            config: '',
                            appDefinitionId:'dataBinding',
                            pages: {pageRole1: 'c1dmp'}
                        });

                    });

                    it('Should return config as an object', function () {
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                        var routerRef = ps.pointers.routers.getRouterPointer('6');
                        expect(routers.get.byRef(ps, routerRef).config).toEqual(dbConfig);
                    });
                });

                describe('When getting a router when there are no routers:', function () {
                    it('Should return null', function () {
                        var ps = createMockPrivateServicesWithRouters().ps;

                        var routerPointer = ps.pointers.routers.getRouterPointer('1');
                        expect(routers.get.byRef(ps, routerPointer)).toBeNull();

                    });
                });

                describe('When getting a router by not valid routerRef:', function () {
                    it('Should return null', function () {
                        var ps = createMockPrivateServicesWithRouters().ps;
                        var routerPointer = ps.pointers.routers.getRouterPointer('1');

                        expect(routers.get.byRef(ps, routerPointer)).toBeNull();

                    });
                });
            });

            describe('By Page:', function () {

                describe('When page is not exist:', function () {

                    it('Should return undefined', function () {

                        var ps = createMockPrivateServicesWithRouters({}).ps;

                        var pageRef = page.getPageIdToAdd(ps);

                        expect(routers.getRouterRef.byPage(ps, pageRef)).toEqual(undefined);
                    });

                });

                describe('When page is exist but not connected to a router:', function () {

                    it('Should return undefined', function () {

                        spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                        var pageRef = page.getPageIdToAdd(ps);
                        page.add(ps, pageRef, 'pageTitle');

                        expect(routers.getRouterRef.byPage(ps, pageRef)).toEqual(undefined);
                    });

                });

                describe('When page is connected to a router:', function () {

                    it('should return the router pointer when there is one page in the map', function () {

                        spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                        var routerPointer = ps.pointers.routers.getRouterPointer('4');

                        var pagePointer = page.getPageIdToAdd(ps);
                        page.add(ps, pagePointer);

                        routers.pages.connect(ps, routerPointer, pagePointer, 'newPageRole');

                        var expectedPointer = routers.getRouterRef.byPage(ps, pagePointer);

                        expect(ps.pointers.isSamePointer(expectedPointer, routerPointer)).toBeTruthy();

                    });

                    it('should return the router pointer when the page have more then one role', function () {

                        spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                        var routerPointer = ps.pointers.routers.getRouterPointer('4');

                        var pagePointer = page.getPageIdToAdd(ps);
                        page.add(ps, pagePointer);

                        routers.pages.connect(ps, routerPointer, pagePointer, ['newPageRole1', 'newPageRole2']);

                        var expectedPointer = routers.getRouterRef.byPage(ps, pagePointer);

                        expect(ps.pointers.isSamePointer(expectedPointer, routerPointer)).toBeTruthy();

                    });


                });
            });

            describe('By Prefix:', function () {

                describe('When router with prefix is not exist:', function () {

                    it('Should return undefined', function () {

                        var ps = createMockPrivateServicesWithRouters({}).ps;

                        expect(routers.getRouterRef.byPrefix(ps, 'routerPrefix')).toEqual(undefined);
                    });

                });

                describe('When router exist:', function () {

                    it('Should return rotuerRef', function () {

                        var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                        var routerRef = ps.pointers.routers.getRouterPointer('1');

                        var expectedRouterRef = routers.getRouterRef.byPrefix(ps, 'recipes');

                        expect(ps.pointers.isSamePointer(routerRef, expectedRouterRef)).toBeTruthy();
                    });
                });
            });
        });

        describe('Update router:', function () {

            describe('When updating a router prefix:', function () {

                it('Should update the router prefix if prefix is not exist', function () {
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');
                    routers.update(ps, routerPointer, {prefix: 'newPrefix'});
                    expect(routers.get.byRef(ps, routerPointer)).toEqual({
                        prefix: 'newPrefix',
                        config: '',
                        appDefinitionId:'dataBinding',
                        pages: {pageRole1: 'c1dmp'}
                    });
                });

                it('Should throw an error and not update the router prefix if prefix is exist', function () {
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    expect(function () {
                        routers.update(ps, routerPointer, {prefix: 'employees'});
                    }).toThrow(new Error('Router not valid - Prefix: employees, already exist'));
                    expect(routers.get.byRef(ps, routerPointer)).toEqual({
                        prefix: 'recipes',
                        config: '',
                        appDefinitionId:'dataBinding',
                        pages: {pageRole1: 'c1dmp'}
                    });

                });

                it('Should throw an error and not update the router when prefix already used as pageSEOUri', function () {
                    var mocks = createMockPrivateServicesWithRouters(getMockRouters());
                    var ps = mocks.ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    mocks.siteData.addPageWithData('page1', {pageUriSEO: 'puppets'});

                    expect(function () {
                        routers.update(ps, routerPointer, {prefix: 'puppets'});
                    }).toThrow(new Error("Router not valid - Page Uri SEO: puppets, already exist."));
                    expect(routers.get.byRef(ps, routerPointer)).toEqual({
                        prefix: 'recipes',
                        config: '',
                        appDefinitionId:'dataBinding',
                        pages: {pageRole1: 'c1dmp'}
                    });
                });
            });
            describe('When updating a router config:', function () {
                it('Should update router config', function () {
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');
                    routers.update(ps, routerPointer, {config: {pattern: 'config1'}});

                    expect(routers.get.byRef(ps, routerPointer)).toEqual({
                        prefix: 'recipes',
                        appDefinitionId:'dataBinding',
                        config: {pattern: 'config1'},
                        pages: {pageRole1: 'c1dmp'}
                    });
                });
            });
        });

        describe('Add a new page to a router:', function () {


            describe('When adding a new router page to a new router:', function () {

                it('should add a new page and connect it to a router', function () {

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var newRouter = {
                        prefix: 'jobs',
                        appDefinitionId:'dataBinding',
                        config: ''
                    };
                    var routerPointer = routers.getRouterPointer(ps);
                    var newRouterPointer = routers.add(ps, routerPointer, newRouter);
                    var pageRef = routers.getPageToAddPointer(ps);
                    var pagePointer = routers.pages.add(ps, pageRef, newRouterPointer, 'pageName', ['pageRole']);
                    var routerData = ps.dal.get(newRouterPointer);

                    expect(routerData.pages).toEqual({pageRole: '1234'});
                    expect(ps.dal.get(pagePointer).id).toEqual('1234');
                });


                it('Should add the page to router pages for all roles', function () {

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');

                    var ps = createMockPrivateServicesWithRouters({}).ps;
                    var newRouter = {
                        prefix: 'jobs',
                        appDefinitionId:'dataBinding',
                        config: ''
                    };
                    var routerPointer = routers.getRouterPointer(ps);
                    var newRouterPointer = routers.add(ps, routerPointer, newRouter);
                    var pageRef = routers.getPageToAddPointer(ps);
                    var pagePointer = routers.pages.add(ps, pageRef, newRouterPointer, 'pageName', ['pageRole1', 'pageRole2']);
                    var routerData = ps.dal.get(newRouterPointer);

                    expect(routerData.pages).toEqual({pageRole1: '1234', pageRole2: '1234'});
                    expect(ps.dal.get(pagePointer).id).toEqual('1234');
                });

            });

            describe('When adding a new page to existing router with pages:', function () {

                it('Should add the page to router pages', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');
                    var pageRef = routers.getPageToAddPointer(ps);
                    var pagePointer = routers.pages.add(ps, pageRef, routerPointer, 'pageName', 'newPageRole');
                    var routerData = ps.dal.get(routerPointer);

                    expect(routerData.pages).toEqual({pageRole1: 'c1dmp', newPageRole: 'rnnnn'});
                    expect(ps.dal.get(pagePointer).id).toEqual('rnnnn');

                });

                it('Should override the pageRoles for the router page', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('c1dmp');


                    var routerPointer = ps.pointers.routers.getRouterPointer('1');
                    var pageRef = routers.getPageToAddPointer(ps);
                    var pagePointer = routers.pages.add(ps, pageRef, routerPointer, 'pageName', ['pageRole2', 'pageRole3']);
                    var routerData = ps.dal.get(routerPointer);

                    expect(routerData.pages).toEqual({pageRole2: 'c1dmp', pageRole3: 'c1dmp'});
                    expect(ps.dal.get(pagePointer).id).toEqual('c1dmp');
                });

            });
        });

        describe('Connect a page to a router:', function () {

            describe('When connecting static page to a new router:', function () {

                it('Should add the page to router pages', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');

                    var pageRef = page.getPageIdToAdd(ps);
                    page.add(ps, pageRef);


                    routers.pages.connect(ps, routerPointer, pageRef, ['newPageRole']);
                    var routerData = ps.dal.get(routerPointer);

                    expect(routerData.pages).toEqual({pageRole1: 'c1dmp', newPageRole: '1234'});
                });

            });

            describe('When connecting static page to a new router:', function () {

                it('Should add the page to router pages', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                    var pageRef = routers.getPageToAddPointer(ps);
                    var pagePointer = routers.pages.add(ps, pageRef, routerPointer, 'pageName', ['pageRole4']);

                    routers.pages.connect(ps, routerPointer, pagePointer, ['newPageRole', 'newPageRole2']);
                    var routerData = ps.dal.get(routerPointer);

                    expect(routerData.pages).toEqual({pageRole1: 'c1dmp', newPageRole: '1234', newPageRole2: '1234'});
                });

                it('if the page is sub page should make him primary page', function () {
                    var routersMap = {
                        configMap: {
                            1: {
                                prefix: 'recipes',
                                appDefinitionId:'dataBinding',
                                config: '',
                                pages: {
                                    pageRole1: 'page1',
                                    pageRole2: 'page3'
                                }
                            }
                        }
                    };
                    var mockDocumentData = {
                        CUSTOM_MAIN_MENU: {
                            id: 'CUSTOM_MAIN_MENU',
                            type: 'CustomMenu',
                            items: [
                                '#bmi1',
                                '#bmi3'
                            ]
                        },
                        MAIN_MENU: {
                            id: 'MAIN_MENU',
                            type: 'Menu',
                            items: []
                        },
                        bmi1: {
                            type: 'BasicMenuItem',
                            id: 'bmi1',
                            label: 'mockLabel1',
                            isVisible: true,
                            isVisibleMobile: true,
                            link: '#link1',
                            items: [
                                '#bmi2'
                            ]
                        },
                        bmi2: {
                            type: 'BasicMenuItem',
                            id: 'bmi2',
                            label: 'mockLabel2',
                            isVisible: true,
                            isVisibleMobile: true,
                            link: '#link2',
                            items: []
                        },
                        bmi3: {
                            type: 'BasicMenuItem',
                            id: 'bmi3',
                            label: 'mockLabel3',
                            isVisible: true,
                            isVisibleMobile: true,
                            link: '#link3',
                            items: []
                        },
                        link1: {
                            id: 'link1',
                            type: 'PageLink',
                            pageId: '#page1'
                        },
                        link2: {
                            id: 'link2',
                            type: 'PageLink',
                            pageId: '#page2'
                        },
                        link3: {
                            id: 'link3',
                            type: 'PageLink',
                            pageId: '#page3'
                        }

                    };
                    var siteModel = testUtils.mockFactory.mockSiteModel({
                        routers: routersMap
                    });
                    var siteData = testUtils.mockFactory.mockSiteData(siteModel, true)
                        .addPageWithDefaults('page1')
                        .addPageWithDefaults('page2')
                        .addPageWithDefaults('page3')
                        .addData(_.values(mockDocumentData), 'masterPage');
                    var mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var menuItems = menu.getMenu(mockPrivateServices);
                    expect(menuItems.length).toEqual(2);
                    expect(_.find(menuItems, {id: 'bmi1'}).items.length).toEqual(1);
                    var routerPointer = mockPrivateServices.pointers.routers.getRouterPointer('1');
                    var pagePointer = mockPrivateServices.pointers.page.getPagePointer('page2');
                    routers.pages.connect(mockPrivateServices, routerPointer, pagePointer, 'newPageRole');
                    menuItems = menu.getMenu(mockPrivateServices);
                    expect(menuItems.length).toEqual(3);
                    expect(_.find(menuItems, {id: 'bmi1'}).items.length).toEqual(0);

                });

            });

            describe('When connecting existing router page to another router', function () {

                it('Should throw an error', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');
                    var anotherRouterPointer = ps.pointers.routers.getRouterPointer('4');

                    var pagePointer = page.getPageIdToAdd(ps);
                    page.add(ps, pagePointer);

                    routers.pages.connect(ps, routerPointer, pagePointer, 'newPageRole');

                    expect(function () {
                        routers.pages.connect(ps, anotherRouterPointer, pagePointer, 'roles');
                    }).toThrow(new Error('page already exist on another router'));

                });


            });

            describe('When connecting not existing page to a router', function () {

                it('Should not add a page to the router', function () {

                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    var pagePointer = page.getPageIdToAdd(ps);

                    routers.pages.connect(ps, routerPointer, pagePointer, 'newPageRole');
                    expect(ps.dal.get(routerPointer)).toEqual(savedRecipesRouter);


                });


            });
        });

        describe('Disconnect a page from router:', function () {

            describe('When page is not connected to any router', function () {

                it('Should throw an error and not change the routers pages map', function () {

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('4');

                    var pagePointer = page.getPageIdToAdd(ps);

                    expect(function () {
                        routers.pages.disconnect(ps, routerPointer, pagePointer);
                    }).toThrow(new Error("the page is not connected to this router"));
                    expect(ps.dal.get(routerPointer)).toEqual(savedEmployeesRouter);
                });

            });

            describe('When page is connected to another router', function () {

                it('Should throw an error and not change the routers pages map', function () {

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('4');
                    var otherRouterPointer = ps.pointers.routers.getRouterPointer('1');

                    var pagePointer = page.getPageIdToAdd(ps);
                    page.add(ps, pagePointer);
                    routers.pages.connect(ps, routerPointer, pagePointer, ['role1']);

                    expect(function () {
                        routers.pages.disconnect(ps, otherRouterPointer, pagePointer);
                    }).toThrow(new Error("the page is not connected to this router"));
                    expect(ps.dal.get(otherRouterPointer)).toEqual(savedRecipesRouter);
                });

            });

            describe('When page is connected to the router', function () {

                it('Should remove all pageRoles from the router pages map', function () {

                    spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue('1234');
                    var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                    var routerPointer = ps.pointers.routers.getRouterPointer('1');

                    var pagePointer = page.getPageIdToAdd(ps);
                    page.add(ps, pagePointer);
                    routers.pages.connect(ps, routerPointer, pagePointer, ['role1', 'role2']);
                    routers.pages.disconnect(ps, routerPointer, pagePointer);

                    expect(ps.dal.get(routerPointer)).toEqual(savedRecipesRouter);
                });

            });


        });

        describe('should return all connectable pages:', function () {

            var routersMap = {
                configMap: {
                    1: {
                        prefix: 'recipes',
                        appDefinitionId:'dataBinding',
                        config: '',
                        pages: {
                            pageRole1: 'page1',
                            pageRole2: 'page3'
                        }
                    }
                }
            };
            it('when no page connected to router should return all pages', function () {
                var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                var connectablePages = routers.pages.listConnectablePages(ps);
                expect(_.map(connectablePages, 'pageRef.id')).toEqual(['page1', 'page2', 'page3']);
                expect(_.map(connectablePages, 'pageRef.id')).toEqual(['page1', 'page2', 'page3']);
                expect(_.map(connectablePages, 'pageRef.id')).toEqual(['page1', 'page2', 'page3']);
            });

            it('should remove pages that are connected to router', function () {
                var ps = createMockPrivateServicesWithRouters(routersMap).ps;
                var connectablePages = routers.pages.listConnectablePages(ps);
                expect(_.map(connectablePages, 'pageRef.id')).toEqual(['page2']);
            });

        });

        describe('Remove router:', function () {
            it('Should remove router by Ref', function () {
                var routersMap = {
                    configMap: {
                        1: {
                            prefix: 'recipes',
                            appDefinitionId:'dataBinding',
                            config: '',
                            pages: {}
                        }
                    }
                };
                var ps = createMockPrivateServicesWithRouters(routersMap).ps;
                expect(_.keys(routers.get.all(ps)).length).toBe(1);
                var routerRef = ps.pointers.routers.getRouterPointer('1');
                routers.remove(ps, routerRef);
                expect(_.keys(routers.get.all(ps)).length).toBe(0);
                expect(routers.get.byId(ps, 1)).not.toBeDefined();
            });
        });

        describe('getCurrentInnerRoute:', function () {
            it('if current page is dynamic page should return inner route if exist', function () {
                var routerDefinition = {
                    prefix: 'test',
                    routerId: '5'
                };
                var ps = createMockPrivateServicesWithRouters({}, {
                    routerDefinition: routerDefinition, pageAdditionalData: 'animals/dog'
                }, 'currentPage').ps;

                spyOn(routersGetters, 'getRouterDataForPageIfExist').and.returnValue(routerDefinition);
                var innerRoute = routers.getCurrentInnerRoute(ps);
                expect(innerRoute).toEqual({isDynamic: true, innerRoute: 'dog'});
            });

            it('if current page is dynamic page should return dynamic true - since no inner route should not return it', function () {
                var routerDefinition = {
                    prefix: 'test',
                    routerId: '5'
                };
                var ps = createMockPrivateServicesWithRouters({}, {
                    routerDefinition: routerDefinition
                }, 'currentPage').ps;
                spyOn(routersGetters, 'getRouterDataForPageIfExist').and.returnValue(routerDefinition);
                var innerRoute = routers.getCurrentInnerRoute(ps);
                expect(innerRoute).toEqual({isDynamic: true});
            });

            it('if current page is not dynamic return false', function () {
                var ps = createMockPrivateServicesWithRouters().ps;
                spyOn(routersGetters, 'getRouterDataForPageIfExist').and.returnValue(undefined);
                var innerRoute = routers.getCurrentInnerRoute(ps);
                expect(innerRoute).toEqual({isDynamic: false});
            });
        });

        describe('getPageFromInnerRoute:', function () {
            it('should return page id  of inner route', function (done) {
                var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                spyOn(utils.routersBackEndRequests, 'makeParamObjFromPs').and.returnValue({});
                spyOn(utils.routersBackEndRequests, 'getInnerRoutesSiteMap').and.callFake(function (params, callback) {
                    callback([{url: 'mockUrl', pageName: 'mockPageName'}]);
                });
                routers.getPageFromInnerRoute(ps, 1, 'mockUrl', function (res) {
                    expect(res).toEqual('mockPageName');
                    done();
                });
            });
        });


        describe('getRouterInnerRoutes:', function () {
            it('should return inner routes for the given page', function (done) {
                var ps = createMockPrivateServicesWithRouters(getMockRouters()).ps;
                spyOn(utils.routersBackEndRequests, 'makeParamObjFromPs').and.returnValue({});
                spyOn(utils.routersBackEndRequests, 'getInnerRoutesSiteMap').and.callFake(function (params, callback) {
                    callback([{url: 'mockUrl', pageName: 'mockPageName'}, {
                        url: 'mockUrl2',
                        pageName: 'mockPageName2'
                    }, {url: 'mockUrl3', pageName: 'mockPageName'}]);
                });
                routers.getRouterInnerRoutes(ps, 1, 'mockPageName', function (res) {
                    expect(res).toEqual([{url: 'mockUrl', pageName: 'mockPageName'}, {
                        url: 'mockUrl3',
                        pageName: 'mockPageName'
                    }]);
                    done();
                });
            });
        });

        describe('isValidPrefix', function () {
            function createMockPrivateServices() {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1');
                return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            }

            it('should be false when prefix is null', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1, null);
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(1);

            });

            it('should be false when prefix is empty', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1, '');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(1);
            });

            it('should be false when prefix is undefined', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1);
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(1);
            });

            it('should be false if prefix is too long', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1, _.repeat('a', constants.URLS.MAX_LENGTH + 1));
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(2);
            });

            it('should be false if isDuplicatePageUriSeo', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1, 'pageUriSEO page1');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(3);
            });

            it('should be false if prefix contains non alpha-numeric character(s)', function () {
                var ps = createMockPrivateServices();
                var isValiPrefixResponse = routers.isValidPrefix(ps, -1, 'a.b');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(4);
            });

            it('should be false if prefix is forbidden word', function () {
                var ps = createMockPrivateServices();
                ps.dal.set(ps.pointers.general.getForbiddenPageUriSEOs(), {
                    app: true,
                    apps: true,
                    _api: true,
                    sites: true
                });
                var isValiPrefixResponse;
                isValiPrefixResponse = routers.isValidPrefix(ps, -1, 'app');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(5);

                isValiPrefixResponse = routers.isValidPrefix(ps, -1, 'apps');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(5);

                isValiPrefixResponse = routers.isValidPrefix(ps, -1, 'sites');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(5);
            });

            it('should be false if prefix is already in use by another application', function () {
                var ps = createMockPrivateServicesWithRouters(
                    {
                        configMap: {
                            1: {
                                prefix: 'maa',
                                appDefinitionId:'app1'
                            },
                            2: {
                                prefix: 'boo',
                                appDefinitionId:'app2'
                            }
                        }
                    }).ps;


                spyOn(platform, 'getAppDataByApplicationId').and.callFake(function (privateServices, applicationId) {
                    return {appDefinitionId : applicationId};
                });
                var isValiPrefixResponse = routers.isValidPrefix(ps, 'app2', 'maa');
                expect(isValiPrefixResponse.valid).toBe(false);
                expect(isValiPrefixResponse.message).toEqual(6);

                isValiPrefixResponse = routers.isValidPrefix(ps, 'app1', 'maa');
                expect(isValiPrefixResponse.valid).toBe(true);
            });

        });

    });
});
