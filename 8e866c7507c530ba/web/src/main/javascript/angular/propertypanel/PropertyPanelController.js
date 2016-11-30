W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name propertyPanel.controller:PropertyPanelController
     * @description
     * Provides the inner views with compData, and updates dialog's title, desc and help when selected component changes.
     *
     */
    angular.module('propertyPanel').controller('PropertyPanelController', function PropertyPanelController($scope, $rootScope, configManager) {
        var self = this;

        init();

        function init() {
            self.webThemeDir = configManager.webThemeDir;
            $scope.$on('propertyPanelDataChanged', onPanelDataUpdated);

            onPanelDataUpdated();
        }

        function onPanelDataUpdated() {
            attachCompDataToController();
            setDialogPartsByComponent();

            $scope.$emit('updateContentSizeIfNeeded');
        }

        /**
         * This is to reduce coupling of the inner property panel view with the dialog infra,
         * Allowing for the same views and controllers to be used outside of a dialog if needed in the future
         * (propertyPanelController.compData.data.title instead of context.compData.data.title)
         */
        function attachCompDataToController() {
            self.compData = $scope.context.compData;
        }

        function setDialogPartsByComponent() {
            $scope.dialog.setTitle('COMP_' + self.compData.label);
            $scope.dialog.setDescription('COMP_DESC_' + self.compData.label);
            $scope.dialog.setHelpId(self.compData.helpId);
        }
    });
});