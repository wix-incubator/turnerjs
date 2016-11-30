define.skin('mock.viewer.skins.PageDeadCompsHandlerSiteButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.html(
        '<a skinPart="link">' +
            '<span skinPart="label">' +
            '</span>' +
            '</a>');


});