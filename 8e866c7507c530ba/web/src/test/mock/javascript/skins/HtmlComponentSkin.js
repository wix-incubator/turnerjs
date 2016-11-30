define.skin('wysiwyg.viewer.skins.HtmlComponentSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html('<div  skinPart="iFrameHolder"></div>');
    def.css(
        [
            '%iFrameHolder% {width:100%,height:100%}',
            '%iFrameHolder% > iframe { position:absolute; }',
            '[state=noContent] { background-color:#A5A5A5; }'
        ]
    );
});
