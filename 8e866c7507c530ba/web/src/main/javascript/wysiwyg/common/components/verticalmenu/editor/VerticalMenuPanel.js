define.component('wysiwyg.common.components.verticalmenu.editor.VerticalMenuPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['MenuDataRef', 'Menu']);  //MenuDataRef is defined in BasicMenuItemDataSchema (it point to  menuRef: "#MAIN_MENU" by default)

    def.propertiesSchemaType('VerticalMenuProperties');

    def.skinParts({
        menuItemsAlignment: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: { labelText: 'VerticalMenu_menuItemsAlignment', display: 'inline', presetList: Constants.PanelFields.RadioImages.args.presetList },
            bindToProperty: 'itemsAlignment'
        },
        subMenuOpenSide: {
            type: Constants.PanelFields.RadioButtons.compType,
            argObject: {
                labelText: 'VerticalMenu_subMenuOpenSide',
                presetList: [
                    {label: W.Resources.get('EDITOR_LANGUAGE', 'VerticalMenu_subMenuOpenSideRight'), value: 'right'},
                    {label: W.Resources.get('EDITOR_LANGUAGE', 'VerticalMenu_subMenuOpenSideLeft'), value: 'left'}
                ]
            },
            bindToProperty: 'subMenuOpenSide'
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: { buttonLabel: 'CHOOSE_STYLE_TITLE' }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
    });
});
