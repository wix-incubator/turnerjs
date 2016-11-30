define.Class('wysiwyg.viewer.managers.pages.PageHandler', function(classDefinition){
    "use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    //circular ref on w.Layout
    def.resources(['W.Data', 'W.ComponentData', 'W.Theme', 'dataFixer', 'W.Skins', 'W.Commands']);

    def.utilize(['core.managers.components.ComponentDomBuilder']);

    def.inherits('bootstrap.managers.events.EventDispatcherBase');

    def.binds(['_getPageData', '_createPageStructure', '_attachPage', '_addComponentStuffToManagers', '_setCorrectWidthToPage', '_wixifyPage',  '_onFailBeforeWixify','_onFailToRenderPage', '_getSuccessInfo', '_writePageIdOnComponentNodes']);

    /**
     * @constructs
     */
    def.methods(/** @lends {wysiwyg.viewer.managers.pages.PageHandler} **/{
        /**
         * @param pageId
         * @param pageNode
         * @param dataResolver
         * @param viewerName
         * @param pageCorrectWidth
         * @param waitForRender
         */
        initialize: function(pageId, pageNode, dataResolver, viewerName, pageCorrectWidth, waitForRender){
            this._comps = {};
            this._pageId = pageId;
            this._dataResolver = dataResolver;
            this._isPageLoaded = false;
            this._viewerName = viewerName;
            this._rootNode = pageNode;
            this._pageCorrectWidth = pageCorrectWidth;
            this._waitingForRender = waitForRender;
            this._failed = {};
//            this._timedOut = [];
            /**@type core.managers.components.ComponentDomBuilder*/
            this._compDomBuilder = new this.imports.ComponentDomBuilder(Constants.ViewerTypesParams.DOM_ID_PREFIX[viewerName]);
            this.resources.W.Commands.registerCommand('W.ViewerCommands.PageHandlerAttachPage', true);
        },

        loadPage: function(){
            this.promise =  this._getPageData()
                .then(this._addComponentStuffToManagers)
                .then(this._createPageStructure)
                .then(this._writePageIdOnComponentNodes)
                .then(this._setCorrectWidthToPage)
                .then(this._attachPage)
                .then(this._wixifyPage, this._onFailBeforeWixify)
                .then(this._getSuccessInfo)
                .fail(this._onFailToRenderPage);

            return this.promise;
        },

        _getSuccessInfo: function(nodes){
            var obj = {
                'pageId': this._pageId,
                'pageNode': nodes.rootCompNode,
                'failed': _.values(this._failed),
                'nodes': nodes
            };
            this.exterminate();
            return obj;
        },

        /**
         * Writes the pageId on each node $pageId property
         * @param nodes
         * @returns {nodes}
         * @private
         */
        _writePageIdOnComponentNodes: function(nodes) {
            var compNodes = nodes.compNodes;
            for (var i = 0; i < compNodes.length; i++) {
                compNodes[i].$pageId = this._pageId;
            }
            return nodes;
        },


        _getPageData: function(){
            return this._dataResolver.getPageData(this._pageId);
        },

        _createPageStructure: function(pageData){
            this._logPageRender("startHtml");

            var pageStructure = pageData.structure;

            var childComponentsPropertyName = this._getChildrenPropertyName();

            var rootDomLevel = this._rootNode ? this._rootNode.$domLevel : 0;

            var nodes = this._compDomBuilder.createComponent(pageStructure, childComponentsPropertyName, rootDomLevel);

            return nodes;
        },

        /**
         * I think that this should happen in some other place, maybe the data resolver..
         * @param pageData
         * @returns {*}
         * @private
         */
        _addComponentStuffToManagers: function(pageData){
            var childComponentsPropertyName = this._getChildrenPropertyName();
            var pageStructure = pageData.structure;
            this._addComponentStuffToManagersRec(pageStructure, childComponentsPropertyName);
            return pageData;
        },

        _addComponentStuffToManagersRec: function(componentStructure, childComponentsPropertyName){
            this._addCompAnchorsToLayout(componentStructure);

            this._applyMethodOnChildren(componentStructure, childComponentsPropertyName, this._addComponentStuffToManagersRec);
        },

        _addCompAnchorsToLayout: function(componentStructure){
            var anchors = componentStructure.layout && componentStructure.layout.anchors;
            var id = componentStructure.id;
            if(!id || !anchors) {
                return;
            }

            var prefixedAnchors = [];
            _.forEach(anchors, function(anchor){
                var prefixedAnchor = _.clone(anchor);
                prefixedAnchor.targetComponent = this._compDomBuilder._getDomId_(anchor.targetComponent);
                prefixedAnchors.push(prefixedAnchor);
            }, this);

            var prefixedAnchorsObj = {};
            prefixedAnchorsObj[this._compDomBuilder._getDomId_(id)] = prefixedAnchors;

            W.Layout.appendSavedAnchor(prefixedAnchorsObj);
        },

        _applyMethodOnChildren: function(componentStructure, childComponentsPropertyName, method){
            childComponentsPropertyName = childComponentsPropertyName || 'components';
            var childComponentsData = componentStructure[childComponentsPropertyName] || [];

            var answers = [];

            _.forEach(childComponentsData, function(childComponentData) {
                var ans = method.call(this, childComponentData);
                answers.push(ans);
            }, this);
            return answers;
        },

        _getChildrenPropertyName: function(){
            return this._dataResolver.getPageComponentsPropertyName(this._viewerName);
        },

        _setCorrectWidthToPage: function(nodes){
            var newPageNode = nodes.rootCompNode;
            newPageNode.setAttribute('width', this._pageCorrectWidth);
            return nodes;
        },

        _attachPage: function(nodes){
            var newPageNode = nodes.rootCompNode;
            this._rootNode.parentNode.replaceChild(newPageNode, this._rootNode);
            this._rootNode = newPageNode;
            this._collapsePage(newPageNode);
            return nodes;
        },

        _collapsePage: function(pageNode){
            this.resources.W.Commands.executeCommand('W.ViewerCommands.PageHandlerAttachPage', this, {pageNode: pageNode});
            pageNode.setStyle('opacity', '0');
            if(!this._waitingForRender) {
                pageNode.collapse();
            }
        },


        _wixifyPage: function(nodes){
            this._logPageRender("startWixify");
            var deferred = Q.defer();
            var nodesToWixify = nodes.compNodes;

            this._comps = _.transform(nodesToWixify, function(res, node){
                res[node.get('id')] = true;
            }, {});

            this.on('allCompsWixifyDone', this, function(){
                this._logPageRender("ready");
                deferred.resolve(nodes);
            });

            this._wixifyNodes(nodesToWixify);

            return deferred.promise;
        },

        _wixifyNodes: function(nodesToWixify){
            return _.forEach(nodesToWixify, function(node, nodeIndex){
                var nodeId = node.get('id');

                node.on(this._getNodeWixifyFinishedEvent(), this, function(){
                    this._onNodeWixifyDone(nodeId);
                });
                node.on(Constants.ComponentEvents.REQUESTING_TO_DIE, this, function(eventInfo){
                    var data = eventInfo.data;
                    this._addFailedComp(node, data.errorObj, data.messageToUserObj);
                    this._onNodeWixifyDone(nodeId);
                });

                this._wixifyNode(node);
            }, this);
        },

        _wixifyNode: function(node){
            try{
                node.wixify({'isWaitingForRender': this._waitingForRender});
            } catch(e){
                this._addFailedComp(node, e);
                this._onNodeWixifyDone(node.get('id'));
            }
        },

        _onNodeWixifyDone: function(nodeId){
            delete this._comps[nodeId];
            if(_.isEmpty(this._comps)){
                this.trigger('allCompsWixifyDone');
            }
        },


        _addFailedComp: function(node, error, messageToUser ){
            if(this._compDomBuilder._getNodeCompId_(node) === this._pageId || node.$isContainerOrPage){
                console.log("we don't support dead containers and pages");
                throw error;
            }
            var compId = node.get('id');
            if(this._failed[compId]){
                return;
            }
            this._failed[compId] = {
                'pageId': this._pageId,
                'domCompId': compId,
                'stack': error.stack || error,
                'message': error.message || error,
                'messageToUser': messageToUser
            };
        },

        _getNodeWixifyFinishedEvent: function(){
            if(this._waitingForRender){
                return Constants.ComponentEvents.READY;
            }
            return Constants.ComponentEvents.WIXIFIED;
        },

        _onFailBeforeWixify: function(error){
            var errorMessage = error.stack ? error.stack : error;
            this._logPageRender("startWixify", errorMessage);
            LOG.reportError(wixErrors.PM_PAGE_FAILED_BEFORE_WIXIFY, "PageHandler", "loadPage",  errorMessage);
            throw error;
        },

        _onFailToRenderPage: function(error){
            var errorMessage = error.stack ? error.stack : error;
            this._logPageRender("ready", errorMessage);
            LOG.reportError(wixErrors.PM_RENDER_PAGE_FAILED, "PageHandler", "loadPage", errorMessage);
            this.exterminate();
            throw error;
        },

        _logPageRender: function(step, error) {
            deployStatus('pageLoad', {
                'pageId': this._pageId,
                'type': step,
                'time': LOG.getSessionTime(),
                'errorDesc': error
            });
        }
    });
});
