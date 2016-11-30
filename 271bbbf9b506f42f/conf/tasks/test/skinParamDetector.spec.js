'use strict'

const sassFunctionsToJSON = require('./../lib/sassFunctionsToJSON')
const sassSkinMigrator = require('./../lib/sassSkinMigrator')

//NOTE: to run these tests, use grunt mochaTest
describe('Skin Param Migrator Tests', () => {
    let cssString = ''

    beforeEach(() => {
    })

    describe('Sass Functions Array', () => {
        it('should return object', () => {
            expect(Array.isArray(sassFunctionsToJSON(cssString))).toEqual(true)
        })

        it('should return an array of sass function definition objects: [{cssRule, funcName, args}]', () => {
            cssString = 'background-color: param-bg-color(_bgColor, $_bgColor);'

            const expectedSassFnDefinition = {
                cssRule: 'background-color',
                args: ['_bgColor', '$_bgColor'],
                funcName: 'param-bg-color',
                line: 0
            }

            const actualSassFnDefinitions = sassFunctionsToJSON(cssString)

            expect(actualSassFnDefinitions[0]).toEqual(expectedSassFnDefinition)
        })

        it('if there is more than one sass function for the same rule it should return both', () => {
            cssString = 'background-color: param-bg-color(_bgColor, $_bgColor);'
        })

        it('should not save objects without cssRule', () => {
            cssString = '@include param-box-shadow(shd, $shd);'
            const sassFnDefinitions = sassFunctionsToJSON(cssString)

            expect(sassFnDefinitions.length).toEqual(0)
        })

        it('should return array with 2 definitions if there is more than one function in the sass string', () => {
            cssString = 'background-color: param-bg-color(_bgColor, $_bgColor) param-size(_bgsize, $_bgSize);'
            const sassFnDefinitions = sassFunctionsToJSON(cssString)

            expect(sassFnDefinitions.length).toEqual(2)
            expect(sassFnDefinitions[1].funcName).toEqual('param-size')
        })
        it('should not return native css functions', () => {
            const allCSSfunctions = ['annotation', 'attr', 'blur', 'brightness', 'calc', 'character-variant', 'circle', 'contrast', 'cubic-bezier', 'dir', 'drop-shadow', 'element', 'ellipse', 'grayscale', 'hsl', 'hsla', 'hue-rotate', 'image', 'inset', 'invert', 'lang', 'linear-gradient', 'matrix', 'matrix3d', 'minmax', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type', 'opacity', 'ornaments', 'perspective', 'polygon', 'radial-gradient', 'rect', 'repeat', 'repeating-linear-gradient', 'repeating-radial-gradient', 'rgb', 'rgba', 'rotate', 'rotatex', 'rotatey', 'rotatez', 'rotate3d', 'saturate', 'scale', 'scalex', 'scaley', 'scalez', 'scale3d', 'sepia', 'skew', 'skewx', 'skewy', 'steps', 'styleset', 'stylistic', 'swash', 'symbols', 'translate', 'translatex', 'translatey', 'translatez', 'translate3d', 'url', 'var']
            cssString = allCSSfunctions.map(cssFunc => `rule:${cssFunc}(some, args);`).join('\n')
            expect(sassFunctionsToJSON(cssString)).toEqual([])
        })
        it('should not return outer param functions (to easily ignore native functions which rely on custom sass functions calc(innerFunc(), innerFunc())', () => {
            cssString = 'rule: calc(-1 * #{func(brw, $brw)}) func(brw, $brw);'
            const sassFnDefinitions = sassFunctionsToJSON(cssString)
            expect(sassFnDefinitions.length).toEqual(2)
            expect(sassFnDefinitions[0].funcName).toEqual('func')
            expect(sassFnDefinitions[1].funcName).toEqual('func')
        })
    })

    describe('Sass Skin Migrator', () => {

        let sassString
        it('should return a string', () => {
            sassString = 'border: param-size(_bgsize, $_bgSize);'
            const migratedString = sassSkinMigrator(sassString)
            expect(typeof migratedString).toEqual('string')
        })

        describe('Migrations for param-size', () => {
            it('if under border, migration -> param-border-size', () => {
                sassString = 'border: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border: param-border-size(_bgsize, $_bgSize);')
            })
            it('if under border-DIR, migration -> param-border-DIR-size', () => {
                sassString = 'border-top: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border-top: param-border-top-size(_bgsize, $_bgSize);')
            })
            it('if under padding, migration -> param-padding-size', () => {
                sassString = 'padding: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('padding: param-padding-size(_bgsize, $_bgSize);')
            })
            it('if under padding-DIR, migration -> param-padding-DIR-size', () => {
                sassString = 'padding-top: param-size(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('padding-top: param-padding-top-size(brdh, $brdh);')
            })
            it('if under margin, migration -> param-margin-size', () => {
                sassString = 'margin: param-size(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('margin: param-margin-size(brdh, $brdh);')
            })
            it('if under margin-DIR, migration -> param-margin-DIR-size', () => {
                sassString = 'margin-top: param-size(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('margin-top: param-margin-top-size(brdh, $brdh);')
            })
            it('if under background-size, migration -> param-bg-size', () => {
                sassString = 'background-size: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('background-size: param-bg-size(_bgsize, $_bgSize);')
            })
            it('if under stroke-width, migration -> param-border-size', () => {
                sassString = 'stroke-width: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('stroke-width: param-border-size(_bgsize, $_bgSize);')
            })
            it('if under border-width, migration -> param-border-size', () => {
                sassString = 'border-width: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border-width: param-border-size(_bgsize, $_bgSize);')
            })
            it('if under border-DIR-width, migration -> param-border-DIR-size', () => {
                sassString = 'border-top-width: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border-top-width: param-border-top-size(_bgsize, $_bgSize);')
            })
            it('if under width, migration -> param-width ', () => {
                sassString = 'width: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('width: param-width(_bgsize, $_bgSize);')
            })
            it('if under height, migration -> param-height', () => {
                sassString = 'height: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('height: param-height(_bgsize, $_bgSize);')
            })
            it('if under top, migration -> param-top', () => {
                sassString = 'top: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('top: param-top(_bgsize, $_bgSize);')
            })
            it('if under bottom, migration -> param-bottom', () => {
                sassString = 'bottom: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('bottom: param-bottom(_bgsize, $_bgSize);')
            })
            it('if under left, migration -> param-left', () => {
                sassString = 'left: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('left: param-left(_bgsize, $_bgSize);')
            })
            it('if under right, migration -> param-right', () => {
                sassString = 'right: param-size(_bgsize, $_bgSize);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('right: param-right(_bgsize, $_bgSize);')
            })
            describe('multiple rules matching', () => {
                it('if multiple border-DIR cssRules use the same param -> param-border-size', () => {
                    sassString = [
                        'border-top: param-size(brd, $brd);',
                        'border-bottom: param-size(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top: param-border-size(brd, $brd);',
                        'border-bottom: param-border-size(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple border-DIR-width cssRules use the same param -> param-border-size', () => {
                    sassString = [
                        'border-top-width: param-size(brd, $brd);',
                        'border-bottom-width: param-size(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top-width: param-border-size(brd, $brd);',
                        'border-bottom-width: param-border-size(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple margin-DIR cssRules use the same param -> param-margin-size', () => {
                    sassString = [
                        'margin-top: param-size(brd, $brd);',
                        'margin-bottom: param-size(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'margin-top: param-margin-size(brd, $brd);',
                        'margin-bottom: param-margin-size(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple padding-DIR cssRules use the same param -> param-padding-size', () => {
                    sassString = [
                        'padding-top: param-size(brd, $brd);',
                        'padding-bottom: param-size(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'padding-top: param-padding-size(brd, $brd);',
                        'padding-bottom: param-padding-size(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple DIR cssRules use the same param -> param-margin-size', () => {
                    sassString = [
                        'top: param-size(brd, $brd);',
                        'bottom: param-size(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'top: param-margin-size(brd, $brd);',
                        'bottom: param-margin-size(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
            })
        })
        describe('Migrations for param-color', () => {
            it('if under border, migration-> param-border-color', () => {
                sassString = 'border: solid param-color(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border: solid param-border-color(brdh, $brdh);')
            })
            it('if under border-color, migration-> param-border-color', () => {
                sassString = 'border-color: solid param-color(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border-color: solid param-border-color(brdh, $brdh);')
            })
            it('if under color, migration -> param-text-color', () => {
                sassString = 'color: param-color(txt, $txt);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('color: param-text-color(txt, $txt);')
            })
            it('if under background, migration -> param-bg-color', () => {
                sassString = 'background: param-color(clr, $clr);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('background: param-bg-color(clr, $clr);')
            })
            it('if under background-color, migration -> param-bg-color', () => {
                sassString = 'background-color: param-color(clr, $clr);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('background-color: param-bg-color(clr, $clr);')
            })
            describe('multiple rules matching', () => {
                it('if multiple border-DIR cssRules use the same param -> param-border-color', () => {
                    sassString = [
                        'border-top: param-color(brd, $brd);',
                        'border-bottom: param-color(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top: param-border-color(brd, $brd);',
                        'border-bottom: param-border-color(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple border-DIR-color cssRules use the same param -> param-border-DIR-color', () => {
                    sassString = [
                        'border-top-color: param-color(brd, $brd);',
                        'border-bottom-color: param-color(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top-color: param-border-color(brd, $brd);',
                        'border-bottom-color: param-border-color(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
            })
        })
        describe('Migrations for param-color-alpha', () => {
            it('if under border, migration -> param-border-color-alpha', () => {
                sassString = 'border: solid param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border: solid param-border-color-alpha(brdh, $brdh);')
            })
            it('if under border-color, migration -> param-border-color-alpha', () => {
                sassString = 'border-color: solid param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('border-color: solid param-border-color-alpha(brdh, $brdh);')
            })
            it('if under background, migration -> param-bg-color', () => {
                sassString = 'background: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('background: param-bg-color(brdh, $brdh);')
            })
            it('if under background-color, migration -> param-bg-color', () => {
                sassString = 'background-color: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('background-color: param-bg-color(brdh, $brdh);')
            })
            it('if under color, migration -> param-text-color', () => {
                sassString = 'color: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('color: param-text-color(brdh, $brdh);')
            })
            it('if under fill, migration -> param-bg-color', () => {
                sassString = 'fill: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('fill: param-bg-color(brdh, $brdh);')
            })
            it('if under stroke, migration -> param-border-color-alpha', () => {
                sassString = 'stroke: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('stroke: param-border-color-alpha(brdh, $brdh);')
            })
            it('if under box-shadow, migration -> param-box-shadow-color', () => {
                sassString = 'box-shadow: param-color-alpha(brdh, $brdh);'
                const migratedString = sassSkinMigrator(sassString)
                expect(migratedString).toEqual('box-shadow: param-box-shadow-color(brdh, $brdh);')
            })

            describe('multiple rules matching', () => {
                it('if multiple border-DIR cssRules use the same param -> param-border-color-alpha', () => {
                    sassString = [
                        'border-top: param-color-alpha(brd, $brd);',
                        'border-bottom: param-color-alpha(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top: param-border-color-alpha(brd, $brd);',
                        'border-bottom: param-border-color-alpha(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
                it('if multiple border-DIR-color cssRules use the same param -> param-border-DIR-color-alpha', () => {
                    sassString = [
                        'border-top-color: param-color-alpha(brd, $brd);',
                        'border-bottom-color: param-color-alpha(brd, $brd);'
                    ].join('\n')
                    const migratedString = sassSkinMigrator(sassString)
                    const expectedMigratedString = [
                        'border-top-color: param-border-color-alpha(brd, $brd);',
                        'border-bottom-color: param-border-color-alpha(brd, $brd);'
                    ].join('\n')
                    expect(migratedString).toEqual(expectedMigratedString)
                })
            })
        })
        describe('Migrations for param-number should be migrated like param-size', () => {
            it('if under border, migration -> param-border-size', () => {
                sassString = 'border: param-size(_bgsize, $_bgSize);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'border: param-number(_bgsize, $_bgSize);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })
            it('if under padding, migration -> param-padding-size', () => {
                sassString = 'padding: param-size(_bgsize, $_bgSize);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'padding: param-number(_bgsize, $_bgSize);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })
            it('if under margin, migration -> param-margin-size', () => {
                sassString = 'margin: param-size(brdh, $brdh);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'margin: param-number(brdh, $brdh);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })
            it('if under background-size, migration -> param-bg-size', () => {
                sassString = 'background-size: param-size(_bgsize, $_bgSize);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'background-size: param-number(_bgsize, $_bgSize);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })
            it('if under stroke-width, migration -> param-border-size', () => {
                sassString = 'stroke-width: param-size(_bgsize, $_bgSize);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'stroke-width: param-number(_bgsize, $_bgSize);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })
            it('if under border-width, migration -> param-border-size', () => {
                sassString = 'border-width: param-size(_bgsize, $_bgSize);'
                const migratedParamSize = sassSkinMigrator(sassString)
                const paramNumberSassString = 'border-width: param-number(_bgsize, $_bgSize);'
                const migratedParamNumber = sassSkinMigrator(paramNumberSassString)
                expect(migratedParamNumber).toEqual(migratedParamSize)
            })

        })
        it('should suppot migration on files which were already migrated', () => {
            //note: this string uses a param for border, and the same one for margin, but the margin was partially unmigrated (it specifies param-size once for this param).
            //it should migrate to param-border-size, and not param-margin-size. //TODO: make this test clearer so this comment is unnecessary
            sassString = 'border: param-border-size(brw, $brw);\n margin: calc(-1 * #{param-border-size(brw, $brw)}) param-border-size(brw, $brw) 0 param-size(brw, $brw);'
            const migratedString = sassSkinMigrator(sassString)
            expect(migratedString).toEqual('border: param-border-size(brw, $brw);\n margin: calc(-1 * #{param-border-size(brw, $brw)}) param-border-size(brw, $brw) 0 param-border-size(brw, $brw);')
        })



/*
        it('should replace if more than one function are present', () => {
            //TODO: write new test (split the test into 2, one for each migration)
            //sassString = 'border: solid param-color-alpha(brdh, $brdh) param-size(brw, $brw);';
            //sassFnDefinitions = sassFunctionsToJSON(sassString);
            //
            //const migratedString = sassSkinMigrator(sassString, sassFnDefinitions);
            //expect(migratedString).toEqual('border: solid param-border-color-alpha(brdh, $brdh) param-border-size(brw, $brw);');
        });

        it('should replace only specific functions and leave param-url as is', () => {
            sassString = 'background: param-color-alpha(bg3, $bg3) param-url(webThemeDir, $web-theme-directory, "subscribeform/envelope-bg.png");';

            const migratedString = sassSkinMigrator(sassString);
            expect(migratedString).toEqual('background: param-bg-color(bg3, $bg3) param-url(webThemeDir, $web-theme-directory, "subscribeform/envelope-bg.png");');
        });

        it('should replace the relevant function in each line', () => {
            //TODO: write new test for each param (i.e. for param-color-alpha under text to become param-text-color with no alpha)
            sassString = 'color: param-color-alpha(llf_txt2, $llf-txt2);\n' +
            'padding: calc(6px + #{param-size(llf_brw, $llf-brw)}) 24px;\n' +
            'box-sizing: border-box;\n' +
            'display: block;\n' +
            'background-color: param-color-alpha(llf_bg2, $llf-bg2);\n' +
            'border: none;';


            const migratedString = sassSkinMigrator(sassString);
            expect(migratedString).toEqual('color: param-text-color(llf_txt2, $llf-txt2);\n' +
            'padding: calc(6px + #{param-size(llf_brw, $llf-brw)}) 24px;\n' +
            'box-sizing: border-box;\n' +
            'display: block;\n' +
            'background-color: param-bg-color(llf_bg2, $llf-bg2);\n' +
            'border: none;');
        });*/
    })



})
