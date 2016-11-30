define.skin('mock.viewer.skins.ImageNewMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def = SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.html('<img skinPart="image"/>');

    def.css([
        '{overflow: hidden;}',
        '%image% {position: static; box-shadow: #000 0 0 0}; image-rendering: optimizequality'
    ]);

});