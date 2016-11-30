W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name utilsDirectives.directive:wixTranslate
     * @param {placeholder | text } translatetarget If left as null will replace the text node of the element it is put on.
     * @param {boolean} translateDynamic if set to true the attribute value will be continuously watched and updated.
     * @description
     * The wixTranslate directive allows you to automatically translate a string for any directive.
     * if you wrap the value passed to the attribute with either single or double quotes it will be treated as a literal value.
     */
    angular.module('utilsDirectives')
        .directive('wixTranslate', function (editorResources) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    translate();

                    if (attrs.translateDynamic && attrs.translateDynamic.toLowerCase() === 'true') {
                        scope.$watch(attrs.wixTranslate, translate);
                    }

                    function translate() {
                        var result;

                        var key = scope.$eval(attrs.wixTranslate);
                        if (typeof(key) === 'undefined') {
                            key = attrs.wixTranslate;
                        }

                        if (!key) {
                            return;
                        }

                        if (_isWrappedInQuotes(attrs.wixTranslate)) {
                            result = _trimQuotes(attrs.wixTranslate);
                        } else {
                            result = editorResources.translate(key, 'EDITOR_LANGUAGE', key);
                        }

                        var translateTarget = attrs.translatetarget && attrs.translatetarget.toLowerCase();
                        switch (translateTarget) {
                            case "placeholder":
                                element.attr('placeholder', result);
                                break;
                            default :
                                createOrUpdateTextNodeChild(result);
                            //what we really want it to set the value of the text node of the element.
                            //using text or html will replace the entire dom subtree.
                        }
                    }

                    /**
                     * Update the value of the text node of the element.
                     * Using innerText or innerHTML will replace the entire dom subtree.
                     * If no text node child - create one and append to element.
                     * @param textValue
                     */
                    function createOrUpdateTextNodeChild(textValue) {
                        if (textValue.indexOf('<br/>') >= 0 || textValue.indexOf('<br>') >= 0) {
                            var spanElm = _.find(element[0].childNodes, function (child) {
                                return (child.tagName.toLowerCase() === "span" && child.getAttribute('data-name') === 'translated');
                            });
                            if (!spanElm) {
                                spanElm = document.createElement('span');
                                spanElm.setAttribute('data-name', 'translated');
                                element[0].appendChild(spanElm);
                            }
                            spanElm.innerHTML = textValue;
                        } else {
                            var childNodes = element[0].childNodes;
                            for (var i = 0; i < childNodes.length; i++) {
                                if (childNodes[i].nodeValue !== null) {
                                    childNodes[i].nodeValue = textValue;
                                    return;
                                }
                            }

                            //no text element child - create it
                            var textNode = document.createTextNode(textValue);
                            element[0].appendChild(textNode);
                        }

                    }
                }
            };

            function _isWrappedInQuotes(string) {
                return (/^['|"].*['|"]$/).test(string);
            }

            function _trimQuotes(string) {
                return string.slice(1, string.length - 1);
            }

        });
});