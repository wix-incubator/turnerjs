define.skin('wysiwyg.viewer.skins.horizontalmenubutton.LinesHorizontalMenuButtonSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' }
    });
    def.skinParams([

        {'id':'brd1','type':Constants.SkinParamTypes.OTHER,'defaultValue': '30px solid transparent'},
        {'id':'pos','type':Constants.SkinParamTypes.OTHER,'defaultValue': 'position:absolute;top:50%;'},
        {'id':'txt', 'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_1'},
        {'id':'c',   'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_3'}

    ]);
    def.html(
        '<div skinPart="bg"></div>' +
        '<div class="arr arrLeft"></div>' +
        '<div class="arr arrRight"></div>' +
        '<div skinPart="label"></div>');
    def.css([
        '{ display:inline-block; cursor:pointer; padding:0 10px; position:relative;' +
            'font-family:Arial, Helvetica, sans-serif; font-size:14px; color:[txt]; line-height:30px;'+
            'transition: color 0.5s ease 0s; -moz-transition: color 0.5s ease 0s; -webkit-transition: color 0.5s ease 0s;'+
            '}',

        '%bg% { position:absolute; top:0; bottom:0; left:0; right:0; background-color:[c]}',


        '%.arr% { position:absolute; top:50%; border-top:[brd1]; border-right:[brd1]; border-bottom:[brd1]; }',
        '%.arrLeft%  { left:0px;    border-left:30px solid #000;}',
        '%.arrRight% { right:-60px; border-left:30px solid [c];}',


        '%label% { position:relative; padding:0 10px; }',

        ':hover  {  }'
    ]
    );
});