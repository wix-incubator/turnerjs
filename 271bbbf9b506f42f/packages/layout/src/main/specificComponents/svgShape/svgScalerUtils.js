/**
 * Created by eitanr on 6/24/14.
 */
define(function(){
    'use strict';
    return {
        trim: function (str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        round: function (val) {
            return Math.round(val * 1000000) / 1000000;
        }
    };
});