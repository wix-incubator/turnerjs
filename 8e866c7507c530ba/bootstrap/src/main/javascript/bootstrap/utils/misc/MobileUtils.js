define.utils('mobile', function(){

    return ({

        getMobileDefaultMinFontSize: function() {
            return 12;
        },

        convertFontSizeToMobile: function (fontSize, scale) {
            var mobileFontSize = this.getMobileFontSize(fontSize);
            return scale * Math.round(mobileFontSize);
        },

        getMobileFontSize: function(desktopFontSize) {
            var mobileFontSize;
            var mobileDefaultMinFontSize = this.getMobileDefaultMinFontSize();

            if (desktopFontSize<mobileDefaultMinFontSize) {
                mobileFontSize = mobileDefaultMinFontSize;
            }
            else if (desktopFontSize<=14) {
                mobileFontSize = desktopFontSize + 1;
            }
            else if (desktopFontSize<=25) {
                mobileFontSize = desktopFontSize;
            }

            else if (desktopFontSize<=100){

                var desktopToMobileFontSizeMap = {
                    '26':	26,
                    '27':	26,
                    '28':	26,
                    '29':	27,
                    '30':	27,
                    '31':	27,
                    '32':	28,
                    '33':	28,
                    '34':	28,
                    '35':	29,
                    '36':	29,
                    '37':	29,
                    '38':	30,
                    '39':	30,
                    '40':	30,
                    '41':	31,
                    '42':	31,
                    '43':	31,
                    '44':	32,
                    '45':	32,
                    '46':	32,
                    '47':	33,
                    '48':	33,
                    '49':	33,
                    '50':	34,
                    '51':	34,
                    '52':	34,
                    '53':	35,
                    '54':	35,
                    '55':	35,
                    '56':	36,
                    '57':	36,
                    '58':	36,
                    '59':	37,
                    '60':	37,
                    '61':	37,
                    '62':	38,
                    '63':	38,
                    '64':	38,
                    '65':	39,
                    '66':	39,
                    '67':	39,
                    '68':	40,
                    '69':	40,
                    '70':	40,
                    '71':	41,
                    '72':	41,
                    '73':	41,
                    '74':	42,
                    '75':	42,
                    '76':	42,
                    '77':   43,
                    '78':	43,
                    '79':	43,
                    '80':	44,
                    '81':	44,
                    '82':	44,
                    '83':	45,
                    '84':	45,
                    '85':	45,
                    '86':	46,
                    '87':	46,
                    '88':	46,
                    '89':	47,
                    '90':	47,
                    '91':	47,
                    '92':	48,
                    '93':	48,
                    '94':	48,
                    '95':	49,
                    '96':	49,
                    '97':	49,
                    '98':	50,
                    '99':	50,
                    '100':	50
                };
                mobileFontSize = desktopToMobileFontSizeMap[desktopFontSize];
            }
            else {
                mobileFontSize = 50;
            }
            return mobileFontSize;

        },

        _getClassFontSize: function (node, themeManager) {
            var fontClass = this._getFontClass(node, themeManager);
            return fontClass ? parseInt(fontClass.getSize()) : NaN;
        },

        _getClassFontColor: function(node, themeManager) {
            var fontClass = this._getFontClass(node, themeManager);
            return fontClass && fontClass.getColorReference() && themeManager.getProperty(fontClass.getColorReference());
        },

        _getFontClass: function(node, themeManager) {
            var className = this._findNodeClassThatStartsWith(node, 'font_');
            if (className && themeManager.getPropertyType(className) === "font") {
                return themeManager.getProperty(className);
            }
            return null;
        },

        _findNodeClassThatStartsWith: function(node, prefix) {
            return _.find(node.classList, function(className) {return className.indexOf(prefix) === 0;});
        },

        getFontSize: function (node, themeManager) {
            var fontSize = parseInt(node.style.fontSize);
            if (isNaN(fontSize)) {
                //no inner style font size - look for font class
                fontSize = this._getClassFontSize(node, themeManager);
            }

            return fontSize;
        },

        getFontColor: function(node, themeManager) {
            var fontColorClass, fontColor = node.style.color;
            if (fontColor) {
                fontColor = themeManager.getColorClassInstance(fontColor);
            }
            else {
                fontColorClass = this._findNodeClassThatStartsWith(node, 'color_');
                fontColor = fontColorClass ? themeManager.getProperty(fontColorClass) : this._getClassFontColor(node, themeManager);
            }
            return fontColor;
        },

        calcNodeDirectCharacters:function(node) {
            var numOfCharacters = _.reduce(
                node.childNodes,
                function(result, childNode) {
                    return result + (childNode.nodeType == 3? childNode.length : 0);
                },
                0
            );

            return numOfCharacters;
        }
    });

});