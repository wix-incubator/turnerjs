/**
 * @class wysiwyg.viewer.managers.pages.StubPageDomBuilder
 * @extends core.managers.components.BaseDomBuilder
 */
define.Class('wysiwyg.viewer.managers.pages.StubPageDomBuilder', function(classDefinition){

    var def = classDefinition;

    def.inherits('core.managers.components.BaseDomBuilder');

    /**@lends wysiwyg.viewer.managers.pages.StubPageDomBuilder*/
    def.methods({
        initialize: function(idPrefix){
            this.parent(idPrefix);
        },

        /**
         *
         * @param id
         * @param pageData
         * @param domLevel
         * @returns {Element}
         */
        createPageStubNode: function(id, pageData, domLevel) {
            var comp = pageData && pageData.getData().type === "AppPage" ? "wixapps.integration.components.AppPage"
                    : "mobile.core.components.Page";

            var rootNode = this._createViewNodeBase(id, comp, 'mobile.core.skins.InlineSkin', domLevel);

            rootNode.setAttribute('dataQuery', '#' + id);

            return rootNode;
        }
    });
});