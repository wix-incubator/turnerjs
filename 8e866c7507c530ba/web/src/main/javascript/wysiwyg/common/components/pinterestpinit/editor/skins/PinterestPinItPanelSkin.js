define.skin('wysiwyg.common.components.pinterestpinit.editor.skins.PinterestPinItPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

	def.skinParams([
        {'id':'$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'},
        { "id": "$WebThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" }
    ]);

	def.compParts({
        selectImage: {skin: Constants.PanelFields.ImageField.skins['default']},
        description: {skin: Constants.PanelFields.Input.skins['default']},
        counterPosition: {skin: Constants.PanelFields.ComboBox.skins['default']},
        size: {skin: Constants.PanelFields.ComboBox.skins['default']},
        color: {skin: Constants.PanelFields.ComboBox.skins['default']}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="selectImage"></div>' +
                '<div skinpart="description"></div>' +
                '<p class="note">' + W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_note') + '</p>' +
                '<div skinpart="preview">' +
                    '<p class="title">' +
                        '<span>' + W.Resources.get('EDITOR_LANGUAGE', 'PinterestPinIt_preview') + '</span>' +
                    '</p>' +
                    '<figure class="frame empty">' +
                        '<div class="imgCont">' +
                            '<img class="img" src="">' +
                        '</div>' +
                        '<figcaption class="desc"></figcaption>' +
                    '</figure>' +
                '</div>' +
            '</fieldset>' +
            '<fieldset skinpart="extraSets" class="hidden">' +
                '<div skinpart="counterPosition"></div>' +
                '<div skinpart="size"></div>' +
                '<div skinpart="color"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        'strong {font-size: 12px;}',
        '%selectImage%, %description%, %.note% {margin-bottom: 15px;}',
        '%preview% {position: relative;}',
        '%preview% .title {position: relative; text-align: center;}',
        '%preview% .title:before {background-color: rgb(180, 180, 180); content: ""; height: 1px; left: 0; position: absolute; top: 50%; width: 100%; z-index: 0;}',
        '%preview% .title span {background-color: #fff; padding: 10px; position: relative;}',
        '%preview% .frame {border: 1px solid rgb(180, 180, 180); border-radius: 3px; margin: 15px auto; max-width: 200px; padding: 5px 5px 0 5px; position: relative; text-align: center; width: 200px;}',
        '%preview% .frame.empty {min-height: 130px;}',
        '%preview% .frame.portrait {width: auto;}',
        '%preview% .frame .imgCont {display: inline-block; max-height: 250px; outline: 1px solid rgb(180, 180, 180); overflow: hidden; width: 100%;}',
        '%preview% .frame.empty .imgCont {background: url([$WebThemeDir]add_image_thumb.png) no-repeat center 30%; height: 110px;}',
        '%preview% .frame.portrait .imgCont {height: 250px; width: auto;}',
        '%preview% .frame .imgCont .img {display: block; opacity: 0; width: 100%; }',
        '%preview% .frame .imgCont .img.animation {transition: opacity .2s; -webkit-transition: opacity .2s;}',
        '%preview% .frame .imgCont .img.animation.end {opacity: 1}',
        '%preview% .frame.portrait .imgCont .img {height: 100%; width: auto;}',
        '%preview% .desc {margin: 5px 0; text-align: center; word-wrap: break-word;}'
    ]);
});
