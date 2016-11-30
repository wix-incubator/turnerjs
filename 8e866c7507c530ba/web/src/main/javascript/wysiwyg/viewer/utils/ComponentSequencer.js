define.Class('wysiwyg.viewer.utils.ComponentSequencer', function(def){

    def.inherits('bootstrap.utils.Events');

    def.resources(['W.Data']);

    def.fields({
        _pendingElements : [],
        _createdElements : [],
        _reusedElements : [],
        _notifiedOnReady : [],
        _preExistingElements : []
    });

    def.methods({
        initialize : function () {

        },

        resolveItem : function (dataItem, itemIndex, dataList) {

        },

        createComponents : function (container, data) {
            this._resolveRefList(data, function (dataList) {
                this._createCompsFromDataList(container, dataList);
            }.bind(this));
        },

        reset : function () {
            this._pendingElements.forEach(function (element) {
                element.removeEvent(Constants.ComponentEvents.READY);
            });
            this._pendingElements = [];
            this._createdElements = [];
            this._reusedElements = [];
            this._preExistingElements = [];
            this._notifiedOnReady = [];
        },

        _resolveRefList : function (data, callback) {
            var refList = typeOf(data) === "array" ? data : data.get('items');
            var dataList = [];
            var counter = refList.length;

            if (refList.length) {
                for (var i = 0; i < refList.length; i++) {
                    this._resolveCompData(refList[i], i,
                        function (dataItem, index) {
                            dataList[index] = dataItem;
                            counter--;
                            if (counter === 0) {
                                callback(dataList);
                            }
                        });
                }
            } else {
                callback([]);
            }
        },

        _resolveCompData : function (dataRef, index, callback) {
            if (typeOf(dataRef) === "string") {
                this.resources.W.Data.getDataByQuery(dataRef, function (dataItem) {
                    callback(dataItem, index);
                });
            } else {
                callback(dataRef, index);
            }
        },

        _createCompsFromDataList : function (container, dataList) {
            this._preExistingElements = container.getChildren().slice(0);

            this._allSetup = false;
            this._pendingElements = [];
            this._createdElements = [];
            this._reusedElements = [];
            this._notifiedOnReady = [];

            for (var i = 0; i < dataList.length; i++) {
                this._setupComponent(container, i, dataList);
            }

            this._preExistingElements.forEach(function (element) {
                if (!this._reusedElements.contains(element)) {
                    this._removeElement(element);
                }
            }.bind(this));

            // Reorder elements to fit the order of dataList
            this._createdElements.forEach(function (element) {
                container.appendChild(element);
            });

            this._allSetup = true;

            this._checkIfAllDone();
        },

        _setupComponent : function (container, index, dataList) {
            var dataItem = dataList[index];
            var method;
            var itemType;
            var element = this._findReusableComponent(this._preExistingElements, dataItem);
            if (element) {
                method = "reuse";
                this._reusedElements.push(element);
            } else {
                method = "create";
                element = this.createComponent(container, dataItem, index, dataList);
            }

            this._createdElements.push(element);

            this._notifyOnComponentReadyIfNeeded(method, element, index);
        },

        createComponent:function(container, dataItem, index, dataList){
            var element;
            var factoryInfo = this.resolveItem(dataItem, index, dataList);
            var itemType = typeOf(factoryInfo);
            var compStyle = this._getCompStyle(container);
            if (itemType === "element") {
                element = factoryInfo;
                if(!element.getLogic && !element.hasAttribute("comp")) {
                    this._supplyMinimalLogic(element, dataItem);
                }
                container.adopt(element);
            } else {
                element = new Element('div');
                element.setAttribute('comp', factoryInfo.comp);
                element.setAttribute('skin', factoryInfo.skin);
                if(factoryInfo.styleId){
                    element.setAttribute('styleId', factoryInfo.styleId);
                }
                if("data" in factoryInfo) {
                    dataItem = factoryInfo.data;
                }
                this._pendingElements.push(element);
                this._listenToInnerComponentReady(element, index);
                container.adopt(element);
                element.wixify(factoryInfo.args || {}, dataItem, undefined, undefined, compStyle);
            }

            return element;
        },

        _notifyOnComponentReadyIfNeeded: function(method, element, index) {
            if (!this._notifiedOnReady.contains(element) && !this._pendingElements.contains(element)) {
                this._notifiedOnReady.push(element);
                this.fireEvent(Constants.ComponentEvents.COMPONENT_SEQUENCER_COMP_SETUP, { method:method, compView: element, index:index });
            }
        },

        _supplyMinimalLogic : function (element, dataItem) {
            var logicInstance = {
                getDataItem : function () {
                    return dataItem;
                },
                getIsDisplayed: function() {
                    return true;
                },
                dispose : function () {
                    dataItem = null;
                }
            };
            element.getLogic = function () {
                return logicInstance;
            };
        },

        _onAllComponentsReady : function () {
            var createdElements = this._createdElements.slice(0);
            this._createdElements = [];
            this._reusedElements = [];
            this._preExistingElements = [];
            this.fireEvent(Constants.ComponentEvents.COMPONENT_SEQUENCER_PRODUCTION_FINISHED, { elements: createdElements });
        },

        _removeElement : function (element) {
            if (element.getLogic) {
                element.getLogic().dispose();
            }
            element.destroy();
        },


        _findReusableComponent : function (candidates, dataItem) {
            var candidate;

            for (var i = 0; i < candidates.length; i++) {
                candidate = candidates[i];
                if (candidate.getLogic) {
                    if (this._dataItemsIdentical(dataItem, candidate.getLogic().getDataItem())) {
                        return candidate;
                    }
                }
            }
        },

        _dataItemsIdentical: function (dataItem1, dataItem2) {
            // If the dataItem1 and dataItem2 references are identical, it's a no-brainer
            if (dataItem1 === dataItem2) {
                return true;
                // If they are different, they still might be Wysiqyg DataItemBase instances
                // with the same id (reference string)
            } else if (dataItem1.get && dataItem2.get && dataItem1.hasField('id') && dataItem2.hasField('id')) {
                var id1 = dataItem1.get("id");
                var id2 = dataItem2.get("id");
                return (id1 && id2 && (id1 === id2) );
            } else {
                return false;
            }
        },


        /*
         This whole thing is a mess and should be rewritten...
         The style _style seems to be always undefined.
         The whole concept of styles inside component sequencer should be re-thought
         */
        _getCompStyle : function (container) {
            var parentComp;
            if (!this._style) {
                parentComp = container;
                while (parentComp && !parentComp.getLogic) {
                    parentComp = parentComp.getParent();
                }
                if (parentComp && parentComp.getLogic && parentComp.getLogic() && parentComp.getLogic().getStyle) {
                    return parentComp.getLogic().getStyle();
                }
            }
        },


        _listenToInnerComponentReady: function(element, index) {
            element.addEvent(Constants.ComponentEvents.READY, function () {
                this._pendingElements.erase(element);
                this._notifyOnComponentReadyIfNeeded("create", element, index);
                this._checkIfAllDone();
            }.bind(this));
        },

        isPending: function () {
            return this._pendingElements.length > 0;
        },

        _checkIfAllDone: function () {
            if (this._allSetup === true && !this.isPending()) {
                this._onAllComponentsReady();
            }
        }
    });
});
