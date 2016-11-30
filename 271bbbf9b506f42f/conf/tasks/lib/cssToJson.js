'use strict'
const path = require('path')
const _ = require('lodash')
const cheerio = require('cheerio')
const fs = require('fs')
const fileset = require('fileset')
const utils = require('./convertersUtils.js')
const skinParamMapper = require('./skinParamMapper')
const math = require('mathjs')

let skinCount = 0

const xmlComments = {
    mutators: /\/\*<mutator(.*?)<\/mutator>\*\//gi,
    params: /\/\*<param(.*?)<\/param>\*\//gi,
    exports: /\/\*<exports(.*?)\/\>\*\//gi,
    sumParams: /\/\*<sumparams(.*?)\/\>\*\//gi,
    mappedParams: /\/\*<mappedParam(.*?)\/\>\*\//gi,
    defineParams: /\/\*<defineParam(.*?)\/\>\*\//gi,
    defineEditableParams: /\/\*<defineEditableParam(.*?)\/\>\*\//gi
}

const SIZE_ALIASES = [
    'BORDER_SIZE',
    'BORDER_TOP_SIZE',
    'BORDER_BOTTOM_SIZE',
    'BORDER_LEFT_SIZE',
    'BORDER_RIGHT_SIZE',
    'PADDING_SIZE',
    'PADDING_TOP_SIZE',
    'PADDING_BOTTOM_SIZE',
    'PADDING_LEFT_SIZE',
    'PADDING_RIGHT_SIZE',
    'MARGIN_SIZE',
    'MARGIN_TOP_SIZE',
    'MARGIN_BOTTOM_SIZE',
    'MARGIN_LEFT_SIZE',
    'MARGIN_RIGHT_SIZE',
    'BG_SIZE',
    'WIDTH_SIZE',
    'HEIGHT_SIZE',
    'TOP_SIZE',
    'BOTTOM_SIZE',
    'LEFT_SIZE',
    'RIGHT_SIZE',
    'TEXT_SIZE'
]
const COLOR_ALIASES = [
    'TEXT_COLOR',
    'BORDER_COLOR'
]
const COLOR_ALPHA_ALIASES = [
    'BORDER_COLOR_ALPHA',
    'BOX_SHADOW_COLOR_ALPHA',
    'TEXT_COLOR_LEGACY_ALPHA'
]

const BG_COLOR_ALIASES = [
    'BG_COLOR_ALPHA'
]

const PARAM_ALIAS_MAP = {}

_.forEach(SIZE_ALIASES, alias => {
    PARAM_ALIAS_MAP[alias] = 'SIZE'
})
_.forEach(COLOR_ALIASES, alias => {
    PARAM_ALIAS_MAP[alias] = 'COLOR'
})
_.forEach(COLOR_ALPHA_ALIASES, alias => {
    PARAM_ALIAS_MAP[alias] = 'COLOR_ALPHA'
})
_.forEach(BG_COLOR_ALIASES, alias => {
    PARAM_ALIAS_MAP[alias] = 'BG_COLOR'
})


const MEDIA_QUERY_REGEX = /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+[^\}]+\}/igm
const KEYFRAME_REGEX = /@[-A-Za-z]*keyframes [^\{]+\{([^\{\}]*\{[^\}\{]*\})+[^\}]+\}/igm

function decodeParamName(paramName) {
    if (paramName[0] === '_') {
        return `$${paramName.slice(1)}`
    }
    return paramName
}

function castValue(value) {
    if (value === 'true') {
        return true
    }
    if (value === 'false') {
        return false
    }
    if (Array.isArray(value)) {
        return _.map(value, castValue)
    }
    if (typeof value === 'string' && !isNaN(value)) {
        return parseFloat(value)
    }
    return value
}

function useAliasParamTypeIfExist(param){
    const paramTypeAlias = PARAM_ALIAS_MAP[param.type]
    if (!_.isUndefined(paramTypeAlias)){
        param.type = paramTypeAlias
    }
}

function parseXmlFromCssComments(css, regex) {
    return _.reduce(removeNewLines(css).match(regex), (result, matchingStr) => {
        const parsed = cheerio.parseHTML(matchingStr.trim())[1].attribs
        result.push(parsed)
        return result
    }, [])
}

function uniqueKeepLast(arr, uniqueField) {
    return _.values(
        _.reduce(arr, (res, obj) => {
            res[obj[uniqueField]] = obj
            return res
        }, {})
    )
}

function parseComments(type, css) {
    if (!xmlComments[type]) {
        return []
    }
    return uniqueKeepLast(parseXmlFromCssComments(css, xmlComments[type]), 'name')
}

const fixAttrib = (function () {
    const mapNames = {
        acceptcharset: 'acceptCharset',
        accesskey: 'accessKey',
        frameborder: 'frameBorder',
        allowtransparency: 'allowTransparency',
        allowfullscreen: 'allowFullScreen',
        autocomplete: 'autoComplete',
        autoplay: 'autoPlay',
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        colspan: 'colSpan',
        maxlength: 'maxLength',
        rowspan: 'rowSpan',
        tabindex: 'tabIndex',
        viewbox: 'viewBox',
        preserveaspectratio: 'preserveAspectRatio',
        'fill-opacity': 'warnUnknownProperty',
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap'
    }

    function fixValue(name, value) {
        switch (value) {
            case 'true':
            case name:
                return true
            case '0':
                return 0
            default:
                return value
        }
    }

    return function (name, value) {
        return _.zipObject([mapNames[name] || name], [fixValue(name, value)])
    }
}())

function cheerioArrayToReact(tree) {
    return _.compact(_.map(tree, node => {
        if (node.type === 'text'){
            const textData = node.data && node.data.trim()
            return textData || null
        }
        if (node.type !== 'tag') {
            return null
        }

        let nodeData = [node.name, null, [], {}]

        _.forEach(node.attribs, (attribVal, attribName) => {
            if (attribName === 'id') {
                nodeData[1] = attribVal
            } else if (attribName === 'class') {
                if (attribVal.trim()) {
                    nodeData[2] = _.map(attribVal.trim().split(' '), cName => `_${cName}`)
                }
            } else {
                _.assign(nodeData[3], fixAttrib(attribName, attribVal))
            }
        })

        if (node.children.length) {
            nodeData = nodeData.concat(_.compact(cheerioArrayToReact(node.children)))
        }
        return nodeData
    }))
}

function createReactDom(html) {
    const cheerioArray = cheerio.parseHTML(html.trim().replace(/\n/, ''))
    return cheerioArrayToReact(cheerioArray[0].children)
}

function splitCssToDefinitions(css) {
    const cssDefinitions = _.map(css.split('}'), rule => `${rule}}`)

    return _.initial(cssDefinitions)
}

function processParamPlaceholder(type, name, value) {
    let placeholder = `[${decodeParamName(name)}]`
    if (type === 'URL') {
        placeholder = `url(${placeholder}${value.split('|')[1]})`
    }
    return placeholder
}

function processPlaceholders(css) {
    _.forEach(['mappedParams', 'exports', 'sumParams', 'defineParams'], part => {
        css = css.replace(xmlComments[part], '')
    })
    _.forEach(['params', 'mutators'], part => {
        css = css.replace(xmlComments[part], full => {
            const item = parseXmlFromCssComments(full, xmlComments[part], part)[0]
            return processParamPlaceholder(item.type, item.name, item.value)
        })
    })
    return css
}

function removeNewLines(css) {
    return css.replace(/\r?\n|\r|\n/g, '')
}

function handleContainerSelector(selector) {
    return selector
        .replace(/^:host\.(.+) \./, '%.$1 .')
        .replace(/^:host\./, '%_')
        .replace(/^:host/, '%')
        .replace(/:host/, '')
}

function handleContainerAttributeSelector(selector) {
    if (selector.indexOf('[') === 0) {
        selector = `%${selector}`
    }
    return selector
}

function handleClassSelectors(selector) {
    if (_.includes(selector, '% .') || _.includes(selector, '%.')) {
        return selector
    }
    return selector.replace(/\./g, '%_')
}

function handleSkinParts(selector) {
    if (_.includes(selector, '% #')) {
        return selector
    }
    return selector.replace(/#/g, '%')
}

function isLetter(character) {
    return /^[a-zA-Z]$/.test(character)
}

function handleTagNameSelectors(selector) {
    if (isLetter(selector[0])) {
        selector = `% ${selector}`
    }
    return selector
}

function processCssSelector(selectors) {
    return _.map(selectors.split(','), selector => {
        selector = selector.trim()
        //NOTE: order of calling the various handlers matters here
        _.forEach([
            handleContainerSelector,
            handleContainerAttributeSelector,
            handleClassSelectors,
            handleSkinParts,
            handleTagNameSelectors
        ], handler => {
            selector = handler(selector)
        })

        return selector
    }).join(',')
}

function removeSpacesBetweenCssRules(cssRules) {
    return _(cssRules)
        .split(';')
        .map(rule => _(rule).split(':').invoke('trim').join(':'))
        .invoke('trim')
        .join(';')
}

function processCssDefinition(definition) {
    return _.uniq(definition.split(';')).join(';')
}

function processCssSelectors(css) {
    return _.map(splitCssToDefinitions(css), cssDefinition => {
        const resultParts = []
        _.forEach(cssDefinition.split('{'), (part, index) => {
            if (index === 0) {
                resultParts.push(processCssSelector(part.trim()))
            } else {
                resultParts.push(`${processCssDefinition(part.split('}')[0].trim())}}`)
            }
        })
        return resultParts.join('{')
    }).join('')
}

function convertCssStringToObject(css) {
    return _.reduce(splitCssToDefinitions(css), (result, cssRule) => {
        const parts = cssRule.split('{')
        if (parts.length === 2) {
            if (!result[parts[0]]) {
                result[parts[0]] = ''
            }
            result[parts[0]] += parts[1].substring(0, parts[1].length - 1).trim()
        }
        return result
    }, {})
}

function removeMultilineComments(css) {
    return css.replace(/\/\*(.*?)\*\//g, '')
}

function removeMediaQueries(css) {
    return css.replace(MEDIA_QUERY_REGEX, '')
}

function removeKeyframes(css) {
    return css.replace(KEYFRAME_REGEX, '')
}

function removeCharsetDefinition(css) {
    return css.replace(/@charset "(.*?)";/g, '')
}

function getSkinCss(originalCSS) {
    let css = originalCSS
    _.forEach([
        removeCharsetDefinition,
        removeSpacesBetweenCssRules,
        removeNewLines,
        processPlaceholders,
        removeMultilineComments,
        removeMediaQueries,
        removeKeyframes,
        processCssSelectors,
        convertCssStringToObject,
        getKeyframes
    ], handler => {
        css = handler(css, originalCSS)
    })

    return css
}

function getSkinParamsTypes(paramsData, mutatorsData, mappedParamsData, sumParamsData, defineParamsData, defineEditableParamsData) {
    if (!_.flattenDeep(arguments).length) {
        //no skin params of any kind
        return null
    }

    const paramsTypes = {}

    _.forEach(_.flattenDeep([paramsData, mutatorsData, sumParamsData, defineParamsData, defineEditableParamsData]), item => {
        const paramName = decodeParamName(item.name)
        paramsTypes[paramName] = item.type || 'SIZE' //sumParams dont have type, and are always SIZE
    })

    _.forEach(mappedParamsData, mappedParam => {
        //support overriding mapped param type (optionally set mappedParamType)
        paramsTypes[mappedParam.name] = mappedParam.mappedtype ? mappedParam.mappedtype : paramsTypes[mappedParam.mapped]
    })

    return paramsTypes
}

function getSkinEditableParamsTypes(defineEditableParamsData) {
    if (!defineEditableParamsData.length) {
        //no skin params of any kind
        return null
    }
    return _.pluck(defineEditableParamsData, 'name')
}

function getSkinExports(exportsData) {
    if (!exportsData || !exportsData.length) {
        return null
    }

    return _.reduce(exportsData, (result, item) => {
        const key = item.name
        const keyParts = key.split(':')
        if (keyParts.length > 1) {
            result[keyParts[0]] = result[keyParts[0]] || {}
            result[keyParts[0]][keyParts[1]] = castValue(item.value)
        } else {
            result[key] = castValue(item.value)
        }
        return result
    }, {})
}

function getSkinParamsMutators(mutatorsData, evals) {
    if (!mutatorsData.length) {
        //no skin params of any kind
        return null
    }
    const mutators = {}

    _.forEach(mutatorsData, mutatorData => {
        if (evals && mutatorData.func === 'eval') {
            evals[mutatorData.amount] = mutatorData.param
        }

        mutators[mutatorData.name] = [
            [
                mutatorData.func,
                castValue(mutatorData.amount)
            ].concat(mutatorData['default-only'] ? [true] : [])
        ]
    })

    return mutators
}

function getParamsDefaults(paramsData, mutatorsData, mappedParamsData, sumParamsData, defineParamsData, defineEditableParamsData) {
    if (!_.flattenDeep(arguments).length) {
        //no skin params of any kind
        return null
    }

    const paramsDefaults = {}

    _.forEach(_.flattenDeep([paramsData, defineParamsData, defineEditableParamsData]), paramData => {
        //URL params look like this: "BASE_THEME_DIRECTORY|some_icon.png". we only want the first part
        const paramName = decodeParamName(paramData.name)
        paramsDefaults[paramName] = (_.includes(paramData.value, '|') ? paramData.value.split('|')[0] : paramData.value)
    })

    _.forEach(mutatorsData, mutatorData => {
        //if mutatorData.param is specified, this is a mutator for other parameter
        //otherwise, it mutates a constant value;
        paramsDefaults[mutatorData.name] = mutatorData.param ? [mutatorData.param] : mutatorData.const
    })

    _.forEach(mappedParamsData, mappedParamData => {
        paramsDefaults[mappedParamData.name] = [mappedParamData.mapped]
    })

    _.forEach(sumParamsData, data => {
        paramsDefaults[data.name] = _(data.args).split(',').invoke('trim').value()
    })
    return paramsDefaults
}

function getMediaQuery(css) {
    const match = removeNewLines(css).match(MEDIA_QUERY_REGEX)

    if (!match || !match.length) {
        return null
    }


    return _.map(match, mq => ({
        query: mq.substring(0, mq.indexOf('{')).trim(),
        css: getSkinCss(mq.substring(mq.indexOf('{') + 1, mq.length).trim())
    }))
}

function getKeyframes(object, css) {
    const match = removeNewLines(css).match(KEYFRAME_REGEX)

    if (!match || !match.length) {
        return object
    }

    return _.assign(object, _.reduce(match, (result, kf) => {
        const splitIndex = kf.indexOf('keyframes') + 10
        const bracketIndex = kf.indexOf('{')
        const keyframeCss = kf.substring(bracketIndex + 1, kf.length - 1).trim()
        const selector = `${kf.substr(0, splitIndex)}%${kf.substr(splitIndex, bracketIndex - splitIndex)}`
        result[selector.trim()] =
            _.map(getSkinCss(keyframeCss), (innerCSS, key) => `${key}{${innerCSS}}`).join('')

        return result
    }, {}))
}

function createSkinJson(html, css, keepSkinParamAliases, evals) {
    const skinJson = {
        react: createReactDom(html)
    }

    if (css) {
        const paramsData = parseComments('params', css)
        if (!keepSkinParamAliases) {
            _.forEach(paramsData, param => {
                useAliasParamTypeIfExist(param)
            })
        }
        const mutatorsData = parseComments('mutators', css)
        const exportsData = parseComments('exports', css)
        const sumParamsData = parseComments('sumParams', css)
        const mappedParamsData = parseComments('mappedParams', css)
        const defineParamsData = parseComments('defineParams', css)
        const defineEditableParamsData = parseComments('defineEditableParams', css)

        const skinValues = {
            exports: getSkinExports(exportsData),
            params: getSkinParamsTypes(paramsData, mutatorsData, mappedParamsData, sumParamsData, defineParamsData, defineEditableParamsData),
            editableParams: getSkinEditableParamsTypes(defineEditableParamsData),
            paramsDefaults: getParamsDefaults(paramsData, mutatorsData, mappedParamsData, sumParamsData, defineParamsData, defineEditableParamsData),
            paramsMutators: getSkinParamsMutators(mutatorsData, evals),
            mediaQueries: getMediaQuery(css),
            css: getSkinCss(css)
        }

        _.forEach(skinValues, (value, key) => {
            if (value) {
                skinJson[key] = value
            }
        })
    }
    return skinJson
}

const skinLogger = {}

function logSkin(skinName) {
    if (skinLogger[skinName]) {
        skinLogger[skinName]++
    } else {
        skinLogger[skinName] = 1
    }
//    console.log('converted #' + skinCount, ':', skinName);
}

const compiledSkins = {}
const compiledSkinsForEditor = {}

function getSkinName(htmlFilePath) {
    return htmlFilePath.substring(0, htmlFilePath.length - 5).slice(htmlFilePath.lastIndexOf(path.sep) + 1)
}

function getFileName(skinName, files) {
    return utils.normalizePathSeparator(_.find(files, filePath => _.includes(filePath, skinName)))
}

function createCompiledSkinsModuleContent(cmpldSkins) {
    const skinsFileTemplate = '/* Autogenerated file. Do not modify */\n' +
        'define([], function() {\n' +
        '\t\'use strict\';\n' +
        '\tvar skins = {};\n' +
        '<%=skins%>' +
        '\treturn skins;\n' +
        '});'
    const skinDefinitionTemplate = '\tskins[\'<%=key%>\'] = <%=skinObject%>;\n'

    return _.template(skinsFileTemplate)({
        skins: _.reduce(_.keys(cmpldSkins), (result, key) => {
            result += _.template(skinDefinitionTemplate)({
                key,
                skinObject: JSON.stringify(cmpldSkins[key], 0, 2)
            })
            return result
        }, '')
    })
}

function compileEvals(evals) {
    const str = _.map(evals, (value, exprStr) => {
            const expr = math.parse(exprStr).toString()
            return `"${exprStr}": function(${value}) { return ${expr}; }`
        }).join(',')
    return `define([], function() {
        "use strict";
        return {
            ${str}
        };
    });`
}

function convertCssAndHtmlToJson(config, cb) {
    const skinsJsFile = utils.normalizePath(config.skinsJsFile)
    const evalsJsFile = utils.normalizePath(config.evalsJsFile)
    const editorSkinsDataFile = utils.normalizePath(config.editorSkinsData)
    const htmlLocations = _.map(config.htmlLocations, utils.normalizePath)
    const cssLocations = _.map([config.cssLocation], utils.normalizePath)

    console.log('working...')
    fileset(htmlLocations, (error, htmlFiles) => {
        if (error) {
            return console.error(error)
        }




        fileset(cssLocations, (err, cssFiles) => {
            if (err) {
                return console.error(err)
            }

            const evals = {}

            const skinNames = _.map(htmlFiles, htmlFile => getSkinName(utils.normalizePathSeparator(htmlFile)))
            _.forEach(skinNames, skinName => {
                const html = fs.readFileSync(getFileName(skinName, htmlFiles), 'utf8')
                const cssFileName = getFileName(skinName, cssFiles)
                const css = cssFileName ? fs.readFileSync(cssFileName, 'utf8') : null //skins may not have css
                skinCount++
                compiledSkins[skinName] = createSkinJson(html, css, false, evals)
                compiledSkinsForEditor[skinName] = createSkinJson(html, css, true)
                logSkin(skinName)
            })

            _.forEach(skinLogger, (value, key) => {
                if (value > 1) {
                    console.log('\rDuplicate skin:', key, 'has', value, 'copies')
                }
            })

            fs.writeFileSync(skinsJsFile, createCompiledSkinsModuleContent(compiledSkins))

            const editorSkinDataMap = skinParamMapper.getSkinParamMap(compiledSkinsForEditor)
            fs.writeFileSync(editorSkinsDataFile, createCompiledSkinsModuleContent(editorSkinDataMap))

            fs.writeFileSync(evalsJsFile, compileEvals(evals))
            console.log('\nSUCCESS: Converted', skinCount, 'skins.')
            console.log('created', skinsJsFile, 'for the viewer')
            console.log('created', editorSkinsDataFile, 'for DocumentServices')
            if (cb) {
                cb()
            }
        })
    })
}

module.exports = {convertCssAndHtmlToJson, createSkinJson, compileEvals}
