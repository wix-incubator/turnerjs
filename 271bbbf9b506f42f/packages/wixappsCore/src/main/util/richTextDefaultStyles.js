define([], function () {
    'use strict';
    function color(str) {
        var isColor = str.charAt(0) === "#";
        var attr = {
            name: isColor ? "style" : "class",
            value: isColor ? "color:" + str + ";" : str
        };
        return {
            name: 'span',
            attributes: [attr]
        };
    }

    function backgroundColor(str) {
        var isColor = str.charAt(0) === "#";
        var attr = {
            name: isColor ? "style" : "class",
            value: isColor ? "background-color:" + str + ";" : str
        };
        return {
            name: 'span',
            attributes: [attr]
        };
    }

    function bold(val) {
        return {
            name: 'strong',
            attributes: [
                {
                    name: 'style',
                    value: val ? 'font-weight: bold;' : 'font-weight: normal;'
                }
            ]
        };
    }

    function italic(val) {
        return {
            name: 'em',
            attributes: [
                {
                    name: 'style',
                    value: val ? 'font-style: italic;' : 'font-style: normal;'
                }
            ]
        };
    }

    function lineThrough(val) {
        return {
            name: 'strike',
            attributes: [
                {
                    name: 'style',
                    value: val ? 'text-decoration: line-through;' : 'text-decoration: none;'
                }
            ]
        };
    }

    function underline(val) {
        return {
            name: 'u',
            attributes: [
                {
                    name: 'style',
                    value: val ? 'text-decoration: underline;' : 'text-decoration: none;'
                }
            ]
        };
    }

    return {
        color: color,
        backgroundColor: backgroundColor,
        bold: bold,
        italic: italic,
        lineThrough: lineThrough,
        underline: underline
    };
});
