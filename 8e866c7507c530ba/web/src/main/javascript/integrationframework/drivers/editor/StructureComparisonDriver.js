//#WOH-2715
/**
 * @class wysiwyg.deployment.it.editor.StructureComparisonDriver
 */
define.Class("wysiwyg.deployment.it.editor.StructureComparisonDriver", function (classDefinition) {
    var def = classDefinition;

    def.fields({});

//    def.resources(['W.Data', 'W.CommandsNew', 'W.Commands', 'W.Preview', 'W.Skins']);
    def.resources([]);

    def.methods({

        initialize: function () {
            this.algo = W.Preview.getMultiViewersHandler()._layoutAlgorithms;
        },

        setAlertWhenTestFails: function(value) {
            this._alertWhenTestFails = value;
        },

        getPageComponent: function(pageId) {
            var pageComponent = pageId == 'masterPage'? this.getMobileStructure().masterPage : this.getMobileStructure().pages[pageId];
            return pageComponent;
        },

        getPageComponentIds: function(pageId) {
            var pageComponent = this.getPageComponent(pageId);
            if (this.algo._getStructureComponentIds){
                return this.algo._getStructureComponentIds(pageComponent);
            }
            else {
                return this.algo.getStructureComponentIds(pageComponent);
            }
        },

        getMobileStructure: function() {
            //TODO: get it publicly!!!
            var mobileViewerInfo = W.Preview.getMultiViewersHandler()._viewersInfo['MOBILE'];
            return mobileViewerInfo.siteStructureSerializer._getSerializedStructure();
        },

        parsePageToSomeDataMap: function(mapFunction) {
            var mobileStructure = this.getMobileStructure();
            var pages = _.keys(mobileStructure.pages);
            pages.push('masterPage');

            var ret = {};
            for (var i=0; i<pages.length; i++) {
                ret[pages[i]] = mapFunction(pages[i]);
            }
            return ret;
        },

        parsePageToComponentIdListMap: function() {
            return this.parsePageToSomeDataMap(this.getPageComponentIds.bind(this));
        },

        parsePageToStructureSkeleton: function() {
            return this.parsePageToSomeDataMap(this.getPageStructureSkeleton.bind(this));
        },

        parsePageToLayoutDetails: function() {
            return this.parsePageToSomeDataMap(this.getPageLayoutDetails.bind(this));
        },

        parsePageToAnchors: function() {
            return this.parsePageToSomeDataMap(this.getPageAnchors.bind(this));
        },

        parseAllTemplateRequiredDataForTest: function() {
            var ret = {};
            ret.pageToComponentIdList = this.parsePageToComponentIdListMap();
            ret.pageToStructureSkeleton = this.parsePageToStructureSkeleton();
            ret.pageToLayoutDetails = this.parsePageToLayoutDetails();
            ret.pageToAnchors = this.parsePageToAnchors();
            return this.handleEscapeIssues(JSON.stringify(ret));
        },

        handleEscapeIssues: function(str) {
            return this._handleEscapeSlashes(str);
        },

        revertHandleEscapeIssues: function(str) {
            return this._revertHandleEscapeSlashes(str);
        },

        _handleEscapeSlashes: function(str) {
            while (str.indexOf("\\")>-1) {
                var indexOfSlash = str.indexOf("\\");
                str = str.slice(0,indexOfSlash) + "&@slash" + str.slice(indexOfSlash+1);
            }
            return str;
        },

        _revertHandleEscapeSlashes: function(str) {
            str = str.replace(/&@slash/ig, "\\");
            return str;
        },

        getPageStructureSkeleton: function(pageId) {
            var pageComponent = this.getPageComponent(pageId);
            return this.getStructureSkeleton(pageComponent);
        },

        getPageLayoutDetails: function(pageId) {
            var pageComponent = this.getPageComponent(pageId);
            return this.getLayoutDetails(pageComponent);
        },

        getPageAnchors: function(pageId) {
            var pageComponent = this.getPageComponent(pageId);
            return this.getAnchors(pageComponent);
        },

        getStructureSkeleton: function(component, numTabs) {

            numTabs = numTabs || 0;
            var ret = this._addTabs(numTabs);
            ret += component.id || "ROOT";

            var children = component.components || component.children;
            if (!children || children.length==0) {
                return ret;
            }

            ret+=":{\n";
            for (var i=0;i<children.length;i++) {
                ret+= this.getStructureSkeleton(children[i], numTabs+1);
                if (i!=children.length-1) {
                    ret+= ",";
                }
                ret+= "\n";
            }
            ret+=this._addTabs(numTabs)+"}\n";

            return ret;
        },

        getLayoutDetails: function(component, numTabs) {
            numTabs = numTabs || 0;
            var ret = this._addTabs(numTabs);
            ret += component.id || "";
            if (component.layout) {
                ret+=":{";
                ret+= "x:"+ component.layout.x+",";
                ret+= "y:"+ component.layout.y+",";
                ret+= "width:"+ component.layout.width+",";
                ret+= "height:"+ component.layout.height+"}";
                ret+= "\n";
            }

            var children = component.components || component.children;
            if (!children || children.length==0) {
                return ret;
            }

            for (var i=0;i<children.length;i++) {
                ret+= this.getLayoutDetails(children[i], numTabs+1);
            }

            return ret;
        },

        getAnchors: function(component, numTabs) {
            numTabs = numTabs || 0;
            var ret = this._addTabs(numTabs);
            ret += component.id || "";
            if (component.layout && component.layout.anchors) {
                ret+=":[\n";
                var anchors = component.layout.anchors;
                for (var i=0; i<anchors.length; i++) {
                    ret+="{";
                    ret+= "distance:"+ anchors[i].distance+",";
                    ret+= "locked:"+ anchors[i].locked+",";
                    ret+= "originalValue:"+ anchors[i].originalValue+",";
                    ret+= "targetComponent:"+ anchors[i].targetComponent+",";
                    ret+= "topToTop:"+ anchors[i].topToTop+",";
                    ret+= "type:"+ anchors[i].type+"}\n";
                }
                ret+= "]\n";
            }

            var children = component.components || component.children;
            if (!children || children.length==0) {
                return ret;
            }

            for (var i=0;i<children.length;i++) {
                ret+= this.getAnchors(children[i], numTabs+1);
            }

            return ret;
        },

        _addTabs: function(numTabs) {
            var ret = "";
            for (var i=0; i<numTabs; i++) {
                ret+="---";
            }
            return ret;
        },

        _arrayToString: function(arr) {
            ret = "";
            for (var i=0; i<arr.length; i++) {
                ret+=arr[i];
                if (i<arr.length-1) {
                    ret+="\n";
                }
            }
            return ret;
        },

        testPageComponentIds: function(pageId, expectedPageComponentIds) {
            var pageComponentIds = this.getPageComponentIds(pageId);
            var pageComponentIdsStr = this._arrayToString(pageComponentIds);
            var expectedPageComponentIdsStr = this._arrayToString(expectedPageComponentIds);
            expect(pageComponentIdsStr).toEqual(expectedPageComponentIdsStr);
            return (pageComponentIdsStr === expectedPageComponentIdsStr);
        },

        testPageStructureSkeleton: function(pageId, expectedPageStructureSkeleton) {
            var pageStructureSkeleton = this.getPageStructureSkeleton(pageId);
            expect(pageStructureSkeleton).toEqual(expectedPageStructureSkeleton);
            return (pageStructureSkeleton === expectedPageStructureSkeleton);
        },

        testLayoutDetails: function(pageId, expectedPageLayoutDetails) {
            var pageLayoutDetails = this.getPageLayoutDetails(pageId);
            expect(pageLayoutDetails).toEqual(expectedPageLayoutDetails);
            return (pageLayoutDetails === expectedPageLayoutDetails);
        },

        testAnchors: function(pageId, expectedPageAnchors) {
            var pageAnchors = this.getPageAnchors(pageId);
            expect(pageAnchors).toEqual(expectedPageAnchors);
            return (pageAnchors === expectedPageAnchors);
        },

        testPage: function(pageId, expectedMobileSiteResults) {
            var expectedMobileSiteResultData = JSON.parse(this.revertHandleEscapeIssues(expectedMobileSiteResults));

            var pageComponentIdsTestPassed =  this.testPageComponentIds(pageId, expectedMobileSiteResultData.pageToComponentIdList[pageId]);
            var pageStructureSkeletonTestPassed = this.testPageStructureSkeleton(pageId, expectedMobileSiteResultData.pageToStructureSkeleton[pageId]);
            var layoutDetailsTestPassed = this.testLayoutDetails(pageId, expectedMobileSiteResultData.pageToLayoutDetails[pageId]);
            var anchorsTestPassed = this.testAnchors(pageId, expectedMobileSiteResultData.pageToAnchors[pageId]);
            var testsPassed =
                pageComponentIdsTestPassed &&
                pageStructureSkeletonTestPassed &&
                layoutDetailsTestPassed &&
                anchorsTestPassed;

            if (!testsPassed && this._alertWhenTestFails) {
                alert("Dude, there is a failing test!");
                debugger;
            }
        },

        getPageComponentsTextBorders: function(viewerMode, pageId) {
            viewerMode = viewerMode || Constants.ViewerTypesParams.TYPES.DESKTOP;
            pageId = pageId || W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            var pageCompIds = W.Preview.getPageComponents(pageId, viewerMode).map(function(comp) {return comp._compId;});
            return this.getTextBorders(pageCompIds, viewerMode);

//            for (var i=0;i<pageCompIds.length;i++) {
//                var curCompId = pageCompIds[i];
//                var curCompLogic = W.Preview.getCompByID(curCompId, viewerMode).$logic;
//                if (curCompLogic.className == "wysiwyg.viewer.components.WRichText") {
//                    compIdToTextBorderMap[curCompId]= this.algo._textLayoutCalculator.getTextOverallBorders(curCompLogic);
////                    compIdToTextBorderMap[curCompId].view = curCompLogic.$view;
//                }
//
//            }
//            return compIdToTextBorderMap;
        },

        getTextBorders: function(componentIds, viewerMode) {
            viewerMode = viewerMode || Constants.ViewerTypesParams.TYPES.DESKTOP;
            var compIdToTextBorderMap = {};
            for (var i=0;i<componentIds.length;i++) {
                var curCompId = componentIds[i];
                if (curCompId !== "TINY_MENU") {
                    var curCompLogic = W.Preview.getCompByID(curCompId, viewerMode).$logic;
                    if (curCompLogic.className == "wysiwyg.viewer.components.WRichText") {
                        var textLayoutCalculator = this._isRefactoredVersion?  this.algo._conversionAlgorithm._structurePreprocessor._textLayoutCalculator : this.algo._textLayoutCalculator;
                        compIdToTextBorderMap[curCompId]= textLayoutCalculator.getTextOverallBorders(curCompLogic);
                        //                    compIdToTextBorderMap[curCompId].view = curCompLogic.$view;
                    }
                }
            }
            return compIdToTextBorderMap;
        }


    });
});
