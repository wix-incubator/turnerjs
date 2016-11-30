define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormSkinTopLabels', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders: true
    });

    def.iconParams({'description': 'Vertical Subscribe Form with labels on the top', 'iconUrl': '/images/wysiwyg/skinIcons/forms/formonecollabel.png', 'hidden': true, 'index': 2});

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

        {'id':'tl_bg4',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},
        {'id':'tl_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'}
    ]);

    def.html(

        '<div skinpart="wrapper">'
        +    '<ul>'
        +       '<li class="row">'
        +			'<label class="cell"></label>'
        +			'<div skinpart="formTitle"></div>'
        +		'</li>'
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
        +			'<div class="cell"><input skinpart="emailField" type="email" name="email"/></div>'
        +		'</li>'
        +		'<li class="row hidden">'
        +			'<label skinpart="phoneFieldLabel" class="cell"></label>'
        +			'<div class="cell" skinpart="phoneField">'
        +               '<span class="drop-list">'
        +   			   '<input type="text" class="selected" name="code"/>'
        +                  '<span class="after">\u25BC</span>'
        +                  '<select></select>'
        +               '</span>'
        +               '<div class="forPhone">'
        +				    '<input type="phone" name="phone"/>'
        +               '</div>'
//        +               '<em>(note: SMS rate may apply; Send "STOP" to unsubscribe)</em>'
        +			'</div>'
        +		'</li>'
        +		'<li class="row hidden">'
        +			'<div class="cell button">'
        +               '<button skinpart="submit">Subscribe</button>'
        +   			'<span skinpart="notifications"></span>'
        +           '</div>'
        +		'</li>'
        +    '</ul>'
        + '</div>'
    );

    def.css([
        '%wrapper%                                                    { width: 100% }',
        '%wrapper% ul                                                 { width: 100% }',
        '%wrapper% ul li.row                                          { min-width: 100%;}',
        '%wrapper% ul li.row.phone                                    { position: relative;}',

        '%wrapper% ul li.row .cell                                    { display: block; position: relative;}',
        '%wrapper% ul li.row label.cell                               { [fnt1] color: [labelTxt]; border: none; vertical-align: middle; text-align: left; padding: 3px 0; }',

        '%wrapper% %formTitle%                                        { [tfnt] margin-bottom: 4px; color: [titleColor]; }',

        '%wrapper% %phoneField%                                       { position: relative; }',
        '%wrapper% .drop-list                                         { display: inline-block; width: 86px; [fnt]; position: relative; padding: 0; vertical-align: top; [rd][shd];background-color: transparent; overflow: hidden; white-space: nowrap; margin-bottom: 2px;}',
        '%wrapper% .drop-list .selected                               { display: block; [box] color:[txt1]; [fnt] padding: 5px 1em 5px 5px; overflow: hidden; width: 100%; border:[brw] solid [brd]; [rd]; box-shadow: none; margin: 0}',
        '%wrapper% .drop-list .after                                  { position: absolute; color:[txt1]; right: [brw]; padding-right:5px; font-family: Arial; font-size: 0.6em; [rd]; top: 50%; margin-top: -1em}',
        '%wrapper% .drop-list select                                  { position: absolute; width: 100%; height: 100%; top: 0; background-image: none; border: 0px; opacity: 0; filter: alpha(opacity=0); }',

        '%wrapper% ul li.row %phoneField% .forPhone     { position: absolute; display: block; left: 95px; right: 0px; top: 0;}',

        '%wrapper% %phoneField% .forPhone input                       { margin: 0}',

        '%wrapper% ul li.row div.cell em                              { display: block; color: [labelTxt]}',

        '%wrapper% ul li.row div.cell.button                          { text-align: right; vertical-align: middle; }',
        'button                                                       { [rd][shd][bg2][fnt2] color:[txt2]; padding:5px 10px; border:none; cursor:pointer; display:inline-block;  white-space: nowrap; vertical-align:middle;  margin:8px 0 0 0; float:right; }',
        '[state~=right] button                                        { float:left;}',
        'input                                                        { [box] color:[txt1]; [rd][shd];background-color: [bg1];[fnt] border:[brw] solid [brd]; padding:5px; width: 100%;}',
        '%wrapper% ul li.row div.cell.button span                     { vertical-align: middle; display: none; padding: 0 10px; [efnt]; text-align: left;}',
        '[state~=right] %wrapper% ul li.row div.cell.button span      { text-align: right; }',
        '%wrapper% ul li.row div.cell span.success                    { color: [txtSuccess]; display: block;}',
        '%wrapper% ul li.row div.cell span.error                      { color: [txtError]; display: block;}',
        'input.error, textarea.error                                  { border-width: 1px;color: [txtError]; [fnt] border-color: [txtError]; }',

        '[state~=right]                                               { direction:rtl; text-align: right; }',
        '[state~=left]                                                { direction:ltr; text-align: left; }',

        '[state~=right] %wrapper% ul li.row div.cell.button           { text-align: left; }',
        '[state~=right] %wrapper% ul li.row label.cell                { text-align: right; padding:0 0 5px 15px; }',

        '[state~=right] %phoneField%                                            { direction:ltr; text-align: left; }',
        '[state~=right] %phoneField% em                                         { text-align: right; }',
        '[state~=right] %phoneField% .forPhone input                            { direction:ltr; text-align: right; }',
        '[state~=right] .drop-list .selected                                    { direction:ltr; text-align: right; padding-right: 20px}',
        '[state~=right] .drop-list                                              { direction:ltr; text-align: left;}',

        '[state~=right][state~="mobile"] ul li.row div.cell .drop-list .selected { padding-right: 20px; }',

        '[state~=mobile][state~=right] %wrapper% ul li.row label.cell { text-align: right; }',

        '[state~=left] %wrapper% ul li.row label.cell                 { text-align: left; }',

        '[state~=mobile][state~=left] %wrapper% ul li.row label.cell  { text-align: left; }',

        '[state~=right] %wrapper% ul li.row div.cell select + input   { margin-right: 23% }',

        '[state~="mobile"] %wrapper% ul                               { display: block; width:100%; font-size: 14px; padding: 0; margin:3px 0; }',
        '[state~="mobile"] %wrapper% ul li.row                        { display: block; width:100%; }',
        '[state~="mobile"] %wrapper% ul li.row label.cell             { display: block; width:100%; font-size: 14px; margin: 3px 0; }',

        '[state~="mobile"] ul li.row div.cell                         { display: block; width:100%; font-size: 14px; padding: 0; margin: 3px 0; }',
        '[state~="mobile"] ul li.row div.cell input                   { width: 100%; font-size: 14px; padding: 0 5px; margin: 0; height: 45px; line-height: 45px; -webkit-appearance:none }',
        '[state~="mobile"] ul li.row div.cell .drop-list              { height: 45px; margin-top: 0; line-height: 45px; width: 86px;}',
        '[state~="mobile"] ul li.row div.cell .drop-list .selected    { height: 45px; line-height: 35px; font-size: 14px;}',
        '[state~="mobile"] ul li.row div.cell .drop-list .after       { top: 0; bottom: 0; right: [brw]; line-height: 45px; font-size: 12px; margin: 0;}',
        '[state~="mobile"] ul li.row div.cell span + input            { display: inline-block;}',
        '[state~="mobile"] ul li.row div.cell select                  { font-size: 14px; height: 45px; line-height: 45px; }',
        '[state~="mobile"] ul li.row div.cell em                      { font-size: 10px; margin-top: 10px}',
        '[state~="mobile"] ul li.row div.cell.button span             { display: block; text-align: center; padding: 0; width:100% }',
        '[state~="mobile"] ul li.row div.cell.button button           { margin-top: 10px; }',

        '%wrapper% .button button:active, %wrapper% .button button:hover{ color: [tl_txt3]; [tl_bg4];}'

    ]);
});