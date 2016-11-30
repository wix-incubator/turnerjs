define.skin('wysiwyg.editor.skins.inputs.TickerInputSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html(
        '<label skinpart="label"></label>' +
        '<input skinpart="input" type="number" />' +
        '<span skinpart="units"></span>'
    );
});
