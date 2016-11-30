/**
 * Created by Talm on 29/09/2014.
 */
define(['lodash',
    'documentServices/dataModel/themeValidationHelper',
    'documentServices/dataModel/dataModel',
    'documentServices/privateServices/idGenerator',
    'documentServices/theme/skins/skinsByComponentType',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/theme/skins/editorSkinsData',
    'color',
    'documentServices/theme/colorPresets',
    'documentServices/component/componentsDefinitionsMap',
    'utils',
    'fonts',
    'documentServices/siteMetadata/generalInfo',
    'documentServices/theme/skins/componentTypeAliases'
], function (_, themeValidationHelper, dataModel, idGenerator, skinsByComponentType, dataSchemas, editorSkinsData, Color, colorPresets, compDefinitionMap, utils, fontsPkg, generalInfo, componentTypeAliases) {
    'use strict';

    var THEME_DATA_ID = 'THEME_DATA';

    var themeChangeListeners = [];

    function setColors(ps, colors) {
        if (typeof colors !== 'object') {
            throw new Error('Value "' + colors + '" is not valid.Param should be an object');
        }
        mergeIntoDAL(ps, 'color', colors);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(onThemeChangeRunCallbacks.bind(this, {
            type: "COLOR",
            values: colors
        }));
    }


    function setFonts(ps, fonts) {
        if (typeof fonts !== 'object') {
            throw new Error('Value "' + fonts + '" is not valid.Param should be an object');
        }
        mergeIntoDAL(ps, 'font', fonts);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(onThemeChangeRunCallbacks.bind(this, {
            type: "FONT",
            values: fonts
        }));
    }

    function updateStyle(ps, styleId, styleValue) {
        runStyleValidations(styleId, styleValue);
        var newStyleValue = _.omit(styleValue, ['styleType']); //cannot change styleType for a style
        var stylePointer = ps.pointers.data.getThemeItem(styleId);
        var currentStyleValue = ps.dal.get(stylePointer);
        var styleValueToSet = _.assign(currentStyleValue || {}, newStyleValue);
        styleValueToSet.id = styleId;

        ps.dal.set(stylePointer, styleValueToSet);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(onThemeChangeRunCallbacks.bind(this, {
            type: "STYLE",
            values: styleId
        }));
    }

    function getThemeStyles(ps) {

        var themePointer = ps.pointers.data.getThemeItem('THEME_DATA');
        var colorPointer = ps.pointers.getInnerPointer(themePointer, 'color');
        var fontsPointer = ps.pointers.getInnerPointer(themePointer, 'font');
        var themeColors = ps.dal.get(colorPointer);
        var themeFonts = ps.dal.get(fontsPointer);

        return fontsPkg.fontCss.getThemeFontsCss(themeFonts, themeColors);
    }

    function isKnownSystemStyle(styleId) {
        return _.some(compDefinitionMap, function (compDefaults) {
            return compDefaults.styles && compDefaults.styles[styleId];
        });
    }

    var ALLOWED_STYLE_TYPES = ['system', 'custom'];

    function createStyleItem(ps, styleRawData, styleId) {
        if (!_.includes(ALLOWED_STYLE_TYPES, styleRawData.styleType)) {
            throw new Error('Unable to create a style without a styleType. styleType must be one of ' + JSON.stringify(ALLOWED_STYLE_TYPES));
        }
        if (styleRawData.styleType === 'system' && !isKnownSystemStyle(styleId)) {
            throw new Error('Unable to create a system style whose id - ' + styleId + ', is not in componentDefinitionMap');
        }
        var styleItem = buildStyleByData(styleRawData, styleId);
        runStyleValidations(styleItem.id, styleItem);
        var stylePointer = ps.pointers.data.getThemeItem(styleItem.id);
        ps.dal.set(stylePointer, styleItem);
        return styleItem.id;
    }

    function runStyleValidations(styleId, styleValue) {
        if (!styleId || !styleValue) {
            throw new Error('missing arguments - styleId: ' + styleId + ', styleValue: ' + styleValue);
        }
        var validationResult = validateStyleValue(styleValue);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }
    }

    function buildStyleByData(styleData, styleId) {
        var styleItem = dataModel.createDataItemByType(null, 'TopLevelStyle');
        _.merge(styleItem, styleData);
        styleItem.compId = '';
        styleItem.pageId = '';
        styleItem.id = styleId || idGenerator.getStyleIdToAdd();
        styleItem.metaData = {isPreset: false, schemaVersion: '1.0', isHidden: false};//TODO: Shahar - extremely ugly! Remove!
        styleItem.style = styleItem.style || {properties: {}, propertiesSource: {}};
        return styleItem;
    }

    function getAllFonts(ps) {
        return getPropertiesAccordingToType(ps, "font");
    }

    function getThemeFontsMap(ps) {

        var themeColors = getAllColors(ps);
        var themeFonts = getAllFonts(ps);

        return _.transform(themeFonts, function (res, font, fontIndex) {
            res[fontIndex] = fontsPkg.fontUtils.parseStyleFont(fontIndex, themeFonts, themeColors);
            return res;
        }, {});

    }

    function convertToHex(colors) {
        function valueToHex(colorString) {
            var colorObj;

            if (colorString.indexOf('#') !== 0) {
                var rgbString = colorString.indexOf('r') === 0 ? colorString : 'rgba(' + colorString + ')';
                colorObj = new Color(rgbString);
            } else {
                colorObj = new Color(colorString);
            }

            return colorObj.hexString();
        }

        if (_.isArray(colors)) {
            return _.map(colors, valueToHex);
        } else if (_.isObject(colors)) {
            return _.mapValues(colors, valueToHex);
        }
        return valueToHex(colors);
    }

    function getAllColors(ps) {
        var colors = getPropertiesAccordingToType(ps, "color");
        return convertToHex(colors);
    }

    function createColorHashMapFromStyleData(stylesInTheme) {
        return _.transform(stylesInTheme, function (colorHashMap, styleDataItem/*, styleId*/) {
            var skinDescription = editorSkinsData[styleDataItem.skin];
            if (styleDataItem.type === "TopLevelStyle" && skinDescription) {
                var props = styleDataItem.style && styleDataItem.style.properties || {};
                _(props)
                    .pick(function (propValue, propName) {
                        return skinDescription[propName] && _.includes(skinDescription[propName].type, 'COLOR');
                    })
                    .forOwn(function (propVal/*, propName*/) {
                        colorHashMap[propVal] = propVal;
                    })
                    .value(); //just to make sure the chain is run
            }
        }, {});
    }

    function getCustomColorsUsedInSkins(ps, removeDuplicateToThemeColors) {
        var stylesInTheme = getAllStyles(ps);
        var colorsHashMap = createColorHashMapFromStyleData(stylesInTheme);

        var colors = _.filter(colorsHashMap, function (colorValue) {
            return colorValue.indexOf('color') !== 0;
        });

        colors = convertToHex(colors);

        if (removeDuplicateToThemeColors) {
            var themeColors = getAllColors(ps);
            colors = _.difference(colors, themeColors);
        }

        return colors;
    }

    function getFont(ps, fontName) {
        return getProperty(ps, 'font', fontName);
    }

    function renderColor(ps, color) {
        if (_.includes(color, 'color')) {
            return getColor(ps, color);
        }
        if (color.charAt(0) === '#' || _.includes(color, 'rgb')) {
            return color;
        }
        var splitColor = color.split(',');
        if (splitColor.length === 3) {
            return 'rgb(' + color + ')';
        }
        if (splitColor.length === 4) {
            return 'rgba(' + color + ')';
        }
        return color;
    }

    function getColor(ps, colorName) {
        var color = getProperty(ps, 'color', colorName);
        return color && convertToHex(color);
    }


    function getStyle(ps, styleId) {
        var stylePointer = ps.pointers.data.getThemeItem(styleId.replace('#', ''));
        return ps.dal.get(stylePointer);
    }

    function getAllStyles(ps) {
        return ps.dal.get(ps.pointers.general.getAllTheme());
    }

    function getAllStyleIds(ps) {
        return ps.dal.getKeys(ps.pointers.general.getAllTheme());
    }

    function removeStyle(ps, styleId) {
        ps.dal.remove(ps.pointers.data.getThemeItem(styleId.replace('#', '')));
    }

    function omitSystemStyles(ps, styleIds) {
        return _.reject(_.without(styleIds, THEME_DATA_ID), function (styleId) {
            return getStyle(ps, styleId).styleType === 'system';
        });
    }

    function onThemeChangeAddListener(ps, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Value "' + callback + '" is not valid.Param should be function');
        }
        var listenerId = themeChangeListeners.length;
        themeChangeListeners.push({listenerId: listenerId, callback: callback});
        return listenerId;

    }

    function removeChangeThemeListener(ps, listenerId) {
        if (_.isNull(listenerId) || _.isUndefined(listenerId)) {
            throw new Error('missing argument - listenerId: ' + listenerId);
        }
        var indexToRemove = _.findIndex(themeChangeListeners, {listenerId: listenerId});
        if (indexToRemove === -1) {
            throw new Error('Value "' + listenerId + '" is not valid.No listener with this id exist');
        }
        themeChangeListeners.splice(indexToRemove, 1);
    }


    /******Internal Functions *********/

    function validateStyleValue(styleValue) {
        if (typeof styleValue !== 'object') {
            return {success: false, error: 'received style value is not an object'};
        }
        if (!styleValue.skin) {
            return {success: false, error: 'received style did not contain a skin property'};
        }
        if (!styleValue.type) {
            return {success: false, error: 'received style did not contain a type property'};
        }
        return {success: true};
    }

    function getThemeItemPointer(ps, type, index) {
        var theme = ps.pointers.data.getThemeItem(THEME_DATA_ID);
        return ps.pointers.getInnerPointer(theme, [type, index]);
    }

    function mergeIntoDAL(ps, type, valuesToMerge) {
        var allValues = getPropertiesAccordingToType(ps, type);
        validateAllKeysInSchema(ps, valuesToMerge, allValues, type);
        _.forEach(valuesToMerge, function (value, name) {
            var index = getPropIndex(name);
            var itemPointer = getThemeItemPointer(ps, type, index);
            ps.dal.set(itemPointer, value);
        });
    }

    function getPropertiesAccordingToType(ps, type) {
        var result = {};
        var theme = ps.pointers.data.getThemeItem(THEME_DATA_ID);
        var pointer = ps.pointers.getInnerPointer(theme, type);
        var values = ps.dal.get(pointer);

        _.forEach(values, function (value, index) {
            result[type + '_' + index] = value;
        });
        return result;
    }

    function validateAllKeysInSchema(ps, valuesToMerge, propertyAccordingToSchema, type) {
        _.forEach(valuesToMerge, function (val, key) {
            if (!propertyAccordingToSchema[key]) {
                throw new Error("Invalid Key " + key);
            } else {
                if (type === 'color') {
                    var normalizedColorVal = normalizeColorValue(val);
                    var isColorValid = themeValidationHelper.validateColor(null, normalizedColorVal);
                    if (!isColorValid) {
                        throw new Error("color value isn't valid " + val + " .Please supply or hex/rgb string");
                    }
                    valuesToMerge[key] = normalizedColorVal;
                }
                if (type === 'font') {
                    validateFont(ps, val);
                }
            }
        });
    }

    function normalizeColorValue(colorValue) {
        if (colorValue) {
            var regexRes = /^(rgb|rgba)\(([0-9,\\.]*)\)$/.exec(colorValue);
            colorValue = (regexRes && regexRes[2]) || colorValue;
        }
        return colorValue;
    }

    function validateFont(ps, fontStr) {
        var result = themeValidationHelper.validateFont(ps, fontStr, getAllColors(ps));
        if (result.isValid) {
            return true;
        }
        if (result.error) {
            throw result.error;
        }
        return false;
    }

    function getProperty(ps, type, name) {
        var index = getPropIndex(name);
        if (!_.isNaN(index)) {
            var pointer = getThemeItemPointer(ps, type, index);
            return ps.dal.get(pointer);
        }
        var resultTemplate = _.template("Non valid <%=type %> value <%=name %>");
        return resultTemplate({
            type: type,
            name: name
        });
    }

    function getPropIndex(name) {
        return parseInt(name.split('_')[1], 10);
    }

    function onThemeChangeRunCallbacks(changedData) {
        _(themeChangeListeners)
            .filter('callback')
            .invoke('callback', changedData)
            .value();
    }

    function getSchema() {
        return _.cloneDeep(dataSchemas.FlatTheme.properties);
    }

    function getComponentSkins(privateServices, componentType) {
        var compType = componentTypeAliases.getAlias(componentType);
        if (skinsByComponentType[compType]) {
            return skinsByComponentType[compType].slice(); //return a copy for public
        }
        return [];
    }

    var SVG_SKIN_DEFINITION = 'skins.viewer.svgshape.SvgShapeDefaultSkin';

    function getSkinDefinition(privateServices, skinClassName) {
        var skinDefinition = _.includes(skinClassName, 'svgshape.') ? editorSkinsData[SVG_SKIN_DEFINITION] : editorSkinsData[skinClassName];
        return _.clone(skinDefinition); //return a copy for public
    }

    function getColorPresets() {
        return colorPresets;
    }

    function getColorCssString(ps) {

        var themePointer = ps.pointers.data.getThemeItem('THEME_DATA');
        var colorPointer = ps.pointers.getInnerPointer(themePointer, 'color');
        var colors = ps.dal.get(colorPointer);

        return utils.cssUtils.getColorsCssString(colors);

    }

    function getCharacterSet(privateServices) {
        var dataItemPointer = privateServices.pointers.data.getDataItemFromMaster('masterPage');
        var result = privateServices.dal.get(dataItemPointer).characterSets;
        if (!result) {
            result = ['latin'];
        } else if (!_.includes(result, 'latin')) {
            result.push('latin');
        }

        return result;

    }

    var wixLanguageCharacterSet = {
        'pl': ['latin-ext', 'latin'],
        'ru': ['cyrillic', 'latin'],
        'ja': ['japanese', 'latin'],
        'ko': ['korean', 'latin']
    };

    function getLanguageCharacterSet(privateServices, languageSymbol) {
        if (languageSymbol) {
            return wixLanguageCharacterSet[languageSymbol];
        }
    }

    function updateCharacterSet(privateServices, characterSetArr) {
        if (_.isArray(characterSetArr)) {
            var dataItemPointer = privateServices.pointers.data.getDataItemFromMaster('masterPage');
            var dataItem = {characterSets: characterSetArr};
            privateServices.dal.merge(dataItemPointer, dataItem);
        }
    }

    function getCharacterSetByGeo(privateServices) {
        var sets = [],
            geo = generalInfo.getGeo(privateServices);
        if (geo && utils.countryCodes.countries[geo]) {
            sets = _.clone(utils.countryCodes.countries[geo].characterSets);
        }

        if (sets.length > 0 && !_.includes(sets, 'latin')) {
            sets.push('latin');
        } else {
            sets = ['latin'];
        }

        return sets;
    }

    /**
     * Converts all 'system' styles which are not supposed to be system to 'custom' styles.
     * This is so they can then be erased during garbage collection if needed.
     * @param ps
     * @returns {*}
     */
    function convertUnknownSystemStylesToCustomStyles(ps) {
        return _(ps)
            .thru(getAllStyleIds)
            .without(THEME_DATA_ID)
            .map(function (styleId) {
                return _.merge(getStyle(ps, styleId), {id: styleId});
            })
            .filter(function (style) {
                return style.styleType === 'system' && !isKnownSystemStyle(style.id);
            })
            .forEach(function (style) {
                style.styleType = 'custom';
                ps.dal.set(ps.pointers.data.getThemeItem(style.id), style);
            })
            .size();
    }

    function runGarbageCollection(ps) {
        var allCustomStyleIds = omitSystemStyles(ps, getAllStyleIds(ps));
        var pagesDataPointer = ps.pointers.page.getAllPagesPointer();
        var pagesData = ps.dal.full.get(pagesDataPointer);
        var usedStyles = ps.siteAPI.collectUsedStylesFromAllPages(pagesData);
        var newOrphanStyles = _.difference(allCustomStyleIds, _.keys(usedStyles));

        var orphanStyles = ps.dal.get(ps.pointers.general.getOrphanPermanentDataNodes());
        orphanStyles = orphanStyles.concat(newOrphanStyles);

        ps.dal.set(ps.pointers.general.getOrphanPermanentDataNodes(), orphanStyles);
        _.forEach(newOrphanStyles, removeStyle.bind(null, ps));
    }

    function initializeTheme(ps, params) {
        if (params && params.runStylesGC) {
            convertUnknownSystemStylesToCustomStyles(ps);
            runGarbageCollection(ps);
        }
    }

    /**
     * @class documentServices.theme
     */
    return {
        initialize: initializeTheme,
        /**
         * @class documentServices.theme.colors
         */
        colors: {
            /**
             * The function receive an object with the colors we want to update and update theme data schema with the new colors (the object key is the color name and the value is the color value we want to set).
             * Color name can be from color_0 to color_35 and the color value can be hex string or rgba.
             * @example hex : color_1: "#FFFFFF") , rgba : (color_3: "237,28,5,1")
             * @param {object.<string, string>} colors  object with the colors we want to update (key - color name (between color_0 to color_35), value -  color value we want to set in hex/rgba value
             *
             */
            update: setColors,
            /**
             * The function returns the color value for a given color name.
             * @param {string} colorName - color name should be between color_0 to color_35
             * @return {string} color value for the given color name
             * @example
             * //return #FFFFFF
             */
            get: getColor,
            /**
             * The function returns an object with all the colors on the theme data schema.
             * @return {object.<string,string>} all preset colors (key- color name , value - color value)
             * @example
             * //return {"color_0":"#ffffff","color_1":"#FFFFFF","color_2":"#000000","color_3":"237,28,36,1"}
             */
            getAll: getAllColors,
            getCustomUsedInSkins: getCustomColorsUsedInSkins,
            getColorPresets: getColorPresets,
            /**
             * The function returns a css string represents the theme color_* and backcolor_* classes
             * @return css string with theme colors classes
             * @example
             * //return ".color_0 {color: #123456;} .backcolor_0 {background-color: #123456;}"
             */
            getCssString: getColorCssString,
            render: renderColor
        },
        /**
         * @class documentServices.theme.fonts
         */
        fonts: {
            /**
             * The function receives an object with the fonts we want to update and updates the theme data schema with the new fonts (the object key is the font name and the value is the new font css string).
             * Font key can be from font_0 to font_10 and the font string should be in the following format : font-style font-variant font-weight font-size/line-height font-family color
             * @example normal normal normal 40px/1.4em din-next-w01-light {color_14};
             * font-style - Specifies the font style for text. possible values : 'normal', 'italic'.
             * font-variant -Specifies whether or not a text should be displayed in a small-caps font. possible values : 'normal', 'small-caps', 'inherit'.
             * font- weight - Specifies how thick or thin characters in text should be displayed. possible values:'normal', 'bold', 'bolder', 'lighter'.
             * font-size - Specifies the size of a font. should be int value and the possible units are: 'px', 'em', 'pt', 'ex', 'in', 'cm', 'mm', 'pc'.
             * line-height - Specifies the line height. should be int value and the possible units are: 'px', 'em', 'pt', 'ex', 'in', 'cm', 'mm', 'pc'.
             * font-family - Specifies the font. The font-family property can hold several font names as a "fallback" system. If the browser does not support the first font, it tries the next font.
             * color - Specifies the text color. possible values : can have one of the preset colors (color0-color35) : {color_0} or Hex/Rgba string
             * @param {object.<string, string>} fonts object with the fonts we want to update (key - font name (between font_0 to font_10), value - new fonts string in the following format :font-style font-variant font-weight font-size/line-height font-family color
             *
             */
            update: setFonts,
            /**
             * The function returns the font string for a given font name.
             * @param {string} fontName should be between font_0 to font_10
             * @return {string} font value for the given font name
             * @example
             * //return normal normal normal 45px/1.4em Open+Sans {color_14}
             */
            get: getFont,
            /**
             * The function returns an object with all the fonts on the theme data schema.
             * @return {object.<string,string>} all preset fonts (key- fontName , value - font string)
             * @example
             * // returns {"font_0":"normal normal normal 45px/1.4em Open+Sans {color_14}","font_1":"normal normal normal 13px/1.4em Arial {color_11}"}
             */
            getAll: getAllFonts,
            /**
             * The function returns an object with all the fonts on the theme data schema as object.
             * @return {object.object} all preset fonts (key- fontName , value - theme font as object)
             * @example
             * // returns 'font_1': { style: 'normal', variant: 'normal', weight: 'normal', size: '13px', lineHeight: '1.4em', family: 'Arial', color: '{color_1}', bold: false, italic: false, fontWithFallbacks: 'arial,arial_fallback,sans-serif', cssColor: '#A0CF8E'}
             */
            getMap: getThemeFontsMap,
            /**
             * The function returns an Array with all the character sets of the current site from the site structure
             * @return Array
             * @example
             * // returns ['latin']
             */
            getCharacterSet: getCharacterSet,
            /**
             * The function returns an Array with all the character sets of a specific language symbol (As configured in My Account)
             * @param languageSymbol - the language symbol to return its languages
             * @return Array, there should be always array with at least one character set -> ['latin']
             * @example
             * // for languageSymbol === 'pl' returns ['latin-ext', 'latin']
             */
            getLanguageCharacterSet: getLanguageCharacterSet,
            /**
             * The function returns an Array with all the character sets of the IP/GEO
             * @return Array, there should be always array with at least one character set -> ['latin']
             * @example
             * // for geo ISR should returns ['hebrew', 'arabic', 'latin']
             */
            getCharacterSetByGeo: getCharacterSetByGeo,
            /**
             * The function update the site structure character sets of the current site, with new array
             * @param Array, of character set
             */
            updateCharacterSet: updateCharacterSet,
            /**
             * @param ps
             * @returns {font_0: font: 'normal normal normal 45px/1.4em Open+Sans; color: #FFFFFF;}
             */
            getThemeStyles: getThemeStyles
        },
        /**
         * @class documentServices.theme.styles
         */
        styles: {
            /**
             * The function receive styleId which is the style name and styleValue which is the style object representing the style.
             * style id must exist and the style object must be an object containing at least skin name and type
             * @example  {compId:"",componentClassName:"",id:"mockId",skin:"wysiwyg.viewer.skins.button.BasicButton",type: "TopLevelStyle",style:{groups:{},properties:{},propertiesSource:{}},styleType: "system"
             * @param {string} styleId  the styleId we want to update
             * @param {object} styleValue style objects we want to update
             *
             */
            update: updateStyle,
            /**
             * Create a new style object with the given properties and add it to the master page
             * @param {object} styleRawData - style object with properties from which the new style will be created
             * @param {string} [styleId] - style id to create the new style with. Should be used when creating <b>system</b> styles only.
             * @returns {string} styleId - the created style id
             */
            createItem: createStyleItem,
            /**
             * The function returns the style object for a given style name.
             * @param {string} styleId - styleId we want to get
             * @return {object} style object for the given style name
             * @example
             * //return {"componentClassName":"","pageId":"","compId":"","styleType":"system","metaData":{"isPreset":false,"isHidden":false,"schemaVersion":"1.0"},"type":"TopLevelStyle","id":"twt1","skin":"skins.core.TwitterTweetSkin"}
             */
            get: getStyle,
            /**
             * The function returns all styles.
             * @return {object.<string, object>} object containing all styles (key- style name , value - style object)
             * @example
             * //returns {twt1:{"componentClassName":"","pageId":"","compId":"","styleType":"system","metaData":{"isPreset":false,"isHidden":false,"schemaVersion":"1.0"},"type":"TopLevelStyle","id":"twt1","skin":"skins.core.TwitterTweetSkin"}}
             */
            getAll: getAllStyles,
            getAllIds: getAllStyleIds
        },

        skins: {
            getComponentSkins: getComponentSkins,
            getSkinDefinition: getSkinDefinition
        },
        /**
         * The function returns the schema of the site's theme
         * @return {object.<string, object>} object containing all schema properties (key- schema property, value - type and default value of schema property)
         */
        getSchema: getSchema,
        /**
         * @class documentServices.theme.events
         */
        events: {
            /**
             * @class documentServices.theme.events.onChange
             */
            onChange: {
                /**
                 * The function add listener and the listener is triggered when the theme changes: font change, color change, style change
                 * @param {requestCallback} callback  called when the theme is change
                 * @return {int} listener id - used if you want to remove the listener
                 * @example
                 * //returns 2
                 */
                addListener: onThemeChangeAddListener,
                /**
                 * The function removes listener based on listener id.
                 * @param {int} listenerId - the listener id given when the callback was registered
                 */
                removeListener: removeChangeThemeListener,

                executeListeners: onThemeChangeRunCallbacks
            }
        },
        FONT_POSSIBLE_VALUES: themeValidationHelper.FONT_POSSIBLE_VALUES
    };
});
