W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    angular.module('dialogs')
        .controller('LinkDialogController', LinkDialogController);
    /**
     * @ngdoc controller
     * @name linkDialog.controller:LinkDialogController
     * @description
     * link dialog logic. Provides the logic needed to switch between the different link views.
     */
        //@ngInject
    function LinkDialogController($scope, $element, editorResources, editorData) {
//        var self = this;
//        var currentLinkDataRef = $scope.context.wixData;
//        var currentDataItem;
//        var currentLinkType;
//        var anchorTypesToLinkTypesMap = {
//            'SCROLL_TO_BOTTOM': 'AnchorLink_bottom',
//            'SCROLL_TO_TOP': 'AnchorLink_top'
//        };
//        $scope.context.showDescription = true;
//        self.linkExists = false;
//        self.linkSpecificData = {};
//        self.buttonsPerRow = 2;
//        self.linkButtonsData = editorData.getDataByQuery('#LINK_BUTTONS_TYPE', editorData.DATA_SOURCE.WDATA).items;
//        self.linkTypes = editorData.getDataByQuery('#LINK_BUTTONS_TYPE', editorData.DATA_SOURCE.WDATA).dataSchemaByType;
//
//        if (currentLinkDataRef) {
//            currentDataItem = editorData.getDataByQuery(currentLinkDataRef, editorData.DATA_SOURCE.PREVIEW_DATA);
//            currentLinkType = currentDataItem.type;
//        }
//
//        if (!currentLinkType) {
//            self.showLinkOptions();
//        } else {
//            showSelectedLink(currentLinkType);
//        }
//
//        function showSelectedLink(linkType) {
//            if (linkType.indexOf('Anchor') >= 0) {
//                linkType = getAnchorType() || linkType;
//            }
//            self.linkContent = editorResources.getAngularPartialPath('/dialogs/linkdialog/linkcontenttemplates/' + linkType.toLowerCase() + 'Content.html');
//            self.showBackButton = true;
//            $scope.context.showDescription = false;
//        }
//
//        function getAnchorType() {
//            return anchorTypesToLinkTypesMap[currentDataItem.anchorDataId];
//        }
//
//        self.linkOptionSelected = function (linkIndex) {
//            var linkType = self.linkTypes[self.linkButtonsData[linkIndex].linkType];
//            showSelectedLink(linkType);
//        };
//
//        self.showLinkOptions = function () {
//            self.linkContent = editorResources.getAngularPartialPath('/dialogs/linkdialog/DefaultLinkContent.html');
//            self.showBackButton = false;
//            $scope.context.showDescription = true;
//        };


        /* An example on how to add a DI
        function addDataItem(){
            var di = editorData.addDataItemWithUniqueId("",
                {"type":"PageLink","pageId":"#cjg9","metaData":{"isPreset":false}},
                editorData.DATA_SOURCE.WDATA);
            debugger;

         addDataItem();
        }*/


    }
});