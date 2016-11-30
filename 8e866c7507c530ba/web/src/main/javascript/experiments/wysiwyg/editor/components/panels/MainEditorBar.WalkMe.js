//W.Experiments.registerExperimentComponent("WalkMe", "New",{
//    name: 'experiments.editor.components.panels.MainEditorBarWalkMeNew',
//    skinParts: clone(),
//    Class: {
//        Extends: 'wysiwyg.editor.components.panels.MainEditorBar',
//
//        _addDocumentActions: function() {
//            //Document Actions (save, publish, preview etc.)
//            var helpIcon = {iconSrc: 'maineditortabs/dark-help-sprite.png', iconSize: {width:18, height:18}, spriteOffset: {x:0, y:0}};
//
//            this.addInputGroupField(function() {
//                this.setNumberOfItemsPerLine(0);
//                this.addButtonField(null, this._translate('MAIN_BAR_PREVIEW'), false, null    , 'mainBarDocActions', null, 'Main_Menu_Preview_ttid', 'WEditorCommands.WSetEditMode', {'editMode': W.Editor.EDIT_MODE.PREVIEW, 'src':'previewBtn'});
//                this.addButtonField(null, this._translate('MAIN_BAR_SAVE')   , false, null    , 'mainBarDocActions', null, 'Main_Menu_Save_ttid', 'WEditorCommands.Save', {'promptResultDialog': true, 'src':'saveBtn'});
//                this.addButtonField(null, this._translate('MAIN_BAR_PUBLISH'), false, null    , 'mainBarDocActions', null, 'Main_Menu_Publish_ttid', 'WEditorCommands.OpenPublishDialog', {});
//                this.addButtonField(null, this._translate('MAIN_BAR_UPGRADE'), false, null    , 'mainBarDocActions', null, 'Main_Menu_Upgrade_ttid', 'WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.TOP_PANEL});
//                // this.addButtonField(null, this._translate('WALK_THROUGH')    , false, null, 'mainBarDocActions', null, null, 'WEditorCommands.ShowWalkThru' , {});
//                if(window.wixEditorLangauge == "en"){
//                    this.addButtonField(null, this._translate('WALK_THROUGH') ,  false, {iconSrc: 'maineditortabs/dark-icon-sprite.png', iconSize: {width:26, height:26}, spriteOffset: {x:0, y:-162}}, 'mainBarEditActions', null, 'Main_Menu_WalkMe_ttid','WEditorCommands.ShowWalkThru');
//                }
//                this.addButtonField(null, this._translate('MAIN_BAR_HELP')   , false, helpIcon, 'mainBarHelpIcon'  , null, null, 'WEditorCommands.ShowHelpDialog', 'TopBar');
//            }, 'skinless');
//        }
//    }
//});
