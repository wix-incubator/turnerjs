W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name propertyPanel.service:componentLayout
     * @description
     * Manages the layout of the component
     */
    angular.module('propertyPanel').service('componentLayout', function ($rootScope, editorCommands, editorComponent) {

        var EditorManager = W.Editor;

        function _updatecomponentLayout(scope, args) {
            $rootScope.$broadcast('onComponentLayoutChanged', args);
        }


        var getLayoutData = function () {
            var comp = editorComponent.getEditedComponent();
            if (!comp) {
                return;
            }
            var layoutData = {};
            // TODO GuyR 6/24/14 10:12 AM - get the bounding x and y for the view
            layoutData.layout = {
                width: comp.getWidth(),
                height: comp.getHeight(),
                x: comp.getX(),
                y: comp.getY(),
                angle: comp.getAngle()
            };
            layoutData.rotatable = comp.isRotatable();
            return layoutData;
        };


        editorCommands.listenToCommand('WEditorCommands.componentLayoutChanged', $rootScope, _updatecomponentLayout);

        return {
            /**
             * @ngdoc method
             * @name propertyPanel.service:componentLayout#getComponentScope
             * @methodOf propertyPanel.service:componentLayout
             * @returns {string} Gets the current scope of the component
             * @description
             * Returns the scope of the currently edited component.
             * The scope is whether the component is displayed on all pages or only on the the current page.
             */
            getComponentScope: function () {
                var comp = editorComponent.getEditedComponent();
                return EditorManager.getComponentScope(comp);
            },
            /**
             * @ngdoc method
             * @name propertyPanel.service:componentLayout#toggleComponentScope
             * @methodOf propertyPanel.service:componentLayout
             * @param {boolean} showOnAllPages not used but needed in the Editor API.
             * @description
             * Toggles the scope of the currently edited component.
             * The scope is whether the component is displayed on all pages or only on the the current page.
             */
            toggleComponentScope: function (showOnAllPages) {
                editorCommands.executeCommand('EditCommands.moveCurrentComponentToOtherScope', {event: {value: showOnAllPages}});
            },
            /**
             * @ngdoc method
             * @name propertyPanel.service:componentLayout#setSelectedCompPositionSize
             * @methodOf propertyPanel.service:componentLayout
             * @param {object} coordinates A list of coordinates and rotation data.
             * @description
             * Sets the position and size of the currently selected component
             */
            setSelectedCompPositionSize: function (coordinates) {
                editorCommands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", coordinates);
            },
            /**
             * @ngdoc method
             * @name propertyPanel.service:componentLayout#setSelectedCompRotationAngle
             * @methodOf propertyPanel.service:componentLayout
             * @param {object} coordinates A list of coordinates and rotation data.
             * @description
             * Sets the Rotation Angle of the selected Component.
             */
            setSelectedCompRotationAngle: function (coordinates) {
                editorCommands.executeCommand("WEditorCommands.SetSelectedCompRotationAngle", coordinates);
            },
            /**
             * @ngdoc method
             * @name propertyPanel.service:componentLayout#getSelectedCompLayoutData
             * @methodOf propertyPanel.service:componentLayout
             * @returns {object} The layout data structure that describes the position, layout, and rotation of the edited Component.
             * @description
             * Gets a data structure that defines the layout of the currently selected component
             */
            getSelectedCompLayoutData: function () {
                return getLayoutData();
            }

        };

    });

});