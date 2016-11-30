define.skin('wysiwyg.common.components.subscribeform.editor.skins.SubscribeFormPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
	
	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);
	
	def.compParts({
        email: {
            skin: Constants.PanelFields.Input.skins.default
        },
        bbcEmail: {
            skin: Constants.PanelFields.Input.skins.default
        },
        labelText: {
            skin: Constants.PanelFields.Label.skins.default
        },
        customizeLabel: {
            skin: Constants.PanelFields.Label.skins.default
        },
        customizeAnnotationAsterisk: {
            skin: Constants.PanelFields.Label.skins.default
        },
        textDirectionLabel: {
            skin: Constants.PanelFields.Label.skins.default
        },
        textDirectionField: {
            skin: Constants.PanelFields.RadioImages.skins.default
        },
        subscribeFormTitle: {
            skin: Constants.PanelFields.TextArea.skins.default
        },
        firstNameFieldCheckBox: {
            skin: Constants.PanelFields.CheckBox.skins.default
        },
        firstNameField: {
            skin: Constants.PanelFields.Input.skins.default
        },
        firstNameFieldAsterisk: {
            skin: Constants.PanelFields.CheckBoxImage.skins.default
        },
        lastNameFieldCheckBox: {
            skin: Constants.PanelFields.CheckBox.skins.default
        },
        lastNameField: {
            skin: Constants.PanelFields.Input.skins.default
        },
        lastNameFieldAsterisk: {
            skin: Constants.PanelFields.CheckBoxImage.skins.default
        },
        emailFieldCheckBox: {
            skin: Constants.PanelFields.CheckBox.skins.default
        },
        emailField: {
            skin: Constants.PanelFields.Input.skins.default
        },
        emailFieldAsterisk: {
            skin: Constants.PanelFields.CheckBoxImage.skins.default
        },
        phoneFieldCheckBox: {
            skin: Constants.PanelFields.CheckBox.skins.default
        },
        phoneField: {
            skin: Constants.PanelFields.Input.skins.default
        },
        phoneFieldAsterisk: {
            skin: Constants.PanelFields.CheckBoxImage.skins.default
        },
        changeStyle:{
            skin: Constants.PanelFields.ButtonField.skins.blueWithArrow
        },
        buttonText: {
            skin: Constants.PanelFields.TextArea.skins.default
        },
        successMessage: {
            skin: Constants.PanelFields.TextArea.skins.default
        },
        errorMessageEmail: {
            skin: Constants.PanelFields.TextArea.skins.default
        },
        errorMessageMandatory: {
            skin: Constants.PanelFields.TextArea.skins.default
        },
        addAnimation: {
            skin: Constants.PanelFields.ButtonField.skins.withArrow
        }
    });

    def.html(        
    	'<div skinPart="content">'
        +   '<fieldset>'
        +       '<div skinpart="email"></div>'
        +       '<div skinpart="bbcEmail"></div>'
        +       '<div skinpart="labelText"></div>'
        +   '</fieldset>'
        +   '<fieldset>'
        +       '<div skinpart="changeStyle"></div>'
        +   '</fieldset>'
        +   '<fieldset>'
        +       '<div skinpart="textDirectionLabel"></div>'
        +       '<div skinpart="textDirectionField"></div>'
        +   '</fieldset>'
        +   '<fieldset>'
        +       '<div skinPart="customizeLabel"></div>'
        +       '<div skinPart="customizeAnnotationAsterisk"></div>'
        +       '<div class="inputGroup">'
        +           '<div skinpart="firstNameFieldCheckBox"></div>'
        +           '<div skinpart="firstNameField"></div>'
        +           '<div skinpart="firstNameFieldAsterisk"></div>'
        +       '</div>'
        +       '<div class="inputGroup">'
        +           '<div skinpart="lastNameFieldCheckBox"></div>'
        +           '<div skinpart="lastNameField"></div>'
        +           '<div skinpart="lastNameFieldAsterisk"></div>'
        +       '</div>'
        +       '<div class="inputGroup">'
        +           '<div skinpart="emailFieldCheckBox"></div>'
        +           '<div skinpart="emailField"></div>'
        +           '<div skinpart="emailFieldAsterisk"></div>'
        +       '</div>'
        +       '<div class="inputGroup">'
        +           '<div skinpart="phoneFieldCheckBox"></div>'
        +           '<div skinpart="phoneField"></div>'
        +           '<div skinpart="phoneFieldAsterisk"></div>'
        +       '</div>'
        +   '</fieldset>'
        +   '<fieldset>'
        +       '<div skinpart="subscribeFormTitle"></div>'
        +       '<div skinPart="buttonText"></div>'
        +       '<div skinPart="successMessage"></div>'
        +       '<div skinPart="errorMessageEmail"></div>'
        +       '<div skinPart="errorMessageMandatory"></div>'
        +   '</fieldset>'
        +   '<fieldset>'
        +       '<div skinpart="addAnimation"></div>'
        +   '</fieldset>'
        +'</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%content% .inputGroup { position:relative; height:22px; line-height:22px; margin: 10px 0 0 0;}',
        '%content% .inputGroup > div { margin:0; padding:0; border:0; vertical-align:middle; box-sizing: border-box; position:absolute; top:0; bottom:0; }',
        '%content% .inputGroup > div input { margin:0; padding:0; height:22px; line-height:22px; box-sizing: border-box; }',
        '%content% .inputGroup > div input[type="text"]{ border-top-right-radius:0; border-bottom-right-radius:0; padding: 0 3px; }',
        '%content% .inputGroup > div:nth-child(2){ left:25px; right:23px; }',
        '%content% .inputGroup > div:first-child{ width:20px; left:0; }',
        '%content% .inputGroup > div:last-child{ width:25px; right:0; }',
        '%content% [disabled="disabled"] { opacity:0.5; pointer-events: none; }',
        '%customizeAnnotationAsterisk%[state~="hasIcon"] [skinpart="icon"].wysiwyg_editor_skins_inputs_LabelSkin-icon{margin-right: 5px}',
        '%content% textarea {resize: none;}',
        '%content% %labelText% {margin-top: 5px;}'


//        '%content% > div                 { margin:0; padding:0; border:0; vertical-align:middle; box-sizing: border-box; position:absolute; top:0; bottom:0;}',
//        '%content% input                 { margin:0; padding:0; height:22px; line-height:22px; box-sizing: border-box; }',
//        '%content% input[type="text"]    { border-top-right-radius:0; border-bottom-right-radius:0; padding: 0 3px;}',
//        '%content% > div:nth-child(2)    { left:25px; right:23px;}',
//        '%content% > div:first-child     { width:20px; left:0; }',
//        '%content% > div:last-child      { width:25px; right:0;}',


    ]);
});