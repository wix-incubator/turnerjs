define.skin('wysiwyg.editor.skins.panels.TreeStructureEditorSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html('<div skinPart="container"></div>');
    def.css(
        '%container%{background-color:#DDDDDD}'
    );
});