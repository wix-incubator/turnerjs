define([], function() {
    "use strict";
    return {
        "circle": {
            "svg": {
                "width": "12",
                "height": "12",
                "viewBox": "0 0 24 24"
            },
            "content": "<circle cx=\"12\" cy=\"12\" r=\"10\"/>"
        },
        "fullCircle": {
            "svg": {
                "width": "24",
                "height": "24",
                "viewBox": "0 0 48 48"
            },
            "content": "<circle class=\"external\" cx=\"24\" cy=\"24\" r=\"22\" />" +
                "<circle class=\"border\" cx=\"24\" cy=\"24\" r=\"10\" />" +
                "<circle class=\"inner\" cx=\"24\" cy=\"24\" r=\"10\" />"
        }
    };
});
