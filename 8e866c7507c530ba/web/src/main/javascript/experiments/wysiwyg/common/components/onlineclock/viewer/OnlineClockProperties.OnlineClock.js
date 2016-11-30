define.experiment.newDataSchema('OnlineClockProperties.OnlineClock', function() {
	return {
        "timeFormat": {
            "type": "string",
            "enum": ["full_24", "short_24", "full_12", "short_12"],
            "default": ""
        },
        "showDate": {
            "type": "boolean",
            "default": true
        },
        "dateFormat": {
            "type": "string",
            "enum": ["monthfirst", "datefirst", "monthfirstshort", "datefirstshort"],
            "default": "monthfirst"
        },
        "mobileTimeFontSize": {
            "type": "number",
            'minimum': 12,
            'maximum': 60
        },
        "mobileDateFontSize": {
            "type": "number",
            'minimum': 12,
            'maximum': 60
        },
        "textAlign": {
            "type": "string",
            "default": "left",
            "enum": ["left",  "center", "right"]
        }
    };
});
