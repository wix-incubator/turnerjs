define([
    'lodash',
    'testUtils',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mobileConversion/modules/conversionUtils',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_,
             testUtils,
             mobileConversion,
             conversionUtils,
             privateServicesHelper) {
    'use strict';

    describe('mobile layout algorithm', function () {

        describe('mobile merge', function () {
            var button, photo, text, container, masterPageChildren;
            var mobileDeletedCompIdMap, components, mobileComponents;
            var siteData, ps, newMobileStructure;

            function initComps() {
                button = {
                    id: 'testButton',
                    anchors: [],
                    dataQuery: '#testButton',
                    componentType: 'wysiwyg.viewer.components.SiteButton',
                    propertyQuery: 'testButton',
                    skin: 'wysiwyg.viewer.skins.photo.SiteButtonSkin',
                    styleId: 'buttonStyle',
                    type: 'Component',
                    nickname: 'button2',

                    layout: {
                        fixedPosition: false,
                        height: 20,
                        rotationInDegrees: 0,
                        scale: 1,
                        width: 20,
                        x: 150,
                        y: 150
                    }
                };

                photo = {
                    id: 'testPhoto',
                    anchors: [],
                    dataQuery: '#testPhoto',
                    componentType: 'wysiwyg.viewer.components.WPhoto',
                    propertyQuery: 'testPhoto',
                    skin: 'wysiwyg.viewer.skins.photo.NoSkinPhoto',
                    styleId: 'textStyle',
                    type: 'Component',
                    nickname: 'photo1',

                    layout: {
                        fixedPosition: false,
                        height: 100,
                        rotationInDegrees: 0,
                        scale: 1,
                        width: 100,
                        x: 100,
                        y: 100
                    }
                };

                text = {
                    id: 'testText',
                    anchors: [],
                    dataQuery: '#testText',
                    componentType: 'wysiwyg.viewer.components.WRichText',
                    propertyQuery: 'testPhoto',
                    skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
                    styleId: 'textStyle',
                    type: 'Component',

                    layout: {
                        fixedPosition: false,
                        height: 100,
                        rotationInDegrees: 0,
                        scale: 1,
                        width: 50,
                        x: 200,
                        y: 200
                    }
                };

                container = {
                    componentType: 'mobile.core.components.Container',

                    components: [],

                    id: 'testContainer',

                    layout: {
                        anchors: [],
                        fixedPosition: false,
                        height: 300,
                        rotationDegrees: 0,
                        scale: 1,
                        width: 491,
                        x: 0,
                        y: 480
                    },

                    skin: '',
                    styleId: 'c2',
                    type: 'Container'
                };

                masterPageChildren = [
                    {
                        componentType: "wysiwyg.viewer.components.HeaderContainer",
                        components: [],
                        id: "SITE_HEADER",
                        skin: "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                        styleId: "hc3",
                        type: "Container",

                        layout: {
                            anchors: [],
                            fixedPosition: false,
                            height: 75,
                            rotationInDegrees: 0,
                            scale: 1,
                            width: 980,
                            x: 0,
                            y: 0
                        }
                    },

                    {
                        componentType: "wysiwyg.viewer.components.FooterContainer",
                        components: [],
                        id: "SITE_FOOTER",
                        skin: "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                        styleId: "fc3",
                        type: "Container",

                        layout: {
                            anchors: [],
                            fixedPosition: false,
                            height: 68,
                            rotationInDegrees: 0,
                            scale: 1,
                            width: 980,
                            x: 0,
                            y: 1206
                        }
                    },

                    {
                        componentType: "wysiwyg.viewer.components.PagesContainer",
                        components: [],
                        id: "PAGES_CONTAINER",
                        skin: "wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen",
                        styleId: "pc1",
                        type: "Container",

                        layout: {
                            anchors: [],
                            fixedPosition: false,
                            height: 1131,
                            rotationInDegrees: 0,
                            scale: 1,
                            width: 980,
                            x: 0,
                            y: 75
                        }
                    }
                ];
            }

            beforeEach(function () {
                initComps();
                mobileDeletedCompIdMap = {
                    mainPage: []
                };

                components = [
                    photo,
                    text,
                    container
                ];

                mobileComponents = _.cloneDeep(components);

                siteData = privateServicesHelper.getSiteDataWithPages({
                    mainPage: {
                        components: components,
                        mobileComponents: mobileComponents,
                        data: {testText: {text: ''}}
                    }
                })
                    .setPageComponents(masterPageChildren, 'masterPage')
                    .setPageComponents(_.cloneDeep(masterPageChildren), 'masterPage', true);
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should copy nickname to mobile structure if exists', function () {
                newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap);

                var comp = _.find(newMobileStructure.mainPage, {id: 'testPhoto'});

                expect(comp.nickname).toBe('photo1');
            });

            it('should not copy nickname to mobile structure if doesnt exist', function () {
                newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap);

                var comp = _.find(newMobileStructure.mainPage, {id: 'testText'});

                expect(comp).toBeDefined();
                expect(_.has(comp, 'nickname')).toBe(false);
            });

            it('should readd hidden component', function () {
                var pagePointer = ps.pointers.components.getPage('mainPage', 'DESKTOP');
                var pageChildrenPointer = ps.pointers.components.getChildrenContainer(pagePointer);
                ps.dal.push(pageChildrenPointer, button);

                newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap, false);

                expect(newMobileStructure.mainPage[newMobileStructure.mainPage.length - 1].id).toBe(button.id);
            });

            it('should readd hidden component if it is in a container', function () {
                var pagePointer = ps.pointers.components.getPage('mainPage', 'DESKTOP');
                var containerPointer = ps.pointers.components.getComponent('testContainer', pagePointer);
                var containerChildrenPointer = ps.pointers.components.getChildrenContainer(containerPointer);
                ps.dal.push(containerChildrenPointer, button);

                newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap, false);

                expect(newMobileStructure.mainPage[2].components[0].id).toBe(button.id);
            });

            describe('fixedPosition components', function() {

                function addComponents(comps) {
                    var pagePointer = ps.pointers.components.getPage('mainPage', 'DESKTOP');
                    var pageChildrenPointer = ps.pointers.components.getChildrenContainer(pagePointer);
                    _.forEach(comps, function (comp) {
                        ps.dal.push(pageChildrenPointer, comp);
                    });
                }

                function createMockFixedPositionComponent(componentType) {
                    return {
                        id: componentType,
                        anchors: [],
                        dataQuery: '#fixedComp',
                        componentType: componentType,
                        propertyQuery: 'fixedcomp',
                        skin: componentType + 'Skin',
                        styleId: 'fixedCompStyle',
                        type: 'Component',
                        layout: {
                            fixedPosition: true,
                            height: 20,
                            rotationInDegrees: 0,
                            scale: 1,
                            width: 20,
                            x: 150,
                            y: 150
                        }
                    };
                }

                it('should hide fixed position components if keepNotRecommendedMobileComponents and convertFixedPositionToAbsolute are set to false', function () {
                    var comp = createMockFixedPositionComponent('wysiwyg.viewer.components.SiteButton');
                    addComponents([comp]);
                    newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap, {keepNotRecommendedMobileComponents: false});
                    expect(_.find(newMobileStructure.mainPage, {id: comp.id})).toBeUndefined();
                });

                it('should convert fixed position components to absolute if keepNotRecommendedMobileComponents is set to false and convertFixedPositionToAbsolute are set to true', function () {
                    var comp = createMockFixedPositionComponent('wysiwyg.viewer.components.tpapps.TPAMultiSection');
                    addComponents([comp]);
                    newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap, {keepNotRecommendedMobileComponents: false});
                    expect(_.find(newMobileStructure.mainPage, {id: comp.id})).toBeDefined();
                });

                it('should convert fixed position components to absolute if keepNotRecommendedMobileComponents is by default', function() {
                    var comps = [
                        createMockFixedPositionComponent('wysiwyg.viewer.components.SiteButton'),
                        createMockFixedPositionComponent('wysiwyg.viewer.components.tpapps.TPAMultiSection')
                    ];

                    addComponents(comps);
                    newMobileStructure = mobileConversion.runMobileMergeAlgorithm(ps, siteData.pagesData, conversionUtils.extractMobileStructure(siteData.pagesData), mobileDeletedCompIdMap);
                    var convertedCompsFixedPositionFlags = _(newMobileStructure.mainPage)
                        .filter(function (comp) {
                            return _.find(comps, {id: comp.id});
                        })
                        .map('layout.fixedPosition')
                        .value();
                    expect(convertedCompsFixedPositionFlags).toEqual(_.map(comps, _.constant(false)));
                });
            });
        });
    });
});
