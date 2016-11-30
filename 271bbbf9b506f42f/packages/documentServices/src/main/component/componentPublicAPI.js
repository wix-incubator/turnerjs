define(['documentServices/component/component',
        'documentServices/dataModel/dataModel',
        'documentServices/component/componentsDefinitionsMap',
        'documentServices/component/componentStylesAndSkinsAPI',
        'documentServices/component/componentCode',
        'documentServices/component/componentBehaviors',
        'documentServices/media/wixVideoAPI',
        'documentServices/constants/constants',
        'documentServices/privateServices/idGenerator',
        'documentServices/component/componentStructureInfo',
        'documentServices/utils/utils',
        'documentServices/mobileConversion/mobileActions'],
    function(component, dataModel, compDefinitionMap, componentStylesAndSkinsAPI, componentCode, componentBehaviors, wixVideoAPI, constants, idGenerator, componentStructureInfo, dsUtils, mobileActions){
    "use strict";
    return {
        methods: {
            components: {
                /**
                 * @param {ComponentReference} containerReference
                 * @param {Object} componentDefinition - {componentType: String, styleId: String, data: String|Object, properties: String|Object}
                 * @param {string} [optionalCustomId]
                 * @returns {*}
                 */
                add: {dataManipulation: component.add, isUpdatingAnchors: dsUtils.YES, getReturnValue: component.getComponentToAddRef},
                addWithConstraints: {dataManipulation: component.addWithConstraints, isUpdatingAnchors: dsUtils.YES, getReturnValue: function(ps, pagePointer, componentDefinition, constraints, optionalCustomId){
                    return component.getComponentToAddRef(ps, pagePointer, componentDefinition, optionalCustomId);
                }},
                addAndAdjustLayout: {dataManipulation: component.addAndAdjustLayout, isUpdatingAnchors: dsUtils.NO, getReturnValue: component.getComponentToAddRef},
                duplicate: {dataManipulation: component.duplicate, isUpdatingAnchors: dsUtils.YES, getReturnValue: component.getComponentToDuplicateRef},
                serialize: component.serialize,
                remove: {dataManipulation: component.externalRemove, isAsyncOperation: component.shouldDelayDeletion, isUpdatingAnchors: dsUtils.YES},
                buildDefaultComponentStructure: componentStructureInfo.createComponentDefaultStructureBuilder(compDefinitionMap),
                getContainer: component.getContainer,
                getPage: component.getPage,
                getSiblings: component.getSiblings,
                getChildren: component.getChildren,
                getTpaChildren: component.getTpaChildren,
                getBlogChildren: component.getBlogChildren,
                getType: component.getType,
                isRenderedOnSite:component.isRenderedOnSite,
                properties: {
                    update: {dataManipulation: component.properties.update, singleComp: dataModel.shouldUpdatePropertiesWithSingleComp, isUpdatingAnchors: dataModel.shouldUpdateAnchorsAfterPropertiesUpdate},
                    get: component.properties.get,
                    mobile: {
                        fork: {dataManipulation: component.properties.mobile.fork},
                        join: {dataManipulation: component.properties.mobile.join},
                        isForked: component.properties.mobile.isForked
                    }
                },
                style: {
                    setId: {dataManipulation: componentStylesAndSkinsAPI.style.setId},
                    getId: componentStylesAndSkinsAPI.style.getId,
                    update: {dataManipulation: componentStylesAndSkinsAPI.style.update, isUpdatingAnchors: dsUtils.YES},
                    setCustom: {dataManipulation: componentStylesAndSkinsAPI.style.setCustom, getReturnValue: idGenerator.getStyleIdToAdd}
                },
                skin: {
                    set: {dataManipulation: componentStylesAndSkinsAPI.skin.set},
                    get: componentStylesAndSkinsAPI.skin.get,
                    getComponentSkinExports:componentStylesAndSkinsAPI.skin.getComponentSkinExports
                },
                layout: {
                    get: component.layout.get,
                    RESIZE_SIDES: constants.RESIZE_SIDES
                },
                video: {
                    play: wixVideoAPI.play,
                    pause: wixVideoAPI.pause,
                    stop: wixVideoAPI.stop,
                    registerToPlayingChange: wixVideoAPI.registerToPlayingChange,
                    unregisterToPlayingChange: wixVideoAPI.unregisterToPlayingChange,
                    getReadyState: wixVideoAPI.getReadyState,
                    isPlaying: wixVideoAPI.isPlaying
                },
                is: {
                    /**
                     * Checks if a component is duplicable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @param {AbstractComponent} pageReference
                     * @returns {boolean}
                     */
                    duplicatable: component.isComponentDuplicatable,
                    /**
                     * Checks if a component is removable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @param {AbstractComponent} pageReference
                     * @returns {boolean}
                     */
                    removable: component.isComponentRemovable,
                    modal: component.isComponentModal,
                    usingLegacyAppPartSchema: component.isComponentUsingLegacyAppPartSchema,
                    exist: component.isExist,
                    /**
                     * Checks if a component is visible on site
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @returns {boolean}
                     */
                    visible: component.isComponentVisible,
                    rendered: componentStructureInfo.isRenderedOnSite
                },
                COMPONENT_DEFINITION_MAP: compDefinitionMap,
                behaviors: {
                    execute: {dataManipulation: componentBehaviors.executeBehavior},
                    getRuntimeState: componentBehaviors.getRuntimeState
                },
                code: {
                    generateNicknamesForSite: componentCode.generateNicknamesForSite,
                    getNickname: componentCode.getNickname,
                    setNickname: componentCode.setNickname,
                    validateNickname: componentCode.validateNickname,
                    getComponentsInPage: componentCode.getComponentsInPage,
                    VALIDATIONS: componentCode.VALIDATIONS
                },
                modes: {
                    /** JSON getters **/
                    getTypes: component.modes.getModeTypes,
                    getModeById: component.modes.getComponentModeById,
                    getModes: component.modes.getComponentModes,
                    getModesByType: component.modes.getComponentModesByType,
                    getAllCompOverrides: component.modes.overrides.getAllOverrides,
                    isDisplayedByDefault: component.modes.isComponentDisplayedByDefault,
                    isComponentDisplayedInModes: component.modes.isComponentDisplayedInModes,

                    /** JSON setters **/
                    add: {dataManipulation: component.modes.addComponentModeDefinition, getReturnValue: component.modes.getModeToAddId},
                    remove: {dataManipulation: component.modes.removeComponentMode, noBatchingAfter: true},

                    /** stateful getters (considering currently active modes) **/
                    getComponentActiveModeIds: component.modes.getComponentActiveModeIds,
                    getFirstAncestorActiveModes: component.modes.getFirstAncestorActiveModes,
                    getFirstAncestorWithActiveModes: component.modes.getFirstAncestorWithActiveModes,
                    isComponentCurrentlyDisplayed: component.modes.isComponentCurrentlyDisplayed,

                    /** stateful setters (considering currently active modes) **/
                    activateComponentMode: {dataManipulation: component.modes.activateComponentMode, noBatchingAfter: true},
                    resetAllActiveModes: {dataManipulation: component.modes.resetAllActiveModes, noBatchingAfter: true},
                    applyCurrentToAllModes: {dataManipulation: component.modes.overrides.applyCurrentToAllModes},
                    applyComponentToMode: {dataManipulation: component.modes.overrides.applyComponentToMode},
                    showComponentOnlyInModesCombination: {dataManipulation: component.modes.overrides.showComponentOnlyInModesCombination},

                    updateMobileDisplayedModeProperty: {dataManipulation: mobileActions.setComponentDisplayMode, noBatchingAfter: true},
                    getComponentModesAvailableInView: component.modes.getComponentModesAvailableInView,
                    getCompMobileMode: component.modes.getCompMobileMode,
                    removeDesignBehaviorsFromAllModes: {dataManipulation: component.modes.removeDesignBehaviorsFromAllModes}

                }
            },
            siteSegments: {
                /**
                 * @class documentServices.siteSegments.style
                 * @link documentServices.components.style
                 */
                style: {
                    setId: {dataManipulation: componentStylesAndSkinsAPI.style.setId},
                    getId: componentStylesAndSkinsAPI.style.getId,
                    setCustom: {dataManipulation: componentStylesAndSkinsAPI.style.setCustom, getReturnValue: idGenerator.getStyleIdToAdd}
                },
                /**
                 * @class documentServices.siteSegments.layout
                 * @link documentServices.components.layout
                 */
                layout: {
                    get: component.layout.get
                }
            }
        }
    };
});
