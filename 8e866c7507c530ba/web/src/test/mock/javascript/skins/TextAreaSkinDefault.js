define.skin('wysiwyg.viewer.skins.contactform.TextAreaSkinDefault', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    })
    def.html(
        '<label skinpart="label"></label>' +
        '<textarea skinpart="textarea" type="text"> </textarea>'
    );
});
