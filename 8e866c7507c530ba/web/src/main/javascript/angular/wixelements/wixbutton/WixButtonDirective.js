W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';


    /**
     * @ngdoc directive
     * @name wixElements.directive:wixButton
     * @restrict E
     * @element wix-button
     * @param {string} label The label to show on the button. The label will be automatically translated.
     * @param {string=} command The command to execute when the button is clicked.  The command will be execute automatically. Should not be supplied if supplying a click handler.
     * @param {string} icon-src The path to the icon you want displayed in the button
     * @param {string} button-width The width of the button
     * @param {string} button-height The height of the button
     * @param {string} icon-height  The Height of the icon
     * @param {string} icon-width  The Width of the icon
     * @param {string} icon-sprite-Offset  The Width of the icon
     * @param {function} clickHandler a callback to run when the button is clicked.

     * @description
     * creates a button that allows you to create a standard Wix Editor button.
     * As a convenience the button accepts a command name and will execute it automatically.
     * If you are interesting in a conventional click event use [ngClick](https://docs.angularjs.org/api/ng/directive/ngClick)
     *
     * @example
     <example>
     <file name="script.js">
     function startExample () {
        var exampleScripts = ['wixelements/wixbutton/WixButtonDirective.js'] ;
        loadModuleScripts(exampleScripts, start) ;
    }

     function start() {
             angular.module("wixElements").controller("myController", function ($scope) {
            $scope.clicked = function(message){
                $scope.output = message;
            }
        });

     }
     </file>
     <file name="index.html">
     <div ng-controller="myController">
     <div  style="width:200px">
     <wix-button class="wix-button-primary" label="'Blue button'" ng-click="clicked('blue button clicked')"></wix-button>
     <wix-button class="wix-button-default wix-button-arrow" label="'Gray button /w arrow'" ng-click="clicked('gray button w/ arrow clicked')"></wix-button>
     <wix-button class="wix-button-primary wix-button-arrow" label="'Blue button /w arrow'" ng-click="clicked('blue button w/arrow clicked')"></wix-button>
     </div>
     <span style="margin-right:10px">output:</span>
     <span>{{output}}</span>
     </div>
     </file>
     </example>
     *
     */
    angular.module('wixElements').directive('wixButton', function wixButtonDirective(editorResources, editorCommands) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixbutton/WixButtonTemplate.html'),
            scope: {
                label: '@',
                command: '@',
                buttonWidth: '@',
                buttonHeight: '@',
                iconSrc: '@',
                iconHeight: '@',
                iconWidth: '@',
                clickHandler: '&',
                iconSpriteOffset: '@'
            },
            link: function (scope, element, attrs) {
                scope.handleClick = function (cmd) {
                    if (cmd) {
                        editorCommands.executeCommand(cmd);
                    } else if (scope.clickHandler && typeof(scope.clickHandler) === 'function') {
                        scope.clickHandler();
                    }
                };
                scope.buttonStyle = {
                    height: scope.buttonHeight,
                    width: scope.buttonWidth
                };
                scope.iconStyle = {
                    background: scope.iconSrc ? 'url(' + scope.iconSrc + ') 50% 50% no-repeat' : '',
                    'background-position': scope.iconSpriteOffset,
                    width: scope.iconWidth,
                    height: scope.iconHeight,
                    'margin-top': -1 * (scope.iconHeight) / 2
                };
            }
        };
    });
});