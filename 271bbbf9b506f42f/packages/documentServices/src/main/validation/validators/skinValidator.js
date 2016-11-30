define(['lodash',
        'documentServices/component/componentStylesAndSkinsAPI',
        'documentServices/theme/skins/skinsByComponentType',
        'documentServices/theme/skins/deprecatedSkinsByComponentType',
        'documentServices/theme/skins/componentTypeAliases'
    ],
    function (_,
              componentStylesAndSkinsAPI,
              skinsByComponentType,
              deprecatedSkinsByComponentType,
              componentTypeAliases) {
        'use strict';


        /**
         * This returns all valid viewer-skins, including the deprecated ones which might need lazy migration in the editor and cant be migrated via dataFixer
         * If everything could have been migrated via dataFixer, we would not need to get the deprecated skins
         * @param privateServices
         * @param componentType
         * @returns {*}
         */
        function getValidSkinsForComponent(componentType) {
            var compTypeOrAlias = componentTypeAliases.getAlias(componentType);
            var supportedSkins = skinsByComponentType[compTypeOrAlias] || [];
            var deprecatedSkins = deprecatedSkinsByComponentType[compTypeOrAlias] || [];
            return supportedSkins.concat(deprecatedSkins);
        }

        var COMPONENTS_WITH_DYNAMIC_SKINS = {
            'wysiwyg.viewer.components.svgshape.SvgShape': true
        };

        function validateComponentSkin(ps, compPointer) {
            var skinName = componentStylesAndSkinsAPI.skin.get(ps, compPointer);
            var componentType = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'componentType'));
            var validSkinsForComp = getValidSkinsForComponent(componentType);
            var isSkinValid = COMPONENTS_WITH_DYNAMIC_SKINS[componentType] || _.includes(validSkinsForComp, skinName);
            if (!isSkinValid) {
                throw new Error('The skin [' + skinName + '] is not valid for component type [' + componentType + ']');
            }
        }

        return {
            validateComponentSkin: validateComponentSkin
        };
    });
