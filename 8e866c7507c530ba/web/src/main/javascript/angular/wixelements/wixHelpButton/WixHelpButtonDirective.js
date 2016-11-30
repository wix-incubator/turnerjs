W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name wixElements.directive:wixHelpButton
     * @restrict E
     * @element wix-help-button
     * @param {string=} help-id - ID To be sent on show help dialog command

     * @description
     * creates a Help Button (visually represented by a question mark)
     * @example
     <example>
     <file name="script.js">
     function startExample () {
        var exampleScripts = ['wixelements/wixhelpbutton/WixHelpButtonDirective.js'] ;
        loadModuleScripts(exampleScripts, start) ;
    }

     function start() {
        angular.module("wixElements").controller("myController", function ($scope) {
            W.Commands.executeCommand = function(cmd, params, source){
                var sentCmd = "Command: " + cmd;
                var sentParams = "Params: " + params;
                var mySource = "Source: " + source;
                $scope.data = {
                    "cmd": sentCmd,
                    "params": sentParams,
                    "source": mySource
                }
            };
            $scope.exampleHelpId = "Your_Help_ID_Goes_Here";
        });

     }
     </file>
     <file name="index.html">
     <div class="wix-ng-panel" style="width:450">
     </div>
     <div ng-controller="myController" >
     <wix-help-button help-id="{{exampleHelpId}}"></wix-help-button>

     <p>{{data.cmd}}</p>
     <p>{{data.params}}</p>
     </div>
     </file>
     </example>
     */
    angular.module("wixElements")
        .directive("wixHelpButton", function (editorCommands) {
            return {
                restrict: "E",
                scope: {},
                template: '<div class="wix-help-button" ng-click="sendCommand()"><span></span></div>',
                link: function (scope, elem, attrs) {
                    var propertyPanelHelpId = attrs.helpId;

                    scope.sendCommand = function () {
                        editorCommands.executeCommand("WEditorCommands.ShowHelpDialog", propertyPanelHelpId);
                    };
                }
            };
        });
});