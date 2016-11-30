define.utils('cookies', function() {
    'use strict';
    return ({
        /**
         * Creates and sets a cookie
         * @param {String} cookieName
         * @param {String} value
         * @param {Number=} persistenceMilliseconds
         */
        createCookie: function(cookieName, value, persistenceMilliseconds) {
            var expires = "";
            if (persistenceMilliseconds) {
                var date = new Date();
                date.setTime(date.getTime()+(persistenceMilliseconds));
                expires = "; expires="+date.toGMTString();
            }
            document.cookie = cookieName+"="+value+expires+"; path=/";
        },

        /**
         * Deletes a cookie
         * @param {String} cookieName
         */
        deleteCookie: function(cookieName) {
            document.cookie = cookieName+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
        },

        /**
         * @returns {Boolean} True if there's a cookie by that name in the page
         */
        hasCookie: function(cookieName) {
            return this.readCookie(cookieName) !== null;
        },

        /**
         * @returns {Boolean} True if there's a cookie by that name in the page
         */
        readCookie: function(cookieName){
            var results = document.cookie.match(new RegExp('\\b' + cookieName + '=(.*?)(;|$)')) ;
            if(results){ return(results[1]); }
            else{ return null; }
        }
    });

});