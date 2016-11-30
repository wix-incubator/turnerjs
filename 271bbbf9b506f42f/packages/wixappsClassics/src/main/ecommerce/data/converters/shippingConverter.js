define(['lodash'], function (_) {
    "use strict";

    function convertCartDestination(destinationData) {
        var destination = null;
        switch (destinationData.type) {
            case 'resolved':
                destination = {'_type': 'PredefinedDestination', 'name': destinationData.name, "shippable": true};
                break;
            case 'unresolved':
                destination = convertCountriesList();
                break;
            default: //not supported
                destination = {"_type": "Destination", "shippable": false};
                break;
        }
        return destination;
    }

    function convertCountriesList(rawData) {
        return {
            "countries": {
                '_type': 'ComboOptionsList',
                'selectedValue': -1,
                'items': _.map(rawData, convertCountryItem),
                "valid": true
            },
            "regions": {
                '_type': 'ComboOptionsList',
                'selectedValue': -1,
                'items': [],
                "valid": true
            },
            "shippable": true,
            "_type": "AdvancedDestination"
        };
    }

    function convertCountryItem(countryData) {
        var country = {
            '_type': 'Option',
            'value': countryData.id,
            'text': countryData.name,
            'regions': {
                '_type': 'ComboOptionsList',
                'selectedValue': -1,
                'items': [],
                valid: true
            }
        };

        if (countryData.regions) {
            country.regions.items = _.map(countryData.regions, function (region) {
                return {
                    '_type': 'Option',
                    'value': region.id,
                    'text': region.name
                };
            });
        }

        return country;
    }

    return {
        convertCountriesList: convertCountriesList,
        convertCartDestination: convertCartDestination
    };

});