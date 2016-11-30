define.experiment.skin('wysiwyg.common.components.dropdownmenu.editor.skins.DropDownMenuPanelSkin.CustomMenu', function (skinDefinition, experimentStrategy) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.compParts({
        editMenu: {skin: Constants.PanelFields.ButtonField.skins.blueWithArrow},
        connectedTo: {skin: Constants.PanelFields.Label.skins["default"]},
        menuName: {skin: Constants.PanelFields.Label.skins["default"]},
        detach: {skin: Constants.PanelFields.InlineTextLinkField.skins["default"]},
        buttonsAlignment: {skin: Constants.PanelFields.RadioImages.skins["default"]},
        textAlignment: {skin: Constants.PanelFields.RadioImages.skins["default"]},
        buttonsConstantWidth: {skin: Constants.PanelFields.CheckBox.skins["default"]},
        buttonsFillMenuWidth: {skin: Constants.PanelFields.CheckBox.skins["default"]},
        moreButtonLabel: {skin: Constants.PanelFields.Input.skins["default"]},
        changeStyle: {skin: Constants.PanelFields.ButtonField.skins.blueWithArrow},
        addAnimation: {skin: Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div>' +
                    '<div skinpart="connectedTo" class="inline"></div>' +
                    '<div skinpart="menuName" class="inline"></div>' +
                '</div>' +
                '<div skinpart="editMenu"></div>' +
                '<div skinpart="detach"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="buttonsAlignment"></div>' +
                '<div skinpart="textAlignment"></div>' +
                '<div skinpart="buttonsConstantWidth"></div>' +
                '<div skinpart="buttonsFillMenuWidth"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="moreButtonLabel"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="changeStyle"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%.inline% {display: inline-block;}',
        '%menuName% {margin-left: 5px}',
        '%detach% {text-align: right}'
    ]);
});