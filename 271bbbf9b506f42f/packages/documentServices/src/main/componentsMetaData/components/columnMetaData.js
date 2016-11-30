define(['lodash', 'documentServices/constants/constants', 'documentServices/dataModel/dataModel'], function (_, consts, dataModel) {
    'use strict';

    return {
        duplicatable: function (ps, comp, potentialContainer) {
            if (ps.siteAPI.isMobileView()) {
                return false;
            }

            var isDuplicatingAsSibling = ps.pointers.isSamePointer(ps.pointers.components.getParent(comp), potentialContainer);
            var numOfColumns = potentialContainer && ps.pointers.components.getChildren(potentialContainer).length;

            return (isDuplicatingAsSibling && (numOfColumns < 5));
        },
        groupable: false,
        enforceContainerChildLimitsByWidth: false,
        enforceContainerChildLimitsByHeight: true,
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.NEVER},
            from: {allow: false, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        isContainCheckRecursive: false,
        mobileConversionConfig: {
            filterChildrenWhenHidden: true,
            stretchHorizontally: true,
            minHeight: 200,
            category: 'column',
            preserveAspectRatio: false,
            fixedSize: function(ps, comp, pageId) {
                var width = 320;
                var compDesign = comp.designQuery && dataModel.getDesignItemById(ps, comp.designQuery.replace('#', ''), pageId);
                var media = _.get(compDesign, ['background', 'mediaRef']);
                media = (media && (media.posterImageRef || media)) || {};
                return (media.height && media.width) ? {width: width, height: width * media.height / media.width} : null;
            }
        }
    };
});
