/**
 * Created by shaharz on 3/9/14.
 */
define.Class('wysiwyg.viewer.components.classes.TextScalingModifier', function(classDefinition) {
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.components.classes.TextModifierBase');

    def.utilize(['wysiwyg.viewer.components.classes.TextScalingLayoutCalculator']);

    def.methods({
        initialize: function(initialScale, parentNode) {
            this.parent(initialScale, parentNode);
            this._scale = initialScale;
            this._mostCommonTextSize = null;
            this._layoutCalculator = new this.imports.TextScalingLayoutCalculator();
        },

        setScale: function(scale) {
            this._scale = scale;
        },

        emptyCache: function() {
            this.parent();
            this._mostCommonTextSize = null;
        },

        getMostCommonTextSizeBeforeScaling: function() {
            if (!this._mostCommonTextSize) {
                this.calculateMostCommonTextSize();
            }
            return this._mostCommonTextSize;
        },

        calculateMostCommonTextSize: function() {
            if (!this._parentNode) {
                return;
            }
            this.emptyCache();
            this._updateCache();
            this._addTextLengthToElementSizeCache();
            var textSizeToDomElementsMap = this._createTextSizeToElementsMap();
            var textSizeToTextLengthMap = this._createTextSizeToTextLengthMap(textSizeToDomElementsMap);
            this._mostCommonTextSize = this._getMaxTextSize(textSizeToTextLengthMap);
        },

        getEffectiveTextHeight: function(compLogic) {
            return this._layoutCalculator.getTextOverallBorders(compLogic).height;
        },

        _addTextLengthToElementSizeCache: function() {
            var parentNode, childIndex, childNode, textLengthCounter;
            for (var i=this._cache.length-1; i>=0; i--) {
                parentNode = this._cache[i].node;
                textLengthCounter = parentNode.textContent.replace(/ /g, '').length;
                childIndex = i-1;
                while(childIndex >= 0 && parentNode.getElement(childNode = this._cache[childIndex].node)) {
                    textLengthCounter -= childNode.textContent.replace(/ /g, '').length;
                    childIndex--;
                }
                this._cache[i].length = textLengthCounter;
            }
        },

        _createTextSizeToElementsMap: function() {
            return _.groupBy(this._cache, function(elementObj) {
                return elementObj.value;
            });
        },

        _createTextSizeToTextLengthMap: function(textSizeToDomElementsMap) {
            var textSizeToTextLengthMap = {};
            _.forEach(textSizeToDomElementsMap, function(elementArr, size) {
                textSizeToTextLengthMap[size] = this._sumElementsTextLength(elementArr);
            }, this);
            return textSizeToTextLengthMap;
        },

        _sumElementsTextLength: function(elementArr) {
            if (elementArr.length === 1) {
                return _.first(elementArr).length;
            }
            else {
                return _.reduce(elementArr, function(result, elementObj) {
                    if (typeOf(result) === 'object') {
                        result = result.length;
                    }
                    return elementObj.length + result;
                });
            }
        },

        _getMaxTextSize: function(textSizeToTextLength) {
            var maxTextSize, longestText = _.max(textSizeToTextLength);
            _.forEach(textSizeToTextLength, function(textLength, textSize) {
                if (textLength === longestText) {
                    maxTextSize = textSize;
                    return;
                }
            });
            return parseFloat(maxTextSize);
        },

        _getNodeDesktopValue: function(node) {
            return W.Utils.mobile.getFontSize(node, W.Theme);
        },

        _updateNodeNewValue: function(node, originalSize) {
            var wantedSize;
            if (originalSize) {
                wantedSize = Math.round(W.Utils.mobile.convertFontSizeToMobile(originalSize, this._scale));
                node.setStyle('fontSize', wantedSize);
            }
        }
    });
});