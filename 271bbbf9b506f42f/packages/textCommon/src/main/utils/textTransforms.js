define(['lodash', 'siteUtils', 'coreUtils', 'color'], function (_, siteUtils, coreUtils, Color) {
    'use strict';

    var cssUtils = coreUtils.cssUtils;

    if (typeof window !== 'undefined') {
        window.addEventListener("message", function (event) {
            if (event.data === 'show-always') {
                window.showAlways = !window.showAlways;
                _.forEach(window.document.getElementsByClassName('text-info-n47t'), function(element){
                    if (window.showAlways) {
                        element.classList.add('show-always');
                    } else {
                        element.classList.remove('show-always');
                    }
                });
            }
        });
    }

    function getBrightenedColor(color, brightness) {
        // if the color is pure black, light it a bit, so it changes in brightness could be seen
        // this is a legacy behavior we don't want to change
        var newColor = color.hexString() !== "#000000" ?
            color.clone() :
            new Color("#121212");


        newColor.lightness(newColor.hslArray()[2] * (brightness || 1.0));
        return newColor;
    }

    function getFontSize(str) {
        var fontSize = parseFloat(str);
        if (!isNaN(fontSize)){
            return fontSize;
        }
    }

    function getFontName(fontFamily){
        if (!fontFamily) {
            return;
        }
        return _.first(fontFamily.split(','));
    }

    function getColor(colorData) {
        if (!colorData) {
            return;
        }
        return new Color(cssUtils.normalizeColorStr(colorData));
    }

    function correctFontSize(element, transformData, options) {
        if (!transformData.fontSize) {
            return;
        }

        if (transformData.fontSize % 1 !== 0) {
            // This is a reproduction of a bug in the legacy textTransform algorithm
            // In some rare cases when the user would have font-size with a floating point value the legacy algorithm failed to recognize it.
            // The floating point font-size was then left untouched.
            // Fixing this bug now may have noticeable effect on these sites.
            return;
        }

        if (!element.style.fontSize && !tryGetFontData(element, options)) {
            // To keep in sync with the legacy textTransform algorithm
            // Font-size should only be applied to elements that already had font size style or class definitions
            return;
        }

        var scale = parseFloat(options.scale);
        var mobileFriendlyFontSize = Math.round(siteUtils.mobileUtils.convertFontSizeToMobile(transformData.fontSize, scale));
        element.style.fontSize = mobileFriendlyFontSize + 'px';
    }

    function correctBrightness(element, transformData, options) {
        if (!transformData.color) {
            return;
        }

        var fontData = tryGetFontData(element, options);
        if (!element.style.color && !tryGetColorData(element, fontData, options)) {
            // To keep in sync with the legacy textTransform algorithm
            // Color should only be applied to elements that already had color style or class definitions
            return;
        }

        var brightness = parseFloat(options.brightness);
        var mobileAdjustedColor = getBrightenedColor(transformData.color, brightness);
        element.style.color = mobileAdjustedColor.hslString();
    }

    function tryGetFontData(element, options){
        var execResult = /(?:\s|^)(font_\d+)(?:\s|$)/g.exec(element.className);
        if (!execResult) {
            return;
        }

        var font = options.fontGetter && options.fontGetter(execResult[1]);
        if (font) {
            return cssUtils.parseFontStr(font);
        }
    }

    function tryGetColorClassFromElement(element) {
        var execResult = /(?:\s|^)(color_\d+)(?:\s|$)/g.exec(element.className);
        if (execResult) {
            return execResult[1];
        }
    }

    function tryGetColorClassFromFontData(fontData) {
        var execResult = /^{(color_\d+)}$/.exec(_.get(fontData, 'color'));
        if (execResult) {
            return execResult[1];
        }
    }

    function tryGetColorData(element, fontData, options) {
        var colorClass = tryGetColorClassFromElement(element) || tryGetColorClassFromFontData(fontData);
        if (!colorClass) {
            return;
        }

        var colorData = options.colorGetter && options.colorGetter(colorClass);
        if (colorData) {
            return colorData;
        }
    }

    function getClassDefinitions(element, options) {
        var fontData = tryGetFontData(element, options);
        var colorData = tryGetColorData(element, fontData, options);
        return {
            fontSize: getFontSize(_.get(fontData, 'size')),
            fontName: getFontName(_.get(fontData, 'family')),
            color: getColor(colorData)
        };
    }

    function getElementStyleDefinitions(element){
        var style = _(element.style)
            .pick(['fontSize', 'fontFamily', 'color'])
            .omit(_.isEmpty)
            .value();

        return {
            fontSize: getFontSize(style.fontSize),
            fontName: getFontName(style.fontFamily),
            color: getColor(style.color)
        };
    }

    function applyOverDomElement(element, inheritedData, actions, options) {
        var transformData = _.defaults(
            {},
            getElementStyleDefinitions(element),
            getClassDefinitions(element, options),
            inheritedData
        );

        _.forEach(element.children, _.partial(applyOverDomElement, _, transformData, actions, options));
        _.invoke(actions, 'call', null, element, transformData);
    }

    function applyOverDomContainer(container, actions, options) {
        var transformData = {
            characterCount: container.textContent.length
        };

        applyOverDomElement(container, transformData, actions, options);
    }

    function buildActionsList(options) {
        var actions = [];
        if (options.scale) {
            actions.push(_.partial(correctFontSize, _, _, options));
        }
        if (options.brightness && parseFloat(options.brightness) !== 1) {
            actions.push(_.partial(correctBrightness, _, _, options));
        }
        return actions;
    }

    function createDocumentFragment() {
        var docfrag = window.document.createDocumentFragment();
        return docfrag.appendChild(window.document.createElement('div'));
    }

    return {
        applyMobileAdjustments: function(htmlText, options) {
            var actions = buildActionsList(options);
            if (actions.length === 0) {
                return htmlText;
            }

            var container = createDocumentFragment();
            container.innerHTML = htmlText;
            _.forEach(container.children, _.partial(applyOverDomContainer, _, actions, options));

            return container.innerHTML;
        }
    };
});
