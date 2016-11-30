define.skin('mock.viewer.skins.MediaZoomSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'tdr','type':Constants.SkinParamTypes.URL, 'defaultTheme':'BASE_THEME_DIRECTORY'} ,
            {'id':'bgc','type':Constants.SkinParamTypes.BG_COLOR, 'mutators':['alpha',75], 'defaultTheme':'color_6'},
            {'id': '$marginToArrow', 'type':'OTHER', 'defaultValue': '30'},
            {'id': '$marginIncludingArrow', 'type':'OTHER', 'defaultValue': '90'}
        ]
    );
    def.compParts({ imageItem: {skin:'mock.viewer.skins.displayers.MediaZoomDisplayerSkin'}});
    def.html(
        '<div class="overlay z-dialog" skinPart="blockingLayer">' +
            '<div skinPart="buttonPrev" class="sprite zoomPrevNext">prev</div>' +
            '<div skinPart="buttonNext" class="sprite zoomPrevNext">next</div>' +

            '<div class="z-dialog" skinPart="dialogBox">' +

            '<div skinPart="xButton"    class="sprite dialogCloseBtn"></div>' +
            '<div skinPart="virtualContainer"></div><div skinPart="itemsContainer"></div><div skinPart="counter"></div>' +

            '</div>' +

        '</div>'
    );
    def.css(
        [

            '{ position:absolute; width:100%; height:100%; }',
            '%blockingLayer% { [bgc] position:fixed; top:0; bottom:0; left:0; right:0; visibility:visible; zoom:1; overflow: auto; }',
            '%dialogBox%     { position:relative; margin:auto; background:#fff; }',


            '%.sprite%    { background-image:url([tdr]btn_arrows.png); background-repeat:no-repeat; overflow:hidden; text-indent:-999px; cursor:pointer; z-index:999;}',
            '%xButton%    { position:absolute; width:40px; top:0px; right:-40px; height:40px; background-position:0 0; }',
            '%buttonNext% { position:fixed; right:[$marginToArrow]px;  top:30%; width:50px; height:50px;  background-position:0 100%; }',
            '%buttonPrev% { position:fixed; left:[$marginToArrow]px; top:30%; width:50px; height:50px;  background-position:100% 100%;  }',


            '%counter% {position:absolute; top:40px; right:-40px; width:40px; padding:10px 0; background:#000; color:#fff; text-align:center;}',

            '%virtualContainer% {position: absolute; top: -1000px;}'

        ]
    );
});
