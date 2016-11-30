define.dataSchema('SubscribeForm', {
    "toEmailAddress": {
        "type": "string"
    },
    "bccEmailAddress": {
        "type": "string", "default": ""
    },
    "firstNameFieldLabel": {
        "type": "string"
    },
    "lastNameFieldLabel": {
        "type": "string"
    },
    "emailFieldLabel": {
        "type": "string"
    },
    "phoneFieldLabel": {
        "type": "string"
    },
    "subscribeFormTitle": {
        "type": "string"
    },
    "textDirection": {
        "type": "string",
        "default": "left",
        "enum": ["left", "right"]
    },
    "submitButtonLabel":{
        "type": "string"
    },
    "successMessage": {
        "type": "string"
    },
    "errorMessage": {
        "type": "string"
    },
    "validationErrorMessage": {
        "type": "string"
    }
});