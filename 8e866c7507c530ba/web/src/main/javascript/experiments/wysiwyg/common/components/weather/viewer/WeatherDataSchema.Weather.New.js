define.experiment.newDataSchema('Weather.Weather.New', function() {
    return {
        "locationId" : "string",
        "locationName" : "string",
        "degreesUnit" : {
            "type" : "string",
            "enum" : ["fahrenheit", "celsius"],
            "default" : "fahrenheit"
        }
    };
});
