define.skin('wysiwyg.editor.skins.inputs.CheckBoxSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html(
        '<div class="clearfix">' +
            '<label>' +
            '<input type="checkbox" skinpart="checkBox" />' +
            '<span skinpart="label"></span>' +
            '</label>' +
        '</div>'
    );
    def.css(
        [
            '{padding-bottom: 2px;}',
            '%checkBox% {cursor:pointer}',
            '%label% {cursor:pointer}'
        ]
    );
});
