define.Class('wysiwyg.viewer.managers.pages.PageDeadCompsHandler', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Config', 'W.Data', 'W.ComponentData', 'W.Events', 'W.Commands']);

    /**
     * @constructs
     */
    def.methods(/** @lends {wysiwyg.viewer.managers.pages.PageDeadCompsHandler} **/{
        handleDeadComps: function(failed){
            this._sendBI(failed);
            _.forEach(failed, this._replaceFailedComp, this);
            return true;
        },


        _sendBI: function(allFailed){
            var comps = _.map(allFailed, this._getBIJson, this);
            _.forEach(comps, function(biInfo){
                var desc = JSON.stringify(biInfo.desc);
                LOG.reportError(wixErrors.PM_RENDER_FILED_COMPS, biInfo.compType, biInfo.pageId, desc);
            });
        },

        _getBIJson: function(compInfo){
            var node = this._getCompById(compInfo.domCompId);
            var stackString = "";
            if(compInfo.stack){
                stackString = typeof compInfo.stack === "string" ? compInfo.stack : compInfo.stack.toString();
            }

            var obj = {
                'compType': node.get('comp'),
                'pageId': compInfo.pageId,
                'desc': {
                    'compId': compInfo.domCompId,
                    'message': compInfo.message,
                    'stack': stackString.substr(0, 300)
                }

            };
            return obj;
        },

        _replaceFailedComp: function(compInfo){
            var node = this._getCompById(compInfo.domCompId);
            this._checkForAnchors(node);
            var newNode = this._createSignatureNode(node);
            node.parentNode.replaceChild(newNode, node);
            this._disposeCompOnWixify(node, newNode);
            this._wixifyNode(newNode, compInfo.messageToUser);
            return newNode;
        },

        _createSignatureNode: function(oldNode){
            var outerHtml = oldNode.outerHTML;
            var innerHtml = oldNode.innerHTML;
            var html = outerHtml.replace(innerHtml, '');
            var tmp = new Element('div');
            tmp.innerHTML = html;
            return tmp.firstChild;
        },

        _wixifyNode: function(node, messageToUserObj){
            var dataQuery = node.get('dataquery');
            if(dataQuery && !this.resources.W.Data.isDataAvailable(dataQuery)){
                dataQuery = undefined;
            }
            var propsQuery = node.get('propertyquery');
            if(propsQuery && !this.resources.W.ComponentData.isDataAvailable(propsQuery)){
                propsQuery = undefined;
            }
            var skin = this._getDeadCompSkinName();
            node.__wixifyInner__('wysiwyg.common.components.DeadComponent', skin, dataQuery, propsQuery, undefined, {'messageToUserObj': messageToUserObj});
        },

        _getDeadCompSkinName: function(){
            var skin = 'skins.viewer.deadcomp.DeadCompPreviewSkin';
            if(this.resources.W.Config.env.$isPublicViewerFrame){
                skin = 'skins.viewer.deadcomp.DeadCompPublicSkin';
            }
            return skin;
        },

        _disposeCompOnWixify: function(node, newNode){
            //just to be sure, the wixify should be sync
//            newNode.addEvent(Constants.ComponentEvents.WIXIFIED, function(){
                try{
                    if(node.$logic){
                        node.$logic.dispose();
                    }
                    node.dispose();
                } catch(e){
                    this._removeEvents(node);
                    W.Utils.debugTrace("couldn't dispose of a dead comp " + e.message || e);
                }
//            });

        },

        _removeEvents: function (node) {
            var eventsManager = this.resources.W.Events;
            node.removeEvents && node.removeEvents();
            var dispatcherId = eventsManager.getObjectId(node, true);
            eventsManager.deleteObjectFromMaps(dispatcherId);

            if (node.$logic) {
                this.resources.W.Commands.unregisterListener(node.$logic);
                node.$logic.removeEvents();
                dispatcherId = eventsManager.getObjectId(node.$logic, true);
                eventsManager.deleteObjectFromMaps(dispatcherId);
            }
        },

        _checkForAnchors: function(node){
            var anchors = '';
            if(node.$logic && node.$logic.getAnchors().length){
                _.forEach(node.$logic.getAnchors(), function(anchor){
                    anchors += " to " + anchor.toComp.getComponentUniqueId();
                });
            }
            if(node.$logic && node.$logic.getReverseAnchors().length){
                _.forEach(node.$logic.getAnchors(), function(anchor){
                    anchors += " from " + anchor.toComp.getComponentUniqueId();
                });
            }
            if(anchors.length){
                LOG.reportError(wixErrors.PM_FOUND_FAILED_COMP_WITH_ANCHORS, "PageManager", "_replaceFailedComp", "comp " + node.get('id') + " anchors " + anchors);
            }
        },

        _getCompById: function(compDomId){
            return $(compDomId);
        }

    });
});