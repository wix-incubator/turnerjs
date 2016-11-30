define.skin('wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        hidePlaceholders : false,
        successMessageOutside: true,
        sizeLimits: {
            minW: 800,
            minH: 81,
            maxW: 1000,
            maxH: 300
        }
    });

    def.iconParams({'description': 'Transparent', 'iconUrl': '/images/wysiwyg/skinIcons/forms/CleanLong.png', 'hidden': false, 'index': 6});

    def.skinParams([
        {'id':'llt_bg1',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_11', lang: 'fieldBg'},
        {'id':'llt_bg2',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_19', lang: 'buttonBg'},
        {'id':'llt_bg3',        'type': Constants.SkinParamTypes.COLOR_ALPHA, styleDefaults: {alpha: 0.01},      'defaultTheme': 'color_11', lang: 'boxColor'},
        {'id':'llt_bg4',        'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_18', lang: 'BUTTON_BG_HOVER_COLOR'},
        {'id':'llt_icon_color', 'type': Constants.SkinParamTypes.COLOR_ALPHA,      'defaultTheme': 'color_12', lang: 'ICON_COLOR'},

        {'id':'llt_txt1',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'fieldTxt'},
        {'id':'llt_txt2',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_11', lang: 'buttonTxt'},
        {'id':'llt_txt3',       'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_15', lang: 'BUTTON_TEXT_HOVER_COLOR'},

        {'id':'llt_titleColor', 'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_15', enableEdit:true, lang: 'titleTxt'},
        {'id':'llt_labelTxt',   'type': Constants.SkinParamTypes.COLOR,         'defaultTheme': 'color_12', enableEdit:true, lang: 'labelTxt'},
        {'id':'llt_txtError',   'type': Constants.SkinParamTypes.COLOR,         'defaultValue': '#8B0000', enableEdit:true, lang: 'txtError'},
        {'id':'llt_txtSuccess', 'type': Constants.SkinParamTypes.COLOR,         'defaultValue': 'rgba(186,218,85,1)', enableEdit:true, lang: 'txtSuccess'},

        {'id':'llt_brd',        'type': Constants.SkinParamTypes.COLOR_ALPHA,   'defaultTheme': 'color_12', lang: 'brd'},
        {'id':'llt_brw',        'type': Constants.SkinParamTypes.SIZE,          'defaultValue': '1px', lang: 'brw'},

        {'id':'llt_tfnt',        'type': Constants.SkinParamTypes.FONT,         'defaultTheme': 'font_6', lang:'titleFont'},
        {'id':'llt_fnt',        'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang:'fieldFont'},
        {'id':'llt_fnt2',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'buttonFont'},
        {'id':'llt_efnt',       'type': Constants.SkinParamTypes.FONT,          'defaultTheme': 'font_9', lang: 'notificationFont'},

        {'id':'llt_shd',        'type': Constants.SkinParamTypes.BOX_SHADOW,    'defaultValue': '0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }, lang: 'shd'},

        {'id':'llt_box',        'type': Constants.SkinParamTypes.OTHER,         'defaultValue': '-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;', lang: 'box'}
    ]);

    def.html(
        '<div class="wrapper" skinpart="wrapper">' +
            '<div class="container">' +
                '<div class="table invertible">' +
                    '<div class="table-row">' +
                        '<div class="table-cell table-cell-container">' +
                            '<div class="table fixed">' +
                                '<div class="table-row">' +
                                    '<div class="table-cell table-cell-title">' +
                                        '<div>' +
                                        '<i class="icon-envelope">' +
                                            '<svg width="54" height="54" xmlns="http://www.w3.org/2000/svg">' +
                                                '<g>' +
                                                    '<ellipse fill="" fill-opacity="0.0" stroke="" stroke-width="3" cx="27" cy="27" id="svg_1" rx="24" ry="24"/>' +
                                                    '<rect fill="" fill-opacity="0.0" stroke="#ffffff" stroke-width="3" stroke-linejoin="null" stroke-linecap="null" x="14.75" y="20" width="24" height="16" id="svg_3"/>' +
                                                    '<line fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="null" stroke-linecap="null" x1="15.5" y1="25.75" x2="29.58013" y2="25.75" id="svg_10" transform="rotate(37.00132751464844 22.540069580078132,25.749999999999996) "/>' +
                                                    '<line fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="null" stroke-linecap="null" x1="23.95994" y1="25.75" x2="38.04007" y2="25.75" id="svg_11" transform="rotate(-36.52885437011719 31,25.750000000000007) "/>' +
                                                '</g>' +
                                            '</svg>' +
                                        '</i>' +
                                        '</div>' +
                                        '<h1 class="title with-envelope-icon" skinpart="formTitle">Subscribe for updates</h1>' +
                                    '</div>' +
                                    '<label skinpart="emailFieldLabel" class="hidden"></label>' +
                                    '<div class="table-cell">' +
                                        '<input class="input" skinpart="emailField" placeholder="enter your e-mail address" name="email" type="email"/>' +
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
                                                    '<div class="table-cell row bottom">' +
                                                        '<input class="input" skinpart="firstNameField" name="first" placeholder="First Name" type="text"/>' +
                                                    '</div>' +
                                                    '<label skinpart="lastNameFieldLabel" class="hidden"></label>' +
                                                    '<div class="table-cell row bottom">' +
                                                        '<input class="input" skinpart="lastNameField" name="last" placeholder="Last Name" type="text"/>' +
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
                                '<button skinpart="submit">Subscribe Now</button>' +
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
            'background-color: [llt_bg3];' +
            'padding: 4px 24px 24px 24px;' +
            'border-top: 1px solid [llt_brd];' +
            'border-bottom: 1px solid [llt_brd];' +
            '[llt_shd]' +
        '}',

        '[state~=right] %wrapper% .container {' +
            'padding-right: 4px;' +
        '}',
        '%wrapper% .table-cell.table-cell-container {' +
            'padding-right: 4px;' +
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
            'padding-right: 20px;' +
            'padding-top: 10px;' +
        '}',

        '%wrapper% .table-cell.table-cell-title {' +
            'position: relative;' +
            'vertical-align: middle;' +
        '}',
        '%wrapper% .table-cell.bottom {' +
            'padding-top: 20px' +
        '}',
        '%wrapper% .table-cell.with-inner-table {' +
            'padding-right: 0;' +
            'padding-top: 0;' +
        '}',
        '%wrapper% .table-cell.table-cell-button-container {' +
            'padding-right: 0;' +
        '}',
        '%wrapper% .button button {' +
            '[llt_fnt2];' +
            'white-space: nowrap;' +
            'max-width: 250px;' +
            'overflow: hidden;' +
            'color: [llt_txt2];' +
            'padding: calc(7px + [llt_brw]) calc(24px + [llt_brw]);' +
            'margin: 0;' +
            '[llt_box]' +
            'display: block;' +
            'background-color: [llt_bg2];'+
            'border: none;' +
//            'line-height: normal;' +
        '}',
        '%wrapper% .button button:active {' +
            'color: [llt_txt3]; ' +
            'background-color: [llt_bg4];' +
        '}',
        '%wrapper% .button button:hover {' +
            'color: [llt_txt3]; ' +
            'background-color: [llt_bg4];' +
        '}',

        '%wrapper% .icon-envelope {' +
            'width: 54px;' +
            'height: 54px;' +
            'display: block;' +
            'float: left;' +
            'position: absolute;' +
            'top: 0;' +
            'background-color: [llt_icon_color];' +
            'border-radius: 50%;' +
        '}',

        '[state~=mobile] %wrapper% .icon-envelope {' +
            'position: initial;' +
        '}',

        '%wrapper% .title {' +
            '[llt_tfnt]' +
            'color: [llt_titleColor];' +
            'vertical-align: middle;' +
        '}',
        '%wrapper% .with-envelope-icon {' +
            'padding-left: 65px;' +
        '}',
        '[state~=right] %wrapper% .with-envelope-icon {' +
            'padding-right: 65px;' +
            'padding-left: 0;' +
        '}',
        '%wrapper% .input {' +
            '[llt_box]' +
            'color: [llt_txt1];' +
            'background-color: [llt_bg1];' +
            '[llt_fnt]' +
            'padding: 7px;' +
            'width: 100%;' +
            'border: [llt_brw] solid [llt_brd];' +
            'margin: 0' +
        '}',

        'input:invalid {' +
            'box-shadow: none !important;' +
        '}',

        '%wrapper% .input:-ms-input-placeholder {' +
            'color: [llt_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% input.isPlaceholder {' +
            'color: [llt_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input::-moz-placeholder {' +
            'color: [llt_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input:-ms-input-placeholder {' +
            'color: [llt_labelTxt];' +
            'padding-left: 15px;' +
        '}',
        '%wrapper% .input::-webkit-input-placeholder {' +
            'color: [llt_labelTxt];' +
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
            'padding-top: 20px;' +
            'position: relative;' +
        '}',
        '%wrapper% .phone .note {' +
            'font-size: 13px;' +
            'position: absolute;' +
            'color: [llt_txt1];' +
            'left: 0' +
        '}',
        '%wrapper% .phone_wrapper {' +
            'padding-right: 20px;' +
            'direction: initial;' +
        '}',

        '%wrapper% .phoneField {' +
            'position: relative;' +
        '}',
        '%wrapper% .phoneField .drop-list {' +
            'background-color: [llt_bg1];' +
            'display: inline-block;' +
            'width: 106px;' +
            'position: relative;' +
            'padding: 0;' +
            'vertical-align: top;' +
            'overflow: hidden;' +
            'white-space: nowrap;' +
            'border: [llt_brw] solid [llt_brd];' +
            '[llt_box]' +
        '}',
        '%wrapper% .phoneField .drop-list .selected {' +
            'background-color: transparent;' +
            'display: block;' +
            'color: [llt_txt1]' +
            'overflow: hidden;' +
            'width: 100%;' +
            'margin: 0;' +
            '[llt_fnt]' +
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
            'background-color: [llt_bg3];' +
            'background-repeat: no-repeat;' +
            'background-position: 50% 50%;' +
            '[llt_fnt];' +
        '}',
        '%wrapper% .phoneField .drop-list .after svg {' +
            'position: absolute;' +
            'top: 50%;' +
            'margin-top: -4px;' +
            'left: 50%;' +
            'margin-left: -8px;' +
        '}',
        '%wrapper% .phoneField .drop-list .after polygon {' +
            'fill: [llt_bg1];' +
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
            '[llt_efnt]' +
//            '[llt_shd]' +
            'background-color: #26e089;' +
            'display: none;' +
        '}',
        '%wrapper% .message.success {' +
            'background-color: transparent;' +
            'color: [llt_txtSuccess];' +
            'display: block;' +
        '}',
        '%wrapper% .message.error{' +
            'background-color: transparent;' +
            'color: [llt_txtError];' +
            'display: block;' +
        '}',
        '%wrapper% .message.editorView {' +
//            'border: 1px solid rgb(209, 209, 209);' +
            'background-color: [llt_bg3];' +
            'display: block;' +
            'color: rgb(209, 209, 209);' +
        '}',

        '%wrapper% input.error{ border-width: 1px; border-color: [llt_txtError]; color: [llt_txtError];}',
        '%wrapper% .container div.error{ [llt_efnt]; color: [llt_txtError]; padding-top: 5px;}',

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
        '[state~="mobile"] %wrapper% .button button {' +
            'margin-left: 0;' +
            'margin-right: 0;' +
            'max-width: initial;' +
            'min-width: initial;' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .line {' +
            'overflow: hidden;' +
        '}',
        '[state~="mobile"] %wrapper% .line .line-item {' +
            'width: 100%;' +
        '}',
        '[state~="mobile"] %wrapper% .line .line-item.phone {' +
            'padding-bottom: 5px;' +
        '}',
        '[state~="mobile"] %wrapper% .phone_wrapper {' +
            'padding-right: 0;' +
        '}'
        
    ]);
});