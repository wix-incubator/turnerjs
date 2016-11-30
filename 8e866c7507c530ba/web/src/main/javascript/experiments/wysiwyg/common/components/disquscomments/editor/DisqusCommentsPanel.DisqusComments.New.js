define.experiment.newComponent('wysiwyg.common.components.disquscomments.editor.DisqusCommentsPanel.DisqusComments.New', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['DisqusComments']);

    def.resources(['W.Config', 'W.Data', 'W.Preview']);

    def.skinParts({
        disqusId: {
            type: Constants.PanelFields.SubmitInput.compType,
            argObject: {
                labelText: 'DISQUS_SITE_PROFILE',
                buttonLabel: 'DISQUS_UPDATE'
            },
            bindToData: 'disqusId',
            hookMethod: '_addDisqusIdValidator'
        },
        registerDisqusSiteProfile: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                prefixText: 'DISQUS_REGISTER_DESCRIPTION',
                buttonLabel: 'DISQUS_REGISTER_LINK_LABEL',
                command: 'WEditorCommands.OpenExternalLink',
                commandParameter: {
                    href: 'https://disqus.com/admin/create/'
                }
            }
        }
    });

    def.methods({

        _addDisqusIdValidator: function (definition) {
            definition.argObject.validatorArgs = {validators: [this._disqusIdValidation]};
            return definition;
        },

        _disqusIdValidation: function (disqusId) {
            disqusId = disqusId.trim();

            if (!isValidDisqusId(disqusId) && disqusId !== '') {
                return W.Resources.get('EDITOR_LANGUAGE', 'DISQUS_NOT_VALID_DISQUS_ID_ERROR', 'DISQUS_NOT_VALID_DISQUS_ID_ERROR');
            }

            function isValidDisqusId(disqusId) {
                return /^[a-zA-Z0-9_-]+$/.test(disqusId);
            }
        }
    })

});
