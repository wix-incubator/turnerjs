define(['lodash'], function (_) {
    'use strict';

    function solveDynamicMinHeight(minHeightData){
        var absoluteHeight = minHeightData.absoluteHeight;

        if (minHeightData.topPercents || minHeightData.bottomPercents){
            var totalPercents = (minHeightData.topPercents || 0) + (minHeightData.bottomPercents || 0);
            var absRatio = 1 - (totalPercents / 100);

            return Math.ceil(absoluteHeight / absRatio);
        }

        return absoluteHeight;
    }

    function checkPercentsRoundEffects(dynamicMinHeightsData, height){
        return _.reduce(dynamicMinHeightsData, function(minHeight, minHeightData){
            var absTop = Math.ceil((minHeightData.topPercents / 100) * height);
            var absBottom = Math.ceil((minHeightData.bottomPercents / 100) * height);
            var totalAbsHeight = absTop + minHeightData.absoluteHeight + absBottom;

            if (totalAbsHeight > minHeight){
                return totalAbsHeight;
            }
            return minHeight;
        }, height);
    }

    function isAbsolute(minHeightData){
        return !minHeightData.topPercents && !minHeightData.bottomPercents;
    }

    /**
     * @type {{absoluteHeight, topPercents, bottomPercents}} MinHeightData
     * @param {Number=} absoluteHeight - 0 by default
     * @param {Number=} topPercents
     * @param {Number=} bottomPercents
     * @constructor
     */
    function MinHeightData(absoluteHeight, topPercents, bottomPercents) {
        this.absoluteHeight = absoluteHeight || 0;

        if (topPercents){
            this.topPercents = topPercents;
        }

        if (bottomPercents){
            this.bottomPercents = bottomPercents;
        }
    }

    /**
     * @memberOf MinHeightData
     * @param {MinHeightData} minHeightData to clone
     * @returns {MinHeightData}
     */
    MinHeightData.prototype.clone = function () {
        return new MinHeightData(this.absoluteHeight, this.topPercents, this.bottomPercents);
    };

    /**
     * @memberOf MinHeightData
     * @param {Number} absoluteHeight
     * @returns {MinHeightData}
     */
    MinHeightData.prototype.addAbsoluteHeight = function (absoluteHeight) {
        // var newMinHeightData = cloneMinHeightData(this);

        this.absoluteHeight += absoluteHeight;

        // return newMinHeightData;
        return this;
    };

    /**
     * @memberOf MinHeightData
     * @param {MinHeightData} minHeightData to add
     * @returns {MinHeightData}
     */
    MinHeightData.prototype.addMinHeightData = function (minHeightDataToAdd) {
        // var newMinHeightData = cloneMinHeightData(this);
        this.absoluteHeight += minHeightDataToAdd.absoluteHeight;

        var newTopPercents = (this.topPercents || 0) + (minHeightDataToAdd.topPercents || 0);

        if (newTopPercents){
            this.topPercents = newTopPercents;
        }

        var newBottomPercents = (this.bottomPercents || 0) + (minHeightDataToAdd.bottomPercents || 0);

        if (newBottomPercents){
            this.bottomPercents = newBottomPercents;
        }

        // return newMinHeightData;
        return this;
    };

    /**
     *
     * @param {Number} absoluteHeight
     * @param {Number} topPercents
     * @param {Number} bottomPercents
     * @returns {MinHeightData}
     */
    function createMinHeightData(absoluteHeight, topPercents, bottomPercents) {
        return new MinHeightData(absoluteHeight, topPercents, bottomPercents);
    }

    /**
     * @param {{px, pct, vh, vw}} dockData
     * @returns {MinHeightData}
     */
    function createMinHeightDataForDockedTopData(dockData) {
        return new MinHeightData(dockData.px, dockData.pct);
    }

    /**
     * @param {{px, pct, vh, vw}} dockData
     * @returns {MinHeightData}
     */
    function createMinHeightDataForDockedBottomData(dockData) {
        return new MinHeightData(dockData.px, null, dockData.pct);
    }

    /**
     * @param {{px, pct, vh, vw}} dockData
     * @returns {MinHeightData}
     */
    function createMinHeightDataForVerticallyCenteredDockedData(dockData) {
        var topPercents, bottomPercents;

        if (_.isNumber(dockData.pct)){
            if (dockData.pct < 0){
                bottomPercents = Math.abs(dockData.pct) * 2;
            } else {
                topPercents = dockData.pct * 2;
            }
        }

        return new MinHeightData(Math.abs(dockData.px) * 2, topPercents, bottomPercents);
    }

    /**
     * @type {{absoluteHeight, dynamicHeights}} ChainMinHeightData
     * @param absoluteHeight
     * @param dynamicHeights
     * @constructor
     */
    function ChainMinHeightData(absoluteHeight, dynamicHeights){
        this.absoluteHeight = absoluteHeight;
        this.dynamicHeights = dynamicHeights;
    }

    /**
     * @memberOf ChainMinHeightData
     * @param {ChainMinHeightData} chainMinHeightData to merge
     * @returns {ChainMinHeightData}
     */
    ChainMinHeightData.prototype.merge = function (chainMinHeightData){
        this.dynamicHeights = this.dynamicHeights.concat(chainMinHeightData.dynamicHeights);

        this.absoluteHeight = Math.max(this.absoluteHeight, chainMinHeightData.absoluteHeight);

        return this;
    };

    /**
     * @memberOf ChainMinHeightData
     * @returns {number}
     */
    ChainMinHeightData.prototype.solve = function (){
        if (_.isEmpty(this.dynamicHeights)){
            return this.absoluteHeight;
        }

        var minHeightFromDynamicChains = Math.ceil(_(this.dynamicHeights).map(solveDynamicMinHeight).max());
        var minHeight = Math.max(this.absoluteHeight, minHeightFromDynamicChains);

        return checkPercentsRoundEffects(this.dynamicHeights, minHeight);
    };

    /**
     * @param {MinHeightData[]} minHeightsData
     * @returns {ChainMinHeightData}
     */
    function createChainMinHeightData(minHeightsData){
        var absoluteHeight = 0;
        var dynamicHeights = [];

        _.forEach(minHeightsData, function(minHeightData){
            if (isAbsolute(minHeightData)) {
                absoluteHeight = Math.max(absoluteHeight, minHeightData.absoluteHeight);
            } else {
                dynamicHeights.push(minHeightData);
            }
        });

        return new ChainMinHeightData(absoluteHeight, dynamicHeights);
    }

    return {
        createMinHeightData: createMinHeightData,
        createMinHeightDataForDockedTopData: createMinHeightDataForDockedTopData,
        createMinHeightDataForDockedBottomData: createMinHeightDataForDockedBottomData,
        createMinHeightDataForVerticallyCenteredDockedData: createMinHeightDataForVerticallyCenteredDockedData,
        createChainMinHeightData: createChainMinHeightData
    };
});
