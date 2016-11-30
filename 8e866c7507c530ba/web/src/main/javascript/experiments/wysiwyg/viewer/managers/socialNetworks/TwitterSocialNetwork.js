resource.getResourceValue('SN.BaseSocialNetwork', function(baseNetwork){
    var tw = Object.create(baseNetwork);

    tw["name"] = "tw";

    tw["iconName"] = {
        "light": "tw_light.png",
        "default": "tw_dark.png"
    };

    tw["label"] = "Share on Twitter";



    define.resource('SN.TwitterSocialNetwork', tw);
});
