/**
 * Created with IntelliJ IDEA.
 * User: baraki
 * Date: 11/26/12
 * Time: 7:06 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/24/12
 * Time: 11:49 AM
 */

define.utils('Validation:this', function(){

    return ({

        /**
         *
         * @param obj
         */
        isObjectEmpty: function(obj) {
            return Object.some(obj, function() {
                return true;
            });
        },

        /**
         *
         * @param n
         */
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        /**
         *
         * @param urlToCheck
         */
        isURLPartValid : function(urlToCheck) {
            return (/[^a-z_0-9]/.test(urlToCheck) === false) && urlToCheck.length >= 4;
        },

        /**
         *
         * @param urlToFix
         */
        convertToValidUrlPart: function(urlToFix) {
            return urlToFix.replace(/[ ]/g, '-').replace(/[^A-Za-z0-9-]/g, "").toLowerCase();
        },

        /**
         *
         * NOTE:
         *      1. This checks if the urlToTest can possibly be a valid URL.
         *      2. This is *forgiving* and allows for some errors, such as www.youtu.23. This is because for the clientside validation, we only care about showing an error to a user for his input. the clientside validation
         *          should never be taken as a truth, meaning if this is super-important and will be saved, server-side validation is necessary too.
         *      3. this handles both with/without protocol.
         *
         *  @param {string} urlToTest
         *
         *  @returns {boolean} validity
         */
        isValidUrl: function(urlToTest) {
            if (urlToTest.indexOf(".") === 0) {
                urlToTest = this._rel_to_abs(urlToTest);
            }
            return this._RegEx.validUrlReg.test(urlToTest.replace(/\s/g, '%20'));
        },

        _rel_to_abs: function(url){
            /* Only accept commonly trusted protocols:
             * Only data-image URLs are accepted, Exotic flavours (escaped slash,
             * html-entitied characters) are not supported to keep the function fast */
            if(/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)){
                return url; //Url is already absolute
            }

            var base_url = location.href.match(/^(.+)\/?(?:#.+)?$/)[0]+"/";
            if(url.substring(0,2) == "//"){
                return location.protocol + url;
            }
            else if(url.charAt(0) == "/"){
                return location.protocol + "//" + location.host + url;
            }
            else if(url.substring(0,2) == "./"){
                url = "." + url;
            }
            else if(/^\s*$/.test(url)){
                return ""; //Empty = Return nothing
            }
            else {url = "../" + url;}

            url = base_url + url;
            var i=0;
            while(/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g,""))){}

            /* Escape certain characters to prevent XSS */
            url = url.replace(/\.$/,"").replace(/\/\./g,"").replace(/"/g,"%22")
                .replace(/'/g,"%27").replace(/</g,"%3C").replace(/>/g,"%3E");
            return url;
        },

        /**
         *
         * @param emailToTest
         */
        isValidEmail: function(emailToTest) {
            return this._RegEx.validEmailReg.test(emailToTest.trim());
        },

        /**
         *
         * @param twitterUser
         */
        isValidTwitterUser: function(twitterUser) {
            return this._RegEx.ValidTwitterUserReg.test(twitterUser);
        },

        /**
         * this function validates a page title, and if it no valid, it returns a valid version
         * of the title. it checks the followings:
         * a. not an empty string
         * b. does not have a space prefix
         * @param curTitle - the current title
         */
        validatePageTitle: function(curTitle) {
            var newTitle = curTitle;

            newTitle = newTitle.replace(/[^A-Za-z0-9_ ]/g, "");

            if (newTitle.indexOf(" ")===0) {
                while (newTitle.indexOf(" ")===0) {
                    newTitle = newTitle.substr(1);
                }
            }

            if (newTitle.indexOf("  ")>-1) {
                while (newTitle.indexOf("  ")>-1) {
                    newTitle = newTitle.replace("  ", " ");
                }
            }


            newTitle = newTitle.substr(0,Constants.Page.NAME_MAX_LENGTH);

            if (newTitle==="") {
                newTitle="untitled";
            }

            return newTitle;
        },

        /**
         * @description Returns true if a given keycode is not in the range of various control keycodes
         * @param code
         */
        isInputKey : function(code) {
            if (! code) {
                return false;
            }
            //TODO: REVISE THIS!
            // under keycode 48 (the zero key), the only valid input keys are enter, space, delete and backspace
            if (code < 48) {
                // enter, space, backspace or delete do count as input keys
                return (code == 13 || code == 32 || code == 8 || code == 46);
            }

            // filter out the fkeys, num lock, scroll lock
            if (code >= 112 && code <= 145) {
                return false;
            }

            // windows keys
            if (code > 90 && code <= 93) {
                return false;
            }

            return true;
        },

        /**
         * @description deep comparison between objects
         * @param obj1
         * @param obj2
         */
        isEquivalent: function(obj1, obj2) {
            // check types

            // quit comparison if types don't match
            if (typeof obj1 !== typeof obj2) {
                return false;
            }

            // quit comparison of one object is an array and the other is not
            if (obj1 instanceof Array && !(obj2 instanceof Array)) {
                return false;
            }

            // if both objects are functions, return true (see test for functions in utilsSpec)
            if ((typeof obj1 && typeof obj2) === 'function') {
                return true;
            }

            // compare and return for simple types
            if (typeof obj1 === 'string' || typeof obj1 === 'number' || typeof obj1 === 'boolean') {
                return (obj1 === obj2);
            }

            // dont bother comparing further, if their boolean value is different (one is undefined null etc, and one is not)
            if (!!obj1 !== !!obj2) {
                return false;
            }

            // init key counter
            var numberOfKeys = 0;

            // check if object is an array
            var isArray = (obj1 instanceof Array);

            // if object is not an array use key/value
            if (!isArray) {
                // go over the keys in obj1 and count them, return false if comparison to obj2 fails
                for (var key in obj1) {
                    if (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) {
                        return false;
                    } else {
                        ++numberOfKeys;
                    }
                }

                // validate both objects has same number of properties by decreasing count to zero
                for (key in obj2) {
                    if (obj2.hasOwnProperty(key)) {
                        numberOfKeys--;
                    }
                }

                // return false if count doesn't match
                if (numberOfKeys !== 0) {
                    return false;
                }

                // check equivalency of values
                for (key in obj1) {
                    if (obj1.hasOwnProperty(key) && !this.isEquivalent(obj1[key], obj2[key])) {
                        return false;
                    }
                }
            } else {
                // if object is an array, assume keys are numbers and use helper to recursively compare values

                var helper = function(item, index) {
                    return W.Utils.isEquivalent(item, obj2[index]);
                };

                return (obj1.length == obj2.length && obj1.every(helper, obj2) );
            }

            return true;
        },
        _RegEx:{
            /**
             *
             * @description a Regular Expression that test for a valid Url
             * note that this is more forgiving, in other words, it will allow 'some' invalid domains (e.g. youtu.1), but we don't care too much - that's the users problem already
             */
            validUrlReg: /^(?:(?:ftps?:|https?:)?\/\/)?(?:(?:[\u0400-\uA69F\w][\u0400-\uA69F\w-]*)?[\u0400-\uA69F\w]\.)+(?:[\u0400-\uA69Fa-z]+|\d{1,3})(?::[\d]{1,5})?(?:[/?#].*)?$/i,

            /**
             * @description a Regular Expression that test for a valid Email
             */
            validEmailReg : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

            /**
             * @description a Regular Expression that test for a valid Twitter Uesr
             */
            ValidTwitterUserReg: /^@?[a-zA-Z0-9_%]+$/

        }


    });

});