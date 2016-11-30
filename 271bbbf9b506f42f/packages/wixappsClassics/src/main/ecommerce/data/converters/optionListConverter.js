define([], function () {
    "use strict";



    var
        optionsType = {
            'PRODUCT_SIZE_OPTION': 'text',
            'PRODUCT_COLOR_OPTION': 'color',
            'PRODUCT_COMBOBOX_OPTION': 'combo',
            'PRODUCT_TEXTAREA_OPTION': 'simpleText'
        },
        NON_OPTION_VALUE = -1;


    function convertOptionsList(rawData) {
        var optionsList = {
            'optionType': optionsType[rawData.wixType],
            'id': rawData.id,
            'title': rawData.title,
            'isSelectableList': true,
            'isMandatory': rawData.isMandatory,
            'selectedValue': NON_OPTION_VALUE,
            'valid': true
        };
        switch (optionsList.optionType) {
            case 'simpleText':
                optionsList._type = 'EcomTextOption';
                optionsList.text = '';
                optionsList.isSelectableList = false;
                break;
            case 'combo':
                optionsList._type = 'ComboOptionsList';
                optionsList.items = rawData.selectionsList.map(_convertOption);
                break;
            default:
                optionsList._type = 'OptionsList';
                optionsList.items = rawData.selectionsList.map(function (rawOption) {
                    return _convertOption(rawOption, optionsList.optionType);
                });
                break;
        }
        return optionsList;
    }

    function _convertOption(rawData, optionType) {
        var text = rawData.value;
        if (optionType === 'color') {
            var colorNumber = parseInt(text, 10);
            text = colorNumber.toString(16);
            while (text.length < 6) {
                text = '0' + text;
            }
            text = '#' + text;
        }
        return {
            '_type': 'Option',
            'text': text,
            'value': rawData.id,
            'description': rawData.description,
            'enabled': true
        };
    }

    function setDefaultSelection(optionsList){
        if (optionsList.items && optionsList.items.length === 1){
            optionsList.selectedValue = optionsList.items[0].value;
        }
        return optionsList;
    }

    return {
        convertOptionsList: convertOptionsList,
        setDefaultSelection: setDefaultSelection
    };
});

