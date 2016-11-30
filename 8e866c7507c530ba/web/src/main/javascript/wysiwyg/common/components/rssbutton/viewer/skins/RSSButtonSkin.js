define.skin('wysiwyg.common.components.rssbutton.viewer.skins.RSSButtonSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.compParts({
        'image': { skin:'skins.core.ImageNewSkin' }
    });

    def.html(
        '<a skinPart="link">' +
            '<div skinPart="image"></div>' +
        '</a>'
    );

    def.css([
        '%link% { position: relative; display: block; z-index: 0; overflow: visible; ' +
                ' -ms-touch-action: none; ' +
                ' -webkit-user-select: none; -moz-user-select: none; user-select: none; ' +
                ' -webkit-tap-highlight-color: rgba(0,0,0,0);' +
                ' -webkit-tap-highlight-color: transparent;' +
                ' -webkit-touch-callout: none; }',

        '[state~=supports_opacity] %link%:after ' +
        '{ content: ""; position: absolute; z-index: 5; width: 100%; height: 100%; display: block; }',

        '%image% { position: absolute; opacity: 1; }',

        '[state~=no_opacity] %image% { visibility: visible; }',

        '[state~=transition_fade] %image% { z-index: 1; [fade_prev] }'
    ]);
});
