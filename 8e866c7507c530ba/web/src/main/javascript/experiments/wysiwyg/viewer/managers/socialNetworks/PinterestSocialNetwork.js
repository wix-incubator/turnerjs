resource.getResourceValue('SN.BaseSocialNetwork', function(baseNetwork){
    var pi = Object.create(baseNetwork);

    pi["name"] = "pi";
    pi["iconName"] = {
        "light": "pi_light.png",
        "default": "pi_dark.png"
    };

    pi["label"] = "Share on Pinterest";


    define.resource('SN.PinterestSocialNetwork', pi);
});
