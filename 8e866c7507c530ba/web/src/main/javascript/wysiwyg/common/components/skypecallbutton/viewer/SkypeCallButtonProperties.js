define.dataSchema('SkypeCallButtonProperties', {
    "imageSize": {
        "type": "string",
        "enum": ["small", "medium", "large"],
        "default": "medium"
    },
    "imageColor": {
        "type": "string",
        "enum": ["blue", "white"],
        "default": "blue"
    }
});
