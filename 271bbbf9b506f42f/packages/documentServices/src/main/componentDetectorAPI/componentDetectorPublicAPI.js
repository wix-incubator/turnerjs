define(['documentServices/componentDetectorAPI/componentDetectorAPI'], function(componentDetectorAPI){
    "use strict";
    return {
        methods: {
            /** @class documentServices.components*/
            components: {
                /**
                 * retrieves all component refs in the masterPage and the passed pageId, ordered by the dom.
                 * If no pageId is passed, all site component refs will be retrieved.
                 * @param {string} [pageId] - the pageId of the page for which to get all the components
                 * @returns {AbstractComponent[]} all the components in the masterPage and the passed pageId
                 */
                getAllComponents: componentDetectorAPI.getAllComponents,
                /** @class documentServices.components.get */
                get: {
                    byXYRelativeToStructure: componentDetectorAPI.getComponentsAtXYRelativeToStructure,
                    byXYRelativeToScreen: componentDetectorAPI.getComponentsAtXYRelativeToScreen,
                    /**
                     * Gets all the components of the given type/s in the entire site or descendants of the rootComp.
                     * @param {String|<Array{String}>} compType a single component type or an array of multiple component types
                     * @param {AbstractComponent} [rootComp] rootComp The root parent component ref that will be used for the search
                     * @returns {AbstractComponent[]} an array of component refs of the passed component type/s
                     */
                    byType: componentDetectorAPI.getComponentByType,
                    /**
                     * Gets component by given id ,pageId (if pageId isn't passed takes the current pageId) and view mode (if view mode not passed takes the current view mode).
                     * @param {String} id component full id
                     * @param {String} [pageId] id of the page that the component is in
                     * @param {String} [viewMode] mobile/desktop
                     * @returns {AbstractComponent} a ref to the component with the passed id
                     */
                    byId: componentDetectorAPI.getComponentById,
                    /**
                     * Retrieve all components under some ancestor
                     * @param privateServices
                     * @param {AbstractComponent} ancestor - comp pointer to ancestor in which to search
                     */
                    byAncestor: componentDetectorAPI.getComponentsUnderAncestor
                },
                isDescendantOfComp: componentDetectorAPI.isDescendantOfComp
            },
            /** @class documentServices.utils*/
            utils: {
                /**
                 * @returns {boolean} returns true if the two references are referencing the same component
                 * @param {AbstractComponent} refA
                 * @param {AbstractComponent} refB
                 */
                isSameRef: function(ps, refA, refB){
                    return ps.pointers.isSamePointer(refA, refB);
                },
                /**
                 * @returns {boolean} returns true if the reference is to a page
                 * @param {AbstractComponent} ref
                 */
                isPage: function(ps, ref){
                    return ps.pointers.components.isPage(ref);
                },
                /**
                 * @returns {boolean} returns true if the reference is to the site structure
                 * @param {AbstractComponent} ref
                 */
                isSiteStructure: function(ps, ref){
                    return ps.pointers.components.isMasterPage(ref);
                }
            }
        }
    };
});