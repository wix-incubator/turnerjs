define(['lodash',
        'documentServices/structure/utils/layoutValidation',
        'documentServices/validation/validators/styleValidator',
        'documentServices/validation/validators/skinValidator',
        'documentServices/validation/validators/compPropValidator',
        'documentServices/validation/validators/compDataValidator',
        'documentServices/validation/validators/siteJsonValidator',
        'documentServices/component/componentsDefinitionsMap',
        'documentServices/component/componentStylesAndSkinsAPI',
        'documentServices/componentDetectorAPI/componentDetectorAPI',
        'documentServices/dataModel/dataModel'
    ],
    function (_,
              layoutValidation,
              styleValidator,
              skinValidator,
              compPropValidator,
              compDataValidator,
              siteJsonValidator,
              componentsDefinitionsMap,
              componentStylesAndSkinsAPI,
              componentDetectorAPI,
              dataModel
              ) {
        'use strict';



        function getInvalidComponentDescription(ps, compPointer) {
            var compStructure = ps.dal.get(compPointer);

            var pageOfComp = ps.pointers.components.getPageOfComponent(compPointer);
            var data = dataModel.getDataItem(ps, compPointer);

            return {
                id: compPointer.id,
                pageId: pageOfComp && pageOfComp.id,
                componentType: compStructure.componentType || compStructure.documentType,
                skin: componentStylesAndSkinsAPI.skin.get(ps, compPointer),
                dataType: data && data.type
            };
        }


        var VALIDATORS = {
            data: compDataValidator.validateCompData,
            properties: compPropValidator.validateCompProps,
            layout: layoutValidation.validateLayout,
            skin: skinValidator.validateComponentSkin,
            style: styleValidator.validateComponentStyle,
            json: siteJsonValidator.validateCompJSONpaths
        };

        function asArray(possiblyArray){
            return _.isArray(possiblyArray) ? possiblyArray : [possiblyArray];
        }

        function validateComponents(ps, comps) {
            return _.reduce(asArray(comps), function (invalidComps, comp) {
                    var invalidations = _(VALIDATORS)
                        .mapValues(function (validator) {
                            try {
                                validator(ps, comp);
                            } catch (validationError) {
                                return validationError.message || validationError.toString();
                            }
                            return null;
                        })
                        .omit(_.isNull)
                        .value();

                    if (!_.isEmpty(invalidations)) {
                        invalidComps.push({
                            comp: getInvalidComponentDescription(ps, comp),
                            invalidations: invalidations
                        });
                    }

                    return invalidComps;
                }, []);
        }

        /**
         * Used for automation
         * @param ps
         * @returns {*}
         */
        function validateAllComponents(ps) {
            var allComponents = componentDetectorAPI.getAllComponents(ps, null, function (comp) {
                return !ps.pointers.components.isMasterPage(comp);
            });
            return validateComponents(ps, allComponents);
        }

        return {
            validateComponentData: VALIDATORS.data,
            validateComponentProperties: VALIDATORS.properties,
            validateComponentLayout: VALIDATORS.layout,
            validateComponentSkin: VALIDATORS.skin,
            validateStyle: VALIDATORS.style,
            validateComponents: validateComponents,
            validateAllComponents: validateAllComponents
        };
    });
