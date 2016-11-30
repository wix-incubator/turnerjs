define.component('wysiwyg.editor.components.panels.ItunesButtonPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Data', 'W.Utils', 'W.Resources', 'W.Commands', 'W.Editor']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.binds(['_itunesUrlValidator']);
    def.dataTypes(['ItunesButton']);
    def.propertiesSchemaType('ItunesButtonProperties');

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this;
            var data = this.getDataItem();
            var properties = this.getComponentProperties();
            this.itunesSiteUrl = 'http://itunes.apple.com/linkmaker';
            var languageKeysPrefix = 'ITUNES_';

            if (!data || !properties) {
                return;
            }

            var languagesData = properties._schema.language.enum.map(function (langCode) {
                return {
                    label: panel._translate(languageKeysPrefix + langCode),
                    value: langCode
                };
            });

            panel.addInputGroupField(function () {
                var proxy = this.addSubLabel(panel._translate('ITUNES_BUTTON_INSERT_URL_TITLE'), null, 'help');
                proxy._htmlElement.addEvent('click', panel._onInnerHelpLinkClick.bind(panel));

                var openDialogCmd = 'WEditorCommands.ShowItunesDialog';
                var dialogParams = { 'iframeUrl': panel.itunesSiteUrl };
                this.addInlineTextLinkField(panel._translate('ITUNES_BUTTON_LINKMAKER_DESC'), null, panel.itunesSiteUrl, null, null, null, null, openDialogCmd, dialogParams);

                this.addBreakLine('22px');

                this.addSubmitInputField(panel._translate('ITUNES_BUTTON_INSERT_URL'), 'https://itunes.apple.com/us/album/born-this-way/id438732291?uo=4', 30, 1000, panel._translate('ITUNES_BUTTON_UPDATE'), null, {validators: [panel._itunesUrlValidator]}, null, null).bindToField('downloadUrl');
            });

            panel.addComboBoxField(this._translate('ITUNES_BUTTON_LANGUAGE'), languagesData, 'English', languagesData.length).bindToProperty('language');
            panel.addComboBox(this._translate("ITUNES_BUTTON_OPEN_IN")).bindToProperty('openIn');

            this.addAnimationButton();
        },

        _onInnerHelpLinkClick: function (e) {
            var target = (e && e.event && e.event.target) ? e.event.target : null;
            if (target.nodeName === 'SPAN') {  //help icon
                var editedComponent = W.Editor.getEditedComponent();
                var helpId = (editedComponent && editedComponent.getHelpId && editedComponent.getHelpId()) ? editedComponent.getHelpId() : '/node/18589';
                W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', helpId);
            }
        },

        _itunesUrlValidator: function (downloadUrl) {
            if (!downloadUrl || !downloadUrl.indexOf || downloadUrl.indexOf('https://itunes.apple.com/') != 0) {
                return this._translate("ITUNES_BUTTON_URL_ERROR");
            }
        }
    });

});
