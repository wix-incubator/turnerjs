/**
 * @class bootstrap.utils.SupportUtils
 *
 * In this class we put all the scripts made for the support team
 *
 */
define.utils('Support', function(){
    return ({

    // ##########################################################################
    // ############  P U B L I C     M E T H O D S    ###########################
    // ##########################################################################

        addMissingHeader: function() {
            this._addMissingSiteSegment("SITE_HEADER");
        },

        addMissingFooter: function() {
            this._addMissingSiteSegment("SITE_FOOTER");
        },

        diagnoseSiteStructure: function(alertErrors) {
            var errorsFound = [];
            errorsFound = errorsFound.concat(this._findMissingSiteSegmentsErrors());
            errorsFound = errorsFound.concat(this._findSiteSegmentMislocatedErrors());
            if (alertErrors) {
                if (errorsFound.length==0) {
                    alert("No Errors found in the Site Structure");
                }
                else {
                    var errorMsg = "";
                    _(errorsFound).forEach(function(err){errorMsg+= err.msg +"\n";});
                    alert(errorMsg);
                }
            }
            return errorsFound;
        },

        diagnoseAndFixSiteStructure: function(alertErrors) {
            var errorsFound = this.diagnoseSiteStructure(alertErrors);

            for (var i = 0; i < errorsFound.length; i++) {
                var err = errorsFound[i];
                if (err.type == "SITE_SEGMENT_MISSING") {
                    this._addMissingSiteSegment(err.erroneousCompId);
                }

                if (err.type == "SITE_SEGMENT_MISLOCATED") {
                    this._fixSiteSegmentLocation(err.erroneousCompId);
                }
            }
        },

        fixCorruptedTextData:function(){
            var mvh = W.Preview.getMultiViewersHandler();
            var desk = mvh._viewersInfo.DESKTOP.siteStructureSerializer._getSerializedStructure();
            var compIds = [];
            this.mapStructure(desk,compIds);
            this.validateIds(compIds);
        },


        // ##########################################################################
        // ############  P R I V A T E   M E T H O D S    ###########################
        // ##########################################################################

        _addMissingSiteSegment: function(siteSegmentId) {
            W.Classes.getClass('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(MultiSelectCls) {
                var multiComponentSelector = new MultiSelectCls();
                W.Editor.clearSelectedComponent();

                if (siteSegmentId == "PAGES_CONTAINER") {
                    return;
                }

                if (W.Preview.getCompByID(siteSegmentId)) {
                    alert("Dude, What the fuck?!? "+ siteSegmentId +" already exists!");
                    return;
                }

                var footerDataStringified = '{"componentType":"wysiwyg.viewer.components.FooterContainer","type":"Container","id":"SITE_FOOTER","styleId":"fc3","skin":"wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen","layout":{"x":0,"y":1243,"width":980,"height":20,"scale":1,"anchors":[]},"components":[]}';
                var headerDataStringified = '{"componentType":"wysiwyg.viewer.components.HeaderContainer","type":"Container","id":"SITE_HEADER","styleId":"hc3","skin":"wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen","layout":{"x":0,"y":1243,"width":980,"height":20,"scale":1,"anchors":[]},"components":[]}';

                var siteSegmentDataStringified = (siteSegmentId == "SITE_HEADER") ? headerDataStringified : footerDataStringified;
                var siteSegmentData = JSON.parse(siteSegmentDataStringified);

                var pagesContainerComp = W.Preview.getCompByID('PAGES_CONTAINER').$logic;

                if (siteSegmentId == "SITE_HEADER") {

                    //move all components down:
                    var siteStructureComponents = this._getAllSiteStructureComponents();
                    multiComponentSelector.setSelectedComps(siteStructureComponents);
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:multiComponentSelector.getY() + 40, enforceAnchors:true, editedComponent:multiComponentSelector});
                }

                var siteStructureNode = W.Preview.getSiteNode();
                W.CompDeserializer.createAndAddComponents(siteStructureNode, [siteSegmentData], true, true, undefined, function(){
                }, true, true);


                setTimeout(function() {
                    var mostBottomYOfSiteStructureComponents = this._getBottomYOfSiteStructureComponents();
                    var siteSegmentY = (siteSegmentId == "SITE_HEADER") ? multiComponentSelector.getY() - 30 : mostBottomYOfSiteStructureComponents + 10;
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:siteSegmentY, updateLayout:true});
                    W.UndoRedoManager.clear();
                }.bind(this), 500);
            }.bind(this));
        },

        _findMissingSiteSegmentsErrors: function () {
            var errorsFound = [];

            var headerNode = W.Preview.getCompByID("SITE_HEADER");
            var pagesContainerNode = W.Preview.getCompByID("PAGES_CONTAINER");
            var footerNode = W.Preview.getCompByID("SITE_FOOTER");

            if (!headerNode) {
                errorsFound.push({msg: "SiteHeader is missing",
                    type: "SITE_SEGMENT_MISSING",
                    erroneousCompId: "SITE_HEADER"

                });
            }
            if (!pagesContainerNode) {
                errorsFound.push({msg: "Pages Container is missing",
                    type: "SITE_SEGMENT_MISSING",
                    erroneousCompId: "PAGES_CONTAINER"
                });
            }
            if (!footerNode) {
                errorsFound.push({msg: "Site Footer is missing",
                    type: "SITE_SEGMENT_MISSING",
                    erroneousCompId: "SITE_FOOTER"
                });
            }

            return errorsFound;
        },

        _findSiteSegmentMislocatedErrors: function () {
            var errorsFound = [];

            var headerNode = W.Preview.getCompByID("SITE_HEADER");
            var pagesContainerNode = W.Preview.getCompByID("PAGES_CONTAINER");
            var footerNode = W.Preview.getCompByID("SITE_FOOTER");

            var headerParentId = headerNode && headerNode.$logic.getParentComponent().getComponentId();
            var pagesContainerParentId = pagesContainerNode && pagesContainerNode.$logic.getParentComponent().getComponentId();
            var footerParentId = footerNode && footerNode.$logic.getParentComponent().getComponentId();


            if (headerParentId && headerParentId!== "SITE_STRUCTURE") {
                errorsFound.push({msg: "Header is inside " + headerParentId +" instead of SITE_STRUCTURE",
                    type: "SITE_SEGMENT_MISLOCATED",
                    erroneousCompId: "SITE_HEADER"
                });
            }

            if (pagesContainerParentId && pagesContainerParentId!== "SITE_STRUCTURE") {
                errorsFound.push({msg: "PagesContainer is inside " + pagesContainerParentId +" instead of SITE_STRUCTURE",
                    type: "SITE_SEGMENT_MISLOCATED",
                    erroneousCompId: "PAGES_CONTAINER"
                });
            }

            if (footerParentId && footerParentId!== "SITE_STRUCTURE") {
                errorsFound.push({msg: "Footer is inside " + footerParentId +" instead of SITE_STRUCTURE",
                    type: "SITE_SEGMENT_MISLOCATED",
                    erroneousCompId: "SITE_FOOTER"
                });
            }

            return errorsFound;
        },

        _getBottomYOfSiteStructureComponents: function() {
             var siteStructureComponents = this._getAllSiteStructureComponents();
             var mostBottomY = 0;
             for (var i=0; i<siteStructureComponents.length; i++) {
                 mostBottomY = Math.max(mostBottomY, siteStructureComponents[i].getY() + siteStructureComponents[i].getPhysicalHeight());
             }
            return mostBottomY;
        },

        _getAllSiteStructureComponents: function() {
             return W.Preview.getSiteNode().$logic.getChildren().map(function(node){ return node.$logic;});
        },

        _fixSiteSegmentLocation: function(siteSegmentId) {
            W.Classes.getClass('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(MultiSelectCls) {
                var multiComponentSelector = new MultiSelectCls();
                W.Editor.clearSelectedComponent();

                var siteSegmentComp = W.Preview.getCompByID(siteSegmentId).$logic;
                var siteSegmentCompHeight = siteSegmentComp.getPhysicalHeight();
                var siteStructureComp = W.Preview.getSiteNode().$logic;

                var componentsToMoveDown = [];
                switch (siteSegmentId) {
                    case "SITE_HEADER":
                        componentsToMoveDown = this._getAllSiteStructureComponents();
                        break;
                    case "SITE_FOOTER":
                        break;
                    case "PAGES_CONTAINER":
                        var footerY = W.Preview.getCompByID("SITE_FOOTER").$logic.getY();
                        componentsToMoveDown = this._getAllSiteStructureComponents().filter(function(comp) {
                            return comp.getY()>=footerY;
                        });
                        break;
                }

                multiComponentSelector.setSelectedComps(componentsToMoveDown);
                var yDestinationOfSiteSegment;

                if (siteSegmentId == 'SITE_FOOTER') {
                    yDestinationOfSiteSegment = this._getBottomYOfSiteStructureComponents() + 10;
                }
                else {
                    yDestinationOfSiteSegment = multiComponentSelector.getY();
                    W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:multiComponentSelector.getY() + siteSegmentCompHeight + 10, enforceAnchors:true, editedComponent:multiComponentSelector});
                }

                siteStructureComp.addChild(siteSegmentComp);
                W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", {y:yDestinationOfSiteSegment, updateLayout:true, editedComponent:siteSegmentComp});

                W.UndoRedoManager.clear();
            }.bind(this));
        },

        //
        mapRecurse: function (node, compIdsArray) {
            var children = node.children || node.components;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    this.mapRecurse(children[i], compIdsArray);
                }
            }
            if (node.id) {
                compIdsArray.push(node.id);
            }
        },
        mapStructure :function(structure,compIdsArray){
            this.mapRecurse(structure.masterPage,compIdsArray);
            for(var page in structure.pages)
            {
                this.mapRecurse(structure.pages[page],compIdsArray);
            }
        },

        getNodesById : function(compId){
            var iFrameDoc = W.Preview.getIFrame().contentWindow.document;
            return iFrameDoc.querySelectorAll('[id="'+compId+'"]');
        },

        validateIds: function(compIds){
            var fixedData = false;
            for(var i=0; i<compIds.length; i++){
                var currentId = compIds[i];
                var nodes = this.getNodesById(currentId);
                if(nodes.length > 1){
                    for(var j=0; j<	nodes.length; j++){
                        var currentNode = nodes[j];
                        var parents = currentNode.getParents();
                        for(var k=0; k<parents.length; k++){
                            var currentParent = parents[k];
                            if(currentParent.getAttribute("comp") === "wysiwyg.viewer.components.WRichText" && currentParent.$logic && currentParent.$logic.$className === "wysiwyg.viewer.components.WRichText"){
                                var textData = W.Preview.getPreviewManagers().Data.getDataByQuery(currentParent.getAttribute('dataquery'));
                                var textString = textData.get('text');
                                var newText= textString.replace(/(id|skin|comp|dataquery|propertyquery)\s*=\s*["'].*?["']/gi, "");
                                textData.set('text', newText);
                                fixedData = true;
                            }
                        }
                    }
                }
            }
            if(fixedData){
                alert("No data was fixed");
            }else{
                alert("Some components were fixed");
            }
        },

        isTextStyleValid: function() {
            W.Theme.getStyle('txtNew', function(style){
                var logger = (console._oldConsole ? window.console._oldConsole : window.console);
                if (style.getSkin() === "wysiwyg.viewer.skins.WRichTextSkin") {
                    logger.log("false");
                } else {
                    logger.log("true");
                }
            });
        },

        fixTextStyle: function() {
            W.Theme.getStyle('txtNew', function(style){
                if (style.getSkin() === "wysiwyg.viewer.skins.WRichTextSkin") {
                    var textStyle = style;
                    W.Skins.getSkin("wysiwyg.viewer.skins.WRichTextNewSkin", function(newTextSkin) {
                        textStyle.setSkin(newTextSkin);
                    });
                }
            });
        }
    });
});