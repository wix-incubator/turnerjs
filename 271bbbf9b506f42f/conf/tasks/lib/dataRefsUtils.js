/*eslint no-confusing-arrow:0*/
'use strict'

const _ = require('lodash')
const refPseudoTypes = ['ref', 'refList', 'weakRef']

function getRefs(schema) {
    const refs = _(schema)
        .pick(propDef => _.intersection(refPseudoTypes, propDef.pseudoType).length > 0)
        .mapValues(propDef => _.includes(propDef.pseudoType, 'string'))
        .value()

    _(schema)
        .pick(prop => prop.type === 'object')
        .forEach((propSchema, propName) => {
            const propRefs = getRefs(propSchema)
            if (!_.isEmpty(propRefs)) {
                refs[propName] = propRefs
            }
        })
        .value()

    return refs
}

function getSchemaDefinition(schemas, type) {
    const currentSchema = schemas[type]
    if (currentSchema.allOf) {
        const allOfSchemas = _.map(currentSchema.allOf, innerSchema =>
            innerSchema.properties ? innerSchema : getSchemaDefinition(schemas, innerSchema.$ref)
        )

        return _.merge.apply(_, allOfSchemas)
    }

    return currentSchema
}

function getAllRefs(schemas) {
    return _(schemas)
        .mapValues((schema, type) => {
            const definition = getSchemaDefinition(schemas, type)
            return getRefs(definition.properties)
        })
        .omit(_.isEmpty)
        .value()
}

module.exports = {getAllRefs}
