define(['lodash',
        'utils',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/constants/constants',
    'documentServices/structure/structureUtils',
    'core'],
    function (_, utils, componentsMetaData, consts, structureUtils, core) {
    'use strict';

    var anchorsConsts = consts.ANCHORS;
    var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;
    var compAnchorsMetaData = utils.componentsAnchorsMetaData;

    function createBottomParentAnchor(ps, fromComp, toComp, fromCompLayout, toCompLayout) {
        //TODO ask alisa about _setAnchorableDistance in html-client
        // to parent anchors to page have distance 0 (page is marked as a shrinkable container in measurePage)
        // as well as to parent anchors to pages_container
        var distance = 0;
        var anchorableContainerHeight = componentsMetaData.getAnchorableHeight(ps, toComp); //componentsMetaData
        var originalValue = ps.pointers.components.isPage(toComp) ? anchorableContainerHeight : structureUtils.getBoundingHeight(toCompLayout);
        if (!ps.pointers.components.isPage(toComp) && !ps.pointers.components.isPagesContainer(toComp) && !boxSlideShowCommon.isBoxOrStripSlideShowComponent(componentsMetaData.getComponentType(ps, toComp))) {
            distance = anchorableContainerHeight -
                structureUtils.getBoundingHeight(fromCompLayout) -
                structureUtils.getBoundingY(fromCompLayout);
        }

        return createAnchor(ps, fromCompLayout, 'BOTTOM_PARENT', fromComp, toComp, distance, originalValue);
    }

    /**
     *
     * @param ps
     * @param {Object} fromCompPointer
     * @param {Object} toCompPointer
     * @param {Object} fromCompLayout
     * @param {Object} toCompLayout
     * @param {Number} [minDistance]
     * @returns {*}
     */
    function createBottomTopAnchor(ps, fromCompPointer, toCompPointer, fromCompLayout, toCompLayout, minDistance) {
        var distance = structureUtils.getBoundingY(toCompLayout) - structureUtils.getBoundingY(fromCompLayout) - structureUtils.getBoundingHeight(fromCompLayout);
        if (_.isFinite(minDistance)) {
            distance = Math.max(distance, minDistance);
        }
        return createAnchor(ps, fromCompLayout, 'BOTTOM_TOP', fromCompPointer, toCompPointer, distance, structureUtils.getBoundingY(toCompLayout));
    }

    function createTopTopAnchor(ps, fromCompPointer, toCompPointer, fromCompLayout, toCompLayout) {
        var distance = structureUtils.getBoundingY(toCompLayout) - structureUtils.getBoundingY(fromCompLayout);
        return createAnchor(ps, fromCompLayout, 'TOP_TOP', fromCompPointer, toCompPointer, distance, structureUtils.getBoundingY(toCompLayout));
        //we don't create bottom bottom anchors anymore
    }

    function createAnchor(ps, fromCompLayout, type, fromCompPointer, toCompPointer, distance, originalValue, isToMaster) {
        var anchor = getBasicAnchorStructure(type, fromCompPointer, toCompPointer, originalValue, isToMaster);

        var fromCompType = componentsMetaData.getComponentType(ps, fromCompPointer);
        var toCompType = componentsMetaData.getComponentType(ps, toCompPointer);
        var fromMetaData = compAnchorsMetaData[fromCompType] || compAnchorsMetaData.default;
        var toMetaData = compAnchorsMetaData[toCompType] || compAnchorsMetaData.default;

        var fromAllowed = fromMetaData.from && fromMetaData.from.allow;
        var toAllowed = fromMetaData.to && fromMetaData.to.allow;
        if (fromAllowed === false || toAllowed === false) {
            return false;
        }

        anchor.distance = fromMetaData.distance || toMetaData.distance || distance;
        anchor.locked = isAnchorLocked(fromMetaData, distance);

        if (_.some(fromCompLayout.anchors, _.isEqual.bind(_, anchor))) {
            return false;
        }

        var indexOfCurrentAnchorToComp = _.findIndex(fromCompLayout.anchors, {targetComponent: toCompPointer.id});
        if (indexOfCurrentAnchorToComp !== -1) {
            fromCompLayout.anchors[indexOfCurrentAnchorToComp] = anchor;
        } else {
            fromCompLayout.anchors.push(anchor);
        }
        return true;
    }

    function getBasicAnchorStructure(type, fromCompPointer, toCompPointer, originalValue, isToMaster) {
        return {
            distance: 0,
            locked: true,
            originalValue: originalValue,
            fromComp: fromCompPointer.id,
            targetComponent: isToMaster ? 'masterPage' : toCompPointer.id,
            topToTop: null, //this was used only in lock bottom anchors, we don't produce them anymore
            type: type
        };
    }

    function isAnchorLocked(fromMetaData, distance) {
        if (fromMetaData.from.lock === anchorsConsts.LOCK_CONDITION.NEVER) {
            return false;
        }

        if (fromMetaData.from.lock === anchorsConsts.LOCK_CONDITION.ALWAYS) {
            return true;
        }

        return distance <= anchorsConsts.LOCK_THRESHOLD;
    }

    return {
        createBottomParentAnchor: createBottomParentAnchor,
        createBottomTopAnchor: createBottomTopAnchor,
        createTopTopAnchor: createTopTopAnchor,
        createAnchor: createAnchor
    };
});
