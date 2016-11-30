/**
 * @class wysiwyg.viewer.managers.pages.SiteStructureDomBuilder
 * @extends core.managers.components.BaseDomBuilder
 */
define.Class('wysiwyg.viewer.managers.pages.SiteStructureDomBuilder', function(classDefinition){

    var def = classDefinition;

    def.inherits('core.managers.components.BaseDomBuilder');

    def.statics({
        STRUCTURE_COMP_ID: "SITE_STRUCTURE",
        PAGES_CONTAINER_COMP_ID: "SITE_PAGES"
    });

    /**@lends wysiwyg.viewer.managers.pages.SiteStructureDomBuilder*/
    def.methods({
        initialize: function(idPrefix, compDomBuilder){
            this.parent(idPrefix);
            this._compDomBuilder = compDomBuilder;
        },

        /**
         *
         * @param data
         * @param {String} childComponentsPropertyName
         * @returns {{rootCompNode: Element, compNodes: Array<Element>}}
         */
        createComponent: function(data, childComponentsPropertyName) {
            childComponentsPropertyName = childComponentsPropertyName || 'children';

            var rootNode = this._createViewNodeBase(
                this.STRUCTURE_COMP_ID,
                'wysiwyg.viewer.components.WSiteStructure',
                'mobile.core.skins.InlineSkin',
                0);

            rootNode.setAttribute('class', 'SITE_STRUCTURE');

            var childComps = this._compDomBuilder._createChildComponents(rootNode, data, childComponentsPropertyName);
            childComps.push(rootNode);

            return {
                'rootCompNode': rootNode,
                'compNodes': childComps
            };
        },

        /**
         *
         * @returns {String} structure id in dom
         */
        getStructureDomId: function(){
            return this._getDomId_(this.STRUCTURE_COMP_ID);
        },
        /**
         *
         * @returns {String} pages container/ page group id in dom
         */
        getPagesContainerDomId: function(){
            return this._getDomId_(this.PAGES_CONTAINER_COMP_ID);
        }
    });
});