define(['lodash', 'utils'], function (_, utils) {
    'use strict';

	function getOriginalCompStructure(sitePrivates, pageId, rootId, viewMode) {
        var fullJsonCache = sitePrivates.cache.getBoundCacheInstance(true);
        var pagePointer = sitePrivates.pointers.full.components.getPage(pageId, viewMode);
        var rootPointer = pagePointer && sitePrivates.pointers.full.components.getComponent(rootId, pagePointer);
        var nodePath = rootPointer && fullJsonCache.getPath(rootPointer);
        return nodePath ? _.get(sitePrivates.fullPagesData, nodePath) : null;
    }

    /**
     * Get pointers for all comps from the full json that are under the given node
     * @returns CompStructure[]
     */
    function getAllCompsUnderRoot(sitePrivates, pageId, rootCompId) {
	    var fullNodeStructure = getOriginalCompStructure(sitePrivates, pageId, rootCompId, sitePrivates.siteData.getViewMode());
        return utils.dataUtils.getAllCompsInStructure(fullNodeStructure, sitePrivates.siteData.isMobileView());
    }

	function getFullStructureProperty(sitePrivates, compPointer, property) {
		var fullJsonCache = sitePrivates.cache.getBoundCacheInstance(true);
		var nodePath = fullJsonCache.getPath(sitePrivates.pointers.getInnerPointer(compPointer, property));
		return nodePath ? _.get(sitePrivates.fullPagesData, nodePath) : null;
	}

    return function getAPI(privateServices) {
        return {
            getAllCompsUnderRoot: _.partial(getAllCompsUnderRoot, privateServices),
	        getFullStructureProperty: _.partial(getFullStructureProperty, privateServices)
        };
    };
});
