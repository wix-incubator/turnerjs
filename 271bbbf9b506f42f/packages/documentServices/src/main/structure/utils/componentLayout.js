define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    function getBoundingLayout(privateServices, layout){
        return utils.boundingLayout.getBoundingLayout(layout);
    }

    function getComponentLayout(ps, compPointer) {
        var layout = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
        if (!layout) {
            return null;
        }
        if (layout.docked){
            _.assign(layout, getPositionAndSize(ps, compPointer));
            delete layout.docked;
        }

        return _.merge(layout, {bounding: getBoundingLayout(ps, layout)});
    }

    /**
     * This function is important for 2 reasons:
     * 1. We don't want to recursively get the width up the chain (i.e. our parent is docked left+right)
     * 2. We can't get our own width, since during batched updates in DS, the current value in the measureMap might not be correct (our JSON updated during batch but relayout is only at end of the batch), but the parent's value will still be correct
     *
     * @param ps
     * @param compPointer
     * @returns {Number} Width of the parent, as it is currently rendered
     */
    function getParentWidth(ps, compPointer, compLayout) {
        if (compLayout.fixedPosition || utils.dockUtils.isHorizontalDockToScreen(compLayout)) {
            return ps.siteAPI.getSiteMeasureMap().clientWidth;
        }
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var measureMap = ps.siteAPI.getSiteMeasureMap();

        return measureMap.width[parentPointer.id];
    }

    function getParentDimensions(ps, compPointer) {
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        return {
            width: measureMap.width[parentPointer.id],
            height: measureMap.height[parentPointer.id]
        };
    }

    /**
     * This function is important for 2 reasons:
     * 1. We don't want to recursively get the height up the chain (i.e. our parent is docked top+bottom)
     * 2. We can't get our own height, since during batched updates in DS, the current value in the measureMap might not be correct (our JSON updated during batch but relayout is only at end of the batch), but the parent's value will still be correct
     *
     * @param ps
     * @param compPointer
     * @returns {Number} Height of the parent, as it is currently rendered
     */
    function getParentHeight(ps, compPointer, compLayout) {
        if (compLayout.fixedPosition) {
            return ps.siteAPI.getSiteMeasureMap().clientHeight;
        }
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var measureMap = ps.siteAPI.getSiteMeasureMap();

        return measureMap.height[parentPointer.id];
    }

    /**
     *
     * @param currentPositionAndSize
     * @param newPositionAndSize
     * @returns {positionAndSize} the difference between the current positionAndSize and the new one
     */
    function getPositionAndSizeDiff(currentPositionAndSize, newPositionAndSize) {
        return _.mapValues(currentPositionAndSize, function (value, key) {
            return _.isFinite(newPositionAndSize[key]) ?
            newPositionAndSize[key] - value :
                0;
        });
    }

    function isPctUnits(units) {
        return _.includes(['vw', 'pct'], units);
    }

    function applyDiffToUnitsData(dockData, diffInPx, parentInPx) {
        var dockUnits = _.keys(dockData);

        if (_.includes(dockUnits, 'px')) {
            dockData.px += diffInPx;
        } else {
            var percentUnits = _.find(dockUnits, isPctUnits);
            dockData[percentUnits] += (diffInPx / parentInPx) * 100;
            dockData[percentUnits] = parseFloat((dockData[percentUnits]).toFixed(2));
        }
    }

    function updateHorizontalLayoutForDocked(compLayout, positionAndSizeDiff, parentWidth) {
        var docked = compLayout.docked;

        if (docked.left && positionAndSizeDiff.x) {
            applyDiffToUnitsData(docked.left, positionAndSizeDiff.x, parentWidth);
        }

        if (docked.right) {
            var rightDiff = (positionAndSizeDiff.x + positionAndSizeDiff.width) * -1;
            if (rightDiff) {
                applyDiffToUnitsData(docked.right, rightDiff, parentWidth);
            }
        }

        if (docked.hCenter) {
            var centerDiff = (positionAndSizeDiff.width / 2 + positionAndSizeDiff.x);
            if (centerDiff) {
                applyDiffToUnitsData(docked.hCenter, centerDiff, parentWidth);
            }
        }

        if (!(docked.left && docked.right)) { //if not horizontally stretched
            compLayout.width += positionAndSizeDiff.width;
        }
    }

    function updateVerticalLayoutForDocked(compLayout, positionAndSizeDiff, parentHeight) {
        var docked = compLayout.docked;

        if (docked.top && positionAndSizeDiff.y) {
            applyDiffToUnitsData(docked.top, positionAndSizeDiff.y, parentHeight);
        }

        if (docked.bottom) {
            var diffBottom = ((positionAndSizeDiff.y + positionAndSizeDiff.height) * -1);
            if (diffBottom) {
                applyDiffToUnitsData(docked.bottom, diffBottom, parentHeight);
            }
        }

        if (docked.vCenter) {
            var centerDiff = (positionAndSizeDiff.height / 2 + positionAndSizeDiff.y);
            if (centerDiff) {
                applyDiffToUnitsData(docked.vCenter, centerDiff, parentHeight);
            }
        }

        if (!(docked.top && docked.bottom)) {
            compLayout.height += positionAndSizeDiff.height;
        }
    }


    function applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, positionAndSize) {

        return componentLayout(ps, compPointer, positionAndSize)
            .updateVerticalLayout()
            .updateHorizontalLayout()
            .value();
    }

    function componentLayout(ps, compPointer, positionAndSizeChanges) {
        return new ComponentLayoutBuilder(ps, compPointer, positionAndSizeChanges);
    }

    function ComponentLayoutBuilder(ps, compPointer, positionAndSizeChanges) {
        this.ps = ps;
        this.compPointer = compPointer;
        var currentPositionAndSize = getPositionAndSize(ps, compPointer);
        this.newPositionAndSize = _.assign({}, currentPositionAndSize, positionAndSizeChanges);
        this.positionAndSizeDiff = getPositionAndSizeDiff(currentPositionAndSize, positionAndSizeChanges);
        this.compLayout = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
    }

    ComponentLayoutBuilder.prototype.value = function () {
        return this.compLayout;
    };

    ComponentLayoutBuilder.prototype.updateVerticalLayout = function () {
        if (this.positionAndSizeDiff.y === 0 && this.positionAndSizeDiff.height === 0) {
            return this;
        }

        if (utils.layout.isVerticallyDocked(this.compLayout) && !utils.layout.isVerticallyStretchedToScreen(this.compLayout)) {
            var parentHeight = getParentHeight(this.ps, this.compPointer, this.compLayout);
            updateVerticalLayoutForDocked(this.compLayout, this.positionAndSizeDiff, parentHeight);
        } else {
            this.compLayout.y += this.positionAndSizeDiff.y;
            this.compLayout.height += this.positionAndSizeDiff.height;
        }

        return this;
    };

    ComponentLayoutBuilder.prototype.updateHorizontalLayout = function () {
        if (this.positionAndSizeDiff.x === 0 && this.positionAndSizeDiff.width === 0) {
            return this;
        }

        if (utils.layout.isHorizontallyDocked(this.compLayout)) {
            var parentWidth = getParentWidth(this.ps, this.compPointer, this.compLayout);
            updateHorizontalLayoutForDocked(this.compLayout, this.positionAndSizeDiff, parentWidth);
        } else {
            this.compLayout.x += this.positionAndSizeDiff.x;
            this.compLayout.width += this.positionAndSizeDiff.width;
        }

        return this;
    };

    ComponentLayoutBuilder.prototype.keepAspectRatioIfNeeded = function () {

        if (utils.layout.isAspectRatioOn(this.compLayout)) {
            this.compLayout.aspectRatio = utils.layout.calcAspectRatio(this.newPositionAndSize.width, this.newPositionAndSize.height);
        }

        return this;
    };


    /**
     *
     * @param ps
     * @param compPointer
     * @returns {Object} the rendered position and size of the component, in pixels
     */
    function getPositionAndSize(ps, compPointer, compLayout) {
        var layout = compLayout || ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
        if (!layout.docked){
            var layoutToReturn = _.pick(layout, ['x', 'y', 'width', 'height']);
            layoutToReturn.height = layout.height;
            return layoutToReturn;
        }

        var parentDimensions = getParentDimensions(ps, compPointer);
        var screenSize = ps.siteAPI.getScreenSize();

        var measureMap = ps.siteAPI.getSiteMeasureMap();
        var rootPointer = ps.pointers.components.getPageOfComponent(compPointer);
        var siteWidth = utils.layout.getRootWidth(measureMap, rootPointer.id, ps.siteAPI.getSiteWidth());

        var siteX = ps.siteAPI.getSiteX();
        var rootLeft = utils.layout.getRootLeft(measureMap, rootPointer.id, siteX);

        return utils.positionAndSize.getPositionAndSize(layout, parentDimensions, screenSize, siteWidth, rootLeft);
    }

    /**
     * @exports documentServices/structure/utils/componentLayout
     */
    return {
        /**
         *
         * @param ps
         * @param compPointer
         * @param positionAndSize
         */
        applyPositionAndSizeOnCurrentLayoutSchema: applyPositionAndSizeOnCurrentLayoutSchema,

        getBoundingLayout: getBoundingLayout,
        getComponentLayout: getComponentLayout,
        getPositionAndSize: getPositionAndSize
    };
});
