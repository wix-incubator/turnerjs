define(['lodash', 'testUtils', 'wixappsCore/core/proxyFactory'], function (_, /** testUtils */testUtils, proxyFactory) {
    'use strict';

    describe('Paginated Column Gallery proxy', function () {

        var props;
        var viewDef;
        var cols = 4;
        var horizGap = 20;
        var vertGap = 40;
        var items = [
            {"_type": "Item", text: "abcd"},
            {"_type": "Item", text: "ab"},
            {"_type": "Item", text: "cd"},
            {"_type": "Item", text: "aaa"},
            {"_type": "Item", text: "ggg"},
            {"_type": "Item", text: "ghhg"}
        ];

        beforeEach(function () {
            viewDef = {
                comp: {
                    "name": "ColumnGallery", "columns": cols, "horizontalGap": horizGap, "verticalGap": vertGap,
                    "templates": {
                        "item": {
                            "comp": {
                                "name": "VBox", "items": []
                            }
                        }
                    }
                }
            };
            props = testUtils.proxyPropsBuilder(viewDef, items);
        });

        it('Should create columnGallery and add dom attributes for the layout part', function () {
            var proxy = testUtils.proxyBuilder('ColumnGallery', props);
            var proxyAttributes = proxy.refs.component.attributes;
            expect(proxyAttributes['data-proxy-name'].value).toBe('PaginatedColumnGalleryProxy');
            expect(proxyAttributes['data-direction'].value).toBe('ltr');
            expect(proxyAttributes['data-horizontal-gap'].value).toBe(String(horizGap));
            expect(proxyAttributes['data-vertical-gap'].value).toBe(String(vertGap));
            expect(proxyAttributes['data-columns'].value).toBe(String(cols));
        });

        it('Should create columnGallery with proxy children with width percent', function () {
            var proxy = testUtils.proxyBuilder('ColumnGallery', props);
            var proxyChildren = proxy.refs.component.children;
            expect(proxyChildren.length).toBe(items.length);
            _.forEach(proxyChildren, function(item){
                expect(item.style.width).toEqual((100 / cols) + "%");
            });
        });

        it('Should be the same proxy as ColumnGallery', function () {
            var columnGallery = proxyFactory.getProxyClass('ColumnGallery', true);
            var paginatedColumnGallery = proxyFactory.getProxyClass('PaginatedColumnGallery', true);

            expect(columnGallery.displayName).toEqual(paginatedColumnGallery.displayName);
        });

        it('should handle pagination - set maxPage var to according to total items count and itemsPerPage property', function(){
            spyOn(props.viewProps, 'setVar');
            var proxy = testUtils.proxyBuilder('PaginatedColumnGallery', props);
            expect(props.viewProps.setVar).toHaveBeenCalledWith(proxy.contextPath, "maxPage", 1, true);

            props.viewDef.comp.itemsPerPage = "2";
            proxy = testUtils.proxyBuilder('PaginatedColumnGallery', props);
            expect(props.viewProps.setVar).toHaveBeenCalledWith(proxy.contextPath, "maxPage", 3, true);

            props.viewDef.comp.itemsPerPage = "4";
            testUtils.proxyBuilder('PaginatedColumnGallery', props);
            expect(props.viewProps.setVar).toHaveBeenCalledWith(proxy.contextPath, "maxPage", 2, true);
        });

        it('should handle pagination - read currentPage var and show the relevant items accordingly', function(){
            var currPage = 1;
            var itemsPerPage = 3;
            props.viewDef.comp.itemsPerPage = itemsPerPage;

            spyOn(props.viewContextMap, 'getVar').and.callFake(function(path, name) {
                if (name === 'currentPage') {
                    return 2;
                }
            });

            var proxy = testUtils.proxyBuilder('PaginatedColumnGallery', props);
            var proxyChildren = proxy.refs.component.children;

            var firstItemInPage = itemsPerPage * currPage;
            var expectedPageItems = items.slice(firstItemInPage, firstItemInPage + itemsPerPage);

            expect(proxyChildren.length).toBe(itemsPerPage);
            _.forEach(proxyChildren, function (child, index) {
                expect(proxy.refs[(currPage * itemsPerPage) + index].proxyData).toEqual(expectedPageItems[index]);
                expect(proxy.refs[(currPage * itemsPerPage) + index].props.viewDef).toEqual(viewDef.comp.templates.item);
            });
        });
    });
});
