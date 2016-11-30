define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormPlaceholderSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders: false,
        sizeLimits: {
            minW: 235,
            maxW: 980,
            maxH: 1024,
            minH: 1
        }
    });

    def.iconParams({'description': 'Basic Subscribe Form', 'iconUrl': '/images/wysiwyg/skinIcons/forms/formonecol.png', 'hidden': false, 'index': 0});

    def.skinParams([
        {'id':'bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'bg2',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'titleColor', 'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_15', enableEdit:true, lang: 'titleTxt'},
        {'id':'labelTxt',   'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_12', enableEdit:true, lang: 'labelTxt'},
        {'id':'txtError',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': '#8B0000', enableEdit:true},
        {'id':'txtSuccess', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(186,218,85,1)', enableEdit:true},

        {'id':'brd',        'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_12'},
        {'id':'brw',        'type': Constants.SkinParamTypes.SIZE,          'defaultValue': '1px'},

        {'id':'tfnt',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_6', lang:'titleFont'},
        {'id':'fnt',        'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang:'fieldFont'},
        {'id':'fnt2',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'buttonFont'},
        {'id':'efnt',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'notificationFont'},

        {'id':'rd',         'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0px', noshow: true},
        {'id':'shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;'},

        {'id':'phs_bg4',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},
        {'id':'phs_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'}
    ]);

    def.html(

        '<div skinpart="wrapper">'
        +			'<div skinpart="formTitle"></div>'
        +			'<label class="cell" skinpart="firstNameFieldLabel"></label>'
        +			'<div class="row hidden">'
        +                '<input skinpart="firstNameField" type="text" name="first"/>'
        +           '</div>'
        +			'<label skinpart="lastNameFieldLabel" class="hidden"></label>'
        +			'<div class="row hidden">'
        +	    		'<input skinpart="lastNameField" type="text" name="last"/>'
        +           '</div>'
        +			'<label skinpart="emailFieldLabel" class="hidden"></label>'
        +			'<div class="row hidden">'
        +   			'<input skinpart="emailField" type="email" name="email" />'
        +           '</div>'
        +			'<label skinpart="phoneFieldLabel" class="hidden"></label>'
        +			'<div class="row hidden">'
        +   			'<div skinpart="phoneField">'
        +                  '<span class="drop-list">'
        +         			  '<input type="text" class="selected" name="code" data-skip-placeholder="true" disable="disable"/>'
        +                     '<span class="after">\u25BC</span>'
        +                     '<select data-skip-placeholder="true"></select>'
        +                  '</span>'
        +                  '<div class="forPhone">'
        +   				    '<input type="phone" name="phone"/>'
        +                  '</div>'
//        +                  '<em>(note: SMS rate may apply; Send "STOP" to unsubscribe)</em>'
        +   			'</div>'
        +           '</div>'
        +			'<div class="row button hidden">'
        +               '<button skinpart="submit">Subscribe</button>'
        +   			'<span skinpart="notifications"></span>'
        +           '</div>'
        + '</div>'
    );

    def.css([
        '%wrapper%                                                              { width: 100%; position: absolute}',
        '%wrapper% %formTitle%                                                  { [tfnt] margin-bottom: 4px; color: [titleColor]; }',
        '%wrapper% label                                                        { display: none; }',

        '%wrapper% %phoneField%                                                 { position: relative; }',
        '%wrapper% .drop-list                                                   { display: inline-block; width: 86px; margin: 2px 0 8px 0px; [fnt]; position: relative; padding: 0; vertical-align: top; [rd][shd]; background-color: transparent]; overflow: hidden; white-space: nowrap;}',
        '%wrapper% .drop-list .selected                                         { display: block; [box] color:[txt1]; [fnt] padding: 5px 1em 5px 5px; overflow: hidden; width: 100%; border:[brw] solid [brd]; [rd]; box-shadow: none; margin: 0}',
        '%wrapper% .drop-list .after                                            { position: absolute; color:[txt1]; right: [brw]; padding-right:5px; font-family: Arial; font-size: 0.6em; [rd]; top: 50%; margin-top: -1em}',
        '%wrapper% .drop-list select                                            { position: absolute; width: 100%; height: 100%; top: 0; background-image: none; border: 0px; opacity: 0; filter: alpha(opacity=0); }',

        '%wrapper% %phoneField% .forPhone                                       { position: absolute; display: block; left: 95px; right: 0px; top: 0;}',

        '%wrapper% em                                                           { display: block; color: [labelTxt]}',
        '%wrapper% div.button                                                   { text-align: right; vertical-align: middle;}',
        '%wrapper% div.button button                                            { [rd][shd][bg2][fnt2] color:[txt2]; padding:5px 10px; border:none; cursor:pointer;  white-space: nowrap; display:inline-block; vertical-align:middle; margin-right: 0; float: right;}',
        '[state~=right] %wrapper% div.button button                                            { float: left; margin-left: 0; margin-right: initial;}',
        'input                                                                  { [box] color:[txt1]; [rd][shd];background-color: [bg1];[fnt]; border:[brw] solid [brd]; padding: 5px; margin: 2px 0 7px 0; width: 100%;}',


        '%wrapper% div.button span                                              { vertical-align: middle; display: none; padding: 0 10px; [efnt]; text-align: left;}',
        '[state~=right] %wrapper% div.button span                                { text-align: right;}',
        '%wrapper% div.button span.success                                      { color: [txtSuccess]; display: block;}',
        '%wrapper% div.button span.error                                        { color: [txtError]; display: block;}',
        'input.error, textarea.error                                            { border-width: 1px; color: [txtError]; [fnt] border-color: [txtError];}',

        'input:invalid {' +
            'box-shadow: none !important;' +
        '}',

        ' input:-moz-placeholder, textarea:-moz-placeholder                     { color:[labelTxt];}',
        ' input.isPlaceholder, textarea.isPlaceholder                           { color:[labelTxt];}',
        ' input::-moz-placeholder, textarea::-moz-placeholder                   { color:[labelTxt];}',
        ' input:-ms-input-placeholder, textarea:-ms-input-placeholder           { color:[labelTxt];}',
        ' input::-webkit-input-placeholder, textarea::-webkit-input-placeholder { color:[labelTxt];}',

        '[state~=right]                                                         { direction:rtl; text-align: right; }',
        '[state~=left]                                                          { direction:ltr; text-align: left; }',

        '[state~=right] %wrapper% div.button                                    { text-align: left; }',

        '[state~=right] %phoneField%                                            { direction:ltr; text-align: left; }',
        '[state~=right] %phoneField% em                                         { text-align: right; }',
        '[state~=right] %phoneField% .forPhone input                            { direction:ltr; text-align: right; }',
        '[state~=right] .drop-list .selected                                    { direction:ltr; text-align: right; }',
        '[state~=right] .drop-list                                              { direction:ltr; text-align: left;}',

        '[state~=right][state~="mobile"] .drop-list .selected { padding-right: 20px; }',

        '[state~="mobile"] input                                                { font-size: 14px; padding: 0 5px; margin:0 0 5px 0; height: 45px; line-height: normal; -webkit-appearance: none }',

        '[state~="mobile"] .drop-list                                           { height: 45px; margin-top: 0; line-height: 45px; width: 90px; }',
        '[state~="mobile"] .drop-list .selected                                 { height: 45px; line-height: 35px; font-size: 14px; }',
        '[state~="mobile"] .drop-list .after                                    { top: 0; bottom: 0; right: [brw]; line-height: 45px; font-size: 12px; margin: 0;}',

        '[state~="mobile"] .drop-list + input                                   { display: inline-block;}',

        '[state~="mobile"] select                                               { font-size: 14px; height: 45px; line-height: 45px; }',
        '[state~="mobile"] em                                                   { font-size: 10px; margin-top: 10px}',

        '[state~="mobile"] div.button span                                      { display: block; text-align: center; padding: 0; width:100% }',
        '[state~="mobile"] div.button button                                    { margin-top: 10px; }',

        '%wrapper% .button button:active, %wrapper% .button button:hover{ color: [phs_txt3]; [phs_bg4];}'
    ]);
});