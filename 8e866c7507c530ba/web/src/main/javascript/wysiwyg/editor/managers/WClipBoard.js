define.Class('wysiwyg.editor.managers.WClipBoard', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    /**
     * @lends wysiwyg.editor.managers.WClipBoard
     */

    def.resources(['W.UndoRedoManager', 'W.Commands', 'W.CompSerializer', 'W.CompDeserializer', 'W.Editor', 'W.Preview']);

    def.methods({
        initialize: function () {
            this._currentClip = null;
            this._isReady = true;
            this._currentClipScope = null;
            this._pageSource = null;
            this._plugins = {};
        },

        registerPlugin: function(componentClassName, plugin) {
            this._plugins[componentClassName] = plugin;
        },

        getPluginMethod: function(componentClassName, methodName) {
            return this._plugins[componentClassName] && this._plugins[componentClassName][methodName];
        },

        setClip: function (component) {
            //Component description object
            var clip = this.copyComponent(component);
            //Store clip
            this._currentClip = clip;

            var pluginHook = this.getPluginMethod(component.$className, "onSetClip");
            if (pluginHook) {
                pluginHook(component);
            }
        },

        duplicateComp: function (component, parent) {
            //Component description object
            var clip = this.copyComponent(component);
            this.injects().UndoRedoManager.startTransaction();
            this.pasteFromClip(parent, true, clip);
            LOG.reportEvent(wixEvents.DUPLICATING_COMPONENT, {c1: component.className, c2: parent.$logic.className});
        },

        copyComponent: function (component) {
            this._currentClipScope = this.resources.W.Editor.getComponentScope(component);
            this._pageSource = (this._currentClipScope == this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE) ? this.resources.W.Preview.getPreviewCurrentPageId() : null;

            if (!component.isMultiSelect) {
                return this.resources.W.CompSerializer.serializeComponent(component.getViewNode(), true);
            }
            else {
                var comps = [];
                for (var i = 0; i < component.getSelectedComps().length; i++) {
                    comps.unshift(this.resources.W.CompSerializer.serializeComponent(component.getSelectedComps()[i].getViewNode(), true));
                }
                return {isMultiSelect: true, comps: comps};
            }
        },

        _handleTextIfNeeded: function(clip){},

        isReady: function () {
            return this._isReady;
        },

        clone: function () {
            return new this.$class();
        },

        getClip: function () {
            return this._currentClip;
        },


        paste: function (pasteToAnotherPage, autoSelect) {
            if (autoSelect === undefined) {
                autoSelect = true;
            }

            if (pasteToAnotherPage === undefined) {
                var currentPageId = this.resources.W.Preview.getPreviewCurrentPageId();
                pasteToAnotherPage = this._pageSource && this._pageSource !== currentPageId;

                // from the next paste, it will act as it was copied from the same page
                this._pageSource = currentPageId;
            }

            if (this._currentClip) {

                var toHtmlNode = this.resources.W.Editor.getScopeNode(this._currentClipScope);
                this.resources.W.UndoRedoManager.startTransaction();

                var compView = null;

                var pluginHook = this.getPluginMethod(this._currentClip.componentType, "interceptPaste");
                if (pluginHook) {
                    pluginHook(this._currentClip, toHtmlNode, pasteToAnotherPage, autoSelect);
                }
                else {
                    compView = this.pasteFromClip(toHtmlNode, pasteToAnotherPage, this._currentClip, autoSelect);
                }

                return compView;
            }
            else {
                return null;
            }
        },

        resetClip: function () {
            this._currentClip = undefined;
        },

        pasteFromClip: function (toHtmlNode, useOriginalCoordinate, clip, autoSelect, callBack) {
            if (autoSelect == undefined) {
                autoSelect = true;
            }

            var that = this;
            function applyPluginHook(comp) {
                var pluginHook = that.getPluginMethod(comp.componentType, "onPasteFromClip");
                if (pluginHook) {
                    pluginHook(comp);
                }

                if (clip.comps) { _.forEach(comp.comps, applyPluginHook); }
                if (clip.components) { _.forEach(comp.components, applyPluginHook); }
            }

            applyPluginHook(clip);

            if (clip.isMultiSelect) {
                this.resources.W.CompDeserializer.createAndAddComponents(toHtmlNode, clip.comps, useOriginalCoordinate, autoSelect, null, function (newComponentNodes) {
                    this._fireAddComponent(newComponentNodes);
                    callBack && callBack(newComponentNodes);
                }.bind(this));
                return;
            }

            var pastedComponent = this.resources.W.CompDeserializer.createAndAddComponent(toHtmlNode, clip, useOriginalCoordinate, autoSelect, undefined, callBack);
            this.resources.W.Editor._editorComponents.editingFrame.highlightEditingFrame();
            return pastedComponent;
        },

        _fireAddComponent: function (newComponentNodes) {

            var changedComponentData = this.resources.W.CompSerializer.serializeComponents(newComponentNodes, true);
            var changedComponentIds = newComponentNodes.map(function (node) {
                return node.getLogic().getComponentId();
            });

            var data = {
                changedComponentIds: changedComponentIds,
                oldState: {
                    parent: null,
                    changedComponentData: null
                },
                newState: {
                    parent: newComponentNodes[0].getLogic().getParentComponent(),
                    changedComponentData: changedComponentData
                }
            };

            this.resources.W.CompDeserializer.fireEvent('onComponentAdd', data);


            this.resources.W.UndoRedoManager.endTransaction();
        }
    });

});
