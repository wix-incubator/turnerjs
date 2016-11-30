'use strict'

const _ = require('lodash')
const sassFunctionsRegex = /([a-z\d-]+\([^\(\)]*\))/gi
const cssRuleRegex = /([a-z\d-]+):/

/**
 * source for native css functions: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
 * running this in console:
     $('code').filter(function (ind, elem) {
        return elem.textContent.match(/([a-z\d-]+\([^\)]*\))/i)
    }).map(function (ind, e) {
        const funcName = e.textContent.slice(0, -2);
        if (funcName[0] === ':') {
            return funcName.slice(1);
        }
        return funcName;
    });
*/

const NATIVE_CSS_FUNCTIONS = ['annotation', 'attr', 'blur', 'brightness', 'calc', 'character-variant', 'circle', 'contrast', 'cubic-bezier', 'dir', 'drop-shadow', 'element', 'ellipse', 'grayscale', 'hsl', 'hsla', 'hue-rotate', 'image', 'inset', 'invert', 'lang', 'linear-gradient', 'matrix', 'matrix3d', 'minmax', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type', 'opacity', 'ornaments', 'perspective', 'polygon', 'radial-gradient', 'rect', 'repeat', 'repeating-linear-gradient', 'repeating-radial-gradient', 'rgb', 'rgba', 'rotate', 'rotatex', 'rotatey', 'rotatez', 'rotate3d', 'saturate', 'scale', 'scalex', 'scaley', 'scalez', 'scale3d', 'sepia', 'skew', 'skewx', 'skewy', 'steps', 'styleset', 'stylistic', 'swash', 'symbols', 'translate', 'translatex', 'translatey', 'translatez', 'translate3d', 'url', 'var']

const NATIVE_CSS_FUNCTIONS_MAP = _.reduce(NATIVE_CSS_FUNCTIONS, (funcMap, funcName) => {
    funcMap[funcName] = 1
    return funcMap
}, {})

function extractSassFunctionsDefinitions(sassFileString) {
    const sassFileLines = sassFileString.split('\n')
    const parsedSassFunctionsArray = _.map(sassFileLines, (sassLineStr, ind) => extractCssRuleAndSassFunctions(sassLineStr, ind))
    return _.flattenDeep(_.compact(parsedSassFunctionsArray))
}

function extractCssRuleAndSassFunctions(sassString, lineNumber) {
    let cssRule

    const sassFunctions = sassString.match(sassFunctionsRegex)

    if (sassFunctions) {
        cssRule = sassString.match(cssRuleRegex)
        if (cssRule) {
            cssRule = cssRule[0].slice(0, -1)
            const arrayToReturn = []
            _.forEach(sassFunctions, sassFn => {
                const sassFunctionDefinition = parseSassFnToObject(cssRule, sassFn, lineNumber)
                if (sassFunctionDefinition) {
                    arrayToReturn.push(sassFunctionDefinition)
                }
            })
            return arrayToReturn
        }
    }
    return null
}

function parseSassFnToObject(cssRule, functionExpressoinString, lineNumber) {
    const openParenthesisIndex = functionExpressoinString.indexOf('(')
    const funcName = functionExpressoinString.slice(0, openParenthesisIndex)
    if (!NATIVE_CSS_FUNCTIONS_MAP[funcName]) {
        let args = functionExpressoinString.slice(openParenthesisIndex + 1, -1).split(',')
        args = _.invoke(args, 'trim')
        const sassFnDefinition = {
            cssRule,
            funcName,
            args,
            line: lineNumber
        }

        return sassFnDefinition
    }
    return null
}

module.exports = extractSassFunctionsDefinitions
