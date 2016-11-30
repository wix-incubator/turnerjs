define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutFlat', function(skinDefinition){
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

    def.iconParams({'description': 'Flat Box', 'iconUrl': '/images/wysiwyg/skinIcons/forms/FlatBox.png', 'hidden': false, 'index': 4});

    def.skinParams([
        {'id':'bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'bg2',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'bg3',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_12', lang: 'boxColor'},
        {'id':'bg4',        'type': Constants.SkinParamTypes.BG_COLOR,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},

        {'id':'txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'},

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

        {'id':'shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;'}
    ]);

    def.html(
        '<div skinpart="wrapper" class="wrapper">' +
            '<div class="container">' +
                '<h1 skinpart="formTitle"></h1>' +
                '<div class="table">' +
                    '<div class="table-row">' +
                        '<ul class="table-cell">' +
                            '<li class="table-view">' +
                                '<div>' +
                                    '<label skinpart="firstNameFieldLabel" class="hidden"></label>' +
                                    '<span class="row hidden"><input skinpart="firstNameField" type="email" placeholder="First name" name="first"/></span>' +
                                    '<label skinpart="lastNameFieldLabel" class="hidden"></label>' +
                                    '<span class="row hidden"><input skinpart="lastNameField" type="email" placeholder="Last name" name="last"/></span>' +
                                '</div>' +
                            '</li>' +
                            '<label skinpart="phoneFieldLabel" class="hidden"></label>' +
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
                            '<label skinpart="emailFieldLabel" class="hidden"></label>' +
                            '<li class="row hidden">' +
                                '<span><input skinpart="emailField" name="email" type="email" placeholder="enter your e-mail address"/></span>' +
                            '</li>' +
                        '</ul>' +
                        '<div class="table-cell">' +
//                            '<em skinpart="phoneMessage" class="hidden">(Charges may apply. Text *STOP* anytime to unsubscribe.)</em>' +
                            '<div class="button"><button skinpart="submit" class="hidden">Subscribe Now</button></div>' +
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
            'background-color: [bg3];' +
            'padding: 30px 24px;' +
            '[shd]'+
        '}',
        '%wrapper% .container h1{ padding: 0; margin: 0 0 10px 0; [tfnt]; color: [titleColor]}',
        '%wrapper% .container ul{ margin: 0; padding: 0; position: relative; }',
        '%wrapper% .container ul li{ list-style: none; margin-top: 10px; margin-right: 10px; }',

        '[state~=right] %wrapper% .container ul li{ margin-left: 10px; margin-right: 0px; }',

        '%wrapper% .container ul li:first-child{ margin-top: 20px;}',

        '%wrapper% li>span { display: inline-block; margin: 0 10px 0px 0; width: 100%; }',

        '[state~=right] %wrapper% li>span { margin: 0 0 0 10px; }',

        '%wrapper% input {' +
            'margin: 0;' +
            '[box]' +
            'color: [txt1];' +
            'background-color: [bg1];' +
            '[fnt]' +
            'border: [brw] solid [brd];' +
            'padding: 7px;' +
            'width: 100%;' +
            'line-height: normal;' +
        '}',

        '%wrapper% em {display: block; margin: 0px 0px 10px 15px; font-size: 10px; color: [txt1]; }',

        '[state~=right] %wrapper% em {margin: 0px 15px 10px 0;}',

        '%wrapper% .button{ display: block; }',

        '%wrapper% .button button{' +
            'border: none;' +
            'display: block;'+
            'margin: 0px;' +
            'margin-left: 15px;' +
            '[box]' +
            'color: [txt2];' +
            '[fnt2];' +
            'padding: calc(7px + [brw]) calc(24px + [brw]);' +
            'max-width: 250px;' +
            'overflow: hidden;' +
            'background-color: [bg2];'+
            'white-space: nowrap;'+
            'line-height: normal;'+
        '}',

        '%wrapper% .button button:active, %wrapper% .button button:hover{ color: [txt3]; [bg4]}',

        '[state~=right] %wrapper% .button button{ margin-right: 15px; margin-left: 0px; }',

        '%wrapper% .phoneField { position: relative; }',
        '%wrapper% .phoneField .drop-list { background-color: [bg1]; border: [brw] solid [brd]; display: inline-block; width: 106px; position: relative; padding: 0; vertical-align: top; overflow: hidden; white-space: nowrap; border: [brw] solid [brd]; [box]}',
        '%wrapper% .phoneField .drop-list .selected { background: transparent; display: block; color: [txt1]; overflow: hidden; width: 100%; margin: 0; [fnt]; text-align: center; border: 0; padding: 6px 20px 6px 7px;}',
        '%wrapper% .phoneField .drop-list .after { ' +
            'position: absolute; ' +
            'top: 5px; ' +
            'right: 5px; ' +
            'bottom: 5px; ' +
            'text-align: center; ' +
            'padding: 5px; ' +
            'width: 14px;'+
            'background-color: [bg3]; ' +
            'background-repeat: no-repeat; ' +
            'background-position: center; ' +
            '[fnt]' +
        '}',
        '%wrapper% .phoneField .drop-list .after svg {position: absolute; top: 50%; margin-top: -4px; left: 50%; margin-left: -8px;}',
        '%wrapper% .phoneField .drop-list .after polygon {fill: [bg1]}',
        '%wrapper% .phoneField .drop-list select { position: absolute; width: 100%; height: 100%; top: 0; background-image: none; border: 0px; opacity: 0; filter: alpha(opacity=0); }',
        '%wrapper% .phoneField .forPhone { position: absolute; display: block; left: 116px; right: 0px; top: 0; }',

        '%wrapper% .container ul li.table-view{ margin: 0px; }',

        '[state~=right] %wrapper% .container ul li.table-view{ margin: 0px; }',

        '%wrapper% .container ul li.table-view div{ display: table; width: 100% }',

        '%wrapper% .container ul li.table-view span{ display: table-cell; padding-right: 10px;}',

        '[state~=right] %wrapper% .container ul li.table-view span{ padding-left: 10px; padding-right: 0px;}',

        '%wrapper% .container ul li.table-view span input{ margin-top: 10px;}',

        'input.error{ border-width: 1px;border-color: [txtError]; color: [txtError]; [box]}',

        '%wrapper% .container div.error{ [efnt]; color: [txtError]; padding-top: 5px;}',

        '%wrapper% .message{ margin: 15px 0 0 0; background-color: #26e089; text-align: center; [efnt]; padding: 10px 0; display: none;}',
        '%wrapper% .message.success{background-color: transparent; color: [txtSuccess]; display: block;}',
        '%wrapper% .message.error{background-color: transparent; color: [txtError]; display: block;}',

        '%wrapper% .message.editorView { border: 1px dashed #d1d1d1; background-color: #eee; color: #d1d1d1; display: block;}',
        'input:invalid {' +
            'box-shadow: none !important;' +
        '}',
        'input:-moz-placeholder, textarea:-moz-placeholder                     { color:[labelTxt];}',
        'input.isPlaceholder, textarea.isPlaceholder                           { color:[labelTxt];}',
        'input::-moz-placeholder, textarea::-moz-placeholder                   { color:[labelTxt];}',
        'input:-ms-input-placeholder, textarea:-ms-input-placeholder           { color:[labelTxt];}',
        'input::-webkit-input-placeholder, textarea::-webkit-input-placeholder { color:[labelTxt];}',

        '%wrapper% .table{display: table; width: 100%;}',
        '%wrapper% .table-row{display: table-row; width: 100%;}',
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
        '[state~="mobile"] %wrapper% .button button { margin-left: 0px; margin-right: 0px; max-width: auto; min-width: auto; width:100%; }'

    ]);
});