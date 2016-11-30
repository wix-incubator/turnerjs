define.skin('wysiwyg.common.components.multiselection.viewer.skins.MultiSelectionSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" }
    ]);

    //Add the position holder to avoid a bug in firefox where it doesn't know how to vertically align the input if the
    //containing div is empty.

    def.html(
        '<div skinPart="content">' +
            '<div skinPart="items">' +
            '</div>' +
            '<div skinpart="input" contenteditable="true"></div>' +
            '<div skinpart="placeholder"></div>' +
            '<div skinpart="positionholder"></div>' +
        '</div>' +
        '<div skinPart="dropdown"></div>'
    );

    def.css([
        '%content% { position:relative; border: 1px solid #b4b4b4; border-radius: 4px; background-color: #fff; min-height:30px; padding-bottom:5.5px; }',
        //'%content% > * { display:inline-block; padding-top:5.5px;  vertical-align: middle;}',
        '%content%:hover{border-color: #a3d9f6; cursor:text}',
        '%content%:focus{border-color: #19a0e9; cursor:text }',
        '%content%.focused{border-color: #19a0e9; cursor:text }',
        '%items% { display:inline; white-space: normal; }',
        '%items% > * { display:inline-block; padding-left:5px; padding-top:5.5px; }',
        '%input% { display:inline-block; vertical-align:text-top; padding-left:5px; min-width:1px; max-width:100%; }',
        '%placeholder% { display:inline-block; padding-top:5.5px; opacity:0.5;}',
        '%positionholder% { display:inline-block; padding-top:5.5px; width:1px;height:18px}',
        '%dropdown% {position: fixed; z-index: 1; max-height:225px; overflow-y:auto; padding-top:2.5px; border-radius: 0px 0px 3px 3px; border: solid 1px #c4c4c4; border-top: 0px; box-shadow: 0px 0px 3px rgba(0,0,0,.2);}',
        '%dropdown% *.selected{background: #24a1e2; color:#ffffff;}',
        '%dropdown% *.theNewOption {font-weight: bold;}',
        '%dropdown% > *{ list-style-type: none; padding-left:12px; padding-top:6.5px; height:25px; background-color: #fff;}'
    ]);
});
