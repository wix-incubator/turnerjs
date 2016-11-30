define.experiment.newDataSchema('OnlineClock.OnlineClock', function () {
    return {
        "location": {
            "type": "string",
            "default": ""
        },
        "latitude": {
            "type": "decimal",
            "default": 0
        },
        "longitude": {
            "type": "decimal",
            "default": 0
        }
    };
});
