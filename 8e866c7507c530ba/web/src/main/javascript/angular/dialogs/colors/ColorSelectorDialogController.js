W.AngularManager.executeExperiment('dialogs', function () {
    'use strict';

    angular.module('dialogs')
        .controller('ColorSelectorDialogController', ColorSelectorDialogController);
    /**
     * @ngdoc controller
     * @name ColorSelectorDialog.controller:ColorSelectorDialogController
     * @description
     * ColorSelector dialog logic. Provides the logic needed to switch between the different link views.
     */
        //@ngInject
    function ColorSelectorDialogController($scope, $element, editorTheme, editorCommands, biEvent) {
        var self = this;
        var colors;
        createThemeColorsArray();
        self.paletteColors = createPaletteColorsArray();
        self.staticColors = createStaticColorsArray();

        self.colorSelected = function (colorName, source) {
            $scope.context.selectedColor = colorName;
            $scope.context.colorSource = source || 'theme';
            $scope.dialog.close(true, 'color selected');
        };

        self.openLegacyColorPicker = function () {
            var currentColorValue = $scope.context.colorSource === 'theme' ?
                editorTheme.getProperty($scope.context.selectedColor) : $scope.context.selectedColor;
            var dialogBoundingRect = $element[0].getBoundingClientRect();
            var params = {
                color: currentColorValue,
                onChange: customColorSelected,
                enableAlpha: false,
                top: dialogBoundingRect.top + dialogBoundingRect.height * 0.66,
                left: dialogBoundingRect.left + dialogBoundingRect.width * 0.66
            };

            editorCommands.executeCommand('WEditorCommands.ShowColorPickerDialog', params);
        };

        function customColorSelected(e) {
            if (e.cause === 'ok') {
                self.colorSelected(e.color, 'value');
            }
        }


        function createThemeColorsArray() {
            var themeColors = editorTheme.getPropertiesAccordingToType('color');
            colors = [];
            _.forEach(themeColors, function (colorName) {
                var color = editorTheme.getProperty(colorName);
                colors.push({
                    name: colorName,
                    hex: color.getHex()
                });
            });
        }

        function createStaticColorsArray() {
            var staticColors = [];
            for (var i = 1; i < 6; i++) {
                staticColors.push(colors[i]);
            }
            return staticColors;
        }

        function createPaletteColorsArray() {
            var paletteColors = [];
            for (var i = 0; i < 25; i++) {
                /*order the colors for repeater to display in the following order -
                 11 16 21 26 31
                 12 17 22 27 32
                 and so on
                 */
                var indexForDisplay = 11 + Math.floor(i / 5) + (i % 5 * 5);
                paletteColors.push(colors[indexForDisplay]);
            }
            return paletteColors;
        }
    }
});