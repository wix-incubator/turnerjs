define.skin('mock.viewer.skins.PageHandlerPageSkin', function(SkinDefinition){
        /** @type core.managers.skin.SkinDefinition */

        var def=SkinDefinition;

        def.inherits('mobile.core.skins.BaseSkin');

        def.html(
            '<div skinPart="bg">' +
                '</div>' +
                '<div skinPart="inlineContent">' +
                '</div>');

});