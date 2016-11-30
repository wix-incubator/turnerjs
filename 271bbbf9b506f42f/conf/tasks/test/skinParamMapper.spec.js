'use strict'

const skinParamMapper = require('./../lib/skinParamMapper')

//NOTE: to run these tests, use grunt mochaTest
describe('Skin Param Mapper Tests', () => {
    const skins = {}
    beforeEach(() => {
        skins['skin-a'] = {
            react: [
                [
                    'a',
                    'link',
                    [],
                    {},
                    [
                        'span',
                        'label',
                        [],
                        {}
                    ]
                ]
            ],
            params: {
                rd: 'BORDER_RADIUS',
                bg: 'BG_COLOR',
                'bg-block': 'BG_COLOR',
                trans1: 'TRANSITION',
                shd: 'BOX_SHADOW',
                brd: 'COLOR_ALPHA',
                brw: 'SIZE',
                fnt: 'FONT',
                trans2: 'TRANSITION',
                txt: 'COLOR',
                bgh: 'BG_COLOR',
                brdh: 'COLOR_ALPHA',
                ird: 'BORDER_RADIUS',
                txth: 'COLOR',
                topPadding: 'SIZE'
            },
            paramsDefaults: {
                rd: '0',
                bg: 'color_17',
                'bg-block': 'color_17',
                trans1: 'border-color 0.4s ease 0s, background-color 0.4s ease 0s',
                shd: '0 1px 4px rgba(0, 0, 0, 0.6)',
                brd: 'color_15',
                brw: '0',
                fnt: 'font_5',
                trans2: 'color 0.4s ease 0s',
                txt: 'color_15',
                bgh: 'color_18',
                brdh: 'color_15',
                txth: 'color_15',
                ird: [
                    'rd'
                ],
                topPadding: '13px'
            },
            editableParams: [
                'topPadding'
            ],
            paramsMutators: {
                'bg-block': [
                    [
                        'alpha',
                        0.75
                    ]
                ]
            },
            css: {
                '%link': '[rd]  position:absolute;top:0;right:0;bottom:0;left:0;background-color:[bg];[trans1]  [shd]  border:solid [brd] [brw];cursor:pointer !important;',
                '%label': '[fnt]  [trans2]  color:[txt];display:inline-block;margin:-webkit-calc(-1 * [brw]) [brw] 0;margin:calc(-1 * [brw]) [brw] 0;position:relative;white-space:nowrap;',
                '%:active[data-state~=\'mobile\'] %link,%:hover[data-state~=\'desktop\'] %link': 'background-color:[bgh];border-color:[brdh];[trans1][ird][bg-block]',
                '%:active[data-state~=\'mobile\'] %label,%:hover[data-state~=\'desktop\'] %label': 'color:[txth];[trans2]'
            }
        }

        skins['skin-b'] = {
            react: [
                [
                    'div',
                    'bg',
                    [],
                    {}
                ],
                [
                    'div',
                    'inlineContent',
                    [],
                    {}
                ]
            ],
            params: {
                brw: 'SIZE',
                brd: 'COLOR_ALPHA',
                bg: 'BG_COLOR',
                rd: 'BORDER_RADIUS',
                shd: 'BOX_SHADOW',
                bgd: 'BG_COLOR'
            },
            paramsDefaults: {
                brw: '1px',
                brd: 'color_15',
                bg: 'color_11',
                rd: '5px',
                shd: '0 1px 4px rgba(0, 0, 0, 0.6)',
                bgd: ['bg']
            },
            paramsMutators: {
                bgd: [
                    [
                        'brightness',
                        0.5,
                        true
                    ]
                ]
            },
            css: {
                '%bg': 'border:[brw] solid [brd];position:absolute;top:0;right:0;bottom:0;left:0;background-color:[bg];[rd]  [shd]',
                '%inlineContent': 'position:absolute;top:0;right:0;bottom:0;left:0;',
                '%bg[data-disabled="true"]': 'background-color:[bgd];'
            }
        }
    })
    describe('Sass Functions Array', () => {
        it('should return object', () => {
            expect(skinParamMapper.getSkinParamMap(skins)).toBeDefined()
        })

        it('should filter params that are contained in paramsMutators if they are not in default only mode', () => {
            const mappedSkins = skinParamMapper.getSkinParamMap(skins)

            expect(mappedSkins['skin-a']['bg-block']).not.toBeDefined()
        })

        it('should filter out params that their default value (paramsDefaults) is an Array', () => {
            const mappedSkins = skinParamMapper.getSkinParamMap(skins)

            expect(mappedSkins['skin-a'].ird).not.toBeDefined()
        })

        it('should not filter out params that are not present in paramsMutators', () => {
            const mappedSkins = skinParamMapper.getSkinParamMap(skins)
            expect(mappedSkins['skin-b'].brw).toBeDefined()
        })

        it('should include editable params', () => {
            const mappedSkins = skinParamMapper.getSkinParamMap(skins)

            expect(mappedSkins['skin-a'].topPadding).toBeDefined()
        })

        describe('mutated param which is defined as default only (the 3rd parameter of the mutator)', () => {
            it('should return a mutated param if it is defined as default only (the 3rd param of the mutator)', () => {
                const mappedSkins = skinParamMapper.getSkinParamMap(skins)

                //console.log(mappedSkins['skin-b']);
                expect(mappedSkins['skin-b'].bgd).toBeDefined()
            })

            it('should get the type of the param', () => {
                const mappedSkins = skinParamMapper.getSkinParamMap(skins)

                //console.log(mappedSkins['skin-b']);
                expect(mappedSkins['skin-b'].bgd.type).toEqual('BG_COLOR')
            })

            it('should get the default value of the referenced skin param', () => {
                const mappedSkins = skinParamMapper.getSkinParamMap(skins)

                //console.log(mappedSkins['skin-b']);
                expect(mappedSkins['skin-b'].bgd.defaultValue).toEqual('color_11')
            })

            it('the state is regular', () => {
                const mappedSkins = skinParamMapper.getSkinParamMap(skins)

                //console.log(mappedSkins['skin-b']);
                expect(mappedSkins['skin-b'].bgd.state).toEqual('disabled')
            })
        })
    })
})
