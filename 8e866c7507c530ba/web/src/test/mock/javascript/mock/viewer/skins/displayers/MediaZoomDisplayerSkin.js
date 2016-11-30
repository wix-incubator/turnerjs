define.skin('mock.viewer.skins.displayers.MediaZoomDisplayerSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'img','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'background-size: cover !important; backgound-position: 50% 50% !important;'}
        ]
    );
    def.compParts(
        {
            image: {skin:'mobile.core.skins.ImageSkin' }
        }
    );
    def.html(
        '<div skinPart="imageWrapper"><div skinPart="image"></div></div>'+
        '<div skinPart="panel">' +
        '<div skinPart="title"></div>' +
        '<div skinPart="description"></div>' +
        '<a skinPart="link">LINK</a>'
    );
    def.css(
        [
            '{text-align:left;}',
            '%imageWrapper%, %panel% {padding:10px; background:#fff;}' ,
            '%image%{[img]margin:0; padding:0; width:auto !important;}',
        ]
    );
});