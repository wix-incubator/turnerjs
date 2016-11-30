resource.getResourceValue('SN.BaseSocialNetwork', function(baseNetwork){
    var fb = Object.create(baseNetwork);

    fb["name"] = "fb";

    fb["iconName"] = {
        "light": "fb_light.png",
        "default": "fb_dark.png"
    };

    fb["label"] = "Share on FaceBook";

    define.resource('SN.FacebookSocialNetwork', fb);
});
