define.experiment.Class('wysiwyg.editor.managers.WDialogManager.WixAppsGalleryField', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({

        openListEditDialog: function (dataList, galleryConfigID, startingTab, source, callback) {
            if (!galleryConfigID) {
                galleryConfigID = 'photos';
            }

            var innerDialogParams = {
                galleryConfigID: galleryConfigID,
                addButtonText: W.Resources.get('EDITOR_LANGUAGE', 'ADD_' + galleryConfigID.toUpperCase() + '_BUTTON_TEXT'),
                showDescription: (galleryConfigID !== 'social_icons'),
                showTitle: (galleryConfigID !== 'social_icons'),
                showSplashScreen: (galleryConfigID !== 'social_icons'),
                startingTab: startingTab || 'my',
                source: source || "NO_SOURCE_SPECIFIED",
                callback: callback || function() {}
            };

            var helpletComponent = 'ORGANIZE_' + galleryConfigID;
            if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent]) {
                helpletComponent = undefined;
            }

            this._createAndOpenWDialog(
                    '_listEditDialog' + dataList.get('id'),
                'wysiwyg.editor.components.dialogs.ListEditDialog',
                'wysiwyg.editor.skins.dialogs.WListEditDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 550,
                    height: 510,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', 'ORGANIZE_' + galleryConfigID.toUpperCase() + '_DIALOG_TITLE'),
                    description: W.Resources.get('EDITOR_LANGUAGE', 'ORGANIZE_' + galleryConfigID.toUpperCase() + '_DIALOG_DESCRIPTION'),
                    helplet: helpletComponent
                },
                dataList, true, innerDialogParams, false, false
            );
        }

    });
});
