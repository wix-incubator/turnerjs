'use strict'

const _ = require('lodash')
const PARAMS_TO_IGNORE = ['TRANSITION', 'URL']
const finalSkinsData = {}

const tpaGalleriesStyleMap = require('../../data/TPAGalleriesStyle.json')

function buildSkinData(skinName, skinDataItem, skinMap) {
    if (finalSkinsData[skinName]) {
        return finalSkinsData[skinName]
    }

    if (tpaGalleriesStyleMap[skinName]) {
        finalSkinsData[skinName] = tpaGalleriesStyleMap[skinName]
        return finalSkinsData[skinName]
    }

    let skinDataToReturn = {}
    const exportsSkins = []
    if (skinDataItem) {
        _.forEach(skinDataItem.params, (paramOldVal, paramKey) => {
            skinDataToReturn[paramKey] = {
                type: getParamType(paramKey, skinName, skinMap),
                defaultValue: getDefaultValue(skinName, paramKey, skinMap)
            }
        })

        const statesForParams = getParamStatesMap(skinDataItem, skinDataItem.editableParams || [])
        _.merge(skinDataToReturn, statesForParams)

        skinDataToReturn = _.pick(skinDataToReturn, (param, paramName) => {
            const mutators = _.get(skinDataItem, ['paramsMutators', paramName], [])
            return param.state && (_.isArray(param.defaultValue) ? _.some(mutators, 2) : _.isEmpty(mutators))
        })

        if (skinDataItem.exports) {
            _.forEach(skinDataItem.exports, exportData => {
                if (exportData && exportData.skin) {
                    exportsSkins.push(exportData.skin)
                }
            })
        }

        _.forEach(exportsSkins, exportedSkinName => {
            _.merge(skinDataToReturn, buildSkinData(exportedSkinName, skinMap[exportedSkinName], skinMap))
        })
    }

    finalSkinsData[skinName] = _.pick(skinDataToReturn, paramData => !_.includes(PARAMS_TO_IGNORE, paramData.type))

    return finalSkinsData[skinName]
}

const paramRegx = /\[(.*?)\]/g
function getParamStatesMap(skinDataItem, editableParamNames){
    const paramsStateMap = {}
    const cssObject = skinDataItem.css
    _.forEach(cssObject, (cssRule, selector) => {
        const matches = cssRule.match(paramRegx)
        const selectorState = getSelectorState(selector)
        if (matches) {
            _.forEach(matches, paramWithBrackets => {
                const param = paramWithBrackets.slice(1, -1) //remove brackets
                paramsStateMap[param] = {state: selectorState}
            })
        }
    })
    _.forEach(editableParamNames, editableParamName => {
        paramsStateMap[editableParamName] = paramsStateMap[editableParamName] || {state: 'regular'}
    })
    return fixParamsVisibleAfterTransitions(skinDataItem, paramsStateMap)
}

function getSelectorState(selector) {
    if (_.includes(selector, ':hover')) {
        return 'hover'
    }
    if (_.includes(selector, ':active')) {
        return 'active'
    }
    if (_.includes(selector, ':focus')) {
        return 'focus'
    }

    if (_.includes(selector, 'data-disabled="true"')) {
        return 'disabled'
    }

    if (_.includes(selector, 'data-error="true"')) {
        return 'error'
    }
    return 'regular'
}

const HOVER_AND_ACTIVE = [':hover', ':active']

function removeHoverAndActive(selector){
    return _.reduce(HOVER_AND_ACTIVE, (selectorString, pseudo) => selectorString.replace(pseudo, ''), selector)
}

function filterHoverAndActiveSelectors(selector){
    return _.some(HOVER_AND_ACTIVE, pseudo => _.includes(selector, pseudo))
}

function extractSkinParamsFromCssRule(cssRuleForNormalSelector, skinParams){
    const matches = cssRuleForNormalSelector.match(paramRegx)
    if (matches) {
        return _.reduce(matches, (matchedParams, paramWithBrackets) => {
            const param = paramWithBrackets.slice(1, -1) //remove brackets
            if (_.includes(skinParams, param)) {
                matchedParams.push(param)
            }
            return matchedParams
        }, [])
    }
    return []
}

function isAffectedByOpacityTransition(cssRuleForPseudoSelector, cssRuleForNormalSelector){
    return _.includes(cssRuleForNormalSelector, 'opacity:0') &&
        ( _.includes(cssRuleForPseudoSelector, 'opacity:1') || _.includes(cssRuleForPseudoSelector, 'opacity:0.') )
}

function isAffectedByVisibilityChange(cssRuleForPseudoSelector){
    return _.includes(cssRuleForPseudoSelector, 'visibility:visible')
}

function isSkinpartAffectedByTransition(cssRuleForPseudoSelector, cssRuleForNormalSelector){
    return isAffectedByOpacityTransition(cssRuleForPseudoSelector, cssRuleForNormalSelector) || isAffectedByVisibilityChange(cssRuleForPseudoSelector)
}

function fixParamsVisibleAfterTransitions(skinDataItem, skinParamsStatesMap){
    const cssObj = skinDataItem.css
    const skinParams = _.keys(skinDataItem.params)

    _(cssObj)
        .keys()
        .filter(filterHoverAndActiveSelectors)
        .map(selector => { //eslint-disable-line array-callback-return
            const cssRuleForPsuedoSelector = cssObj[selector]
            const normalSelector = removeHoverAndActive(selector)
            const cssRuleForNormalSelector = cssObj[normalSelector]
            if (isSkinpartAffectedByTransition(cssRuleForPsuedoSelector, cssRuleForNormalSelector) && cssRuleForNormalSelector) {
                const paramsForNormalSelector = extractSkinParamsFromCssRule(cssRuleForNormalSelector, skinParams)
                if (paramsForNormalSelector.length) {
                    const state = getSelectorState(selector)
                    return _.reduce(paramsForNormalSelector, (paramsMap, param) => {
                        paramsMap[param] = {state}
                        return paramsMap
                    }, {})
                }
            }
        })
        .compact()
        .forEach(fixedParamsMap => {
            _.merge(skinParamsStatesMap, fixedParamsMap)
        })
        .value()
    return skinParamsStatesMap
}

function getDefaultValue(skinName, paramKey, skinMap) {
    return skinMap[skinName].paramsDefaults[paramKey]
}

function getParamType(skinParamKey, skinName, skinMap) {
    return skinMap[skinName].params[skinParamKey]
}

function flattenDefaults(skins) {
    skins = _.cloneDeep(skins)
    _.forEach(skins, skinDataItem => {
        _.forEach(skinDataItem, paramItem => {
            paramItem.defaultValue = _.isArray(paramItem.defaultValue) ? skinDataItem[paramItem.defaultValue[0]].defaultValue : paramItem.defaultValue
        })
    })
    return skins
}



const skinParamMapper = {
    getSkinParamMap: skins => {
        _.forEach(skins, (skinDataItem, skinName) => {
            buildSkinData(skinName, skinDataItem, skins)
        })

        return flattenDefaults(finalSkinsData)
    }
}

module.exports = skinParamMapper
