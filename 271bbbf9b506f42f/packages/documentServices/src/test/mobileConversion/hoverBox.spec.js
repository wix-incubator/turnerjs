define([
    'lodash',
    'testUtils',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mobileConversion/modules/mergeAggregator',
    'documentServices/documentMode/documentMode'
], function (_, testUtils, constants, privateServicesHelper, mobileActions, mobileConversion, mergeAggregator, documentMode) {
    'use strict';

    describe('Hover Box conversion', function () {

        beforeEach(function () {
            this.regularModeId = 'comp-iw26klp0-mode-iw26klpw';
            this.hoverBoxId = 'hoverBoxId';
            testUtils.experimentHelper.openExperiments('sv_hoverBox');
            this.hoverBoxId = 'comp-iw26klp0';
            this.hoverBox = {
                layout: {
                    x: 308,
                    y: 136.89473684210526,
                    fixedPosition: false,
                    width: 176,
                    height: 176,
                    scale: 1,
                    rotationInDegrees: 0
                },
                modes: {
                    definitions: [
                        {
                            modeId: this.regularModeId,
                            type: 'DEFAULT',
                            label: 'MODE_LABEL_FROM_PRESET',
                            params: ''
                        },
                        {
                            modeId: 'comp-iw26klp0-mode-iw26klpw1',
                            type: 'HOVER',
                            label: 'MODE_LABEL_FROM_PRESET',
                            params: ''
                        }],
                    overrides: []
                },
                components: [
                    {
                        layout: {
                            x: 71,
                            y: 36,
                            fixedPosition: false,
                            width: 35,
                            height: 45,
                            scale: 1,
                            rotationInDegrees: 0
                        },
                        modes: {
                            overrides: [
                                {
                                    modeIds: ['comp-iw26klp0-mode-iw26klpw1'],
                                    layout: {
                                        width: 35,
                                        height: 45,
                                        x: 71,
                                        y: 38,
                                        scale: 1,
                                        rotationInDegrees: 0,
                                        fixedPosition: false
                                    },
                                    isHiddenByModes: true
                                },
                                {
                                    modeIds: ['comp-iw26klp0-mode-iw26klpw'],
                                    layout: {
                                        width: 35,
                                        height: 45,
                                        x: 71,
                                        y: 47,
                                        scale: 1,
                                        rotationInDegrees: 0,
                                        fixedPosition: false
                                    },
                                    isHiddenByModes: true
                                }],
                            isHiddenByModes: false
                        },
                        componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                        type: 'Component',
                        id: 'comp-iw26klqh',
                        dataQuery: '#dataItem-iw26klqi'
                    },
                    {
                        layout: {
                            x: 60,
                            y: 48,
                            fixedPosition: false,
                            width: 56,
                            height: 44,
                            scale: 1,
                            rotationInDegrees: 0
                        },
                        modes: {
                            overrides: [
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw1'],
                                    layout: {
                                        width: 56,
                                        height: 44,
                                        x: 60,
                                        y: 43,
                                        scale: 1,
                                        rotationInDegrees: 0,
                                        fixedPosition: false
                                    },
                                    isHiddenByModes: true
                                },
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw'],
                                    layout: {
                                        width: 56,
                                        height: 44,
                                        x: 60,
                                        y: 52,
                                        scale: 1,
                                        rotationInDegrees: 0,
                                        fixedPosition: false
                                    },
                                    isHiddenByModes: true
                                }],
                            isHiddenByModes: false
                        },
                        componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                        type: 'Component',
                        id: 'comp-iw26klqv'
                    },
                    {
                        layout: {
                            x: 13.886792452830186,
                            y: 18.29276315789474,
                            fixedPosition: false,
                            width: 96,
                            height: 102,
                            scale: 1,
                            rotationInDegrees: 0
                        },
                        modes: {
                            isHiddenByModes: false,
                            definitions: [],
                            overrides: [
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw'],
                                    layout: {
                                        x: 14,
                                        y: 18.29276315789474,
                                        fixedPosition: false,
                                        width: 96,
                                        height: 102,
                                        scale: 1,
                                        rotationInDegrees: 0
                                    }
                                },
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw1'],
                                    layout: {
                                        x: 14,
                                        y: 18.29276315789474,
                                        fixedPosition: false,
                                        width: 96,
                                        height: 102,
                                        scale: 1,
                                        rotationInDegrees: 0
                                    },
                                    isHiddenByModes: true
                                }]
                        },
                        componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                        type: 'Component',
                        id: 'comp-iw26l0cl'
                    },
                    {
                        layout: {
                            x: 15.42857142857143,
                            y: 14.88651315789474,
                            fixedPosition: false,
                            width: 102,
                            height: 102,
                            scale: 1,
                            rotationInDegrees: 0
                        },
                        modes: {
                            isHiddenByModes: true,
                            definitions: [],
                            overrides: [
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw1'],
                                    layout: {
                                        x: 15,
                                        y: 14.88651315789474,
                                        fixedPosition: false,
                                        width: 102,
                                        height: 102,
                                        scale: 1,
                                        rotationInDegrees: 0
                                    },
                                    isHiddenByModes: false
                                }]
                        },
                        componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                        type: 'Component',
                        id: 'comp-iw26lkto'
                    },
                    {
                        type: 'Component',
                        layout: {
                            x: 142,
                            y: 21.5,
                            fixedPosition: false,
                            width: 3,
                            height: 133,
                            scale: 1,
                            rotationInDegrees: 0
                        },
                        componentType: 'wysiwyg.viewer.components.VerticalLine',
                        id: 'comp-iw26mmq7',
                        modes: {
                            isHiddenByModes: true,
                            definitions: [],
                            overrides: [
                                {
                                    modeIds: [
                                        'comp-iw26klp0-mode-iw26klpw1'],
                                    isHiddenByModes: false,
                                    layout: {
                                        x: 137,
                                        y: 21.5,
                                        fixedPosition: false,
                                        width: 3,
                                        height: 133,
                                        scale: 1,
                                        rotationInDegrees: 0
                                    },
                                    styleId: 'style-iw26ml8q'
                                }]
                        }
                    }],
                componentType: 'wysiwyg.viewer.components.HoverBox',
                type: 'Container',
                id: this.hoverBoxId
            };
            this.pageId = 'mainPage';
            this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId, [_.cloneDeep(this.hoverBox)], []);
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
            this.desktopPagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
            mergeAggregator.initialize(this.ps);
            mobileActions.initialize(this.ps);

            this.mobileHoverBoxInHoverMode = {
                componentType: 'wysiwyg.viewer.components.HoverBox',
                type: 'Container',
                id: this.hoverBoxId,
                layout: {
                    x: 20,
                    y: 20,
                    width: 280,
                    height: 122
                },
                components: [{
                    layout: {
                        x: 89,
                        y: 10,
                        width: 102,
                        height: 102
                    },
                    componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                    type: 'Component',
                    id: 'comp-iw26lkto'
                }]
            };

            this.mobileHoverBoxInRegularMode = {
                layout: {
                    x: 20,
                    y: 10,
                    height: 122,
                    width: 280
                },
                componentType: 'wysiwyg.viewer.components.HoverBox',
                type: 'Container',
                id: this.hoverBoxId,
                components: [{
                    layout: {
                        x: 92,
                        y: 10,
                        height: 102,
                        width: 96
                    },
                    componentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
                    type: 'Component',
                    id: 'comp-iw26l0cl'
                }]
            };
            this.mobilePagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.MOBILE);
        });

        function getComponent(ps, compId, pagePointer) {
            var compPointer = ps.pointers.components.getComponent(compId, pagePointer);
            return extractComponentData(ps.dal.get(compPointer));
        }

        function getMobilePointer(compId) {
            return {id: compId, type: 'MOBILE'};
        }

        function extractComponentData(serializedComponent) {
            var layout = _.pick(serializedComponent.layout, ['x', 'y', 'height', 'width']);
            _.set(serializedComponent, 'layout', layout);
            delete serializedComponent.modes;
            delete serializedComponent.propertyQuery;
            if (serializedComponent.components) {
                serializedComponent.components = _.map(serializedComponent.components, extractComponentData);
            }
            return serializedComponent;

        }

        describe('first conversion', function () {

            it('should use hover mode as default when running on switching to mobile', function () {
                expect(this.ps.dal.get(this.mobilePagePointer).mobileComponents).toEqual([]);
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);

                var convertedHoverBox = getComponent(this.ps, this.hoverBoxId, this.mobilePagePointer);
                expect(convertedHoverBox).toEqual(this.mobileHoverBoxInHoverMode);
            });

            it('should use hover mode as default when running on desktop', function () {
                expect(this.ps.dal.get(this.mobilePagePointer).mobileComponents).toEqual([]);
                mobileConversion.convertMobileStructure(this.ps);

                var convertedHoverBox = getComponent(this.ps, this.hoverBoxId, this.mobilePagePointer);
                expect(convertedHoverBox).toEqual(this.mobileHoverBoxInHoverMode);
            });
        });

        describe('hidden components', function () {

            beforeEach(function () {
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);
            });

            it('should hide hover box component', function () {
                mobileActions.hiddenComponents.hide(this.ps, getMobilePointer(this.mobileHoverBoxInHoverMode.components[0].id));
                expect(mobileActions.hiddenComponents.get(this.ps, this.pageId)).toEqual(['comp-iw26lkto', 'comp-iw26mmq7']);
            });

            it('should unhide hover box component', function () {
                mobileActions.hiddenComponents.show(this.ps, null, 'comp-iw26mmq7', this.pageId);
                expect(mobileActions.hiddenComponents.get(this.ps, this.pageId)).toEqual([]);
            });

            it('should should not unhide components after navigating from desktop to mobile and back', function () {
                mobileActions.hiddenComponents.hide(this.ps, getMobilePointer(this.mobileHoverBoxInHoverMode.components[0].id));
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.DESKTOP);
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);
                expect(mobileActions.hiddenComponents.get(this.ps, this.pageId)).toEqual(['comp-iw26lkto', 'comp-iw26mmq7']);
            });

        });

        describe('display mode', function () {
            it('should update hover mode and relayout hover box component', function () {
                expect(this.ps.dal.get(this.mobilePagePointer).mobileComponents).toEqual([]);
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);
                mobileActions.setComponentDisplayMode(this.ps, getMobilePointer(this.hoverBoxId), this.regularModeId);
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.DESKTOP);
                var convertedHoverBox = getComponent(this.ps, this.hoverBoxId, this.mobilePagePointer);
                expect(convertedHoverBox).toEqual(this.mobileHoverBoxInRegularMode);
            });
        });
    });
});