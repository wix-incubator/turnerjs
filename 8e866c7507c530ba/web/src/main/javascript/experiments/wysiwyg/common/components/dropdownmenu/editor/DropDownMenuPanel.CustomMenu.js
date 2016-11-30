define.experiment.component('wysiwyg.common.components.dropdownmenu.editor.DropDownMenuPanel.CustomMenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.traits(['wysiwyg.common.utils.CustomMenuConverter']);

    def.skinParts(strategy.merge({
        editMenu: {
            type: Constants.PanelFields.ButtonField.compType
        },
        connectedTo: {
            type: Constants.PanelFields.Label.compType,
            autoBindDictionary: 'CUSTOMMENU_MenuPanel_ConnectedTo'
        },
        menuName: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                boldLabel: true
            }
        },
        detach: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'CUSTOMMENU_MenuPanel_Detach'
            }
        }
    }));

    def.methods({
        _onAllSkinPartsReady: function(){
            this._initConverter();
        }
    });
});
