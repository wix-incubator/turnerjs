'use strict'

const _ = require('lodash')
const sassFunctionsToJSON = require('./sassFunctionsToJSON')

const DIRECTIONS = ['top', 'bottom', 'left', 'right']

function sassSkinMigrator(sassString) {
    const sassFunctionsDefinitions = sassFunctionsToJSON(sassString)
    const migrationFunctions = _(sassFunctionsDefinitions)
        .filter(onlySkinParamRelatedSassFunctions)
        .groupBy(groupBySkinParam)
        .map(createSkinParamFunctionMigrator)
        .value()

    const sassLines = sassString.split('\n')
    const migratedSassLines = migrateSassLines(migrationFunctions, sassLines)
    return migratedSassLines.join('\n')
}

function onlySkinParamRelatedSassFunctions(functionDefinition) {
    return !!PARAM_FUNCTION_TO_PARAM_TYPE[functionDefinition.funcName]
}

function groupBySkinParam(sassFunctionDefinition) {
    return sassFunctionDefinition.args[0]
}

function createSkinParamFunctionMigrator(allSassFunctionDefinitionsForParam, paramName) {
    const unmigratedSassFunctions = _.filter(allSassFunctionDefinitionsForParam, filterByFunctionsToMigrate)
    if (unmigratedSassFunctions.length) {
        const unmigratedFunctionName = unmigratedSassFunctions[0].funcName
        const migrationRule = getMigrationRuleForParam(unmigratedFunctionName, allSassFunctionDefinitionsForParam) //IMPORTANT: we get the rule based on all uses of the param
        if (migrationRule) {
            const linesToFix = _.pluck(unmigratedSassFunctions, 'line')

            const currentSassFunction = `${unmigratedFunctionName}(${paramName}`
            const newSassFunction = `${migrationRule.newSassFunction}(${paramName}`

            return function migrationFunc(sassLinesArray){
                _.forEach(linesToFix, lineNumber => {
                    sassLinesArray[lineNumber] = sassLinesArray[lineNumber].replace(currentSassFunction, newSassFunction)
                })
            }
        }
    }

    return _.noop
}

function filterByFunctionsToMigrate(functionDefinition){
    return !!MIGRATION_MAP[functionDefinition.funcName]
}

function migrateSassLines(migrationFunctions, sassLinesArray){
    return _.reduce(migrationFunctions, (sassLines, migrationFunc) => {
        migrationFunc(sassLines)
        return sassLines
    }, sassLinesArray)
}

/**
 * This returns the FIRST matching migration rule in our MIGRATION_MAP. This means the order of the migration rules in the map is IMPORTANT, since it's our 'best guess hueristic' for automatic migration.
 * For example, if 'brd' is used with param-size under cssRules 'border', 'padding', 'margin', we will take the first migration rule which matches the cssRule.
 * This way, we can easily change a hueristic for migration by simply defining the cssRule and the new sassFunction and deciding the order of precedence.
 * @param sassFunctionDefinitionsForSkinParam
 * @returns {*}
 */
function getMigrationRuleForParam(funcName, sassFunctionDefinitionArray){
    const cssRulesWhichUseThisParam = _.uniq(_.pluck(sassFunctionDefinitionArray, 'cssRule'))
    const matchedMigrationRule = _.find(MIGRATION_MAP[funcName], migrationRule => _.includes(cssRulesWhichUseThisParam, migrationRule.cssRule) || migrationRule.multipleCssRuleMatcher && multipleRuleMatcher(migrationRule.multipleCssRuleMatcher, cssRulesWhichUseThisParam))

    return matchedMigrationRule
}

const SIZE_MIGRATION_RULES = _.flattenDeep([
    {cssRule: 'border', newSassFunction: 'param-border-size', multipleCssRuleMatcher: matchBorderWithDirection},
    {cssRule: 'border-width', newSassFunction: 'param-border-size', multipleCssRuleMatcher: matchBorderWidthWithDirection},
    createDirectionBasedMigrationRules('border-<%= dir %>', 'param-border-<%= dir %>-size'),
    createDirectionBasedMigrationRules('border-<%= dir %>-width', 'param-border-<%= dir %>-size'),
    {cssRule: 'stroke-width', newSassFunction: 'param-border-size'},
    {cssRule: 'padding', newSassFunction: 'param-padding-size', multipleCssRuleMatcher: matchPaddingWidthWithDirection},
    createDirectionBasedMigrationRules('padding-<%= dir %>', 'param-padding-<%= dir %>-size'),
    {cssRule: 'margin', newSassFunction: 'param-margin-size', multipleCssRuleMatcher: matchMarginWithDirection},
    createDirectionBasedMigrationRules('margin-<%= dir %>', 'param-margin-<%= dir %>-size'),
    {cssRule: 'background-size', newSassFunction: 'param-bg-size'},
    {cssRule: 'width', newSassFunction: 'param-width'},
    {cssRule: 'height', newSassFunction: 'param-height'},
    {cssRule: '', newSassFunction: 'param-margin-size', multipleCssRuleMatcher: matchDirection},
    createDirectionBasedMigrationRules('<%= dir %>', 'param-<%= dir %>')

])

const COLOR_ALPHA_MIGRATION_RULES = [
    {cssRule: 'border', newSassFunction: 'param-border-color-alpha', multipleCssRuleMatcher: matchBorderWithDirection},
    {cssRule: 'stroke', newSassFunction: 'param-border-color-alpha', multipleCssRuleMatcher: matchBorderColorWithDirection},
    {cssRule: 'border-color', newSassFunction: 'param-border-color-alpha'},
    {cssRule: 'background', newSassFunction: 'param-bg-color'},
    {cssRule: 'background-color', newSassFunction: 'param-bg-color'},
    {cssRule: 'fill', newSassFunction: 'param-bg-color'},
    {cssRule: 'color', newSassFunction: 'param-text-color'},
    {cssRule: 'box-shadow', newSassFunction: 'param-box-shadow-color'}
]

const COLOR_MIGRATION_RULES = [
    {cssRule: 'border', newSassFunction: 'param-border-color', multipleCssRuleMatcher: matchBorderWithDirection},
    {cssRule: 'border-color', newSassFunction: 'param-border-color', multipleCssRuleMatcher: matchBorderColorWithDirection},
    {cssRule: 'color', newSassFunction: 'param-text-color'},
    {cssRule: 'background', newSassFunction: 'param-bg-color'},
    {cssRule: 'background-color', newSassFunction: 'param-bg-color'}
]

/**
 * a map of sassFunc: [arrayOfMigrationRules]
 * note that ORDER OF RULES DOES MATTER! (see comments in functions below)
 * @type {{}}
 */
const MIGRATION_MAP = {
    'param-size': SIZE_MIGRATION_RULES,
    'param-number': SIZE_MIGRATION_RULES,
    'param-color-alpha': COLOR_ALPHA_MIGRATION_RULES,
    'param-color': COLOR_MIGRATION_RULES
}

/**
 * This map is just for reference.
 * This is what the cssToJson will create from these functions, as defined in the comments of the sass-functions (which is why they exist in the first place)
 * We also use this to detect the correct migration type when parsing a file that has already been migrated, so that we don't filter out these rules
 * In other words, if we fucked up and need to run migration on already migrated files, or add/change skins for some reason, this is what makes it work
 */
const PARAM_FUNCTION_TO_PARAM_TYPE = {
    'param-size': 'SIZE',
    'param-number': 'SIZE',
    'param-color': 'COLOR',
    'param-color-alpha': 'COLOR_ALPHA',
    'param-box-shadow': 'BOX_SHADOW',
    'param-bg-color': 'BG_COLOR_ALPHA',
    'param-border-color-alpha': 'BORDER_COLOR_ALPHA',
    'param-box-shadow-color': 'BOX_SHADOW_COLOR_ALPHA',
    'param-text-color': 'TEXT_COLOR',
    'param-border-color': 'BORDER_COLOR',
    'param-border-size': 'BORDER_SIZE',
    'param-border-top-size': 'BORDER_TOP_SIZE',
    'param-border-bottom-size': 'BORDER_BOTTOM_SIZE',
    'param-border-left-size': 'BORDER_LEFT_SIZE',
    'param-border-right-size': 'BORDER_RIGHT_SIZE',
    'param-padding-size': 'PADDING_SIZE',
    'param-padding-top-size': 'PADDING_TOP_SIZE',
    'param-padding-bottom-size': 'PADDING_BOTTOM_SIZE',
    'param-padding-left-size': 'PADDING_LEFT_SIZE',
    'param-padding-right-size': 'PADDING_RIGHT_SIZE',
    'param-margin-size': 'MARGIN_SIZE',
    'param-margin-top-size': 'MARGIN_TOP_SIZE',
    'param-margin-bottom-size': 'MARGIN_BOTTOM_SIZE',
    'param-margin-left-size': 'MARGIN_LEFT_SIZE',
    'param-margin-right-size': 'MARGIN_RIGHT_SIZE',
    'param-bg-size': 'BG_SIZE',
    'param-width': 'WIDTH_SIZE',
    'param-height': 'HEIGHT_SIZE',
    'param-top': 'TOP_SIZE',
    'param-bottom': 'BOTTOM_SIZE',
    'param-left': 'LEFT_SIZE',
    'param-right': 'RIGHT_SIZE'
}

function matchBorderWithDirection(cssRule){
    return cssRule.match(/border-(top|left|bottom|right)$/)
}

function matchBorderWidthWithDirection(cssRule){
    return cssRule.match(/border-(top|left|bottom|right)-width$/)
}

function matchBorderColorWithDirection(cssRule){
    return cssRule.match(/border-(top|left|bottom|right)-color/)
}

function matchMarginWithDirection(cssRule){
    return cssRule.match(/margin-(top|left|bottom|right)$/)
}
function matchPaddingWidthWithDirection(cssRule){
    return cssRule.match(/padding-(top|left|bottom|right)$/)
}

function matchDirection(cssRule){
    return _.includes(DIRECTIONS, cssRule)
}

function createDirectionBasedMigrationRules(cssRuleTemplate, newSassFunctionTemplate) {
    return _.map(DIRECTIONS, dir => ({
        cssRule: _.template(cssRuleTemplate)({dir}),
        newSassFunction: _.template(newSassFunctionTemplate)({dir})
    }))
}

function multipleRuleMatcher(matcher, cssRulesArray){
    return _.filter(cssRulesArray, matcher).length > 1
}

module.exports = sassSkinMigrator

// to get all new sass function names:
// const newSassFunctions = _.uniq(_.reduce(MIGRATION_MAP, function(results, migrationRules){
//    results = results.concat(_.pluck(migrationRules, 'newSassFunction'))
//    return results;
// }, []));
// console.log(newSassFunctions);
