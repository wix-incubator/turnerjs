define.experiment.skin('wysiwyg.common.components.subscribeform.editor.skins.SubscribeFormPanelSkin.SubscribeFormSendNewsletter', function(skinDefinition, strategy) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.compParts(strategy.merge({
        sendNewslettersLabel: {
            skin: Constants.PanelFields.Label.skins.default
        },
        sendNewsletters: {
            skin: Constants.PanelFields.ButtonField.skins.blue
        }
    }));

    def.html(
            '<div skinPart="content">'
            +   '<fieldset>'
            +       '<div skinpart="email"></div>'
            +       '<div skinpart="bbcEmail"></div>'
            +       '<div skinpart="labelText"></div>'
            +   '</fieldset>'
            +   '<fieldset>'
            +       '<div skinpart="sendNewslettersLabel"></div>'
            +       '<div skinpart="sendNewsletters"></div>'
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

    def.css(strategy.merge(
        [
            '%content% %sendNewsletters% {font-size: 13px;}'
        ])
    );
});