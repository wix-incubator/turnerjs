define.skin('mock.viewer.skins.PasswordLoginSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts(
        {
            passwordInput: {skin:'wysiwyg.viewer.skins.input.TextInputSquareSkin' }
        }
    );
    def.html(
        '<section skinPart="blockingLayer">'+
            '<div skinPart="dialog" class="content"><div class="wrapper">'+

            '<div skinPart="xButton"></div>'+
            '<header skinPart="header">'+
            '<a href="http://www.wix.com" target="_blank" skinPart="faveIconAhref">'+
            '<img src="http://www.wix.com/favicon.ico" skinPart="favIcon" alt="Administator Login" width="16" height="16">'+
            '</a>'+
            '<h3 skinPart="title"></h3>'+
            '</header>'+
            '<div skinPart="passwordInput"></div>'+
//  ==>  This is set for when we support this feature
//                    '<p class="forgot">Forgot your password? <a href="#">Click here</a></p>'+

            '<footer>' +
            '<a skinPart="cancel">Cancel</a>'+
            '<input type="button" skinPart="submitButton" value="Submit" />'+
            '</footer>'+

            '</div></div>'+
            '</section>'
    );
    def.css([]);
});
