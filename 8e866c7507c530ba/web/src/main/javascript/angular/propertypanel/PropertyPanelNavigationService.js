W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';
    /**
     * @ngdoc service
     * @name propertyPanel.service:propertyPanelNavigation
     * @description
     * Provides a repository for the content panels available for the property panel.
     *
     *
     */
        //Moved propertyPanelNavigation from property panel module to angularEditor to avoid a loading order bug in FF
    angular.module('angularEditor').provider('propertyPanelNavigation', function () {
        var _propertyPanelComponents = {};
        var DEFAULT_PATH = "/propertyPanel/panels/legacy/LegacyPanelView.html";

        return {

            /**
             *  @ngdoc method
             *  @name propertyPanel.service:propertyPanelNavigation#registerPropertyPanel
             *  @methodOf propertyPanel.service:propertyPanelNavigation
             * @param {string} componentClass  The class name of the component for which this panel is registered
             * @param {string} partailPath The path to partial (view) that contains the property panel content template.
             * @description
             * Allows a property panel content builder to register his content panel so the property panel will know to load it when the component is
             * selected on stage.
             */

            registerPropertyPanel: function (componentClass, partialPath) {
                _propertyPanelComponents[componentClass] = partialPath;
            },

            $get: function (editorResources) {

                return{
                    /**
                     *  @ngdoc method
                     *  @name propertyPanel.service:propertyPanelNavigation#getPanelPath
                     *  @methodOf propertyPanel.service:propertyPanelNavigation
                     * @param {string} componentClass  The class name of the component for which this panel is registered
                     * @returns {string} the full path to the component view.
                     * @description
                     * Provides the full partial path for components property panel.
                     */
                    getPanelPath: function (componentClass) {
                        var path = _propertyPanelComponents[componentClass];
                        return {
                            url: path ? editorResources.getAngularPartialPath(path) : editorResources.getAngularPartialPath(DEFAULT_PATH),
                            isLegacy: !path
                        };
                    }
                };

            }
        };
    });
});