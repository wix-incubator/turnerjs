'use strict'
let cssToJson
const _ = require('lodash')

//NOTE: to run these tests, use grunt jasmine:all
describe('cssToJson compiler -->', () => {
    function wrap(html) {
        return `<template>${html || ''}</template>`
    }

    beforeEach(() => {
        cssToJson = require('../lib/cssToJson')
    })

    describe('skin react field -->', () => {
        it('should have react object', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)
            expect(skin.react).toBeDefined()
        })

        it('should be of type array', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)
            expect(Array.isArray(skin.react)).toEqual(true)
            expect(Array.isArray(skin.react)).toEqual(true)
        })

        it('should contain an item for each immediate child of <template> tag', () => {
            const html = wrap('<h1></h1><h2></h2><h3></h3><h4></h4>')
            const skin = cssToJson.createSkinJson(html, null)
            expect(skin.react.length).toEqual(4)
        })

        it('each array item should be of type array', () => {
            const html = wrap('<div></div>')
            const skin = cssToJson.createSkinJson(html, null)
            expect(Array.isArray(skin.react[0])).toEqual(true)
        })

        it('1st item in each tag\'s array should have the tagName', () => {
            const html = wrap('<span></span>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[0]).toEqual('span')
        })

        it('2nd item in each tag\'s array should have the id property', () => {
            const html = wrap('<span id="the-id"></span>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[1]).toEqual('the-id')
        })

        it('2nd item in each tag\'s array should be null if there is no id property', () => {
            const html = wrap('<span></span>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[1]).toEqual(null)
        })

        it('3rd item in each tag\'s array should be an array', () => {
            const html = wrap('<div></div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(Array.isArray(item[2])).toEqual(true)
        })

        it('3rd item in each tag\'s array should contain the list of classes, prefixed with underscore', () => {
            const html = wrap('<div class="class1 class2"></div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[2]).toEqual(['_class1', '_class2'])
        })

        it('4th item in each tag\'s array should contain the attributes (excluding id, class)', () => {
            const html = wrap('<a class="class1" href="#" alt="hello" id="some-id" data-hello="world"></a>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[3]).toEqual({href: '#', alt: 'hello', 'data-hello': 'world'})
        })

        it('5th item in each tag\'s array should be undefined if the item has no children', () => {
            const html = wrap('<div></div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(item[4]).not.toBeDefined()
        })

        it('5th item in each tag\'s array should be an array if the item has children', () => {
            const html = wrap('<div><span></span></div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(Array.isArray(item[4])).toEqual(true)
        })

        it('All items in tag\'s array after the 5th position should contain arrays of children', () => {
            const html = wrap('<div><h1></h1><h2></h2><h3></h3></div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            expect(Array.isArray(item[4])).toEqual(true)
            expect(Array.isArray(item[5])).toEqual(true)
            expect(Array.isArray(item[6])).toEqual(true)
            expect(item[7]).not.toBeDefined()
        })

        it('should ignore html comments', () => {
            const html = wrap('<!--some html comment--><div><!-- second comment --></div><!--another html comment-->')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react

            expect(Array.isArray(item)).toEqual(true)
            expect(item.length).toEqual(1)
            expect(item[0][0]).toEqual('div')
        })

        it('should return text nodes as children, trimmed', () => {
            const html = wrap('<div> abc </div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            const children = item[4]
            expect(children).toEqual('abc')
        })

        it('should not remove newlines from within textNodes which would not be removed by trim', () => { //in other words, will only remove newlines not enclosed by text
            const html = wrap('<div> \n a\nbc \n </div>')
            const skin = cssToJson.createSkinJson(html, null)
            const item = skin.react[0]
            const children = item[4]
            expect(children).toEqual('a\nbc')
        })
    })

    describe('skin exports field -->', () => {
        it('should not have exports field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)
            expect(skin.exports).not.toBeDefined()
        })

        it('should not have exports field if no skin exports are specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')
            expect(skin.exports).not.toBeDefined()
        })

        it('should have exports field if skin exports are specified', () => {
            const css = '/*<exports name="exportKey" value="exportValue" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports).toBeDefined()
            expect(typeof skin.exports).toEqual('object')
        })

        it('should have an key defined for a specified exports tag', () => {
            const css = '/*<exports name="exportKey" value="exportValue" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports.exportKey).toBeDefined()
        })

        it('should have an key with the specified value for a specified exports tag', () => {
            const css = '/*<exports name="exportKey" value="exportValue" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports.exportKey).toEqual('exportValue')
        })

        it('should have an key with the specified value for each specified exports tag', () => {
            const css = '/*<exports name="key1" value="value1" />*/some irrelevant content\n' +
                '/*<exports name="key2" value="value2" />*//*<exports name="key3" value="value3" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports).toEqual({
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
            })
        })

        it('should nest export keys if specified with colon (:)', () => {
            const css = '/*<exports name="mainKey:nestedKey" value="value1" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports).toEqual({
                mainKey: {
                    nestedKey: 'value1'
                }
            })
        })

        it('should cast boolean export values', () => {
            const css1 = '/*<exports name="key1" value="true" />*/'
            const css2 = '/*<exports name="key1" value="false" />*/'

            const skin1 = cssToJson.createSkinJson(wrap(), css1)
            const skin2 = cssToJson.createSkinJson(wrap(), css2)

            expect(skin1.exports.key1).toEqual(true)
            expect(skin2.exports.key1).toEqual(false)
        })

        it('should cast numeric export values', () => {
            const css1 = '/*<exports name="key1" value="100" />*/'
            const css2 = '/*<exports name="key1" value="3.14" />*/'

            const skin1 = cssToJson.createSkinJson(wrap(), css1)
            const skin2 = cssToJson.createSkinJson(wrap(), css2)

            expect(skin1.exports.key1).toEqual(100)
            expect(skin2.exports.key1).toEqual(3.14)
        })

        it('should remove exports with same name, and keep the last of each duplicate', () => {
            const css =
                '/*<exports name="key1" value="value1" />*/some irrelevant content\n' +
                '/*<exports name="key2" value="value2" />*//*<exports name="key1" value="value3" />*/'
            const skin = cssToJson.createSkinJson(wrap(), css)
            expect(skin.exports).toEqual({
                key1: 'value3',
                key2: 'value2'
            })
        })
    })

    describe('skin params field -->', () => {

        it('should not have params field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)

            expect(skin.params).not.toBeDefined()
        })

        it('should not have params field if params are not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')

            expect(skin.params).not.toBeDefined()
        })

        it('should have params field if params are specified', () => {
            const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'
            const skin = cssToJson.createSkinJson(wrap(), css)

            expect(skin.params).toBeDefined()
            expect(typeof skin.params).toEqual('object')
        })

        describe('normal skin params -->', () => {
            it('should have an key defined for a specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.paramName).toBeDefined()
            })

            it('should have an key with the specified value for a specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.paramName).toEqual('PARAM_TYPE')
            })

            it('should have a key with the specified value for each specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName1" value="a">*/color: red;/*</param>*/\n' +
                    '/*<param type="OTHER_PARAM_TYPE" name="paramName2" value="b">*/color: red;/*</param>*/\n' +
                    '/*<param type="PARAM_TYPE" name="paramName3" value="c">*/color: red;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params).toEqual({
                    paramName1: 'PARAM_TYPE',
                    paramName2: 'OTHER_PARAM_TYPE',
                    paramName3: 'PARAM_TYPE'
                })
            })

            it('should decode parameter names which start with _ sign, and replace with $', () => {
                const css = 'div {/*<param type="THE_TYPE" name="_paramName" value="the-value">*//*</param>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.$paramName).toBeDefined()
                expect(skin.params._paramName).not.toBeDefined()
            })
        })

        describe('mutators skin params -->', () => {
            it('should have a key with a specified mutator tag', () => {
                const css = '/*<mutator name="mutatorName" type="mutatorType" func="alpha" amount="0.75" param="bg" >*//*</mutator>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.mutatorName).toEqual('mutatorType')
            })

            it('should have a key with the specified value for each specified mutator tag', () => {
                const css = '/*<mutator name="mutator1" type="mutatorType" func="alpha" amount="0.75" param="bg" >*//*</mutator>*/\n' +
                    '/*<mutator name="mutator2" type="ANOTHER_MUTATOR_TYPE" func="alpha" amount="0.75" param="bg" >*//*</mutator>*/\n' +
                    '/*<mutator name="mutator3" type="MUTATOR_TYPE3" func="alpha" amount="0.75" param="bg" >*//*</mutator>*/\n'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params).toEqual({
                    mutator1: 'mutatorType',
                    mutator2: 'ANOTHER_MUTATOR_TYPE',
                    mutator3: 'MUTATOR_TYPE3'
                })
            })

            it('should have defaultOnly as true in paramsMutators[2]', () => {
                const css = '/*<mutator name="bgd" type="COLOR" func="brightness" amount="0.5" param="bg" default-only="true"/>*/#fff/*</mutator>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.bgd).toEqual('COLOR')
                expect(skin.paramsDefaults.bgd).toEqual(['bg'])
                expect(skin.paramsMutators.bgd).toEqual([['brightness', 0.5, true]])
            })

            it('should add evaluators to the evals list', () => {
                const css = '/*<mutator name="abc" type="SIZE" func="eval" amount="(10 + bg) % 2" param="bg" />*/#1/*</mutator>*/'
                const evals = {}

                const skin = cssToJson.createSkinJson(wrap(), css, false, evals)

                expect(skin.params.abc).toEqual('SIZE')
                expect(skin.paramsMutators.abc).toEqual([['eval', '(10 + bg) % 2']])
                expect(evals['(10 + bg) % 2']).toEqual('bg')
            })
        })

        describe('params mapped to other params -->', () => {
            it('should have a key with a specified mapped param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="bg" value="color_11">*/white/*</param>*/\n' +
                    '/*<mappedParam name="mappedParamName" mapped="bg" mappedtype=""/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.mappedParamName).toBeDefined()
            })

            it('mapped-param type should be the type of the param it is mapped to, when mappedtype attribute is not specified', () => {
                const css = '/*<param type="PARAM_TYPE" name="bg" value="color_11">*/white/*</param>*/\n' +
                    '/*<mappedParam name="mappedParamName" mapped="bg" mappedtype=""/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.mappedParamName).toEqual('PARAM_TYPE')
            })

            it('mapped param type should be as specified in the mappedtype attribute (if it is specified)', () => {
                const css = '/*<param type="PARAM_TYPE" name="bg" value="color_11">*/white/*</param>*/\n' +
                    '/*<mappedParam name="mappedParamName" mapped="bg" mappedtype="ANOTHER_TYPE"/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.mappedParamName).toEqual('ANOTHER_TYPE')
            })
        })

        describe('convert new params type to base params type', () => {
            describe('COLOR type aliases', () => {
                it('should convert each alias to type color', () => {
                    const COLOR_ALIASES = [
                        'TEXT_COLOR',
                        'BORDER_COLOR'
                    ]
                    _.forEach(COLOR_ALIASES, alias => {
                        const css = `/*<param type="${alias}" name="param1" value="color_11">*/white/*</param>*/`

                        const skin = cssToJson.createSkinJson(wrap(), css)

                        expect(skin.params.param1).toEqual('COLOR')
                    })

                })
            })

            describe('COLOR_ALPHA type aliases', () => {
                it('should convert each alias to type color', () => {
                    const COLOR_ALPHA_ALIASES = [
                        'BORDER_COLOR_ALPHA',
                        'BOX_SHADOW_COLOR_ALPHA'
                    ]
                    _.forEach(COLOR_ALPHA_ALIASES, alias => {
                        const css = `/*<param type="${alias}" name="param1" value="color_11">*/white/*</param>*/`

                        const skin = cssToJson.createSkinJson(wrap(), css)

                        expect(skin.params.param1).toEqual('COLOR_ALPHA')
                    })

                })
            })

            describe('BG_COLOR type aliases', () => {
                it('should convert each alias to type color', () => {
                    const BG_COLOR_ALIASES = [
                        'BG_COLOR_ALPHA'
                    ]
                    _.forEach(BG_COLOR_ALIASES, alias => {
                        const css = `/*<param type="${alias}" name="param1" value="color_11">*/white/*</param>*/`

                        const skin = cssToJson.createSkinJson(wrap(), css)

                        expect(skin.params.param1).toEqual('BG_COLOR')
                    })

                })
            })


            describe('SIZE type aliases', () => {
                it('should convert each alias to SIZE', () => {
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
                    _.forEach(SIZE_ALIASES, alias => {
                        const css = `/*<param type="${alias}" name="param1" value="12px">*/white/*</param>*/`

                        const skin = cssToJson.createSkinJson(wrap(), css)

                        expect(skin.params.param1).toEqual('SIZE')
                    })
                })


            })

        })

        describe('defineParams (params not used in CSS, intended for logic) -->', () => {
            it('should have a key with a defined parameter', () => {
                const css = '/*<defineParam type="THE_TYPE" name="theName" value="theValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.theName).toEqual('THE_TYPE')
            })

            it('should have a key for each of the defined parameters', () => {
                const css = '/*<defineParam type="PARAM_TYPE" name="defined1" value="theValue"/>*/' +
                    '/*<defineParam type="ANOTHER_PARAM_TYPE" name="defined2" value="theValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params).toEqual({
                    defined1: 'PARAM_TYPE',
                    defined2: 'ANOTHER_PARAM_TYPE'
                })
            })
        })

        describe('defineEditableParam (params not used in CSS, intended for logic) -->', () => {
            it('should have a key with a defined editable parameter', () => {
                const css = '/*<defineEditableParam type="PARAM_TYPE" name="paramName" value="paramValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.paramName).toEqual('PARAM_TYPE')
            })

            it('should have a key for each of the defined editable parameters', () => {
                const css = '/*<defineEditableParam type="PARAM_TYPE" name="paramName1" value="theValue"/>*/' +
                    '/*<defineEditableParam type="ANOTHER_PARAM_TYPE" name="paramName2" value="theValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.editableParams.length).toEqual(2)
                expect(skin.editableParams).toContain('paramName1')
                expect(skin.editableParams).toContain('paramName2')
            })

            it('should have a key for each of the defined editable parameters', () => {
                const css = '/*<defineEditableParam type="PARAM_TYPE" name="paramName1" value="theValue"/>*/' +
                    '/*<defineEditableParam type="ANOTHER_PARAM_TYPE" name="paramName2" value="theValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params).toEqual({
                    paramName1: 'PARAM_TYPE',
                    paramName2: 'ANOTHER_PARAM_TYPE'
                })
            })

            it('should not have the key "editableParams" if no editableParam was defined ', () => {
                const css = '/*<defineParam type="PARAM_TYPE" name="defined1" value="theValue"/>*/' +
                    '/*<defineParam type="ANOTHER_PARAM_TYPE" name="defined2" value="theValue"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)


                expect(skin.editableParams).not.toBeDefined()
            })
        })

        describe('sumParams - parameters defined as a sum of other parameters -->', () => {
            it('should have a key for a defined sumParams parameter', () => {
                const css = '/*<sumparams name="totalSum" args="param1, param2, param3"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.totalSum).toBeDefined()
            })

            it('Should have "SIZE" set as the parameter type', () => {
                const css = '/*<sumparams name="totalSum" args="param1, param2, param3"/>*/'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.params.totalSum).toEqual('SIZE')
            })
        })
    })

    describe('skin paramsDefaults field -->', () => {
        it('should not have paramsDefaults field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)

            expect(skin.paramsDefaults).not.toBeDefined()
        })

        it('should not have paramsDefaults field if params are not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')

            expect(skin.paramsDefaults).not.toBeDefined()
        })

        it('should have paramsDefaults field if a param is specified', () => {
            const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'
            const skin = cssToJson.createSkinJson(wrap(), css)

            expect(skin.paramsDefaults).toBeDefined()
            expect(typeof skin.paramsDefaults).toEqual('object')
        })

        describe('normal skin params -->', () => {
            it('should have an key defined for a specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.paramName).toBeDefined()
            })

            it('should have an key with the specified value for a specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.paramName).toEqual('paramValue')
            })

            it('should take the first part of a URL param value which contains a pipe (|)', () => {
                const css = '/*<param type="URL" name="paramName" value="part1|part2">*/background-color: #fff200;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.paramName).toEqual('part1')
            })

            it('should have a key with the specified value for each specified param tag', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName1" value="a">*/color: red;/*</param>*/\n' +
                    '/*<param type="OTHER_PARAM_TYPE" name="paramName2" value="b">*/color: red;/*</param>*/\n' +
                    '/*<param type="PARAM_TYPE" name="paramName3" value="c">*/color: red;/*</param>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults).toEqual({
                    paramName1: 'a',
                    paramName2: 'b',
                    paramName3: 'c'
                })
            })

            it('should decode parameter names which start with _ sign, and replace with $', () => {
                const css = 'div {/*<param type="THE_TYPE" name="_paramName" value="the-value">*//*</param>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.$paramName).toBeDefined()
                expect(skin.paramsDefaults._paramName).not.toBeDefined()
            })
        })

        describe('mutators skin params -->', () => {
            it('mutators for params need to be specified in an array', () => {
                const css = '<param type="PARAM_TYPE" name="theParamName" value="a">*/color: #f00;/*</param>*/\n' +
                    '/*<mutator name="theMutatorName" type="THE_TYPE" func="alpha" amount="0.75" param="theParamName" >*//*</mutator>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(Array.isArray(skin.paramsDefaults.theMutatorName)).toEqual(true)
            })

            it('mutators for params need to be specified in a single-item array', () => {
                const css = '<param type="PARAM_TYPE" name="theParamName" value="a">*/color: #f00;/*</param>*/\n' +
                    '/*<mutator name="theMutatorName" type="THE_TYPE" func="alpha" amount="0.75" param="theParamName" >*//*</mutator>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.theMutatorName.length).toEqual(1)
                expect(skin.paramsDefaults.theMutatorName[0]).toEqual('theParamName')
            })

            it('mutators for constant values need to have the mutated const specified', () => {
                const css = '/*<mutator name="theMutatorName" type="BG_COLOR" func="alpha" amount="0.75" const="#555555" >*//*</mutator>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.theMutatorName).toEqual('#555555')
            })
        })

        describe('mapped params -->', () => {
            it('mapped params should be specified in an array', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="color_11">*/white/*</param>*/\n' +
                    '/*<mappedParam name="mappedParamName" mapped="paramName" mappedtype=""/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(Array.isArray(skin.paramsDefaults.mappedParamName)).toEqual(true)
            })

            it('mapped params need to be specified in a single-item array', () => {
                const css = '/*<param type="PARAM_TYPE" name="paramName" value="color_11">*/white/*</param>*/\n' +
                    '/*<mappedParam name="mappedParamName" mapped="paramName" mappedtype=""/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.mappedParamName.length).toEqual(1)
                expect(skin.paramsDefaults.mappedParamName[0]).toEqual('paramName')
            })
        })

        describe('sumParams parameters -->', () => {
            it('sumParams parameter should be specified as an array', () => {
                const css = '/*<sumparams name="theSum" args="param1, param2"/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(Array.isArray(skin.paramsDefaults.theSum)).toEqual(true)
            })

            it('the summed parameters should be specified in an array', () => {
                const css = '/*<sumparams name="theSum" args="param1, param2, param3,param4,param5"/>*/'

                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.paramsDefaults.theSum).toEqual(['param1', 'param2', 'param3', 'param4', 'param5'])
            })
        })
    })

    describe('skin paramsMutators field -->', () => {
        it('should not have paramsMutators field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)

            expect(skin.paramsMutators).not.toBeDefined()
        })

        it('should not have paramsMutators field if param mutators are not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')

            expect(skin.paramsMutators).not.toBeDefined()
        })

        it('should have paramsMutators field if a param mutator is specified', () => {
            const css = '/*<mutator name="theMutatorName" type="BG_COLOR" func="alpha" amount="0.75" const="#555555" >*//*</mutator>*/'
            const skin = cssToJson.createSkinJson(wrap(), css)

            expect(skin.paramsMutators).toBeDefined()
            expect(typeof skin.paramsMutators).toEqual('object')
        })

        it('should have a mutator defined as an array', () => {
            const css = '/*<mutator name="theMutatorName" type="BG_COLOR" func="alpha" amount="0.75" const="#555555" >*//*</mutator>*/'

            const skin = cssToJson.createSkinJson(wrap(), css)

            expect(Array.isArray(skin.paramsMutators.theMutatorName)).toEqual(true)
            expect(Array.isArray(skin.paramsMutators.theMutatorName[0])).toEqual(true)
        })

        it('should have the mutating function defined as the first item of the array', () => {
            const css = '/*<mutator name="theMutatorName" type="BG_COLOR" func="alpha" amount="0.75" const="#555555" >*//*</mutator>*/'

            const skin = cssToJson.createSkinJson(wrap(), css)
            const mutator = skin.paramsMutators.theMutatorName[0]

            expect(mutator[0]).toEqual('alpha')
        })

        it('should have the mutation function parameter defined as the second item of the array', () => {
            const css = '/*<mutator name="theMutatorName" type="BG_COLOR" func="alpha" amount="0.75" const="#555555" >*//*</mutator>*/'

            const skin = cssToJson.createSkinJson(wrap(), css)
            const mutator = skin.paramsMutators.theMutatorName[0]

            expect(mutator[1]).toEqual(0.75)
        })
    })

    describe('skin mediaQueries field -->', () => {
        it('should not have mediaQueries field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)

            expect(skin.mediaQueries).not.toBeDefined()
        })

        it('should not have mediaQueries field if media queries are not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')

            expect(skin.mediaQueries).not.toBeDefined()
        })

        it('should have mediaQueries field if media query is specified', () => {
            const css = '@media (orientation: landscape) { #mobileAd { display: none; } }'
            const skin = cssToJson.createSkinJson(wrap(), css)

            expect(skin.mediaQueries).toBeDefined()
            expect(Array.isArray(skin.mediaQueries)).toEqual(true)
        })

        it('should have query field with the selector', () => {
            const css = '@media (orientation: landscape) { #mobileAd { display: none; } }'

            const skin = cssToJson.createSkinJson(wrap(), css)
            const mediaQuery = skin.mediaQueries[0]

            expect(mediaQuery.query).toEqual('@media (orientation: landscape)')
        })

        it('should have css field with the css rules', () => {
            const css = '@media (orientation: landscape) { #mobileAd { display: none; } }'

            const skin = cssToJson.createSkinJson(wrap(), css)
            const mediaQuery = skin.mediaQueries[0]

            expect(mediaQuery.css).toBeDefined()
            expect(mediaQuery.css['%mobileAd']).toEqual('display:none;')
        })
    })

    describe('skin css field -->', () => {
        it('should not have css field if css is not specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), null)

            expect(skin.css).not.toBeDefined()
        })

        it('should have css field if css is specified', () => {
            const skin = cssToJson.createSkinJson(wrap(), 'div {}')

            expect(skin.css).toBeDefined()
        })

        describe('css selectors -->', () => {
            it('should remove charset specification if it is present in the css file', () => {
                const charset = '@charset "UTF-SHEKER-KOLSHEU";'
                const css = ':host { width: 100px; another-css-prop: some-value; }'

                const skin = cssToJson.createSkinJson(wrap(), charset + css)

                const anyKeysWithCharsetKeyword = Object.keys(skin.css).some(key => _.includes(key, '@charset'))

                expect(anyKeysWithCharsetKeyword).toEqual(false)
            })

            it('should convert :host selectors to "empty" selector', () => {
                const css = ':host { width: 100px; another-css-prop: some-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%']).toBeDefined()
                expect(skin.css['%']).toEqual('width:100px;another-css-prop:some-value;')
            })

            it('should convert :host pseudo selectors to "empty" selector with pseudo selector', () => {
                const css = ':host:hover { some-css-prop: some-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%:hover']).toBeDefined()
                expect(skin.css['%:hover']).toEqual('some-css-prop:some-value;')
            })

            it('should convert :host attribute selectors to "empty" selector with attribute selector', () => {
                const css = '[data-state="active"] { css-prop: css-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%[data-state="active"]']).toBeDefined()
                expect(skin.css['%[data-state="active"]']).toEqual('css-prop:css-value;')
            })

            it('should convert :host selector with class name to empty selector with classname', () => {
                const css = ':host.my-class { color: red; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%_my-class']).toBeDefined()
                expect(skin.css['%_my-class']).toEqual('color:red;')
            })

            it('should correctly convert :host selector starting with a class name and then :host', () => {
                const css = '.today:host { color: red; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%_today']).toBeDefined()
                expect(skin.css['%_today']).toEqual('color:red;')
            })

            it('should correctly convert :host selector starting with a class name and then :host and then a pseudo class', () => {
                const css = '.today:host:hover { color: red; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%_today:hover']).toBeDefined()
                expect(skin.css['%_today:hover']).toEqual('color:red;')
            })

            it('should encode class selectors to underscore', () => {
                const css = '.my-class-selector { css-prop: css-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%_my-class-selector']).toBeDefined()
                expect(skin.css['%_my-class-selector']).toEqual('css-prop:css-value;')
            })

            it('should encode id selectors as %', () => {
                const css = '#skinpart-name { the-css-prop: the-css-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%skinpart-name']).toBeDefined()
                expect(skin.css['%skinpart-name']).toEqual('the-css-prop:the-css-value;')
            })

            it('should prefix tagname with percent sign (%) and a space', () => {
                const css = 'span { some-span-prop: some-span-value; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% span']).toBeDefined()
                expect(skin.css['% span']).toEqual('some-span-prop:some-span-value;')
            })

            it('should aggregate css definitions for the same css selector', () => {
                const css = '.my-class { width: 100px;}\n .my-class { height: 200px; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['%_my-class']).toBeDefined()
                expect(_.keys(skin.css).length).toEqual(1)
                expect(skin.css['%_my-class']).toEqual('width:100px;height:200px;')
            })

            it('should correctly scope keyframes', () => {
                const css = '@keyframes anim { 0% { opacity: 0; } 100% { opacity: 1 } }'
                const skin = cssToJson.createSkinJson(wrap(), css)
                console.log(skin)
                expect(skin.css['@keyframes %anim']).toEqual('0%{opacity:0;}100%{opacity:1}')
            })
        })

        describe('css definitions -->', () => {
            it('should have the css definitions for the selector', () => {
                const css = 'div { width: 100px; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('width:100px;')
            })

            it('should remove spaces and new-lines for multiple css definitions', () => {
                const css = 'div { \n width: 100px;\n       height:    200px;\n color: red;\n }\n'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('width:100px;height:200px;color:red;')
            })

            it('should create parameter placeholder in square brackets', () => {
                const css = 'div {/*<param type="PARAM_TYPE" name="paramName" value="paramValue">*/background-color: #fff200;/*</param>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('[paramName]')
            })

            it('should create mutator-parameter placeholder in square brackets', () => {
                const css = 'div {/*<mutator name="mutatorName" type="mutatorType" func="alpha" amount="0.75" param="bg" >*//*</mutator>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('[mutatorName]')
            })

            it('should create parameter placeholder for URL param type', () => {
                const css = 'div {/*<param type="URL" name="paramName" value="part1|part2">*//*</param>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('url([paramName]part2)')
            })

            it('should decode parameter names which start with _ sign, and replace with $', () => {
                const css = 'div {/*<param type="THE_TYPE" name="_paramName" value="the-value">*//*</param>*/}'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('[$paramName]')
            })

            it('should remove duplicate identical css definitions', () => {
                const css = 'div { width: 100px; height: 100px; width: 100px; }'
                const skin = cssToJson.createSkinJson(wrap(), css)

                expect(skin.css['% div']).toEqual('width:100px;height:100px;')
            })
        })
    })

})
