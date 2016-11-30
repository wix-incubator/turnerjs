define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders: true
    });

    def.iconParams({'description': 'Vertical Subscribe Form with labels on the left', 'iconUrl': '/images/wysiwyg/skinIcons/forms/formonecollabelleft.png', 'hidden': true, 'index': 1});

    def.skinParams([
        {'id':'bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'bg2',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'titleColor', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(169,169,169,1)', enableEdit:true, lang: 'titleTxt'},
        {'id':'labelTxt',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(169,169,169,1)', enableEdit:true, lang: 'labelTxt'},
        {'id':'txtError',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': '#8B0000', enableEdit:true},
        {'id':'txtSuccess', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(186,218,85,1)', enableEdit:true},

        {'id':'brd',        'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15'},
        {'id':'brw',        'type': Constants.SkinParamTypes.SIZE,          'defaultValue': '0px'},

        {'id':'tfnt',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_6', lang:'titleFont'},
        {'id':'fnt',        'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang:'fieldFont'},
        {'id':'fnt1',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_7', lang:'labelFont'},
        {'id':'fnt2',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'buttonFont'},
        {'id':'efnt',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'notificationFont'},

        {'id':'rd',         'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'},
        {'id':'shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 1px 4px rgba(0, 0, 0, 0.6);'},

        {'id':'box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;'},

        {'id':'bs_bg4',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},
        {'id':'bs_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'}
    ]);

    def.html(
        '<div skinpart="wrapper">'
        +    '<div skinpart="formTitle"></div>'
        +    '<ul>'
        +		'<li class="row hidden">'
        +			'<label class="cell" skinpart="firstNameFieldLabel"></label>'
        +			'<div class="cell">'
        +				'<input skinpart="firstNameField" type="text" name="first"/>'
        +			'</div>'
        +		'</li>'
        +		'<li class="row hidden">'
        +			'<label skinpart="lastNameFieldLabel" class="cell"></label>'
        +			'<div class="cell"><input skinpart="lastNameField" type="text" name="last"/></div>'
        +		'</li>'
        +		'<li class="row hidden">'
        +			'<label skinpart="emailFieldLabel" class="cell"></label>'
        +			'<div class="cell"><input skinpart="emailField" type="phone" name="email"/></div>'
        +		'</li>'
        +		'<li class="row hidden">'
        +           '<label class="cell" skinpart="phoneFieldLabel"></label>'
        +			'<div class="cell" skinpart="phoneField">'
        +               '<div class="holder">'
        +                   '<span class="drop-list">'
        +   			        '<input type="text" class="selected" name="code"/>'
        +                       '<span class="after">\u25BC</span>'
        +                       '<select></select>'
        +                   '</span>'
        +                   '<div class="forPhone">'
        +				         '<input type="phone" name="phone"/>'
        +                   '</div>'
//        +                   '<em>(note: SMS rate may apply; Send "STOP" to unsubscribe)</em>'
        +			    '</div>'
        +           '</div> '
        +		'</li>'
        +		'<li class="row hidden">'
        +			'<label class="cell"></label>'
        +			'<div class="cell button">'
        +               '<button skinpart="submit">Subscribe</button>'
        +   			'<span skinpart="notifications"></span>'
        +           '</div>'
        +		'</li>'
        +    '</ul>'
        + '</div>'
    );

    def.css([
        '%wrapper%                                                    { width: 100%; position: relative; }',
        '%wrapper% ul                                                 { display: table; width: 100% }',
        '%wrapper% ul li.row                                          { min-width: 100%; display: table-row;}',
        '%wrapper% ul li.row .cell                                    { vertical-align: top; display: table-cell; position: relative; width: 100%;}',
        '%wrapper% ul li.row label.cell                               { [fnt1] color: [labelTxt]; border: none; vertical-align: top; text-align: right; width: 110px; padding-top: 5px; white-space: nowrap}',
        '%wrapper% %formTitle%                                        { [tfnt] margin-bottom: 4px; color: [titleColor]; }',
        '%wrapper% ul li.row .holder { position: relative }',
        '%wrapper% ul li.row div.cell .drop-list                      { display: inline-block; width: 86px; margin: 2px 0 5px 0px; [fnt]; position: relative; padding: 0; vertical-align: top; [rd][shd];background-color: transparent; overflow: hidden; white-space: nowrap;}',
        '%wrapper% ul li.row div.cell .drop-list .selected            { display: block; [box] color:[txt1]; [fnt] padding: 5px 1em 5px 5px; overflow: hidden; width: 100%; border:[brw] solid [brd]; [rd]; box-shadow: none; margin: 0}',
        '%wrapper% ul li.row div.cell .drop-list .after               { position: absolute; color:[txt1]; right: [brw]; padding-right:5px; font-family: Arial; font-size: 0.6em; [rd]; top: 50%; margin-top: -1em}',
        '%wrapper% ul li.row div.cell .drop-list select               { position: absolute; width: 100%; height: 100%; top: 0; background-image: none; border: 0px; opacity: 0; filter: alpha(opacity=0); }',

        '%wrapper% ul li.row %phoneField% .forPhone                   { position: absolute; display: block; left: 95px; right: 0px; top: 0;}',


        '%wrapper% ul li.row div.cell em                              { display: block; color: [labelTxt]}',
        '%wrapper% ul li.row div.cell.button                          { text-align: right; vertical-align: middle; }',
        'button                                                       { [rd][shd][bg2][fnt2] color:[txt2]; padding:5px 10px; border:none; cursor:pointer; display:inline-block; vertical-align: middle; white-space: nowrap; margin-top: 5px; float: right;}',
        '[state~=right] button                                        { float: left;}',
        'input                                                        { [box] color:[txt1]; [rd][shd];background-color: [bg1];[fnt] border:[brw] solid [brd]; padding:5px; width: 100%; margin: 2px 0px 5px;}',
        '%wrapper% ul li.row div.cell.button span                     { vertical-align: middle; display: none; padding: 0; [efnt]; width: 100%; text-align: left;}',
        '[state~=right] %wrapper% ul li.row div.cell.button span      { text-align: right;}',
        '%wrapper% ul li.row div.cell span.success                    { color: [txtSuccess]; display: block;}',
        '%wrapper% ul li.row div.cell span.error                      { color: [txtError]; display: block;}',
        'input.error, textarea.error                                  { border-width: 1px; color: [txtError]; [fnt] border-color: [txtError]; }',

        '[state~=right]                                               { direction:rtl; text-align: right; }',
        '[state~=left]                                                { direction:ltr; text-align: left; }',

        '[state~=right] %wrapper% ul li.row div.cell.button           { text-align: left; }',
        '[state~=right] %wrapper% ul li.row div.cell.button span      { text-align: right; }',
        '[state~=right] %wrapper% ul li.row label.cell                { text-align: left; padding-left: 15px; }',

        '[state~=right] %phoneField%                                            { direction:ltr; text-align: left; }',
        '[state~=right] %phoneField% em                                         { text-align: right; }',
        '[state~=right] %phoneField% .forPhone input                            { direction:ltr; text-align: right; }',
        '[state~=right] .drop-list .selected                                    { direction:ltr; text-align: right;}',
        '[state~=right] .drop-list                                              { direction:ltr; text-align: left;}',

        '[state~=right][state~="mobile"] ul li.row div.cell .drop-list .selected { padding-right: 20px; }',

        '[state~=mobile][state~=right] %wrapper% ul li.row label.cell { text-align: right; padding: 5px 0 5px 0; }',
        '[state~=left] %wrapper% ul li.row label.cell                 { text-align: right; padding-right: 15px}',
        '[state~=left] %wrapper% ul li.row div.cell.button span       { text-align: left; }',
        '[state~=mobile][state~=left] %wrapper% ul li.row label.cell  { text-align: left;  padding: 5px 0 5px 0; }',

        '[state~=right] %wrapper% ul li.row div.cell select + input   { margin-right: 23% }',

        '[state~="mobile"] %wrapper% ul                               { display: block; width:100%; font-size: 14px; padding: 0; margin:3px 0; }',
        '[state~="mobile"] %wrapper% ul li.row                        { display: block; width:100%; }',
        '[state~="mobile"] %wrapper% ul li.row label.cell             { display: block; width:100%; font-size: 14px; padding: 0; margin:3px 0; }',
        '[state~="mobile"] ul li.row div.cell                         { display: block; width:100%; font-size: 14px; padding: 0; margin: 3px 0; }',
        '[state~="mobile"] ul li.row div.cell input                   { width: 100%; font-size: 14px; padding: 0 5px; margin: 0; height: 45px; line-height: 45px; -webkit-appearance:none }',
        '[state~="mobile"] ul li.row div.cell .drop-list              { height: 45px; margin-top: 0; line-height: 45px; width: 86px; position: relative; }',
        '[state~="mobile"] ul li.row div.cell .drop-list .selected    { height: 45px; line-height: 35px; font-size: 14px;}',
        '[state~="mobile"] ul li.row div.cell .drop-list .after       { top: 0; bottom: 0; right: [brw]; line-height: 45px; font-size: 12px; margin: 0}',
        '[state~="mobile"] ul li.row div.cell span + input            { display: inline-block;}',
        '[state~="mobile"] ul li.row div.cell select                  { font-size: 14px; height: 45px; line-height: 45px; }',
        '[state~="mobile"] ul li.row div.cell em                      { font-size: 10px; margin-top: 10px}',
        '[state~="mobile"] ul li.row div.cell.button span             { display: block; text-align: center; padding: 0; width:100% }',
        '[state~="mobile"] ul li.row div.cell.button button           { margin-top: 10px; }',

        '%wrapper% .button button:active, %wrapper% .button button:hover{ color: [bs_txt3]; [bs_bg4];}'
    ]);
});