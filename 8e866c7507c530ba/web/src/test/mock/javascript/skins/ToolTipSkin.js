define.skin('wysiwyg.editor.skins.ToolTipSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: [

            {'id':'bgc', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultValue':'#fdf08a'},
            {'id':'pos', 'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute;top:0px;bottom:0px;left:0px;right:0px;'},
            {'id':'clr1','type':Constants.SkinParamTypes.COLOR, 'defaultValue':'#383838'},
            {'id':'clr2','type':Constants.SkinParamTypes.COLOR, 'defaultValue':'#3899d0'},
            {'id':'fnt', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme':'fontTitle'},
            {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'}
        ]
    });
    def.html(
        '<div class="toolTipContainer">' +
            // '<small action="close">close</small>' +
            '<a action="moreInfo" class="moreInfo" skinpart="moreInfo">More Info</a>' +
            '<h3 skinpart="title"></h3>' +
            '<p skinpart="content"></p>' +
            '<label action="dontShow" skinpart="isDontShowAgainCont">' +
            '<input action="dontShow" type="checkbox" skinpart="isDontShowAgain" />' +
            '</label>' +
            '<a action="moreHelp" skinpart="moreHelp"></a>'+
            '<div class="ribbon bottom" skinpart="ribbon"></div>'+
            '</div>'
    );
    def.css(
        [
            '{ font-size:12px; background:#fdf08a; border-radius:5px; box-shadow:0 1px 3px rgba(0, 0, 0, 0.75); position:absolute; min-height:50px; min-width:100px; padding:10px; }',
            '%%{}',
            'p {display:block; margin:0 0 5px 0;}',
            'a {display:block; margin:0 0 5px 0; color:#359ace;}',
            '%title%    { margin:0 0 5px 0; font-weight:bold;font-size:14px;display:block;}',
            'a.moreInfo { float:right; margin: 0px; display:none;}',
            '%moreHelp% { float:right; margin: 0 20px 0 0; }',

            //'input, %content%,  {display:none;}',

            '%.ribbon%{ position:absolute;  border:10px solid transparent;}',
            '%.top%    { top:-20px;    left:50%; margin-left:-10px; border-bottom:10px solid #fdf08a;}',
            '%.bottom% { bottom:-20px; left:50%; margin-left:-10px; border-top:10px solid #fdf08a;}',
            '%.left%   { left:-20px;   top:50%;  margin-top: -10px; border-right:10px solid #fdf08a;}',
            '%.right%  { right:-20px;  top:50%;  margin-top: -10px; border-left:10px solid #fdf08a;}',

            '[state~="hidden"] {display:none!important;}',
            '[action="close"] {color:red;}',
            '[state~="isMoreLess"] %moreInfo% {display:block;}',
            '[state~="isMoreLess"] %content% {display:none;}',
//            '[state~="isMoreLess"] %moreHelp% {display:none;}',
            '[state~="dontShowAgain"] %isDontShowAgain% {display:block;}',
            '%isDontShowAgain% {display:none;}',
            '[state~="showHelp"] %moreHelp% {display:block;}',
            '%moreHelp% {display:none;}'
        ]
    );
});
