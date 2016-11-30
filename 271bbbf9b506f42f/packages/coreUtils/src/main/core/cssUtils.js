define(['lodash', 'coreUtils/core/stringUtils'], function (_, stringUtils) {
    'use strict';

    var CSS_UNITS = {
        pct: '%',
        px: 'px',
        vw: 'vw',
        vh: 'vh'
    };

    var rgbaRegexp = /^\d+,\d+,\d+,(\d+.?\d*)?/;

    function toCalcExp(measurements) {
        return 'calc(' + measurements.join(' + ') + ')';
    }

    function roundToNearestHalf(num) {
        return Math.round(num * 2) / 2;
    }

    function getScreenUnitsAsPixels(screenUnits, screenDimension){
        return roundToNearestHalf((screenUnits / 100) * screenDimension);
    }

    function getUnitsDataWithoutScreenUnits(unitsData, screenDimension){
        var newUnitsData = _.clone(unitsData);

        if (_.isFinite(unitsData.vw)){
            newUnitsData[CSS_UNITS.px] = (newUnitsData[CSS_UNITS.px] || 0) + getScreenUnitsAsPixels(unitsData.vw, screenDimension);
            delete newUnitsData[CSS_UNITS.vw];
        }

        if (_.isFinite(unitsData.vh)) {
            newUnitsData[CSS_UNITS.px] = (newUnitsData[CSS_UNITS.px] || 0) + getScreenUnitsAsPixels(unitsData.vh, screenDimension);
            delete newUnitsData[CSS_UNITS.vh];
        }

        return newUnitsData;
    }

    function convertUnitsDataToCssStringValue(unitsData, screenSizeInRelevantAxis) {
        var unitsDataWithoutScreenUnits = getUnitsDataWithoutScreenUnits(unitsData, screenSizeInRelevantAxis);

        var measurements = _(unitsDataWithoutScreenUnits)
            .pick(_.keys(CSS_UNITS))
            .map(function (val, key) {
                return val + CSS_UNITS[key];
            })
            .value();
        return measurements.length > 1 ? toCalcExp(measurements) : measurements[0];
    }

    function concatenateStyleIdToClassName(styleId, className){
        return styleId + '_' + className;
    }

    function concatenateStyleIdToSkinPart(styleId, skinPartName){
        return styleId + skinPartName;
    }

    function concatenateStyleIdToClassList(styleId, classes) {
        return _(classes)
            .compact()
            .map(function(cls) {
                return concatenateStyleIdToClassName(styleId, cls);
            })
            .join(' ');
    }

    function normalizeColorStr(colorStr) {
        return rgbaRegexp.test(colorStr) ? 'rgba(' + colorStr + ')' : colorStr;
    }

    function createColorStyleText(colorVal, cssClassName, styleAttributeName) {
        var childColor = "";
        if (stringUtils.startsWith(colorVal, '#')) {
            childColor = styleAttributeName + ": " + colorVal + ";";
        } else {
            childColor = styleAttributeName + ": rgba(" + colorVal + ");";
        }
        var colorStyle = "." + cssClassName + " {" + childColor + "}";
        return colorStyle;
    }

    function getColorsCssString(colorsArr){
        var result = "";
        _.forEach(colorsArr, function (color, colorIndex){
            result += (createColorStyleText(color, 'color_' + colorIndex, 'color')) + "\n";
            result += (createColorStyleText(color, 'backcolor_' + colorIndex, 'background-color')) + "\n";
        });
        return result;
    }

    function elementHasClass(element, classname) {
        return _(element.className || '')
                .split(' ')
                .includes(classname);
    }

    function addClassToElement(element, classname) {
        if (!elementHasClass(classname)) {
            element.className = element.className ? element.className + ' ' + classname : classname;
        }
    }

    function removeClassFromElement(element, classname) {
        element.className = _(element.className)
            .split(' ')
            .without(classname)
            .join(' ');
    }

    function addStylesheetOfUrl(url) {
        var link = window.document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        window.document.getElementsByTagName('head')[0].appendChild(link);
    }

    function parseFontStr(fontStr) {
        var split = fontStr.split(' ');
        var sizeSplit = split[3] ? split[3].split('/') : [];
        return {
            style: split[0],
            variant: split[1],
            weight: split[2],
            size: sizeSplit[0],
            lineHeight: sizeSplit[1],
            family: split[4].replace(/\+/g, ' '),
            color: split[5],
            bold: split[2] === 'bold' || parseInt(split[2], 10) >= 700,
            italic: split[0] === 'italic'
        };
    }

    return {
        convertUnitsDataToCssStringValue: convertUnitsDataToCssStringValue,
        concatenateStyleIdToClassName: concatenateStyleIdToClassName,
        concatenateStyleIdToClassList: concatenateStyleIdToClassList,
        concatenateStyleIdToSkinPart: concatenateStyleIdToSkinPart,
        normalizeColorStr: normalizeColorStr,
        elementHasClass: elementHasClass,
        addClassToElement: addClassToElement,
        removeClassFromElement: removeClassFromElement,
        addStylesheetOfUrl: addStylesheetOfUrl,
        getColorsCssString: getColorsCssString,
        parseFontStr: parseFontStr
    };

});
