
resource.getResourceValue('W.Theme', function(WTheme){

    var obj = {
        iconName: '',
        getFullIconUrl: function(){
            return WTheme.getProperty("WEB_THEME_DIRECTORY") + 'social_activity/';
        }
    };

    define.resource('SN.BaseSocialNetwork', obj);
})
