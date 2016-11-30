define.Class('wysiwyg.editor.validations.SiteStructureInvalidatorUtils', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods(/** @lends wysiwyg.editor.validations.SiteStructureInvalidatorUtils*/{
        /**
         * @constructs
         */
        initialize: function(WPreview) {
            this._referenceToWPreview = WPreview;
        },

        /**
         *
         * @param [siteStructureComponents]
         * @returns {number} the lowest Y between the components that are show on all pages
         */
        getBottomYOfSiteStructureComponents: function(siteStructureComponents) {
            siteStructureComponents = siteStructureComponents || this.getAllSiteStructureComponents();
            var mostBottomY = 0;
            for (var i=0; i<siteStructureComponents.length; i++) {
                mostBottomY = Math.max(mostBottomY, siteStructureComponents[i].getY() + siteStructureComponents[i].getPhysicalHeight());
            }
            return mostBottomY;
        },
        /**
         *
         * @param overlapDimensions - start and end Y dimensions from which to check for an overlap
         * @param {Array} components to check if they are contained in the given dimensions
         * @returns {Array} array of components that are contained in the given dimensions
         */
        filterComponentsContainedByDimensions: function(overlapDimensions, components){
            var startY = overlapDimensions.startY,
                endY = overlapDimensions.endY;

            return _.filter(components, function(comp){
                var compStartY = comp.getY(),
                    compEndY = compStartY + comp.getHeight();
                return compStartY >= startY && compEndY <= endY;
            },this);
        },
        /**
         * returns all the children of the site_structure -> i.e. all components set to 'show on all pages'
         * @returns {Array}
         */
        getAllSiteStructureComponents: function() {
            return this._referenceToWPreview.getSiteNode().$logic.getChildren().map(function(node){ return node.$logic;});
        },
        /**
         * @param compViewNode
         * @returns {String} the dataQuery id from the actual DOM element.
         */
        getDataQueryIdFromViewNode: function(compViewNode){
            if(!compViewNode){
                return null;
            }
            var dataQuery = compViewNode.getAttribute('dataquery');
            return dataQuery && dataQuery.slice(1); //slice 1, because the dataquery has the # symbol before it
        }

    });
});
