/**
 * @class wysiwyg.viewer.components.MediaRichText
 * @extends wysiwyg.viewer.components.WRichText
 */
define.component('wysiwyg.viewer.components.MediaRichText', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.WRichText');

    def.utilize(['core.managers.components.ComponentDomBuilder']);

    def.dataTypes(['MediaRichText']);

    def.traits(['wysiwyg.viewer.components.traits.MediaTextHandler']);

    def.binds(['_onAllInnerCompsReady']);

    def.fields({
        _innerComponenets: {}
    });

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._compDomBuilder = new this.imports.ComponentDomBuilder();
            this.addEvent('resize', this._updateSize);
            this._isChildCompsReady = false;
        },

        _updateSize: function(maxWidth){
            var textCompWidth = maxWidth || this.getViewNode().getWidth(); //this is the max width

            _.forEach(this._innerComponenets, function(innerComponent) {
                if (innerComponent.node.$logic) {
                    if (innerComponent.jsonData.componentType === "wysiwyg.viewer.components.WPhoto") {
                        this._updateImageSize(innerComponent, textCompWidth);
                    } else if (innerComponent.jsonData.componentType === "wysiwyg.viewer.components.Video") {
                        this._updateVideoSize(innerComponent, textCompWidth);
                    }
                }
            }, this);
        },

        _updateVideoSize: function(innerVideo, textCompWidth) {
            var newWidth = innerVideo.jsonData.defaultWidth;
            var newHeight;

            if (innerVideo.jsonData.width) {
                newWidth = this._getWidthMultiplier(innerVideo.jsonData) * textCompWidth;
            }

            //make sure the inner video comp stay in the media component
            newWidth = (textCompWidth < newWidth? textCompWidth: newWidth);

            newHeight = newWidth * innerVideo.jsonData.dimsRatio;

            innerVideo.node.$logic.setWidth(newWidth);
            innerVideo.node.$logic.setHeight(newHeight);
        },

        _updateImageSize: function (innerImage, textCompWidth) {
            if (innerImage.jsonData.width) {
                innerImage.node.$logic.setWidth(this._getWidthMultiplier(innerImage.jsonData) * textCompWidth);
            } else {
                var compActualWidth = innerImage.node.$logic.getDataItem().get('width');
                var widthToUse = (textCompWidth < compActualWidth? textCompWidth: compActualWidth);
                innerImage.node.$logic.setWidth(widthToUse);
            }
        },

        /**
         * If in mobile we want the width to always take 100% else what the user chose
         * @param jsonData
         * @private
         */
        _getWidthMultiplier: function(jsonData){
            return this._isMobile ? 0.99 : jsonData.width;
        },

        /**
         * Create a temporary document fragment to have reference to the inner components dom nodes.
         * This will keep the cached componentsin the memory and they will not be garbage collected
         *
         * The document fragment is deleted at the end of the update text method
         */
        _createReference4CacheNodes: function(){
            this.docFragment = document.createDocumentFragment();
            _.forEach(this._innerComponenets, function(innerComp){
                this.docFragment.appendChild(innerComp.node);
            }, this);
        },
        _clearCacheNodesReference: function(){
            delete this.docFragment;
        },
        _updateText: function () {
            this._loadFontsToViewer();
            var textContent = this.getDataItem().get('text');

            this._createReference4CacheNodes();

            this.getRichTextContainer().set('html', textContent);

            //in public and preview - we need to update the links after updating the text content from the data.
            if (this._shouldUpdateLinksData()) {
                this._setLinksDataToElements("VIEW");
            }

            this._createInnerComponents();

            if (this._isMobile) {
                this._setMobileComponentAppearance();
            }

            this._clearCacheNodesReference();
        },

        _createInnerComponents: function(){
            this._isChildCompsReady = false;
            this._replacePlaceHoldersWithComps();
            this._listenToAllChildrenReady(this._onAllInnerCompsReady);
        },

        _setStyles: function (compNode, elementDataJson) {
            compNode.setStyle('margin-top', '10px');
            compNode.setStyle('margin-bottom', '10px');

            if (elementDataJson.floatValue) {
                compNode.setStyle('float', elementDataJson.floatValue);
                compNode.setStyle('display', '');
                compNode.setStyle('clear', '');
            } else {
                compNode.setStyle('display', elementDataJson.display);
                compNode.setStyle('clear', 'both');
                compNode.setStyle('float', '');
            }

            compNode.setStyle('margin-left', elementDataJson.marginLeft);
            compNode.setStyle('margin-right', elementDataJson.marginRight);
            compNode.setStyle('position', 'static');
        },

        /**
         * Main functionality, goes over the rich text from ckeditor and finds all the place holders,
         * afterwards it replaces the placeholders with wix componenets, if needed also wixifies them and
         * adds them to dom
         * @param compPlaceHolders
         * @private
         */
        _replacePlaceHoldersWithComps: function(){
            var compPlaceHolders = this.getRichTextContainer().getElements('[wix-comp]');
            _.forEach(compPlaceHolders, function(placeHolder){
                var elementDataJson = JSON.parse(placeHolder.get('wix-comp'));
                var compNode;

                //if we haven't created the component yet we create a new one
                if (!this._innerComponenets[elementDataJson.id]) {
                    compNode = this._createNewInnerComp(elementDataJson);
                } else {
                    //The inner component was already created and wixified, just use it
                    var cachedData = this._innerComponenets[elementDataJson.id];
                    cachedData.jsonData = elementDataJson;
                    compNode = cachedData.node;
                }
                placeHolder.parentElement.replaceChild(compNode, placeHolder);
            },this);
        },

        _createNewInnerComp: function(elementDataJson){
            //we need to have normal positioning as opposed to the rest of wix.... :p
            elementDataJson.layout = {staticPosition: true};

            if(W.Config.env.isViewingSecondaryDevice()){
                elementDataJson.id = Constants.ViewerTypesParams.DOM_ID_PREFIX.MOBILE + elementDataJson.id;
                this._transformDataJsonForMobile(elementDataJson);
            }
            var compNode = this._compDomBuilder.createComponent(elementDataJson).rootCompNode;

            if (elementDataJson.componentType === "wysiwyg.viewer.components.WPhoto") {
                this._createImagePropertiesItem(elementDataJson.dataQuery);
            }

            compNode.wixify();

            // Add to cache
            this._innerComponenets[elementDataJson.id] = {
                jsonData: elementDataJson,
                node: compNode
            };

            return compNode;
        },

        /**
         * only returns true when all children are ready!
         * @returns {boolean}
         * @private
         */
        _prepareForRender: function () {
            return this._isChildCompsReady;
        },

        _listenToAllChildrenReady: function(callback){
            var promises = this._getNodesReadyPromises();
            return Q.all(promises).then(function(){
                callback();
            });
        },

        _onAllInnerCompsReady: function(){
            this.$view.setStyle('overflow', 'overlay');
            this._isChildCompsReady = true;
            this._addAllCompsToSkinParts();
            this._updateCompsStyles();
            this.renderIfNeeded();
            this._updateSize();
        },

        _getNodesReadyPromises: function(){
            var nodes = this._getNodesFromCompsArray();
            return _.map(nodes, function(node){
                var deferred = Q.defer();

                if(node.$logic && node.$logic.isReady()){
                    deferred.resolve();
                }

                node.on(Constants.ComponentEvents.READY, this, function(){
                    deferred.resolve();
                });

                return deferred.promise;
            },this);
        },

        _addAllCompsToSkinParts: function(){
            var nodes = this._getNodesFromCompsArray();
            _.forEach(nodes, function(node){
                if(node.$logic){
                    this._skinParts[node.$logic.getComponentId()] = node.$logic;
                }
            }, this);
        },

        _updateCompsStyles: function(){
            _.forEach(this._innerComponenets, function(innerComp){
                var node = innerComp.node;
                if(node.$logic && node.$logic.$className === "wysiwyg.viewer.components.WPhoto"){
                    node.$logic._skinParts.link.setStyle('display', 'inline-block');
                    node.$logic.setUseWidthOverMinWidth(true);
                }

                this._setStyles(node, innerComp.jsonData);
            }, this);
        },

        _getNodesFromCompsArray: function(){
            return _.map(this._innerComponenets, function(component){
                return component.node;
            });
        },

        _transformDataJsonForMobile: function(elementDataJson){
            elementDataJson.marginLeft = 'auto';
            elementDataJson.marginRight = 'auto';
            elementDataJson.width = 1;
            delete elementDataJson.floatValue;
        },


        /****************************************
         * API FOR GARBAGE COLLECTION ON INNER COMPS FROM CKEDITOR!
         ****************************************/

        /**
         * start as marking all componenets as need to be collected
         */
        markInnerCompsForDispose: function(){
            _.forEach(this._innerComponenets, function(innerCompJson){
                innerCompJson.shouldBeDisposed = true;
            },this);
        },

        /**
         * Components who are used should NOT be garbage collected
         * @param id
         */
        markInnerCompAsUsed: function(id){
            if(this._innerComponenets[id]){
                this._innerComponenets[id].shouldBeDisposed = false;
            }
        },

        /**
         * Dispose all components who are not marked as used
         */
        disposeUnusedComps: function(){
            _.forEach(this._innerComponenets, function(comp){
                if(comp.shouldBeDisposed){
                    comp.node.$logic.dispose();
                    delete this._innerComponenets[comp.jsonData.id];
                }
            },this);
        },
        /*****************************************/




        dispose: function(){
            _.forEach(this._innerComponenets, function(comp){
                comp.node.$logic.dispose();
            }, this);
            this.parent();
        }

    });
});
