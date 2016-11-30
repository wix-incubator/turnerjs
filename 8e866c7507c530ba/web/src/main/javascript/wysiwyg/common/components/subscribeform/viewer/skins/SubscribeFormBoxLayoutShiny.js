define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutShiny', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders: false,
        successMessageOutside: true,
        sizeLimits: {
            minW: 505,
            minH: 98,
            maxW: 980,
            maxH: 1024
        }
    });

    def.iconParams({'description': 'Shiny', 'iconUrl': '/images/wysiwyg/skinIcons/forms/ShinyBox.png', 'hidden': false, 'index': 7});

    def.skinParams([
        {'id':'bls_bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'bls_bg2',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'bls_bg3',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_12', lang: 'boxColor'},
        {'id':'bls_bg4',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},

        {'id':'bls_txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'bls_txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'bls_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'},

        {'id':'bls_titleColor', 'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_15', enableEdit:true, lang: 'titleTxt'},
        {'id':'bls_labelTxt',   'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_12', enableEdit:true, lang: 'labelTxt'},
        {'id':'bls_txtError',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': '#8B0000', enableEdit:true, lang: 'txtError'},
        {'id':'bls_txtSuccess', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(186,218,85,1)', enableEdit:true, lang: 'txtSuccess'},

        {'id':'bls_brd',        'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_12', lang: 'brd'},
        {'id':'bls_brw',        'type': Constants.SkinParamTypes.SIZE,          'defaultValue': '1px', lang: 'brw'},

        {'id':'bls_tfnt',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_6', lang:'titleFont'},
        {'id':'bls_fnt',        'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang:'fieldFont'},
        {'id':'bls_fnt2',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'buttonFont'},
        {'id':'bls_efnt',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'notificationFont'},

        {'id':'bls_shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 2px 1px 0 rgba(50, 50, 50, 0.2)', lang: 'shd'},
        {'id':'bls_shd_input',  'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': 'inset 1px 1px 0 1px rgba(50, 50, 50, 0.2)', noshow: true},
        {'id':'bls_shd_input_rtl',  'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': 'inset -1px 1px 1px 0px rgba(50, 50, 50, 0.75);', noshow: true},
        {'id':'bls_no_shd',  'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': 'none;', noshow: true},

        {'id':'bls_box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;', lang: 'box'},
        {'id':'bls_shd_subscribe_button', 'type' : Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': 'inset 0 -15px 5px 0px rgba(50, 50, 50, 0.4);', noshow: true},
        {'id': "webThemeDir", 'type': Constants.SkinParamTypes.URL, 'defaultTheme': "WEB_THEME_DIRECTORY"}
    ]);

    def.html(
        '<div skinpart="wrapper" class="wrapper">' +
            '<label skinpart="firstNameFieldLabel" class="hidden"></label>' +
            '<label skinpart="lastNameFieldLabel" class="hidden"></label>' +
            '<label skinpart="phoneFieldLabel" class="hidden"></label>' +
            '<label skinpart="emailFieldLabel" class="hidden"></label>' +
            '<div class="container">' +
                '<h1 skinpart="formTitle"></h1>' +
                '<div class="table">' +
//                    '<input class="email-wrapper additionalField"/>' +
                    '<div class="table-row">' +
                        '<ul class="table-cell">' +
                            '<li class="table-view">' +
                                '<div>' +
                                    '<span class="row hidden"><input skinpart="firstNameField" type="text" placeholder="First name" name="first"/></span>' +
                                    '<span class="row hidden"><input skinpart="lastNameField" type="text" placeholder="Last name" name="last"/></span>' +
                                '</div>' +
                            '</li>' +
                            '<li class="row hidden">' +
                                '<div class="phoneField" skinpart="phoneField">' +
                                    '<span class="drop-list">' +
                                        '<input type="text" class="selected" name="code" data-skip-placeholder="true" disable="disable"/>' +
                                        '<span class="after">' +
                                            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="15px" height="7.634px" viewBox="0 0 12.854 7.634">' +
                                                '<polygon fill="#FFFFFF" points="11.658,0 6.427,5.231 1.197,0 0,1.197 5.231,6.427 5.221,6.437 6.417,7.634 6.427,7.624 7.624,6.427 12.854,1.197 "/>'+
                                            '</svg>' +
                                        '</span>' +
                                        '<select data-skip-placeholder="true"></select>' +
                                    '</span>' +
                                    '<div class="forPhone">' +
                                        '<input type="phone" name="phone" placeholder="Phone number"/>' +
                                    '</div>' +
                                '</div>' +
                            '</li>' +
                            '<li class="row hidden">' +
                                '<input class="email" skinpart="emailField" name="email" type="email" placeholder="enter your e-mail address"/>' +
                            '</li>' +
                        '</ul>' +
                        '<div class="table-cell">' +
                            '<div class="button">' +
                                '<a skinpart="submit" class="submit hidden">Subscribe Now</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'+
                '<div skinpart="notifications"></div>' +
            '</div>' +
            '<div class="message">' +
                'Your Success/Error Message goes here' +
            '</div>' +
        '</div>'
    );
    def.css([
        '%wrapper%.wrapper{' +
           'width: 100%;' +
        '}',
        '%wrapper%.wrapper .container{'+
            'background-image: url([webThemeDir]subscribeform/shiny_bg.png);' +
            'background-position-x: 50%;' +
            'background-position-y: 0%;' +
            'background-repeat-x: repeat;' +
            'background-color: [bls_bg3];' +
            'padding: 30px 24px;' +
            '[bls_shd];'+
        '}',
        '%wrapper% .container h1{ padding: 0; margin: 0 0 10px 0; [bls_tfnt]; color: [bls_titleColor]}',
        '%wrapper% .container ul{ margin: 0; padding: 0; position: relative; }',
        '%wrapper% .container ul li{ list-style: none; margin-top: 10px; margin-right: 10px; }',

        '[state~=right] %wrapper% .container ul li{ margin-left: 10px; margin-right: 0px; }',

        '%wrapper% .container ul li:first-child{ margin-top: 20px;}',

        '%wrapper% li>span { ' +
            'display: inline-block; ' +
            'margin: 0 10px 0px 0; ' +
            'width: 100%; ' +
            '[bls_shd_input];' +
            'z-index: 1;' +
            'position: relative;' +
        '}',

        '[state~=right] %wrapper% li>span { ' +
            'margin: 0 0 0 10px; ' +
            '[bls_shd_input_rtl];' +
        '}',

        '%wrapper% input {' +
            'margin: 0;' +
            'color: [bls_txt1];' +
            'background-color: [bls_bg1];' +
            '[bls_fnt]' +
            '[bls_shd_input];' +
            'border: [bls_brw] solid [bls_brd];' +
            'padding: 7px;' +
            'width: 100%;' +
            'display: block;' +
            'line-height: normal;'+
        '}',

        'input:invalid {' +
            'box-shadow: none !important;' +
        '}',

        '[state~=right] %wrapper% input {' +
            '[bls_shd_input_rtl];' +
        '}',

        '%wrapper% .container ul li.email-container {' +
            'margin-right: 0;' +
        '}',

        '[state~=right] %wrapper% .container ul li.email-container {' +
            'margin-left: 0;' +
        '}',

        '%wrapper% em {display: block; margin: 0px 0px 10px 15px; font-size: 10px; color: [bls_txt1]; }',

        '[state~=right] %wrapper% em {margin: 0px 15px 10px 0;}',

        '%wrapper% .button { ' +
            'display: block; ' +
            'position: relative;' +
        '}',

        '[state~=right] %wrapper% .button { ' +
            'position: relative;' +
        '}',

        '%wrapper% a.submit{' +
            '[bls_shd_subscribe_button];' +
            'display: block;'+
            'color: [bls_txt2];' +
            '[bls_fnt2];' +
            'padding: calc([bls_brw] + 7px) 24px;' +
            'max-width: 250px;' +
            'overflow: hidden;' +
            'background-color: [bls_bg2];'+
            'white-space: nowrap;'+
            'line-height: normal;'+
            'margin-left: 14px;' +
            'margin-right: calc(1px + [bls_brw]);' +
        '}',

        '%wrapper% a.submit:active, %wrapper% a.submit:hover{ color: [bls_txt3]; [bls_bg4]}',

        '[state~=right] %wrapper% a.submit{ margin-right: 15px; margin-left: 0px; }',

        '%wrapper% .phoneField { position: relative; }',
        '%wrapper% .phoneField .drop-list { background-color: [bls_bg1]; display: inline-block; width: 106px; position: relative; padding: 0; vertical-align: top; overflow: hidden; white-space: nowrap; border: [bls_brw] solid [bls_brd]; [bls_box]}',
        '%wrapper% .phoneField .drop-list .selected { background-color: transparent; display: block; color: [bls_txt1]; overflow: hidden; width: 100%; margin: 0; [bls_fnt]; text-align: center; border: 0; padding: 6px 20px 6px 0;}',
        '%wrapper% .phoneField .drop-list .after { ' +
            'position: absolute; ' +
            'top: 5px; ' +
            'right: 5px; ' +
            'bottom: 5px; ' +
            'text-align: center; ' +
            'padding: 5px; ' +
            'width: 14px;'+
            'background-color: [bls_bg3]; ' +
            'background-repeat: no-repeat; ' +
            'background-position: center; ' +
            '[bls_fnt]' +
        '}',
        '%wrapper% .phoneField .drop-list .after svg {position: absolute; top: 50%; margin-top: -4px; left: 50%; margin-left: -8px;}',
        '%wrapper% .phoneField .drop-list .after polygon {fill: [bls_bg1]}',
        '%wrapper% .phoneField .drop-list select { position: absolute; width: 100%; height: 100%; top: 0; background-image: none; border: 0px; opacity: 0; filter: alpha(opacity=0); }',
        '%wrapper% .phoneField .forPhone { position: absolute; display: block; left: 116px; right: 0px; top: 0; }',

        '%wrapper% .container ul li.table-view{ margin: 0px; }',

        '[state~=right] %wrapper% .container ul li.table-view{ margin: 0px; }',

        '%wrapper% .container ul li.table-view div{ display: table; width: 100% }',

        '%wrapper% .container ul li.table-view span{ display: table-cell; padding-right: 10px;}',

        '[state~=right] %wrapper% .container ul li.table-view span{ padding-left: 10px; padding-right: 0px;}',

        '%wrapper% .container ul li.table-view span input{ margin-top: 10px;}',

        'input.error{ border-width: 1px;border-color: [bls_txtError]; color: [bls_txtError]; [bls_box]}',

        '%wrapper% .container div.error{ [bls_efnt]; color: [bls_txtError]; padding-top: 5px;}',

        '%wrapper% .message{ margin: 15px 0 0 0; background-color: #26e089; text-align: center; [bls_efnt]; padding: 10px 0; display: none;}',
        '%wrapper% .message.success{background-color: transparent; color: [bls_txtSuccess]; display: block;}',
        '%wrapper% .message.error{background-color: transparent; color: [bls_txtError]; display: block;}',

        '%wrapper% .message.editorView { border: 1px dashed #d1d1d1; background-color: #eee; color: #d1d1d1; display: block;}',

        'input:-moz-placeholder, textarea:-moz-placeholder                     { color:[bls_labelTxt];}',
        'input.isPlaceholder, textarea.isPlaceholder                           { color:[bls_labelTxt];}',
        'input::-moz-placeholder, textarea::-moz-placeholder                   { color:[bls_labelTxt];}',
        'input:-ms-input-placeholder, textarea:-ms-input-placeholder           { color:[bls_labelTxt];}',
        'input::-webkit-input-placeholder, textarea::-webkit-input-placeholder { color:[bls_labelTxt];}',

        '%wrapper% .table-row{display: table-row; width: 100%;}',
        '%wrapper% .table{display: table; width: 100%;position: relative;}',
        '%wrapper% .email-wrapper {' +
            'border-color: transparent;' +
            'position: absolute; ' +
            'left: 0; ' +
            'right: 0; ' +
            'bottom: 0; ' +
            'display: block;' +
            '[bls_fnt]' +
            '[bls_shd_input];' +
            'border: [bls_brw] solid [bls_brd];' +
            'background-color: [bls_bg1];' +
            'padding: 6px;' +
        '}',
        '%wrapper% .table-cell{display: table-cell; width: 100%; vertical-align: bottom}',

        '[state~=right]                                                         { direction:rtl; text-align: right; }',
        '[state~=left]                                                          { direction:ltr; text-align: left; }',
        '[state~=right] %phoneField%                                            { direction:ltr; text-align: left; }',

//        '[state~=right][state~="mobile"] .drop-list .selected { padding-right: 20px; }',

        '[state~="mobile"] %wrapper% .table {display: block; width: 100%;}',

        '[state~="mobile"] %wrapper% .table-row {display: block; width: 100%;}',

        '[state~="mobile"] %wrapper% .table-cell {display: block; width: 100%; vertical-align: bottom}',

        '[state~="mobile"] %wrapper% .container ul li.table-view span{ display: block; padding-right: 0px; padding-left: 0px;}',
        '[state~="mobile"] %wrapper% .container ul li.table-view span input{ margin-bottom: 0}',

        '[state~="mobile"] %wrapper% .container ul li { margin-left: 0;  margin-right: 0; }',

        '[state~="mobile"] input                                                { font-size: 14px; padding: 0 5px; margin:0 0 5px 0; height: 45px; line-height: normal; -webkit-appearance: none }',

        '[state~="mobile"] .drop-list                                           { height: 45px; margin-top: 0; line-height: 45px; width: 86px;}',
        '[state~="mobile"] .drop-list .selected                                 { height: 45px; line-height: 35px; font-size: 14px; }',
        '[state~="mobile"] %wrapper% .phoneField .forPhone                      { left: 96px; }',

        '[state~="mobile"] select                                               { font-size: 14px; height: 45px; line-height: 45px; }',
        '[state~="mobile"] %wrapper% em                { font-size: 10px; margin: 10px 0;}',
        '[state~="mobile"] div.button                                           { margin-top: 5px; }',
        '[state~="mobile"] div.button span                                      { display: block; text-align: center; padding: 0; width:100% }',
        '[state~="mobile"] %wrapper% a.submit {' +
            'margin-left: 0px; ' +
            'margin-right: 0px; ' +
            'max-width: auto; ' +
            'min-width: auto; ' +
            'margin-top: 10px; ' +
            'text-align: center; ' +
        '}'

    ]);
});