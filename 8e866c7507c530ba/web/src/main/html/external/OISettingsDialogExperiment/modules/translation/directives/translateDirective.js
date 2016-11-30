/*global window, document, $, Wix, angular, translation*/
/**
 * Translation directive
 * 
 * It watches changes in the translationService.translation.map
 * and changes content of supported nodes and attributes to a translated text.
 * It assumes that the content is a key for the translation.map or a plain text
 * that shouldn't be translated.
 * It can translate content of the 
 *  - text nodes
 *  - placeholder attribute
 *  - data-tooltip attribute
 */
translation.directive('translate', ['translationService', function(translationService){
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs){
            var el = $element[0];

            $scope.$watch(function(){ return translationService.translation.map; }, function(){
                var textNodes = this._getTextNodes();
                var placeholder = $attrs.placeholder;
                var tooltip = el.getAttribute('data-tooltip');

                textNodes.forEach(function(textNode){
                    textNode.textContent = translationService.translate(textNode.textContent.trim());
                }, this);

                if (placeholder){
                    el.setAttribute('placeholder', translationService.translate(placeholder.trim()));
                }

                if (tooltip){
                    el.setAttribute('data-tooltip', translationService.translate(tooltip.trim()));
                }
            }.bind(this));

            /**
             * Gets all text nodes from the DOM node 
             * 
             * @returns {Array} - an array of the text nodes
             * @private
             */
            this._getTextNodes = function(){
                var textNodes = [],
                    node;

                if (el){
                    node = el.firstChild;

                    while (node){
                        if (node.nodeType === 3){
                            textNodes.push(node);
                        }

                        node = node.nextSibling;
                    }
                }

                return textNodes;
            };
        }
    };
}]);