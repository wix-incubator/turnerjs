define(['lodash', 'coreUtils', 'siteUtils/core/skinAnchorsMetaData'], function (_, coreUtils, skinAnchorsMetaData) {
    'use strict';

    function createOriginalValuesMap(pageStructure, siteTheme, isMobileView){
        var originalValuesMap = {};

        function addComponentToOriginalValuesMap(component){
            var children = coreUtils.dataUtils.getChildrenData(component, isMobileView);
            var originalData = {};

            if (component.layout){
                originalData.top = coreUtils.boundingLayout.getBoundingY(component.layout);
            }

            if (!_.isEmpty(children)){
                if (component.layout){
                    var componentStyleId = component.styleId && component.styleId.replace('#', '');
                    var componentStyle = siteTheme[componentStyleId];
                    var componentSkin = componentStyle && componentStyle.skin || component.skin;

                    originalData.height = component.layout.height - skinAnchorsMetaData.getNonAnchorableHeightForSkin(componentSkin, componentStyle);
                }

                _.forEach(children, addComponentToOriginalValuesMap);
            }

            originalValuesMap[component.id] = originalData;
        }

        addComponentToOriginalValuesMap(pageStructure);
        return originalValuesMap;
    }

    return {
        createOriginalValuesMap: createOriginalValuesMap
    };
});
