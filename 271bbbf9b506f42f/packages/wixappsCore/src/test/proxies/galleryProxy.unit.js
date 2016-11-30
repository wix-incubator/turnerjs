define(['lodash', 'testUtils', 'wixappsCore/proxies/proxyMap'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('Gallery proxy', function () {

        var props;
        var viewDef;

        beforeEach(function () {
            viewDef = {
                comp: {
                    "name": "Gallery",
                    "styleNS": "default",
                    "columns": 2,
                    "rows": 2,
                    "gap": 20,
                    "transition": "horizSwipeAllAtOnce",
                    "autoplayInterval": 2,
                    "transDuration": 1,
                    "showNavigation": true,
                    "showAutoplay": true,
                    "showCounter": true,
                    "expandEnabled": "false",
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

        var items = [
            {"_iid": "SampleItem1", "_type": "Item", "title": "I'm a dish. Click to edit me.", "description": "I'm a dish description. Click \"Edit Menu\" to open the Restaurant Menu editor and change my text. I'm a great place to say how delicious I am so your customers will want to eat me.", "price": "$9.99", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "image": {"_type": "wix:Image", "title": "", "src": "2f7b76_94f56aee5d9cfe22fbaa71a368afa0fe.jpg", "width": 400, "height": 300}, "_createdAt": "2014-07-28T13:40:36.349Z", "_updatedAt": "2014-07-28T13:40:36.349Z", "_hash": "47f031141c702b3852a36bfd7a808c39"},
            {"_iid": "SampleItem4", "_type": "Item", "title": "I'm a dish. Order me.", "description": "I'm a dish description. Click \"Edit Menu\" to open the Restaurant Menu editor and change my text.", "price": "$9.99", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "image": {"_type": "wix:Image", "title": "", "src": "2f7b76_8fd32894d9ed4fe2b1ebc0fd619a26c7.jpg", "width": 400, "height": 300}, "_createdAt": "2014-07-28T13:40:36.349Z", "_updatedAt": "2014-07-28T13:40:36.349Z", "_hash": "fe47d236e2e1237f78ec1fecbac538e2"},
            {"_iid": "6FB1F211-1E0E-47AA-AB8C-04046CD13C3E", "_type": "Item", "title": "I'm a dish.", "description": "I'm a dish description. Click \"Edit Menu\" to open the Restaurant Menu editor and change my text. I'm a great place to say how delicious I am so your customers will want to eat me.", "price": "$9.99", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "image": {"_type": "wix:Image", "title": "", "src": "2f7b76_f09995d80376386f8b02e668822b7415.jpg", "width": 400, "height": 300}, "_createdAt": "2014-07-28T13:40:36.347Z", "_updatedAt": "2014-07-28T13:40:36.347Z", "_hash": "724706d0625ec405641cf32d2290c9f4"},
            {"_iid": "2D3807BB-D954-48B7-A261-145B160629B1", "_type": "Item", "title": "I'm a dish.", "description": "I'm a dish description. Click \"Edit Menu\" to open the Restaurant Menu editor and change my text. I'm a great place to say how delicious I am so your customers will want to eat me.", "price": "$9.99", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "image": {"_type": "wix:Image", "title": "", "src": "2f7b76_13ac2d6d51698048912e81166fbabace.jpg", "width": 400, "height": 300}, "_createdAt": "2014-07-28T13:40:36.346Z", "_updatedAt": "2014-07-28T13:40:36.346Z", "_hash": "e0318098e1d271a1d54e94229715652c"},
            {"_type": "Item", "title": "fdfds", "description": "da\\aD", "price": "sf\\f\\", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "_iid": "84ED48FE-859F-4583-A707-99078BE87BAC", "image": {"_type": "wix:Image", "title": "Hydrangeas.jpg", "src": "d8af22_5eca0c8fa696467a9160115b6894b772.jpg", "width": 1024, "height": 768}, "_createdAt": "2014-07-30T10:13:28.966Z", "_updatedAt": "2014-07-30T10:13:28.966Z", "_hash": "e68e9baf8114319221eb6e66be120759"},
            {"_type": "Item", "title": "lknjho", "description": "694984", "price": "155", "parentRefs": [
                {"_type": "wix:Ref<Section>", "collectionId": "Sections", "itemId": "SampleSection4"}
            ], "_iid": "A9B192A5-F563-4D95-BEF7-9D7CEE6F4D84", "image": {"_type": "wix:Image", "title": "Desert.jpg", "src": "d8af22_7aa9bd1c1b8849608055ca56e3d63580.jpg", "width": 1024, "height": 768}, "_hash": "5539c50813884cd928faa8dc41180946"}
        ];

        it('Should create galleryProxy with all possible skins', function () {
            var galleryProxy = testUtils.proxyBuilder('Gallery', props);
            var paginatedGridGalleryComp = galleryProxy.refs.component;
            expect(paginatedGridGalleryComp.props.skin).toEqual('wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin');

            var ns = {
                'productGallery': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridSimple',
                'contentGallery': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail',
                'minipostGallery': 'wysiwyg.viewer.skins.paginatedgrid.wixapps.PaginatedGridNoDetail',
                'hoverGallery': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoBG',
                'blogGallery': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail'
            };

            _.forEach(ns, function (skin, styleNS) {
                props.viewDef.comp.styleNS = styleNS;
                galleryProxy = testUtils.proxyBuilder('Area', props);
                expect(galleryProxy.refs.component.props.skin).toEqual(skin);
            });
        });

        it('should build proper comp props and an inner callback function for creating gallery items', function () {
            var galleryProxy = testUtils.proxyBuilder('Gallery', props);
            var paginatedGridGalleryComp = galleryProxy.refs.component;

            expect(paginatedGridGalleryComp.props.compProp).toBeDefined();
            //expect(paginatedGridGalleryComp.props.compProp.transition).toEqual("horizSwipeAllAtOnce");
            expect(paginatedGridGalleryComp.props.compProp.numCols).toBe(2);
            expect(paginatedGridGalleryComp.props.compProp.maxRows).toBe(2);
            expect(paginatedGridGalleryComp.props.compProp.margin).toBe(20);
            expect(paginatedGridGalleryComp.props.compProp.autoplayInterval).toBe(2);
            expect(paginatedGridGalleryComp.props.compProp.transDuration).toBe(1);
            expect(paginatedGridGalleryComp.props.compProp.showNavigation).toBe(true);
            expect(paginatedGridGalleryComp.props.compProp.showAutoplay).toBe(true);
            expect(paginatedGridGalleryComp.props.compProp.showCounter).toBe(true);
            expect(paginatedGridGalleryComp.props.compProp.expandEnabled).toBe(false);

            expect(paginatedGridGalleryComp.props.createGalleryItem).toBeDefined();
            expect(paginatedGridGalleryComp.props.getItemRef).toBeDefined();
        });

        describe('showNavigation', function () {
            it('showNavigation is false - matching compProp should be false', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "showNavigation": false, "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showNavigation).toBe(false);
            });

            it('showNavigation is true - matching compProp should be true', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "showNavigation": true, "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showNavigation).toBe(true);
            });

            it('showNavigation is undefined - matching compProp should be true', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showNavigation).toBe(true);
            });
        });

        describe('showCounter', function () {
            it('showCounter is false - matching compProp should be false', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "showCounter": false, "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showCounter).toBe(false);
            });

            it('showCounter is true - matching compProp should be true', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "showCounter": true, "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showCounter).toBe(true);
            });

            it('showCounter is undefined - matching compProp should be true', function () {
                props.viewDef = {
                    comp: {
                        "name": "Gallery", "templates": {"item": {"comp": {"name": "VBox", "items": []}}}
                    }
                };
                var galleryProxy = testUtils.proxyBuilder('Gallery', props);
                var paginatedGridGalleryComp = galleryProxy.refs.component;

                expect(paginatedGridGalleryComp.props.compProp.showCounter).toBe(true);
            });
        });

        it("should build a child proxy with calculated absolute layout positioning (matrix positioning)", function () {
            var galleryProxy = testUtils.proxyBuilder('Gallery', props);

            var item0 = galleryProxy.refs.component.refs["00#0"];
            // expected size is due to the default size given to the component in galleryProxy
            var layout0 = {height: "calc((100% - 20px) / 2)", width: "calc((100% - 20px) / 2)", position: "absolute"};
            _.forEach(layout0, function (value, key) {
                expect(value).toEqual(item0.props.proxyLayout[key]);
            });

            var item1 = galleryProxy.refs.component.refs["00#1"];
            // expected size is due to the default size given to the component in galleryProxy
            var layout1 = {height: "calc((100% - 20px) / 2)", width: "calc((100% - 20px) / 2)", position: "absolute"};
            _.forEach(layout1, function (value, key) {
                expect(value).toEqual(item1.props.proxyLayout[key]);
            });
        });

        it('should use measure map to set sizes of component when the width and height are available', function () {
            var galleryProxy = testUtils.proxyBuilder('Gallery', props);
            expect(galleryProxy.refs.component.width).toBeUndefined();
            expect(galleryProxy.refs.component.height).toBeUndefined();

            // 0 is the default id of the inner component.
            props.viewProps.siteData.measureMap = {
                height: {
                    0: 100
                },
                width: {
                    0: 100
                }
            };

            galleryProxy = testUtils.proxyBuilder('Gallery', props);
            galleryProxy.forceUpdate();
            expect(galleryProxy.refs.component.props.style).toEqual(jasmine.objectContaining({width: 100, height: 100}));
        });


        it('should not use measure map if comp data was changed', function () {
            viewDef.layout = {
                width: 50,
                height: 50
            };

            var galleryProxy = testUtils.proxyBuilder('Gallery', props);

            props.viewProps.siteData.measureMap = {
                height: {
                    0: 100
                },
                width: {
                    0: 100
                }
            };

            expect(galleryProxy.refs.component.props.style).toEqual(jasmine.objectContaining({width: 50, height: 50}));

            var newData = items.slice(0, 1);
            var changedProps = testUtils.proxyPropsBuilder(viewDef, newData);
            galleryProxy = testUtils.proxyBuilder('Gallery', changedProps);
            expect(galleryProxy.refs.component.props.style).toEqual(jasmine.objectContaining({width: 50, height: 50}));
        });

        it('should have relative positioning', function () {
            var galleryProxy = testUtils.proxyBuilder('Gallery', props);
            var paginatedGridGalleryComp = galleryProxy.refs.component;
            expect(paginatedGridGalleryComp.props.style.position).toEqual('relative');
        });
    });
});
