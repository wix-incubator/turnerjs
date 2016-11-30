W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';


    /**
     * @ngdoc directive
     * @name propertyPanel.directive:legacyPanel
     * @restrict E
     * @element legacy-panel
     * @description
     * Allows the ng property panel to host legacy (non-ng) panels.
     * This directive is tightly coupled to the editor because of its nature and should not be used other than in the property panel.
     *
     */
    var app = angular.module('propertyPanel');
    app.directive('legacyPanel', function ($timeout, editorComponent) {
        var _legacyPanel;
        var _componentWatchedUnregister;
        return {
            restrict: 'E',
            template: '<div></div>',

            link: function (scope, iElement) {

                function _replaceLegacyPanel() {
                    _disposeLegacyPanel();
                    if (scope.context.isLegacyPanel) {
                        _legacyPanel = editorComponent.getLegacyPanel();
                        if (_legacyPanel) {
                            iElement.children().remove();
                            //we need a timeout here since insertInto will not fire the proper events if the panel is not visible.
                            //Due to the angular lifecycle the element will not be visible in time.
                            //Therefore we do the insertion in a timeout. ugly, but that's the way interops are done, dog.
                            $timeout(function () {
                                _legacyPanel.insertInto(iElement[0]);
                            }, 0, false);
                        }
                    }
                }

                function _disposeLegacyPanel() {
                    // Old code used to call dispose on this._dataPanel which is an element
                    // What we really want is to call the dispose of the logic
                    // I'm not sure who might be dependant on the old behaviour so I keep the ugly ifs below.
                    if (_legacyPanel) {
                        if (_legacyPanel.$logic && _legacyPanel.$logic.dispose) {
                            _legacyPanel.$logic.dispose();
                        }
                        else {
                            _legacyPanel.dispose();
                        }
                    }
                }

                _componentWatchedUnregister = scope.$on('selectedComponentChanged', _replaceLegacyPanel);

                scope.$on('$destroy', function () {
                    //make sure to kill the listener and dispose the panel when we are moving to an angular panel.
                    _componentWatchedUnregister();
                    _disposeLegacyPanel();
                });

                _replaceLegacyPanel();
            }

        };
    });
});