define.experiment.component('wysiwyg.editor.components.richtext.ToolBar.UploadFonts', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.skinParts(strategy.merge({
        fontFamily: {
            type: 'wysiwyg.editor.components.richtext.ToolBarWritableSelectableListDropDown',
            dataType: 'SelectableList',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton', 'compStyleId': 'RTFontOptionButton'},
                selectionOption: 0,
                label: 'TOOLBAR_DROP_DOWN_FONTS_LABEL',
                defaultValue: 2,
                bottomLinks: {
                    bottomLeftLink:{
                        linkText:'TOOLBAR_DROP_DOWN_FONTS_LANGUAGES_LINK',
                        linkCommand:'WEditorCommands.OpenCharacterSetsDialog',
                        commandParams:{
                            source: 'textEditor'
                        }
                    },
                    bottomRightLink:{
                        linkText:'TOOLBAR_DROP_DOWN_FONTS_UPLOAD_LINK',
                        linkCommand:'WEditorCommands.OpenMediaFrame',
                        commandParams:{
                            galleryConfigID: 'fonts',
                            publicMediaFile: 'fonts',
                            i18nPrefix: 'font',
                            selectionType: 'manager',
                            mediaType: 'ufonts'
                        }
                    }

                }

            }
        }
    }));
});
