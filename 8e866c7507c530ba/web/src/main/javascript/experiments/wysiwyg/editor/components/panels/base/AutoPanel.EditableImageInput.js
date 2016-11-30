/** @class wysiwyg.editor.components.panels.base.AutoPanel */
define.experiment.component('wysiwyg.editor.components.panels.base.AutoPanel.EditableImageInput', function (componentDefinition, strategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({
        addEditableImageInput: function (label, width, height, skinGroup, hasDelete, changeText, editText, revertText, deleteText, addText, galleryConfigID, i18nPrefix, hasPrivateMedia, mgCallback, publicMediaFile, toolTipId, commandSource, aviaryDialogLabel, startingTab) {
            return this._addField(
                'wysiwyg.editor.components.inputs.EditableImageInput',
                this.getSkinFromSet('EditableImageInput', skinGroup),
                {
                    labelText: label,
                    width: width,
                    height: height,
                    hasDelete: Boolean(hasDelete),
                    changeText: changeText,
                    editText: editText,
                    revertText: revertText,
                    deleteText: deleteText,
                    addText: addText,
                    galleryConfigID: galleryConfigID,
                    i18nPrefix: i18nPrefix,
                    selectionType: "single",
                    mediaType: "picture",
                    hasPrivateMedia: hasPrivateMedia,
                    mgCallback: mgCallback,
                    publicMediaFile: publicMediaFile,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    },
                    commandSource: commandSource,
                    aviaryDialogLabel: aviaryDialogLabel,
                    startingTab: startingTab
                }
            );
        }
    });

    _.merge(Constants.AutoPanel, {
        Skins: { DEFAULT: { EditableImageInput: {
            'default': 'wysiwyg.editor.skins.inputs.EditableImageInputSkin'
        } } }
    });

    _.merge(Constants.PanelFields, {
        ImageFieldNew: {
            compType: 'wysiwyg.editor.components.inputs.EditableImageInput',
            skins: { 'default': 'wysiwyg.editor.skins.inputs.EditableImageInputSkin' },
            args: {
                toolTip: function (toolTipId) {
                    return {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    };
                }
            }
        }
    });

});
