define.experiment.component("wysiwyg.editor.components.PanelPresenter.QuickActions", function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.methods({
        createComponentPart: function(skinPart, keepComponent, args, state, overrideState, callback, onFinish) {
            var def = this.getSkinPartDefinition(skinPart);
            var params = {
                type: def.type,
                skin: def.skin,
                data: def.dataQuery,
                args: def.argObject || {},
                componentReadyCallback: function(comp) {
                    this._handlePanelBreadCrumbs(comp, callback);

                    if (keepComponent) {
                        if (keepComponent && !_.has(this._panelsMap, skinPart)) {
                            this._panelsMap[skinPart] = comp;
                        }
                    }

                    if (onFinish) {
                        onFinish(comp, skinPart, keepComponent, args, state, callback, overrideState);
                    }
                }.bind(this)
            };

            // additional args to add to the object passed to createComponent
            if (args) {
                for (var key in args) {
                    params.args[key] = args[key];
                }
            }

            if (def.getDataFromSite) {
                this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(params.data, function(dataItem) {
                    params.data = dataItem;
                    this.resources.W.Components.createComponent(params);
                });
            }
            else {
                this.resources.W.Components.createComponent(params);
            }
        },

        showComponentInSidePanel: function(skinPart, keepComponent, args, state, callback, overrideState) {
            var comp = this._panelsMap[skinPart];

            if (comp) {
                this.showInnerSidePanel(comp, skinPart, keepComponent, args, state, callback, overrideState);
            } else {
                this.createComponentPart(skinPart, keepComponent, args, state, overrideState, callback, this.showInnerSidePanel);
            }
        },

        showInnerSidePanel: function (comp, skinPart, keepComponent, args, state, callback, overrideState) {
            if (this._currentPanel.panel != comp) {
                this.hideSidePanel();
                this.hideSubPanel();
            }

            this._handlePanelBreadCrumbs(comp, callback);

            this._updateBreadcrumbState(comp.getName(), comp.canGoBack(), skinPart, keepComponent, args, state, callback, overrideState) ;

            this.setState(state, 'panels');
            this._currentPanel.panel = comp;

            this._insertPanelToContainer(this._skinParts.sidePanel, comp);

            this.showSidePanel();

            if (comp && comp.saveCurrentState) {
                comp.saveCurrentState();
            }

            this._skinParts.mainTabs.switchPanel(overrideState || state);

            comp.onBeforeShow( {skinPart: skinPart, args: args, state: state});

            if (callback) {
                callback(comp);
            }

            this._panelCallLater(this._resize, null, 100);
        }

    });
});