/*global window, document, $, Wix, angular, translation*/

translation.directive('translate', ['translationService', function(translationService){
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs){
            var el = $element[0];

            $scope.data = translationService.data;

            $scope.$watch(function(){ return $scope.data.translation; }, function(){
                var textNodes = this._getTextNodes(),
                    placeholder = $attrs.placeholder,
                    tooltip = el.getAttribute('data-tooltip');

                textNodes.forEach(function(textNode){
                    textNode.textContent = this.translate(textNode.textContent.trim());
                }, this);

                if (placeholder){
                    el.setAttribute('placeholder', this.translate(placeholder.trim()));
                }

                if (tooltip){
                    el.setAttribute('data-tooltip', this.translate(tooltip.trim()));
                }
            }.bind(this));

            this.translate = function(key){
                return $scope.data.translation[key] || key;
            };

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