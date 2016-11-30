define.skin('wysiwyg.common.components.pinterestpinit.viewer.skins.PinterestPinItSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

    def.html(
        '<iframe skinPart="iframe" src="about:blank" frameBorder="0" allowTransparency="true" scrolling="no"></iframe>'
    );

    def.css([
        '%iframe% {border: 0; display: block;}'
    ]);
});