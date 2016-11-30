define.Class('wysiwyg.editor.validations.SiteStructureInvalidationFixer', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.editor.validations.SiteStructureInvalidatorUtils']);

    def.methods(/** @lends wysiwyg.editor.validations.SiteStructureInvalidationFixer*/{

        /**
         * @param WPreview
         * @param invalidationUtils
         * @constructs
         */
        initialize: function(WPreview, invalidationUtils) {
            this._referenceToWPreview = WPreview;
            /** @type {wysiwyg.editor.validations.SiteStructureInvalidatorUtils} **/
            this.invalidationUtils = invalidationUtils || new this.imports.SiteStructureInvalidatorUtils(WPreview);
        },

        /**
         * generates a new id for
         * @param compViewOrLogic  - either a component's view node or logic, both will work.
         */
        generateNewIdForComp: function(compViewOrLogic){
            var compLogic = compViewOrLogic.$logic ? compViewOrLogic.$logic : compViewOrLogic;
            var compViewNode = compLogic.$view,
                newCompId = W.Utils.getUniqueId();

            compLogic._compId = newCompId;
            compViewNode.id = newCompId;
        },

        /**
         * removes the id from the DOM of the given node. This is used for text nodes INSIDE of a richtext component which were found by ID, which is invalid.
         * @param compViewNode
         */
        removeInvalidIdFromViewNode: function (compViewNode) {
            compViewNode.removeAttribute('id');
        },
        /**
         * removes invalid components. As a component may have several different invalidations, it could enter this twice- so we check to make sure.
         * @param compLogic
         */
        removeInvalidComponent: function(compLogic){
            if(!compLogic.$view){
                return;
            }
            var parentComp = compLogic.getParentComponent();
            compLogic.dispose();

            // reportDelete (of parent, which is how it's used) so that it recalculates the parent's anchors and anchors of all children
            this._referenceToWPreview.getPreviewManagers().Layout.reportDeleteComponent(parentComp);
        },
        /**
         * Copies the data reference to the component (both are supplied as part of the 'newCompData' object... sorry for lack of a good name).
         * This is used when we found a component that has different data in mobile and in desktop.
         * @param newCompData
         */
        synchronizeDataItem: function(newCompData){
            var comp = newCompData.comp,
                correctDataItem = newCompData.dataItem;
            var dataQueryId = '#' + correctDataItem.getData().id;
            comp.setDataItem(correctDataItem);
            comp.$view.setAttribute('dataQuery', dataQueryId);
        },
        /**
         *
         * @param comp
         */
        fixMissingContainerWithWrongClass: function(comp){
            var compId = comp.getID();
            this.generateNewIdForComp(comp);
            this.addMissingSiteSegment(compId);
        },
        /**
         * Adds header / footers to the site if they are missing (given the id)
         * @param siteSegmentId
         */
        addMissingSiteSegment: function(siteSegmentId) {
            W.Classes.getClass('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(MultiSelectCls) {
                var multiComponentSelector = new MultiSelectCls();
                W.Editor.clearSelectedComponent();

                if (siteSegmentId === "PAGES_CONTAINER") {
                    LOG.reportError(wixErrors.SAVE_ERROR_10104_MISSING_PAGES_CONTAINER, "ServerFacadeErrorHandler", "_addMissingSiteSegment", "");
                    return;
                }

                var footerDataStringified = '{"componentType":"wysiwyg.viewer.components.FooterContainer","type":"Container","id":"SITE_FOOTER","styleId":"fc3","skin":"wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen","layout":{"x":0,"y":1243,"width":980,"height":40,"scale":1,"anchors":[]},"components":[]}';
                var headerDataStringified = '{"componentType":"wysiwyg.viewer.components.HeaderContainer","type":"Container","id":"SITE_HEADER","styleId":"hc3","skin":"wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen","layout":{"x":0,"y":0,"width":980,"height":40,"scale":1,"anchors":[]},"components":[]}';

                var siteSegmentDataStringified = (siteSegmentId === "SITE_HEADER") ? headerDataStringified : footerDataStringified;
                var siteSegmentData = JSON.parse(siteSegmentDataStringified);
                var siteStructureNode = this._referenceToWPreview.getSiteNode();

                var componentsToMoveDown;
                if (siteSegmentId === "SITE_HEADER") {

                    //move all components down:
                    var siteStructureComponents = this.invalidationUtils.getAllSiteStructureComponents();
                    var newHeaderChildren = this.invalidationUtils.filterComponentsContainedByDimensions({startY: 0, endY: 40}, siteStructureComponents);
                    componentsToMoveDown = _.xor(siteStructureComponents, newHeaderChildren);
                    multiComponentSelector.setSelectedComps(componentsToMoveDown);
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:multiComponentSelector.getY() + 40, enforceAnchors:true, editedComponent:multiComponentSelector});

                    var attachChildrenCallback = function(header){
                        var headerLogic = header[0].$logic ? header[0].$logic : header[0];
                        _.forEach(newHeaderChildren, headerLogic.addChild.bind(headerLogic));
                    };
                    W.CompDeserializer.createAndAddComponents(siteStructureNode, [siteSegmentData], true, true, undefined, attachChildrenCallback, true, true);
                } else{
                    W.CompDeserializer.createAndAddComponents(siteStructureNode, [siteSegmentData], true, true, undefined, function(){
                    }, true, true);
                }

                setTimeout(function() {
                    var mostBottomYOfSiteStructureComponents = this.invalidationUtils.getBottomYOfSiteStructureComponents(componentsToMoveDown);
                    var siteSegmentY = (siteSegmentId === "SITE_HEADER") ? multiComponentSelector.getY() - 40 : mostBottomYOfSiteStructureComponents + 10;
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:siteSegmentY, updateLayout:true});
                    W.UndoRedoManager.clear();
                }.bind(this), 500);
            }.bind(this));
        },

        /**
         * Fixes site segment containers which are not children of the site structure
         * @param siteSegmentComp
         */
        fixSiteSegmentHierarchy: function(siteSegmentComp) {
            W.Classes.getClass('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(MultiSelectCls) {
                var multiComponentSelector = new MultiSelectCls();
                W.Editor.clearSelectedComponent();

                var siteSegmentId = siteSegmentComp.getID();
                var siteSegmentCompHeight = siteSegmentComp.getPhysicalHeight();
                var siteStructureComp = this._referenceToWPreview.getSiteNode().$logic;

                var componentsToMoveDown = [];
                switch (siteSegmentId) {
                    case "SITE_HEADER":
                        componentsToMoveDown = this.invalidationUtils.getAllSiteStructureComponents();
                        break;
                    case "SITE_FOOTER":
                        componentsToMoveDown.push(siteSegmentComp);
                        break;
                    case "PAGES_CONTAINER":
                        var footerY = this._referenceToWPreview.getCompByID("SITE_FOOTER").$logic.getY();
                        componentsToMoveDown = this.invalidationUtils.getAllSiteStructureComponents().filter(function(comp) {
                            return comp.getY()>=footerY;
                        });
                        break;
                }

                multiComponentSelector.setSelectedComps(componentsToMoveDown);
                var yDestinationOfSiteSegment;

                if (siteSegmentId === 'SITE_FOOTER') {
                    yDestinationOfSiteSegment = this.invalidationUtils.getBottomYOfSiteStructureComponents() + 10;
                }
                else {
                    yDestinationOfSiteSegment = multiComponentSelector.getY();
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:multiComponentSelector.getY() + siteSegmentCompHeight + 10, enforceAnchors:true, editedComponent:multiComponentSelector});
                }

                siteStructureComp.addChild(siteSegmentComp);
                W.Editor.setSelectedComp(componentsToMoveDown[0]);
                W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:yDestinationOfSiteSegment, updateLayout:true, editedComponent:siteSegmentComp});

                W.UndoRedoManager.clear();
            }.bind(this));
        },

        /**
         * @param {object} invalidationReport
         * @param {object} invalidationReport.dataItem
         * @param {string} invalidationReport.invalidId
         */
        removeDataQueryFromReflist: function(invalidationReport){
            var reflistKey = _.findKey(invalidationReport.dataItem._schema, "refList") || "items";
            var data = invalidationReport.dataItem._data;
            var reflist = data && data[reflistKey];
            var idToRemove = '#' + invalidationReport.invalidId;
            _.remove(reflist, function(id){
                return id === idToRemove;
            });
        },

        /**
         *
         */
        markDataAsDirtyForSave: function(dataItem){
            var dataManager = this._referenceToWPreview.getPreviewManagers().Data;
            dataManager.markDirtyObject(dataItem);
        }

    });
});
