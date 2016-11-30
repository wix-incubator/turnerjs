define.dataSchema('SkypeCallButton', {
    "skypeName": "string",
    "buttonType": {
        "type": "string",
        "enum": ["call", "chat"],
        "default": "call"
    }
});
