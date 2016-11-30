define.skin('mock.viewer.skins.BasicContactFormSkin', function(SkinDefinition) {
    var def = SkinDefinition;
    def.inherits('core.managers.skin.BaseSkin2');
    def.skinParams([]);
    def.css([]);
    def.html(
            '<div skinpart="wrapper">'
            + '<input type="text" skinpart="name"/>'
            + '<input type="text" skinpart="email"/>'
            + '<input type="text" skinpart="phone"/>'
            + '<input type="text" skinpart="address"/>'
            + '<input type="text" skinpart="subject"/>'
            + '<textarea skinpart="message"></textarea>'
            + '<button skinpart="submit">submit</button>'
            + '<span skinpart="notifications"></span>'
            + '</div>'
    );
});

