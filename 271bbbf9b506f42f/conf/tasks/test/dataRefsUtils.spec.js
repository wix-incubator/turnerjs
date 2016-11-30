'use strict'

describe('dataRefsUtils', () => {
    const dataRefsUtils = require('../lib/dataRefsUtils')

    describe('getAllRefs', () => {
        function getSchema() {
            const schema = {
                type: 'object',
                properties: {}
            }

            return {
                addProperty(propName, definition) {
                    schema.properties[propName] = definition

                    return this
                },
                addAllOf(inline, refs) {
                    schema.allOf = inline.concat(refs)

                    return this
                },
                build: () => schema
            }
        }

        describe('ref', () => {
            it('should return the pseudoType and it\'s refs properties set to false (single pseudoType)', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['ref']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should return the pseudoType and it\'s refs properties set to true if it can also be a string', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['ref', 'string']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: true
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should return the pseudoType and it\'s refs properties set to false if it can not be a string (multiple pseudoTypes)', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['ref', 'null']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })
        })

        describe('weakRef', () => {
            it('should return the pseudoType and it\'s weakRefs properties set to false (single pseudoType)', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['weakRef']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should return the pseudoType and it\'s weakRefs properties set to true if it can also be a string', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['weakRef', 'string']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: true
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should return the pseudoType and it\'s weakRefs properties set to false if it can not be a string (multiple pseudoTypes)', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['weakRef', 'null']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })
        })

        describe('refList', () => {
            it('should return the pseudoType and it\'s refList properties set to false (single pseudoType)', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['refList']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should return the pseudoType and it\'s refList properties set to true if it can also be a string', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['refList', 'string']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: true
                    }
                }

                expect(actual).toEqual(expected)
            })

            it('should set the property value to false if it of pseudoType refList or any non string pseudoType', () => {
                const schema = getSchema()
                    .addProperty('item', {pseudoType: ['refList', 'array']})
                    .build()

                const actual = dataRefsUtils.getAllRefs({
                    TestSchema: schema
                })

                const expected = {
                    TestSchema: {
                        item: false
                    }
                }

                expect(actual).toEqual(expected)
            })
        })

        it('should return only pseudoTypes that has refs or refList', () => {
            const noRefSchema = getSchema()
                .addProperty('item', {type: 'string'})
                .build()

            const schema = getSchema()
                .addProperty('item', {pseudoType: ['ref']})
                .build()

            const schema2 = getSchema()
                .addProperty('item2', {pseudoType: ['refList']})
                .build()

            const actual = dataRefsUtils.getAllRefs({
                NoRefs: noRefSchema,
                Test: schema,
                Test2: schema2
            })

            expect(actual).toEqual({
                Test: {
                    item: false
                },
                Test2: {
                    item2: false
                }
            })

        })

        it('should return empty object if a schema has no refs', () => {
            const schema = getSchema()
                .addProperty('item', {type: 'string'})
                .build()

            const actual = dataRefsUtils.getAllRefs({
                TestSchema: schema
            })

            expect(actual).toEqual({})
        })

        it('should handle pseudoType with allOf definition', () => {
            const baseSchema = getSchema()
                .addProperty('baseProp', {pseudoType: ['ref']})
                .build()

            const schema = getSchema()
                .addProperty('property', {pseudoType: ['ref']})
                .build()

            const multiSchema = getSchema()
                .addAllOf([schema], [{$ref: 'Base'}])
                .build()

            const actual = dataRefsUtils.getAllRefs({
                Base: baseSchema,
                Test: multiSchema
            })

            const expected = {
                Base: {
                    baseProp: false
                },
                Test: {
                    baseProp: false,
	                property: false
                }
            }

            expect(actual).toEqual(expected)
        })

        it('should handle object properties', () => {
            const schema = getSchema()
                .addProperty('object', {
                    type: 'object',
                    barvaz: {
                        pseudoType: ['ref']
                    },
                    heliwow: {
                        type: 'string'
                    }
                })
                .build()

            const actual = dataRefsUtils.getAllRefs({
                Test: schema
            })

            const expected = {
                Test: {
                    object: {
                        barvaz: false
                    }
                }
            }

            expect(actual).toEqual(expected)
        })
    })
})
