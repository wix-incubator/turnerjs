define(['lodash', 'wixappsCore/util/styleMapping', 'experiment'], function (_, styleMapping, experiment) {
    "use strict";

    var functions = {
        get: function (object, path) {
            return _.get(object, path);
        },

        "getFromLocalStorage": function (itemName) {
            return window.localStorage.getItem(itemName);
        },

        "parseFromJSON": function (json) {
            return JSON.parse(json) || {};
        },

        "getObjectMember": function (object, memberName) {
            return _.get(object, memberName, false);
        },

        "and": function () {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] === false) {
                    return false;
                }
            }

            return true;
        },

        "or": function () {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] === true) {
                    return true;
                }
            }

            return false;
        },

        "if": function (condition, trueValue, falseValue) {
            return (condition ? trueValue : falseValue);
        },

        "eq": function (value1, value2) {
            return value1 === value2;
        },

        "ne": function (value1, value2) {
            return value1 !== value2;
        },

        "not": function (value) {
            return !value;
        },
        "!": function (value) {
            return !value;
        },
        "gt": function (value1, value2) {
            return value1 > value2;
        },
        "gte": function (value1, value2) {
            return value1 >= value2;
        },

        "lt": function (value1, value2) {
            return value1 < value2;
        },
        "lte": function (value1, value2) {
            return value1 <= value2;
        },

        "toString": function (value) {
            return value.toString ? value.toString() : "" + value;
        },

        "toJson": function (value) {
            return JSON.stringify(value);
        },

        "mod": function (a, b) {
            return a % b;
        },

        "add": function () {
            var sum = 0;
            for (var i = 0; i < arguments.length; i++) {
                sum += arguments[i];
            }
            return sum;
        },

        "mult": function () {
            var product = 1;
            for (var i = 0; i < arguments.length; i++) {
                product *= arguments[i];
            }
            return product;
        },

        "sub": function (a, b) {
            return a - b;
        },

        "div": function (a, b) {
            return a / b;
        },

        "negate": function (number) {
            return -number;
        },


        "match": function (value1, value2, resultMatch) {
            return (value1 === value2 ? resultMatch : undefined);
        },

        "true?": function (cond, value) {
            return Boolean(cond) === true ? value : undefined;
        },

        "false?": function (cond, value) {
            return Boolean(cond) === false ? value : undefined;
        },

        "else": function (cond, value) {
            return cond === undefined ? value : cond;
        },

        "map": function () {
            // first parameter is the key to map
            // subsequent pairs are the map key and values
            // if item is not mapped, and there's a parameter after the last pair, it will be used as default.
            // otherwise, if not mapped, return the key itself.
            for (var i = 1; i < arguments.length - 1; i += 2) {
                if (arguments[0] === arguments[i]) {
                    return arguments[i + 1];
                }
            }
            return arguments.length % 2 === 0 ? arguments[arguments.length - 1] : arguments[0];
        },

        "Math": {
            floor: function (value) {
                return Math.floor(value);
            },

            round: function (value) {
                return Math.round(value);
            }
        },

        "Array": {
            length: function (arr) {
                return arr.length;
            },

            isEmpty: function (arr) {
                return arr === null || arr.length === 0;
            },

            slice: function (arr, start, end) {
                return arr.slice(start, end);
            },
            join: function (arr, char) {
                return arr.join(char);
            },
            filter: function (arr, prop, values) {
                return arr.filter(function (element) {
                    return values.contains(element[prop]);
                });
            },
            itemAt: function (arr, index) {
                return arr[index];
            },

            fromArgs: function () {
                return _.toArray(arguments);
            },

            includes: function (array, element) {
                return _.includes(array, element);
            }
        },
        "RichText": {
            isEmpty: function (richText) {
                return richText.text === "<div></div>";
            }
        },
        "String": {
            length: function (str) {
                return String(str).length;
            },

            isEmpty: function (str) {
                return String(str) === null || String(str).length === 0;
            },

            charAt: function (str, index) {
                return String(str).charAt(index);
            },
            charCodeAt: function (str, index) {
                return String(str).charCodeAt(str, index);
            },
            concat: function () {
                return _.reduce(arguments, function (result, str) {
                    return result.concat(String(str));
                }, '');
            },
            indexOf: function (str, substr) {
                return String(str).indexOf(substr);
            },
            lastIndexOf: function (str, substr) {
                return String(str).lastIndexOf(substr);
            },
            match: function (str, pattern) {
                return String(str).match(new RegExp(pattern));
            },
            replace: function (str, searchStr, replaceStr) {
                return String(str).replace(searchStr, replaceStr);
            },
            search: function (str, pattern) {
                return String(str).search(new RegExp(pattern));
            },
            slice: function (str, start, end) {
                return String(str).slice(start, end);
            },
            split: function (str, separator) {
                return String(str).split(separator);
            },
            substr: function (str, start, length) {
                return String(str).substr(start, length);
            },
            substring: function (str, start, end) {
                return String(str).substring(start, end);
            },
            toLowerCase: function (str) {
                return String(str).toLowerCase();
            },
            toUpperCase: function (str) {
                return String(str).toUpperCase();
            },
            contains: function (str, substr) {
                return String(str).contains(substr);
            },
            trim: function (str) {
                return String(str).trim();
            },
            toInt: function (str) {
                return parseInt(str, 10);
            },
            toFloat: function (str) {
                return parseFloat(str);
            }
        },
        Date: {
            createDate: function (dateStr) {
                if (!dateStr) {
                    return new Date();
                }
                return new Date(dateStr);
            },
            /**
             *  Return a date before the compared to date
             * @param daysBefore days before the date
             * @param monthsBefore months before the date
             * @param yearsBefore years before the date
             * @param {String} comparedDate - optional, if not given its the current time
             */
            getBefore: function (daysBefore, monthsBefore, yearsBefore, comparedDate) {
                var pastDate = comparedDate ? new Date(comparedDate) : new Date();
                pastDate.setDate(pastDate.getDate() - daysBefore);
                pastDate.setMonth(pastDate.getMonth() - monthsBefore);
                pastDate.setFullYear(pastDate.getFullYear() - yearsBefore);

                return pastDate;
            },
            getAfter: function (daysAfter, monthsAfter, yearsAfter, comparedDate) {
                var futureDate = comparedDate ? new Date(comparedDate) : new Date();
                futureDate.setDate(futureDate.getDate() - daysAfter);
                futureDate.setMonth(futureDate.getMonth() - monthsAfter);
                futureDate.setFullYear(futureDate.getFullYear() - yearsAfter);

                return futureDate;
            }
        },
        Theme: {
            getColor: function (colorId) {
                var colorVal = this.siteData.getColor(colorId);
                if (colorVal[0] !== '#') {
                    if (!_.includes(colorVal, 'rgb') && _.includes(colorVal, ',')) {
                        return 'rgba(' + colorVal + ')';
                    }
                    return '#' + colorVal;
                }
                return colorVal;
            }
        },
        Styles: {
            fontToTextStyle: function (fontNumber) {
                return styleMapping.fontClassToStyle("font_" + fontNumber);
            },
            calcFontSize: function (fontNumber) {
                return fontNumber * 3 + 9;
            }
        },
        Mobile: {
            zoom: function () {
                return this.siteData.isMobileView() ? 1 / this.siteData.mobile.getZoom() : 1;
            }
        },
        experiment: function (experimentName) {
            return experiment.isOpen(experimentName);
        },
        newBlogSocialIconSourceFor: function (type) {
            return this.siteData.santaBase + '/static/images/new-blog-social-icons/' + type + '.svg';
        },
        invertAlignment: function (alignment) {
            switch (alignment) {
                case 'left':
                    return 'right';
                case 'right':
                    return 'left';
                default:
                    return alignment;
            }
        }
};

    /**
     * Flatten the nested functions object into dot separated keys (e.g. Math.floor)
     * @returns {object}
     */
    function convertToPrototype() {
        var funcTable = {};
        var traverseFunc = function (target, obj, ns) {
            _.forEach(obj, function (item, key) {
                if (typeof item === "function") {
                    target[ns + key] = item;
                } else if (typeof item === "object") {
                    traverseFunc(target, item, key + ".");
                }
            });
        };

        traverseFunc(funcTable, functions, "");

        return funcTable;
    }

    /**
     * @class wixappsCore.FunctionLibrary
     * @param {core.SiteData} siteData
     * @constructor
     */
    function FunctionLibrary(siteData) {
        this.siteData = siteData;
    }

    FunctionLibrary.prototype = convertToPrototype();

    FunctionLibrary.prototype.addFunctions = function (funcsObject) {
        _.assign(FunctionLibrary.prototype, funcsObject);

    };

    return FunctionLibrary;
});
