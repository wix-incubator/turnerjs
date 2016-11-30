define.skin('wysiwyg.common.components.imagebutton.viewer.skins.ImageButtonSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        {
            "id": "fade_prev",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.5s ease 0s"
        },
        {
            "id": "fade_next",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.1s ease 0s"
        }
    ]);

    def.compParts({
        'defaultImage': { skin:'skins.core.ImageNewSkin' },
        'hoverImage':   { skin:'skins.core.ImageNewSkin' },
        'activeImage':  { skin:'skins.core.ImageNewSkin' }
    });

    def.html(
        '<a skinPart="link">' +
            '<div skinPart="defaultImage"></div>' +
            '<div skinPart="hoverImage"></div>' +
            '<div skinPart="activeImage"></div>' +
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

        '%defaultImage% { position: absolute; opacity: 1; }',
        '%hoverImage%   { position: absolute; opacity: 0; }',
        '%activeImage%  { position: absolute; opacity: 0; }',

        '[state~=hovered] %defaultImage% { opacity: 0; }',
        '[state~=hovered] %hoverImage%   { opacity: 1; }',
        '[state~=hovered] %activeImage%  { opacity: 0; }',

        '[state~=pressed] %defaultImage% { opacity: 0; }',
        '[state~=pressed] %hoverImage%   { opacity: 0; }',
        '[state~=pressed] %activeImage%  { opacity: 1; }',

        '[state~=no_opacity] %defaultImage% { visibility: visible; }',
        '[state~=no_opacity] %hoverImage%   { visibility: hidden;  }',
        '[state~=no_opacity] %activeImage%  { visibility: hidden;  }',

        '[state~=no_opacity][state~=hovered] %defaultImage% { visibility: hidden;  }',
        '[state~=no_opacity][state~=hovered] %hoverImage%   { visibility: visible; }',
        '[state~=no_opacity][state~=hovered] %activeImage%  { visibility: hidden;  }',

        '[state~=no_opacity][state~=pressed] %defaultImage% { visibility: hidden;  }',
        '[state~=no_opacity][state~=pressed] %hoverImage%   { visibility: hidden;  }',
        '[state~=no_opacity][state~=pressed] %activeImage%  { visibility: visible; }',

        '[state~=transition_fade] %defaultImage% { z-index: 1; [fade_prev] }',
        '[state~=transition_fade] %hoverImage%   { z-index: 2; [fade_prev] }',
        '[state~=transition_fade] %activeImage%  { z-index: 3; [fade_prev] }',

        '[state~=transition_fade] .prev  { z-index: 3; }',
        '[state~=transition_fade] .next  { z-index: 1; [fade_next] }',
        '[state~=transition_fade] .other { z-index: 2; }'
    ]);
});
