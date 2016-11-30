define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var MAX_Z_INDEX = utils.style.MAX_Z_INDEX;

    function getStyleId(structure, stylesMap) {
        if (stylesMap) {
            return (structure.styleId && stylesMap[structure.styleId]) || (structure.skin && stylesMap[structure.skin]);
        }
        return structure.styleId;
    }

    /**
     * @private
     * @param {data.compStructure} structure
     * @param {core.SiteData} siteData
     * @return {string} the skin name of the comp
     */
    function getSkin(structure, siteData) {
        if (structure.styleId && siteData.getAllTheme()[structure.styleId]) {
            return siteData.getAllTheme()[structure.styleId].skin;
        }
        return structure.skin;
    }

    function getCompProp(siteAPI, compId, propertyQuery, pageId) {
        if (!propertyQuery) {
            return {};
        }

        var runtimeProps = siteAPI.getRuntimeDal().getCompProps(compId);
        return runtimeProps || siteAPI.getSiteData().getDataByQuery(propertyQuery, pageId, 'component_properties') || {};
    }

    /**
     * @private
     * @param {data.compStructure} structure
     * @return {comp.compLayout}
     */
    function getStyle(layout, siteAPI, compId) {
        var siteData = siteAPI.getSiteData();

        var style = utils.layout.getStyle(layout, siteData.getPageBottomMargin(), siteData.getScreenWidth(), siteData.getSiteWidth(), siteData.getSiteX(), siteData.getScreenHeight());

        if (_.includes(_.get(siteData, ['renderRealtimeConfig', 'compsToShowOnTop']), compId)) {
            style.zIndex = MAX_Z_INDEX;
        }

        return style;
    }

    function getCompData(siteAPI, compId, dataQuery, pageId) {
        var runtimeData = siteAPI.getRuntimeDal().getCompData(compId);
        return runtimeData || siteAPI.getSiteData().getDataByQuery(dataQuery, pageId, 'document_data');
    }

    function getCompDesign(siteAPI, compId, designQuery, pageId) {
        var runtimeDesign = siteAPI.getRuntimeDal().getCompDesign(compId);
        return runtimeDesign || siteAPI.getSiteData().getDataByQuery(designQuery, pageId, 'design_data');
    }

    return {
        getStyleId: getStyleId,
        getSkin: getSkin,
        getCompProp: getCompProp,
        getStyle: getStyle,
        getCompData: getCompData,
        getCompDesign: getCompDesign
    };
});
