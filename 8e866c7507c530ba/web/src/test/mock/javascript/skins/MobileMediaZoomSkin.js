define.experiment.newSkin('wysiwyg.viewer.skins.MobileMediaZoomSkin.MobileZoom', function(skinDefinition) {
    /**@type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        imageItem: {skin:'mock.viewer.skins.displayers.MediaZoomDisplayerSkin'}
    });

    def.skinParams([
        {'id':'tdr','type':Constants.SkinParamTypes.URL, 'defaultTheme':'BASE_THEME_DIRECTORY'} ,
        {'id':'bg','type':Constants.SkinParamTypes.BG_COLOR, 'mutators':['alpha',100], 'defaultValue':'#000'},
        {'id':'trns', 'type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'opacity 0.5s ease 0s'},
//        {'id':'fatFingerSizeVertical', 'type':Constants.SkinParamTypes.OTHER,'defaultValue': '22em'},
//        {'id':'fatFingerSizeHorizontal', 'type':Constants.SkinParamTypes.OTHER,'defaultValue': '22em'},
        {'id': '$marginIncludingArrow', 'type':'OTHER', 'defaultValue': '120', 'usedInLogic': true}
    ]);

    def.html(
        '<div skinPart="blockingLayer">' +
            '<div skinPart="virtualContainer"></div>' +
            '<div class="z-dialog" skinPart="dialogBox">' +
            '<div skinPart="itemsContainer"></div>' +
            '<div skinPart="xButton" class="btn"></div>' +
            '<div skinPart="buttonPrev" class="btn"></div>' +
            '<div skinPart="buttonNext" class="btn"></div>' +
            '<div skinPart="counter"></div>' +
            '</div>' +
        '</div>'
    );

    def.css([
        '{ position:fixed; width:100%; height:100%; z-index:99}',
//        '{ position:fixed; width:100%; height:100%; z-index:99; max-height: 1000000px; -webkit-text-size-adjust: none;}',
        '%blockingLayer% { [bg] position:fixed; top:0; bottom:0; left:0; right:0; visibility:visible; zoom:1; overflow: auto; }',
        '%dialogBox%     { margin:auto; background:#000; text-align:right}',
//        '[state~=portrait] %.btn% {position:fixed; width:[fatFingerSizeVertical]; height:[fatFingerSizeVertical]; overflow:hidden; text-indent:-9999px; cursor:pointer; [trns]}',
//        '[state~=landscape] %.btn% {position:fixed; width:[fatFingerSizeHorizontal]; height:[fatFingerSizeHorizontal]; overflow:hidden; text-indent:-9999px; cursor:pointer; [trns]}',
        '%.btn% {position:fixed; width:22em; height:22em; overflow:hidden; text-indent:-9999px; cursor:pointer; [trns]}',
        '[state~=dontShowButtons] %.btn% {display:none}',
        '%buttonPrev% {background:url([tdr]prev_button.png) no-repeat; top: 50%; left :0; background-size:cover}',
        '%buttonNext% {background:url([tdr]next_button.png) no-repeat; top: 50%; right:0; background-size:cover}',
        '[state~=landscape] %buttonPrev% {top:40%}',
        '[state~=landscape] %buttonNext% {top:40%}',
        '%xButton% {top: 0; right:0; background:url([tdr]x_button.png) no-repeat; background-size:cover;}',
        '%counter% {position:absolute; top:25px; right:-40px; width:40px; padding:10px 0; background:#fff; color:#000; text-align:center; display:none;}',
        '%virtualContainer% {position: absolute; top: -5000px;}'
    ]);

});
