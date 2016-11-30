define.skin('wysiwyg.viewer.skins.input.TextInputSquareSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html(
        '<label skinPart="label" class="clearfix">' +
        '<input skinPart="input" type="text"/>' +
        '</label>' +
        '<p skinPart="errorMessage">This is an error message, and a bit long one</p>'
    );
});
