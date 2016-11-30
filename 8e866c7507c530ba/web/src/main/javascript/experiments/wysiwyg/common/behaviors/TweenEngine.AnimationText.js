/** @class wysiwyg.common.behaviors.TweenEngine */
define.experiment.Class('wysiwyg.common.behaviors.TweenEngine.AnimationText', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.statics({
        ClearTypes: strategy.merge({
            SPLIT_TEXT: 'splitText'
        })
    });

    def.utilize(['wysiwyg.common.behaviors.utilities.InsertSplitHtmlText']);


    def.methods(/** @lends wysiwyg.common.behaviors.TweenEngine */{
        initialize: function(tweenResource) {
            if (typeof tweenResource === 'undefined') {
                tweenResource = this.resources.TweenMax;
            }
            this._tweenResource = tweenResource;
            /**
             * Utilities for animation
             * @type {{InsertSplitHtmlText: (wysiwyg.common.behaviors.utilities.InsertSplitHtmlText)}}
             */
            this.utils = {
                /** @lends wysiwyg.common.behaviors.utilities.InsertSplitHtmlText */
                InsertSplitHtmlText: this.imports.InsertSplitHtmlText
            };
        },

        _clearElementByTypes: function(elementClearParams) {
            var element, i, elements;

            elements = (elementClearParams.elements instanceof HTMLElement) ? [elementClearParams.elements] : elementClearParams.elements;

            if (_.contains(elementClearParams.types, this.ClearTypes.CSS_STYLE)) {
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    this._resetElementStyles(element);
                }
            }

            if (_.contains(elementClearParams.types, this.ClearTypes.SPLIT_TEXT)) {
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    this._resetSplitText(element);
                }
            }

        },

        /**
         *
         * @param {HTMLElement} element
         * @private
         */
        _resetSplitText: function(element) {
            var splitTextInstance = new this.utils.InsertSplitHtmlText();
            splitTextInstance.revert(element);
        }
    });
});