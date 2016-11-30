define.dataSchema('ContactForm', {
    "toEmailAddress": {
        "type": "string",
        "default": ""
    },
    "bccEmailAddress": {
        "type": "string",
        "default": ""
    },
    "nameFieldLabel": {
        "type": "string",
        "default": "Name"
    },
    "emailFieldLabel": {
        "type": "string",
        "default": "Email"
    },
    "phoneFieldLabel": {
        "type": "string",
        "default": "Phone"
    },
    "addressFieldLabel": {
        "type": "string",
        "default": "Address"
    },
    "subjectFieldLabel": {
        "type": "string",
        "default": "Subject"
    },
    "messageFieldLabel": {
        "type": "string",
        "default": "Message"
    },
    "submitButtonLabel": {
        "type": "string",
        "default": "Send"
    },
    "successMessage": {
        "type": "string",
        "default": "Your details were sent successfully!"
    },
    "errorMessage": {
        "type": "string",
        "default": "Please provide a valid email"
    },
    "textDirection": {
        "type": "string",
        "default": "left",
        "enum": ["left", "right"]
    },
    "validationErrorMessage": {
        "type": "string",
        "default": "Please fill in all required fields."
    }
});