define.skin('wysiwyg.viewer.skins.IFrameComponentSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html('<div skinPart="iFrameHolder"></div>');
    def.css([]);
});
