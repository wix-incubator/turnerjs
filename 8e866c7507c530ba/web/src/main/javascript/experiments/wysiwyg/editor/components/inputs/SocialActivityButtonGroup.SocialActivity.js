define.experiment.newComponent('wysiwyg.editor.components.inputs.SocialActivityButtonGroup.SocialActivity.New', function(componentDefinition) {
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.traits(['wysiwyg.editor.components.panels.traits.SkinPartsProcessing']);

    def.resources(['W.Preview', 'W.EditorDialogs', 'W.Editor']);

    def.skinParts({
        displaySocialActivity: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject:{
                labelText: 'Show Social Icons',
                toolTip: {
                    toolTipId: "CForm_toEmailAddress",
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                }
            }
        },
        customizeButton: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {
                buttonLabel: "Customize"
            }
        },
        socialNetworks: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },
        render: function(){
            var isSocialActivity = this.resources.W.Editor.getEditedComponent().getSocialDataItem(),
                SADM = this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager;

            this._skinParts.displaySocialActivity.setValue(isSocialActivity);
            this._skinParts.customizeButton[!isSocialActivity ? 'disable' : 'enable']();
            this._skinParts.socialNetworks[!isSocialActivity ? 'addClass' : 'removeClass']('disableOpacity');

            var settings = this.getComponentSocialActivitySettings();
            this._appendSocialNetworksIcons(settings, SADM);
        },
        getComponentSocialActivitySettings: function(manager){
            var comp = this.resources.W.Editor.getEditedComponent(),
                manager = this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager,
                settings;

            if(!(settings = comp.getSocialDataItem())) settings = manager.getDefaultPreset();

            return settings;
        },
        _ifCreateNewSocialDataItem: function(dataItem){
            var manager = this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager;

            if(manager.isPreset(dataItem)){
                return manager.addDataItemWithUniqueId('', dataItem.getData()).dataObject;
            }

            return dataItem;
        },
        _onAllSkinPartsReady: function(){
            this._skinParts.displaySocialActivity.addEvent('inputChanged', this._turnOnSocialActivity.bind(this));
            this._skinParts.customizeButton.addEvent('click', this._openDialog.bind(this));
        },
        _turnOnSocialActivity: function(evt){
            this._skinParts.customizeButton[!evt.value ? 'disable' : 'enable']();
            this._skinParts.socialNetworks[evt.value ? 'removeClass' : 'addClass']('disableOpacity');

            var comp = this.resources.W.Editor.getEditedComponent(),
                settings = this.getComponentSocialActivitySettings();

            comp[evt.value ? 'setSocialDataItem' : 'removeSocialDataItem' ](settings);
        },
        _listenToInput: function(){},
        _stopListeningToInput: function(){},

        _openDialog: function(){
            var self = this,
                dialogs = this.resources.W.EditorDialogs,
                settingsData = this._ifCreateNewSocialDataItem(this.getComponentSocialActivitySettings()),
                dialogOptions = {
                    width: 300,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: dialogs.DialogButtonSet.OK,
                    title: 'Social Activity Settings'//W.Resources.get('EDITOR_LANGUAGE', 'KEY', 'Social Activity Settings')
                };

            var dialogInstance = dialogs._createAndOpenWDialog(
                '_socialActivitySettings',
                'wysiwyg.editor.components.dialogs.SocialActivitySettings',
                'wysiwyg.editor.skins.dialogs.SocialActivitySettingsSkin',
                function(){},
                dialogOptions,
                settingsData,
                true,
                {},
                false, false, true
            );

            this.resources.W.Editor.getEditedComponent().setSocialDataItem(settingsData);

            settingsData.on(Constants.DataEvents.DATA_CHANGED, this, function(){
                this._appendSocialNetworksIcons(this.getComponentSocialActivitySettings(), this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager)
            });
        },
        _appendSocialNetworksIcons: function(data, manager){
            this._skinParts['socialNetworks'].empty();

            data.get('activeNetworks').forEach(function(sn){

                var snetwork = manager.getSocialNetwork(sn),
                    sIconName = snetwork.getFullIconUrl() + snetwork.iconName[data.get('theme')];

                var li = document.createElement('li');
                this._skinParts['socialNetworks'].appendChild(li);

                li['style']['backgroundImage'] = 'url(' + sIconName + ')';

            }.bind(this));
        }
    });
});
