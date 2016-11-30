define([
        'lodash',
        'wixappsBuilder',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/services/listsLayout'
    ],
    function (_, wixappsBuilder, testUtils, privateServicesHelper, listsLayout) {
        'use strict';

        function setItemSpacing(siteData, viewName, value) {
            var view = siteData.wixapps.appbuilder.descriptor.views[viewName];
            view.vars.itemSpacing = value;
        }

        function setHidePagination(siteData, viewName, value) {
            var view = siteData.wixapps.appbuilder.descriptor.views[viewName];
            _.find(view.comp.items, {id: "paginatedlist"}).comp.hidePagination = value;
        }

        function setItemsPerPage(siteData, viewName, value) {
            var view = siteData.wixapps.appbuilder.descriptor.views[viewName];
            _.find(view.comp.items, {id: "paginatedlist"}).comp.itemsPerPage = value;
        }

        function setSeparatorStyle(siteData, viewName, value) {
            var view = siteData.wixapps.appbuilder.descriptor.views[viewName];
            var defaultTemplate = _.find(view.comp.items, {id: "paginatedlist"}).comp.templates.item.comp.cases.default;
            _.find(defaultTemplate, {id: "gutterLine"}).comp.style = value;
        }

        function setSeparatorHidden(siteData, viewName, value) {
            var view = siteData.wixapps.appbuilder.descriptor.views[viewName];
            var defaultTemplate = _.find(view.comp.items, {id: "paginatedlist"}).comp.templates.item.comp.cases.default;
            _.find(defaultTemplate, {id: "gutterLine"}).comp.hidden = value;
        }

        describe('Wixapps listsLayout', function () {

            var fakePS, siteData;
            var testListId = 'testListId';
            var viewName = 'testViewName';

            beforeEach(function () {
                var styles = [{id: 'wp1'}, {id: 'wp2'}];
                var desktopView = _.cloneDeep(_.find(wixappsBuilder.viewsTemplatesData['2.0'].views, function (view) {
                    return view.forType === 'Array' && !view.format;
                }));
                var mobileView = _.cloneDeep(_.find(wixappsBuilder.viewsTemplatesData['2.0'].views, {forType: 'Array', format: 'Mobile'}));
                desktopView.name = viewName;
                mobileView.name = viewName;

                siteData = testUtils.mockFactory.mockSiteData()
                    .addViews([desktopView, mobileView])
                    .addPart(testListId, 'testDataSelectorId', 'testTypeId', viewName)
                    .addCompTheme(styles);

                fakePS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            describe('get', function () {

                describe('desktop', function () {

                    it('when separator style is not defined, get the default one', function () {
                        setSeparatorStyle(siteData, 'Array|testViewName', undefined);

                        var layout = listsLayout.get(fakePS, testListId);

                        expect(layout.separatorStyle).toBe('hl1');
                    });

                    it('when separator style is defined, return it', function () {
                        setSeparatorStyle(siteData, 'Array|testViewName', 'wp2');
                        setSeparatorHidden(siteData, 'Array|testViewName', undefined);

                        var layout = listsLayout.get(fakePS, testListId);

                        expect(layout.separatorStyle).toBe('wp2');
                        expect(layout.hideSeparator).toBe(false);
                    });

                    it('return the separator component type', function () {
                        var layout = listsLayout.get(fakePS, testListId);

                        expect(layout.separatorComponentType).toBe('wysiwyg.viewer.components.FiveGridLine');
                    });

                    it('gets the pagination settings', function () {
                        setHidePagination(siteData, 'Array|testViewName', 'true');
                        setItemsPerPage(siteData, 'Array|testViewName', 5);

                        var layout = listsLayout.get(fakePS, testListId);

                        expect(layout.hidePagination).toBe(true);
                        expect(layout.itemsPerPage).toBe(5);
                    });

                    it('gets the item spacing', function () {
                        setItemSpacing(siteData, 'Array|testViewName', 10);

                        var layout = listsLayout.get(fakePS, testListId);

                        expect(layout.itemSpacing).toBe(10);
                    });

                });

                describe('mobile', function () {

                    it('when separator style is not defined, get the default one', function () {
                        setSeparatorStyle(siteData, 'Array|testViewName|Mobile', undefined);

                        var layout = listsLayout.get(fakePS, testListId, 'Mobile');

                        expect(layout.separatorStyle).toBe('hl1');
                    });

                    it('when separator style is defined, return it', function () {
                        setSeparatorHidden(siteData, 'Array|testViewName|Mobile', true);
                        setSeparatorStyle(siteData, 'Array|testViewName|Mobile', 'wp1');

                        var layout = listsLayout.get(fakePS, testListId, 'Mobile');

                        expect(layout.separatorStyle).toBe('wp1');
                        expect(layout.hideSeparator).toBe(true);
                    });

                    it('gets the pagination settings', function () {
                        setHidePagination(siteData, 'Array|testViewName|Mobile', 'false');
                        setItemsPerPage(siteData, 'Array|testViewName|Mobile', 10);

                        var layout = listsLayout.get(fakePS, testListId, 'Mobile');

                        expect(layout.hidePagination).toBe(false);
                        expect(layout.itemsPerPage).toBe(10);
                    });

                    it('gets the item spacing', function () {
                        setItemSpacing(siteData, 'Array|testViewName|Mobile', 20);

                        var layout = listsLayout.get(fakePS, testListId, 'Mobile');

                        expect(layout.itemSpacing).toBe(20);
                    });

                });
            });

            describe('set', function () {

                _.forEach([undefined, 'Mobile'], function (format) {

                    it('setting hide pagination', function () {
                        var layoutBefore = listsLayout.get(fakePS, testListId, format);
                        layoutBefore.hidePagination = !layoutBefore.hidePagination;
                        listsLayout.set(fakePS, testListId, layoutBefore, format);
                        var layout = listsLayout.get(fakePS, testListId, format);

                        expect(layout.hidePagination).toEqual(layoutBefore.hidePagination);
                    });

                    it('setting items per page', function () {
                        listsLayout.set(fakePS, testListId, {itemsPerPage: 121}, format);
                        var layout = listsLayout.get(fakePS, testListId, format);

                        expect(layout.itemsPerPage).toEqual(121);
                    });

                    it('setting separator style', function () {
                        listsLayout.set(fakePS, testListId, {separatorStyle: 'wp2'}, format);
                        var layout = listsLayout.get(fakePS, testListId, format);

                        expect(layout.separatorStyle).toEqual('wp2');
                    });

                    it('setting item spacing', function () {
                        listsLayout.set(fakePS, testListId, {itemSpacing: 73}, format);
                        var layout = listsLayout.get(fakePS, testListId, format);

                        expect(layout.itemSpacing).toEqual(73);
                    });

                });
            });

        });
    });
