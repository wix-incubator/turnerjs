define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutFlat', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders : false,
        successMessageOutside: true,
        sizeLimits: {
            minW: 724,
            minH: 85,
            maxW: 1000,
            maxH: 300
        }
    });

    def.iconParams({'description': 'Flat Horizontal', 'iconUrl': '/images/wysiwyg/skinIcons/forms/FlatLong.png', 'hidden': false, 'index': 5});

    def.skinParams([
        {'id':'llf_bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'llf_bg2',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'llf_bg3',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_12', lang: 'boxColor'},
        {'id':'llf_bg4',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},

        {'id':'llf_txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'llf_txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'llf_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'},

        {'id':'llf_titleColor', 'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_15', enableEdit:true, lang: 'titleTxt'},
        {'id':'llf_labelTxt',   'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_12', enableEdit:true, lang: 'labelTxt'},
        {'id':'llf_txtError',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': '#8B0000', enableEdit:true, lang: 'txtError'},
        {'id':'llf_txtSuccess', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(186,218,85,1)', enableEdit:true, lang: 'txtSuccess'},

        {'id':'llf_brd',        'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_12', lang: 'brd'},
        {'id':'llf_brw',        'type': Constants.SkinParamTypes.SIZE,          'defaultValue': '1px', lang: 'brw'},

        {'id':'llf_tfnt',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_6', lang:'titleFont'},
        {'id':'llf_fnt',        'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang:'fieldFont'},
        {'id':'llf_fnt2',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'buttonFont'},
        {'id':'llf_efnt',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'notificationFont'},

        {'id':'llf_shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }, lang: 'shd'},

        {'id':'llf_box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;', lang: 'box'}
    ]);

    def.html(
        '<div class="wrapper" skinpart="wrapper">' +




            '<div class="container">' +
                '<div class="table invertible">' +
                    '<div class="table-row">' +
                        '<div class="table-cell table-cell-container">' +
                            '<div class="table fixed">' +
                                '<div class="table-row">' +
                                    '<h1 class="table-cell title" skinpart="formTitle">Subscribe for updates</h1>' +
                                    '<label skinpart="emailFieldLabel" class="hidden"></label>' +
                                    '<div class="table-cell">' +
                                        '<input class="input" skinpart="emailField" placeholder="enter your e-mail address" name="email" type="text"/>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="line">' +
                                '<div class="line-item phone row">' +
                                    '<div class="phone_wrapper">' +
                                        '<label skinpart="phoneFieldLabel" class="hidden"></label>' +
                                        '<div class="phoneField" skinpart="phoneField">' +
                                            '<span class="drop-list">' +
                                                '<input type="text" class="input selected" name="code" data-skip-placeholder="true" disabled="disabled"/>' +
                                                '<span class="after">' +
                                                    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="15px" height="7.634px" viewBox="0 0 12.854 7.634">' +
                                                        '<polygon fill="#FFFFFF" points="11.658,0 6.427,5.231 1.197,0 0,1.197 5.231,6.427 5.221,6.437 6.417,7.634 6.427,7.624 7.624,6.427 12.854,1.197 "/>' +
                                                    '</svg>' +
                                                '</span>' +
                                                '<select data-skip-placeholder="true"></select>' +
                                            '</span>' +
                                            '<div class="forPhone">' +
                                                '<input type="phone" class="input" name="phone" placeholder="Phone number"/>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
//                                    '<em skinpart="phoneMessage" class="note">(Charges may apply. Text *STOP* anytime to unsubscribe.)</em>' +
                                '</div>' +
                                '<div class="line-item table fixed">' +
                                    '<div class="table-row">' +
                                        '<div class="table-cell with-inner-table">' +
                                            '<div class="table fixed">' +
                                                '<div class="table-row">' +
                                                    '<label skinpart="firstNameFieldLabel" class="hidden"></label>' +
                                                    '<div class="table-cell row">' +
                                                        '<input class="input" skinpart="firstNameField" placeholder="First Name" name="first" type="text"/>' +
                                                    '</div>' +
                                                    '<label skinpart="lastNameFieldLabel" class="hidden"></label>' +
                                                    '<div class="table-cell row">' +
                                                        '<input class="input" skinpart="lastNameField" placeholder="Last Name" name="last" type="text"/>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="table-cell table-cell-button-container">' +
                            '<div class="button">' +
                                '<a skinpart="submit">Subscribe Now</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div skinpart="notifications"></div>' +
            '</div>' +
            '<div class="message">' +
                'Your Success/Error Message goes here' +
            '</div>' +
        '</div>'
    );

    def.css([
        '%wrapper%.wrapper {' +
            'width: 100%;' +
        '}',
        '%wrapper% .container {' +
            'background-color: [llf_bg3];' +
            'padding: 30px 24px 40px;' +
            '[llf_shd]' +
        '}',
        '%wrapper% .table-cell.table-cell-container {' +
            'padding-right: 14px;' +
            'padding-top: 0;' +
            'width: 100%;' +
        '}',
        '[state~=right] %wrapper% .table-cell.table-cell-container {' +
            'padding-left: 24px;' +
            'padding-right: 0;' +
        '}',
        '%wrapper% .table {' +
            'display: table;' +
            'width: 100%;' +
        '}',

        '[state~=right] %wrapper% .table.invertible {' +
            'direction: rtl;' +
        '}',
        '%wrapper% .table.fixed {' +
            'table-layout: fixed;' +
        '}',
        '%wrapper% .table-row {' +
            'display: table-row;' +
            'width: 100%;' +
        '}',
        '%wrapper% .table-cell {' +
//            'width: 100%;' +
            'vertical-align: bottom;' +
            'display: table-cell;' +
            'padding-right: 10px;' +
            'padding-top: 10px;' +
        '}',
        '%wrapper% .table-cell.with-inner-table {' +
            'padding-right: 0;' +
            'padding-top: 0;' +
        '}',
        '%wrapper% .table-cell.table-cell-button-container {' +
            'padding-right: 0;' +
        '}',

        '%wrapper% .button {' +
            'margin-bottom: 1px;' +
        '}',

        '%wrapper% .button a {' +
            '[llf_fnt2];' +
            'white-space: nowrap;' +
            'max-width: 250px;' +
            'overflow: hidden;' +
            'color: [llf_txt2];' +
            'padding: calc(6px + [llf_brw]) 24px;' +
            '[llf_box]' +
            'display: block;' +
            'background-color: [llf_bg2];'+

//            'border: [llf_brw] solid [llf_brd];' +
            'border: none;' +
        '}',
        '%wrapper% .button a:active,' +
        '%wrapper% .button a:hover{ ' +
            'color: [llf_txt3]; ' +
            'background-color: [llf_bg4];' +
        '}',
        '%wrapper% .title {' +
            '[llf_tfnt];' +
            'color: [llf_titleColor];' +
            'vertical-align: bottom;' +
        '}',
        '%wrapper% .input {' +
            '[llf_box]' +
            'color: [llf_txt1];' +
            'background-color: [llf_bg1];' +
            '[llf_fnt]' +
            'padding: 7px;' +
            'width: 100%;' +
            'border: [llf_brw] solid [llf_brd];' +
            'margin: 0' +
        '}',

        'input:invalid {' +
            'box-shadow: none !important;' +
        '}',

        '%wrapper% .input:-ms-input-placeholder {' +
            'color: [llf_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input.isPlaceholder {' +
            'color: [llf_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input::-moz-placeholder {' +
            'color: [llf_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input:-ms-input-placeholder {' +
            'color: [llf_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input::-webkit-input-placeholder {' +
            'color: [llf_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .line {' +
            'overflow: hidden;' +
        '}',
        '%wrapper% .line-item {' +
            'float: right;' +
            'width: 50%;' +
        '}',
        '%wrapper% .line-item.phone {' +
            'padding-top: 10px;' +
            'position: relative;' +
        '}',
        '%wrapper% .phone .note {' +
            'font-size: 13px;' +
            'position: absolute;' +
            'color: [llf_txt1];' +
            'left: 0' +
        '}',
        '%wrapper% .phone_wrapper {' +
            'padding-right: 10px;' +
            'direction: initial;' +
        '}',

        '%wrapper% .phoneField {' +
            'position: relative;' +
        '}',
        '%wrapper% .phoneField .drop-list {' +
            'background-color: [llf_bg1];' +
            'display: inline-block;' +
            'width: 106px;' +
            'position: relative;' +
            'padding: 0;' +
            'vertical-align: top;' +
            'overflow: hidden;' +
            'white-space: nowrap;' +
            'border: [llf_brw] solid [llf_brd];' +
            '[llf_box]' +
        '}',
        '%wrapper% .phoneField .drop-list .selected {' +
            'background-color: transparent;' +
            'display: block;' +
            'color: [llf_txt1]' +
            'overflow: hidden;' +
            'width: 100%;' +
            'margin: 0;' +
            '[llf_fnt]' +
            'text-align: center;' +
            'border: 0;' +
            'padding-right: 20px;' +
        '}',
        '%wrapper% .phoneField .drop-list .after {' +
            'position: absolute;' +
            'top: 5px;' +
            'right: 5px;' +
            'bottom: 5px;' +
            'text-align: center;' +
            'padding: 5px;' +
            'width: 14px;' +
            'background-color: [llf_bg3];' +
            'background-repeat: no-repeat;' +
            'background-position: 50% 50%;' +
            '[llf_fnt];' +
        '}',
        '%wrapper% .phoneField .drop-list .after svg {' +
            'position: absolute;' +
            'top: 50%;' +
            'margin-top: -4px;' +
            'left: 50%;' +
            'margin-left: -8px;' +
        '}',
        '%wrapper% .phoneField .drop-list .after polygon {' +
            'fill: [llf_bg1];' +
        '}',
        '%wrapper% .phoneField .drop-list select {' +
            'position: absolute;' +
            'width: 100%;' +
            'height: 100%;' +
            'top: 0;' +
            'background-image: none;' +
            'border: 0;' +
            'opacity: 0;' +
            'filter: alpha(opacity=0);' +
        '}',
        '%wrapper% .phoneField .forPhone {' +
            'position: absolute;' +
            'display: block;' +
            'left: 116px;' +
            'right: 0;' +
            'top: 0;' +
        '}',

        '%wrapper% .message {' +
            'margin: 15px 0 0;' +
            'padding: 10px 0;' +
            'text-align: center;' +
            '[llf_efnt]' +
//            '[llf_shd]' +
            'background-color: #26e089;' +
            'display: none;' +
        '}',
        '%wrapper% .message.success {' +
            'background-color: transparent;' +
            'color: [llf_txtSuccess];' +
            'display: block;' +
        '}',
        '%wrapper% .message.error{' +
            'background-color: transparent;' +
            'color: [llf_txtError];' +
            'display: block;' +
        '}',
        '%wrapper% .message.editorView {' +
            'border: 1px solid rgb(209, 209, 209);' +
            'background-color: rgb(238, 238, 238);' +
            'display: block;' +
            'color: rgb(209, 209, 209);' +
        '}',

        '%wrapper% input.error{border-width: 1px; border-color: [llf_txtError]; color: [llf_txtError];}',
        '%wrapper% .container div.error{ [llf_efnt]; color: [llf_txtError]; padding-top: 5px;}',

        '%wrapper% .container .line .line-item {float: left;}',
        '%wrapper% .container .line .line-item .phone_wrapper .phoneField .drop-list {float: left;}',
        '%wrapper% .container .line .line-item .phone_wrapper .phoneField .forPhone {left: 116px; right: 0;}',
        
        // MOBILE

        '[state~="mobile"] %wrapper% .table {' +
            'display: block;' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .table-row {' +
            'display: block;' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .table-cell {' +
            'display: block;' +
            'width: 100%;' +
            'vertical-align: bottom;' +
        '}',
        '[state~="mobile"] %wrapper% .input {' +
            'font-size: 14px;' +
            'margin:0 0 5px 0;' +
            'height: 45px;' +
            'line-height: normal;' +
            '-webkit-appearance: none;' +
        '}',
        '[state~="mobile"] %wrapper% .drop-list {' +
            'height: 45px;' +
            'margin-top: 0;' +
            'line-height: 45px;' +
            'width: 86px;' +
        '}',
        '[state~="mobile"] %wrapper% .drop-list .selected {' +
            'height: 45px;' +
            'line-height: 45px;' +
            'font-size: 14px;' +
        '}',
        '[state~="mobile"] %wrapper% .phoneField .forPhone {' +
            'left: 96px;' +
        '}',
        '[state~="mobile"] %wrapper% select {' +
            'font-size: 14px;' +
            'height: 45px;' +
            'line-height: 45px;' +
        '}',
        '[state~="mobile"] %wrapper% .note {' +
            'font-size: 10px;' +
            'margin: 0 0 10px;' +
            'left: initial;' +
        '}',
        '[state~="mobile"] %wrapper% div.button {' +
            'margin-top: 5px;' +
        '}',
        '[state~="mobile"] %wrapper% div.button span {' +
            'display: block;' +
            'text-align: center;' +
            'padding: 0;' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .button a {' +
            'margin-left: 0;' +
            'margin-right: 0;' +
            'max-width: initial;' +
            'min-width: initial;' +
            'width: 100%;' +
            'text-align: center; ' +
        '}',
        '[state~="mobile"] %wrapper% .line {' +
            'overflow: hidden;' +
        '}',
        '[state~="mobile"] %wrapper% .line .line-item {' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .line .line-item.phone {' +
            'padding-bottom: 15px;' +
        '}',
        '[state~="mobile"] %wrapper% .phone_wrapper {' +
            'padding-right: 0;' +
        '}'
        
    ]);
});