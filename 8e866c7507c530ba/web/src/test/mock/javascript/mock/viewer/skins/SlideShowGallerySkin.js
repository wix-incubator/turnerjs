define.skin('mock.viewer.skins.SlideShowGallerySkin', function(def, stratgeyDefinition){
        /**@type core.managers.skin.SkinDefinition */
        var def = def || {} ;

        def.inherits('core.managers.skin.BaseSkin2');

        // define the skin component part, so the handler will be able to load its relevant code.
        def.compParts({
            'imageItem': { skin:'wysiwyg.viewer.skins.displayers.DetailedDisplayerSkin' }
        });

        def.html(
            "<div skinPart='itemsContainer'></div>" +
            "<div skinPart='buttonPrev'></div>" +
            "<div skinPart='buttonNext'></div>" +
            "<div skinPart='counter'></div>" +
            "<div skinPart='autoplay'></div>"
        );
    }
);
