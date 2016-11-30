define.component('wysiwyg.editor.components.panels.StatisticsPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');
    def.utilize([]);
    def.resources(['W.Resources', 'W.Commands']);
    def.binds(['_onClose']);
    def.skinParts({
        panelLabel: { 'type': 'htmlElement', autoBindDictionary: 'STATISTICS_TITLE'},
        help: {type: 'htmlElement'},
        close: { type: 'htmlElement', command: 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary: "done", command: 'this._closeCommand'},
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['SiteSettings']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._isPremiumUser = this.injects().Config.isPremiumUser();

            //            this._isPremiumUser = true;
        },
        //Experiment SocialPanel.New was promoted to feature on Mon Jul 23 14:27:52 IDT 2012
        _createFields: function () {

            this.addTitle(this._translate('STATISTICS_PANEL_TITLE_FULL'), null, 'bold');
            this.addSubLabel(this._translate('STATISTICS_PANEL_DESCRIPTION'), null);

            this.addBreakLine('20px');
            this._isPremiumUser ? this._siteHasDomain() : this._createFreeNoDomain();

            this.addBreakLine('15px');
            this.addTitle(this._translate('STATISTICS_PANEL_COOKIE_TITLE'), null, 'bold');

            this.addSubLabel(this._translate('STATISTICS_PANEL_COOKIE_DESCRIPTION_1'));
            this.addSubLabel(this._translate('STATISTICS_PANEL_COOKIE_DESCRIPTION_2'));
            if (this._isPremiumUser) {
                this.addSubLabel(this._translate('STATISTICS_PANEL_COOKIE_PREMIUM'), null, 'bold');
            }

            this.addCheckBoxField(this._translate('STATISTICS_PANEL_COOKIE_CHECKBOX_LABEL'))
                .bindToField('suppressTrackingCookies')
                .addEvent('inputChanged', function (e) {
                    LOG.reportEvent(wixEvents.EU_COOKIE_CHECKBOX_CLICKED, {c1: Number(e.value)});
                });
        },

        _createFreeNoDomain: function () {
            this.addSubLabel(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'THIS_IS_PREMIUM_FEATURE'), null);
            this.addSubLabel(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'UPGRADE'), null);
            if (_.contains(_.pluck(editorModel.permissionsInfo.loggedInUserRoles, 'role'), 'owner')) {
                this.addButtonField('', this.resources.W.Resources.get('EDITOR_LANGUAGE', 'UPGRADE_BUTTON'), null, null, 'purple').addEvent('click', this._upgrade);
            }
        },

        _siteHasDomain: function () {
            this.addSubLabel(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SET_ANALYTICS'), null);
            var url = this.injects().Config.getUserDomainListUrl();
            var setAnalyticsButton = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SET_ANALYTICS_BUTTON');
            this.addSubLabel('<a target="_blank" class="selectable" href="' + url + '">' + setAnalyticsButton + '</a>', null);
        },

        _showHelp: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_Statistics');
        },

        _onClose: function () {
            this.injects().Commands.executeCommand(this._closeCommand);
        },

        _upgrade: function () {
            this.injects().Commands.executeCommand('WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.STATISTICS_PANEL});
        }
    });
});
