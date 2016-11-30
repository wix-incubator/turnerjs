define(['lodash', 'experiment',
    'siteUtils/core/anchorsGenerator',
    'siteUtils/core/skinAnchorsMetaData'], function
    (_, experiment, anchorsGenerator, skinAnchorsMetaData) {
    'use strict';

    function findCompInPage(pageStructure, isMobileView) {
        var childrenKey;
        var isMasterPage = pageStructure.type === 'Document';
        if (isMasterPage) {
            childrenKey = isMobileView ? 'mobileComponents' : 'children';
        } else {
            childrenKey = isMobileView ? 'mobileComponents' : 'components';
        }
        return _.first(pageStructure[childrenKey]);
    }

    function shouldCreateAnchorsForPage(displayedPageStructure, isMobileView, isRootIgnoreBottomBottom) {
        var shouldIgnoreExistingAnchors = isRootIgnoreBottomBottom && ((!isMobileView && displayedPageStructure.isPagePackedDesktop) ||
            (isMobileView && displayedPageStructure.isPagePackedMobile));
        var compInPage = findCompInPage(displayedPageStructure, isMobileView);
        var jsonAnchorsRemoved = !compInPage || !_.get(compInPage, 'layout.anchors');
        if (experiment.isOpen('viewerGeneratedAnchors')) {
            if (typeof (window) === 'undefined' || window.publicModel) {
                return shouldIgnoreExistingAnchors || jsonAnchorsRemoved;
            }

            return jsonAnchorsRemoved;
        }
        return false;
    }

    /**
     * @class layoutAnchorsUtils
     */
    return {
        createPageAnchors: anchorsGenerator.createPageAnchors,
        createChildrenAnchors: anchorsGenerator.createChildrenAnchors,
        packTextAnchors: anchorsGenerator.packTextAnchors,
        shouldCreateAnchorsForPage: shouldCreateAnchorsForPage,
        getNonAnchorableHeightForSkin: skinAnchorsMetaData.getNonAnchorableHeightForSkin
    };
});
