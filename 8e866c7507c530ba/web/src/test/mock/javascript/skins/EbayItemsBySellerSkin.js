define.skin('wysiwyg.viewer.skins.EbayItemsBySellerSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'tdr','type':Constants.SkinParamTypes.URL, 'defaultTheme':'BASE_THEME_DIRECTORY'},
            {'id':'fontColor','type':Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_9'},
            {'id':'borderColor','type':Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_4'},
            {'id':'headerColor','type':Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_5'},
            {'id':'backgroundColor','type':Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_1'},
            {'id':'linkColor','type':Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_2'}
        ]
    );
    def.fields({
        minWidth:455,
        _minHeight:180
    });
    def.html(
        '<div skinPart="iFrameHolder"></div>'
    );
    def.css(
        [
            '[state=noContent] { background-image:url([tdr]eBayPlaceHolder.png);background-repeat:no-repeat; }',
            '%iFrameHolder% > iframe { position:absolute; }'
        ]
    );
});

