define.experiment.newDataSchema('SocialActivitySettings.SocialActivity', function(){
    return {
        "activeNetworks": {
            "type": "enumArray",
            "enum": ["fb", "tw", "pi"],
            "default": ["fb", "tw", "pi"]
        },
        "iconSize": {
            "type": "number"
        },
        "showCondition": {
            "type": "number",
            "default": 1
        },
        "theme": {
            "type": "string",
            "enum": ["default", "light"]
        }
    };
});