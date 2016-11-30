W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('galleryService', function (editorCommands, editorComponent) {
        var organizeImages = function(galleryConfigID, startingTab, source) {
            var editedComponent = editorComponent.getEditedComponent();
            var listData = editedComponent.getDataItem() ;
            var params = {
                data: listData,
                galleryConfigID: galleryConfigID,
                startingTab: startingTab || 'my',
                source: source || "NO_SOURCE_SPECIFIED"
            } ;
            editorCommands.executeCommand('WEditorCommands.OpenListEditDialog', params) ;
        };

        var changeGallery = function() {
            var editedComponent = editorComponent.getEditedComponent();
            var cmdParams = {selectedComp: editedComponent} ;
            editorCommands.executeCommand('WEditorCommands.OpenChangeGalleryDialog', cmdParams) ;
        };

        return {
            openOrganizeImages: organizeImages,
            openChangeGalleryDialog: changeGallery
        };
    });
});
