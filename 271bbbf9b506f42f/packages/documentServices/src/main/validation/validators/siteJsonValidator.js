define(['lodash',
    'documentServices/validation/utils/validationErrors'],
    function (_, validationErrors) {
        'use strict';

        function withoutHash(str){
            return str.replace(/^#/, '');
        }

        function validateDataInScope(ps, structure, pageId){
            if (structure.dataQuery) {
                validateDataPathForComp(ps, pageId, structure.id, 'document_data', withoutHash(structure.dataQuery));
            }
        }

        function validatePropertiesInScope(ps, structure, pageId){
            if (structure.propertyQuery) {
                validateDataPathForComp(ps, pageId, structure.id, 'component_properties', withoutHash(structure.propertyQuery));
            }
        }

        function validateDesignDataInScope(ps, structure, pageId){
            if (structure.designQuery) {
                validateDataPathForComp(ps, pageId, structure.id, 'design_data', withoutHash(structure.designQuery));
            }
        }

        function validateConnectionsDataInScope(ps, structure, pageId){
            if (structure.connectionQuery) {
                validateDataPathForComp(ps, pageId, structure.id, 'connections_data', withoutHash(structure.connectionQuery));
            }
        }

        function validateDataPathForComp(ps, pageId, compId, type, query){
            if (!ps.dal.full.isPathExist(['pagesData', pageId, 'data', type, query])) {
                throw new validationErrors.DataPathError({
                    pageId: pageId,
                    query: query,
                    type: type,
                    compId: compId
                });
            }
        }

        function validateCompJSONpaths(ps, compPointer) {
            var compStructure = ps.dal.full.get(compPointer);
            var pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
            validateDataInScope(ps, compStructure, pageId);
            validatePropertiesInScope(ps, compStructure, pageId);
            validateDesignDataInScope(ps, compStructure, pageId);
            validateConnectionsDataInScope(ps, compStructure, pageId);
        }

        return {
            validateCompJSONpaths: validateCompJSONpaths
        };
    });
