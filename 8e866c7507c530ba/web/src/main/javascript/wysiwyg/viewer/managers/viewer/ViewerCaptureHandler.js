/**@class wysiwyg.viewer.managers.viewer.ViewerCaptureHandler */
define.Class('wysiwyg.viewer.managers.viewer.ViewerCaptureHandler', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize(['wysiwyg.viewer.managers.viewer.ViewerDomDisplayReadyEventsCollector']);

    def.binds(['_processSiteForCapture', '_prepareHtml', '_fireReadyEvent', '_onMobileReady', '_addPageDataToCapturedHtml', '_onLayoutReady', '_waitForLayoutReady', '_addTpaGalleriesData', '_addStaticPrefixToComponents', '_prepareComponentForCapture', '_onNeverDomDisplayReady']);

    def.resources(['topology']);

    def.statics({
            CONTENT_STR: 'content: '
    });

    /** @lends wysiwyg.viewer.managers.viewer.ViewerCaptureHandler */
    def.methods({
        initialize: function(viewer){
            this._viewer = viewer;
            this._tpaGalleriesData = {};
            this._capturedHtml = {
                'shouldCapture': false
            };
            this._domDisplayReadyEventsCollector = new this.imports.ViewerDomDisplayReadyEventsCollector(wixErrors.HTML_CAPTURE_FAILURE, this._prepareComponentForCapture);
            //this._layoutReady = true;
        },

        captureMobile: function(){
            var self = this;
            this._viewer._getDataResolver_().isStructureExists(Constants.ViewerTypesParams.TYPES.MOBILE).then(function(isMobileStructureExist){
                self._addPageDataToCapturedHtml();

                if(!isMobileStructureExist || !W.Config.isMobileOptimizedViewOn()){
                    window.capturedHtml = self._capturedHtml;
                    window.fireEvent('noMobileCapture');
                    return;
                }

                self._capturedHtml.shouldCapture = true;
                W.Config._setIsCapturing_(true);
                var viewerName = Constants.ViewerTypesParams.TYPES.MOBILE;
                self._viewer.switchViewer(viewerName, false, Constants.ViewerTypesParams.DOC_WIDTH[viewerName]);
                self._viewer._activeViewer_.addEvent('SiteReady', self._onMobileReady);
                W.Layout.addEvent('layoutDone',  self._onLayoutReady);
                W.Layout.notifyWhenNoMoreChanges();

                var obsoleteNodeIdsToRemove = self._getObsoleteNodeIdsToRemove();
                self._removeObsoleteComponents(obsoleteNodeIdsToRemove);
                self._viewer._activeViewer_.initiateSite();
            });
        },

        _getObsoleteNodeIdsToRemove: function() {
            return ['wixFooter', 'desktopBgNode'] ;
        },

        _removeObsoleteComponents: function(nodesIdsToRemove) {
            if(nodesIdsToRemove && nodesIdsToRemove.length > 0) {
                var nodeToRemove = null ;
                for(var i=0; i < nodesIdsToRemove.length; i++) {
                    if(nodesIdsToRemove[i]) {
                        nodeToRemove = this._getNodeInDom(nodesIdsToRemove[i]);
                        if (nodeToRemove && nodeToRemove.$logic) {
                            nodeToRemove.$logic.dispose();
                        }
                    }
                }
            }
        },

        _getNodeInDom: function (nodesId) {
            return $(nodesId);
        },

        _onLayoutReady: function(){
            this._layoutReady = true;
        },

        _onMobileReady: function(){
            this._viewer.getSiteView(Constants.ViewerTypesParams.TYPES.DESKTOP).dispose();
            this._turnOffMovement();
            this._processSiteForCapture();
        },

        _processSiteForCapture: function(){
            this._domDisplayReadyEventsCollector._waitForDomDisplayReady(20000)
                .then(this._waitForLayoutReady, this._onNeverDomDisplayReady)
                .then(this._garbageCollectCss)
                .then(this._addStaticPrefixToComponents)
                .then(this._prepareHtml)
                .then(this._addTpaGalleriesData)
                .then(this._fireReadyEvent);
        },

        _turnOffMovement: function(){
            function killAutoPlay(properties){
                _.forEach(properties, function(item){
                    if (item.get('autoplay')){
                        item.set('autoplay', false);
                    } else if (item.get('autoPlay')){
                        item.set('autoPlay', false);
                    } else if (item.get('loop')){
                        item.set('loop', false);
                    }
                });
            }
            W.ComponentData.getDataItemsByType('SlideShowGalleryProperties', killAutoPlay);
            W.ComponentData.getDataItemsByType('PaginatedGridGalleryProperties', killAutoPlay);
            W.ComponentData.getDataItemsByType('VideoProperties', killAutoPlay);
            W.ComponentData.getDataItemsByType('SingleAudioPlayerProperties', killAutoPlay);
            W.ComponentData.getDataItemsByType('AudioPlayerProperties', killAutoPlay);
            W.Data.getDataItemsByType('AudioPlayer', killAutoPlay);
            W.Data.getDataItemsByType('SoundCloudWidget', killAutoPlay);
        },

        _garbageCollectCss: function(){
            W.Skins._cssGarbageCollector.runGarbageCollector();
        },

        _prepareComponentForCapture: function(compNode){
            var compLogic = compNode.$logic;
            var tpaDataJson = compLogic.getTPAData && compLogic.getTPAData();
            if (tpaDataJson){
                var compDomId = compNode.getAttribute('id');
                this._tpaGalleriesData[compDomId] = tpaDataJson;
            }

            if(compLogic.isPartiallyFunctionalInStaticHtml()){
                //can be added here stuff to be done
                //currently do nothing
            } else if (compLogic.isInvisibleInStaticHtml()){
                compNode.addClass('component_capture_full_preloader');
            }
        },

        _waitForLayoutReady: function(){
            var deferred = Q.defer();
            if(this._layoutReady){
                deferred.resolve();
            } else{
                var self = this;
                W.Layout.addEvent('layoutDone',  function(){
                    self._onLayoutReady();
                    deferred.resolve();
                });
            }
            return deferred.promise;
        },

        _addStaticPrefixToComponents: function(){
            var allComponents = document.querySelectorAll('[comp]');
            _.map(allComponents, function(comp){
                //adding a static prefix to id
                comp.setAttribute('id', Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + comp.getAttribute('id'));
            });
        },

        _prepareHtml: function(){
            var siteStyles = this._getSiteStyles();
            var siteScripts = this._getAdditionalScripts();
            var bodyHtml = this._getNodeHtml(document.body);
            var headHtml = this._getNodeHtml(document.head);
            headHtml += siteStyles;
            headHtml = siteScripts + headHtml;
            this._capturedHtml.bodyHtml = bodyHtml;
            this._capturedHtml.headHtml = headHtml;
        },

        _getSiteStyles: function(){
            var skinStyles = _.map(W.Skins._skinRenderer._stylesheet.cssRules, function(rule){
                return this._fixStyleContentText(rule.cssText);
            }.bind(this));
            var themeStyles = _.map(W.Css._generateThemeStylesSheet().cssRules, function(rule){
                return this._fixStyleContentText(rule.cssText);
            }.bind(this));

            return "<style id='" + Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "skinStyles'>" + skinStyles.join('\n') +
                "</style><style id='" + Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "themeStyles'>" + themeStyles.join('\n') +
                "</style>";
        },

        /**
         * This fix was added for special cases where the capturing process's webkit returns a cssText string that looks like
         * this:   "content: ✕;"   instead of "content: '✕';"
         * @param cssText
         * @return {*}
         * @private
         */
        _fixStyleContentText: function(cssText){
            var result = cssText;
            var index = cssText.indexOf(this.CONTENT_STR);

            if (index !== -1){
                var firstContentChar = cssText.substr(index + this.CONTENT_STR.length, 1);
                if (firstContentChar !== "'" && firstContentChar !== '"'){
                    var firstSubString = cssText.substr(0, index);
                    var secondSubString = cssText.substr(index + this.CONTENT_STR.length, cssText.length - 1);
                    var semicolonIndex = secondSubString.indexOf(';');
                    if (semicolonIndex !== -1){
                        result = firstSubString + this.CONTENT_STR + "'" +
                            secondSubString.substr(0, semicolonIndex) +
                            "'" + secondSubString.substr(semicolonIndex, secondSubString.length - 1);
                    }
                }
            }
            return result;
        },

        _getAdditionalScripts: function(){
            var src = this.resources.topology.bootstrap;
            src += "/javascript/bootstrap/bootstrap/capture/additionalScripts.js";
            return "<script type='text/javascript' src='" + src + "'></script>\n";
        },

        _getNodeHtml: function(node){
            var children = node.children;
            var htmlString = '';
            var self = this;
            _.forEach(children, function(child){
                if (self._shouldCaptureNode(child)){
                    var currId = child.getAttribute('id');
                    if (currId && currId.indexOf(Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX) !== 0){
                        child.setAttribute('id',Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + currId);
                    }
                    htmlString += child.outerHTML + '\n';
                }
            });
            return htmlString;
        },

        _shouldCaptureNode: function(node){
            if(node.serverGenerated && node.hasAttribute('comp')){
                return true;
            }
            return !node.serverGenerated;
        },

        _addPageDataToCapturedHtml: function(){
            var currentPageId =   this._viewer.getCurrentPageId();
            var pageInfo = _.find(publicModel.pageList.pages, function(page){
               return page.pageId === currentPageId;
            });
            if(!pageInfo){
                throw "there is no such page in page list";
            }
            var pageUrlName = _.last(pageInfo.urls[0].split('/')).split('?')[0].split('.')[0];
            var masterPageUrl = _.last(publicModel.pageList.masterPage[0].split('/')).split('?')[0];
            pageUrlName += '-' + masterPageUrl;

            this._capturedHtml.urlName = pageUrlName;
            this._capturedHtml.pageId = currentPageId;
        },

        _addTpaGalleriesData: function(){
            if(this._tpaGalleriesData && !_.isEmpty(this._tpaGalleriesData)){
                this._capturedHtml.tpaGalleriesData = {};
                _.forOwn(this._tpaGalleriesData, function(value, key){
                    var staticKey = Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + key;
                    this._capturedHtml.tpaGalleriesData[staticKey] = value;
                }.bind(this));
            }
        },

        /**
         *
         * @private
         */
        _fireReadyEvent: function(){
            window.capturedHtml =  this._capturedHtml;
            window.fireEvent('siteReadyForCapture', this._capturedHtml);
        },

        _onNeverDomDisplayReady: function(){
            this._domDisplayReadyEventsCollector._onNeverDomDisplayReady();
            throw this._domDisplayReadyEventsCollector.getUnfulfilledPromises();
        }
    });

});
