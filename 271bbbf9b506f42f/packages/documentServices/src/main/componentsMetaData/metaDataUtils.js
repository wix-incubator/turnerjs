define([
    'lodash',
    'core',
    'documentServices/utils/utils',
    'documentServices/dataModel/dataModel',
    'experiment',
    'documentServices/page/popupUtils',
    'documentServices/constants/constants'
], function(
    _,
    core,
    dsUtils,
    dataModel,
    experiment,
    popupUtils,
    constants
) {
    'use strict';

    var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;

    var masterPage = 'wysiwyg.viewer.components.WSiteStructure';

    var SITE_SEGMENTS = [
        'wysiwyg.viewer.components.SiteSegmentContainer',
        'wysiwyg.viewer.components.FooterContainer',
        'wysiwyg.viewer.components.HeaderContainer',
        'wysiwyg.viewer.components.PagesContainer'
    ];

    var STRIP_CONTAINERS = {
        'wysiwyg.viewer.components.ScreenWidthContainer': true,
        'wysiwyg.viewer.components.StripContainer': true,
        'wysiwyg.viewer.components.StripContainerSlideShow': true,
        'wysiwyg.viewer.components.StripContainerSlideShowSlide': true,
        'wysiwyg.viewer.components.StripColumnsContainer': true,
        'wysiwyg.viewer.components.Column': function (ps, compPtr) {
            if (ps.pointers.components.getViewMode(compPtr) === constants.VIEW_MODES.MOBILE) {
                return true;
            }
            var isSingleColumn = ps.pointers.components.getSiblings(compPtr).length === 0;

            var columnsContainer = ps.pointers.components.getParent(compPtr);
            var columnsContainerProperties = dataModel.getPropertiesItem(ps, columnsContainer);

            return isSingleColumn && columnsContainerProperties.fullWidth;
        }
    };

    var NON_CONTAINABLE_FULL_WIDTH = {
        'wysiwyg.viewer.components.ScreenWidthContainer': true,
        'wysiwyg.viewer.components.StripContainerSlideShow': true,
        'wysiwyg.viewer.components.StripContainerSlideShowSlide': true
    };

    var LEGACY_FULL_WIDTH_CONTAINERS = _.assign({
        'wysiwyg.viewer.components.WSiteStructure': true,
        'mobile.core.components.SiteStructure': true,
        'wysiwyg.viewer.components.FooterContainer': true,
        'wysiwyg.viewer.components.HeaderContainer': true,
        'mobile.core.components.Page': true,
        'core.components.Page': true,
        'wixapps.integration.components.AppPage': true
    }, STRIP_CONTAINERS);

    var CONTAINERS = [
        'mobile.core.components.Container',
        'wysiwyg.viewer.components.Group',
        'core.components.Container',
        'core.components.ContainerOBC',
        'wysiwyg.viewer.components.PopupContainer',
        'wixapps.integration.components.Area',
        'wixapps.integration.components.common.formcontainer.viewer.FormContainer',
        'wysiwyg.viewer.components.BoxSlideShowSlide',
        'wysiwyg.viewer.components.BoxSlideShow',
        'wysiwyg.viewer.components.HoverBox',
        'wysiwyg.viewer.components.HoverBox_old',
        'wysiwyg.viewer.components.Column'
    ].concat(_.keys(LEGACY_FULL_WIDTH_CONTAINERS));

    var HEADER_FOOTER_PAGE_AND_MASTERPAGE = [
        'wysiwyg.viewer.components.FooterContainer',
        'wysiwyg.viewer.components.HeaderContainer',
        'mobile.core.components.Page',
        'core.components.Page',
        'wixapps.integration.components.AppPage',
        masterPage
    ];

    var COMPONENTS_NOT_SUITABLE_FOR_NON_RENDERING_STATE = [
        'wysiwyg.viewer.components.BoxSlideShowSlide',
        'wysiwyg.viewer.components.BoxSlideShow',
        'wysiwyg.viewer.components.StripContainerSlideShowSlide',
        'wysiwyg.viewer.components.StripContainerSlideShow',
        'wysiwyg.viewer.components.StripColumnsContainer',
        'wysiwyg.viewer.components.HoverBox',
        'wysiwyg.common.components.anchor.viewer.Anchor',
        'wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu',
        'wysiwyg.viewer.components.tpapps.TPAWidget',
        'wysiwyg.viewer.components.tpapps.TPASection',
        'wysiwyg.viewer.components.tpapps.TPAGluedWidget',
        'wysiwyg.viewer.components.tpapps.TPAMultiSection',
        'wixapps.integration.components.AppPart',
        'wixapps.integration.components.AppPart2'
    ];

    return {

        isSiteStructure: function(componentType){
            return componentType === masterPage;
        },

        isSiteSegment: function(componentType) {
            return _.includes(SITE_SEGMENTS, componentType);
        },

        isFullWidthContainer: function(ps, componentType, compPtr) {
            var isStrip = STRIP_CONTAINERS[componentType];
            return _.isFunction(isStrip) ? isStrip(ps, compPtr) : isStrip;
        },

        isContainer: function(componentType) {
            return _.includes(CONTAINERS, componentType);
        },

        isLegacyFullWidthContainer: function (ps, compPtr) {
            var compType = dsUtils.getComponentType(ps, compPtr);
            var isLegacyFullWidthContainer = LEGACY_FULL_WIDTH_CONTAINERS[compType];

            if (_.isFunction(isLegacyFullWidthContainer)) {
                return isLegacyFullWidthContainer(ps, compPtr);
            }

            return !!isLegacyFullWidthContainer;
        },

        isLegacyFullWidthContainerByType: function(componentType){
            return !!(LEGACY_FULL_WIDTH_CONTAINERS[componentType] && !_.isFunction(LEGACY_FULL_WIDTH_CONTAINERS[componentType]));
        },

        isHeaderOrFooterOrPageOrMasterPage: function(componentType){
            return _.includes(HEADER_FOOTER_PAGE_AND_MASTERPAGE, componentType);
        },

        isComponentSuitableForNonRenderingState: function(componentType){
            return !_.includes(COMPONENTS_NOT_SUITABLE_FOR_NON_RENDERING_STATE, componentType);
        },

        isPopupPageOrPopupContainer: function (ps, compPointer) {
            return popupUtils.isPopup(ps, compPointer.id) || dsUtils.getComponentType(ps, compPointer) === 'wysiwyg.viewer.components.PopupContainer';
        },

        isComponentParentTypeMatchesComponentChildType: function(parentType, childType){
            //TODO - columns should be able to use this as well
            return boxSlideShowCommon.isBoxOrStripSlideShowComponent(parentType) && boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent(childType) &&
                    boxSlideShowCommon.getMatchingChildSlideType(parentType) === childType;
        },

        isNonContainableFullWidth: function(componentType){

            return !!(NON_CONTAINABLE_FULL_WIDTH[componentType] && !_.isFunction(NON_CONTAINABLE_FULL_WIDTH[componentType]));
        },

        getComponentType: dsUtils.getComponentType,

        containableByFullWidthPopup: function (ps, comp, containerPointer) {

            var pagePointer = ps.pointers.components.getPageOfComponent(containerPointer);

            return !(popupUtils.isPopup(ps, pagePointer.id) && !popupUtils.isPopupFullWidth(ps, pagePointer));
        },

        notContainableByPopup: function (ps, comp, containerPointer) {
            var pagePointer = ps.pointers.components.getPageOfComponent(containerPointer);

            return !popupUtils.isPopup(ps, pagePointer.id);
        }

    };
});
