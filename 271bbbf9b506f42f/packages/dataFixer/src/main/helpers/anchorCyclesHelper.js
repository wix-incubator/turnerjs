define(['lodash'], function (_) {
    'use strict';

    var ANCHOR_TYPES = {
        BOTTOM_BOTTOM: 'BOTTOM_BOTTOM',
        BOTTOM_TOP: 'BOTTOM_TOP'
    };

    function getCompBottom(comp) {
        return comp && comp.layout && (comp.layout.y + comp.layout.height); //eslint-disable-line lodash3/prefer-get
    }

    function getCompAnchors(comp) {
        return comp.layout && comp.layout.anchors || [];
    }

    function isPushingDownComponentThatsAbove(anchor, fromComp, toComp) {
        var anchorBottom;
        switch (anchor.type) {
            case ANCHOR_TYPES.BOTTOM_BOTTOM:
                anchorBottom = getCompBottom(toComp);
                break;
            case ANCHOR_TYPES.BOTTOM_TOP:
                anchorBottom = _.get(toComp, 'layout.y');
                break;
            default:
                return false;
        }

        if (_.isUndefined(anchorBottom)) {
            return false;
        }

        return anchorBottom - getCompBottom(fromComp) < 0;
    }

    function isBottomBottomOrBottomTopAnchor(anchor) {
        return anchor.type === ANCHOR_TYPES.BOTTOM_BOTTOM || anchor.type === ANCHOR_TYPES.BOTTOM_TOP;
    }

    function doesBTBBCycleExist(cycleCandidateComp, currCompInAnchorPath, siblingsMap, visitedMap) {
        if (visitedMap[currCompInAnchorPath.id]) {
            return false;
        }
        visitedMap[currCompInAnchorPath.id] = true;

        var anchors = getCompAnchors(currCompInAnchorPath);
        anchors = _.filter(anchors, isBottomBottomOrBottomTopAnchor);

        return _.some(anchors, function (anchor) {
            return anchor.targetComponent === cycleCandidateComp.id ||
                doesBTBBCycleExist(cycleCandidateComp, siblingsMap[anchor.targetComponent], siblingsMap, visitedMap);
        });
    }

    function fixBottomTopBottomBottomCycles(children) {
        if (_.isEmpty(children)) {
            return;
        }

        var siblingsMap = _.indexBy(children, 'id');
        _.forEach(children, function (component) {
            var anchors = getCompAnchors(component);
            _.remove(anchors, function (anchor) {
                return isBottomBottomOrBottomTopAnchor(anchor) &&
                    isPushingDownComponentThatsAbove(anchor, component, siblingsMap[anchor.targetComponent]) &&
                    doesBTBBCycleExist(component, siblingsMap[anchor.targetComponent], siblingsMap, {});
            });

            fixBottomTopBottomBottomCycles(component.components);
        });
    }

    return {
        fixBottomTopBottomBottomCycles: fixBottomTopBottomBottomCycles
    };
});
