define.component('wysiwyg.editor.components.ToolTip', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.common.components.InfoTip');
    def.resources(['W.Commands', 'W.Data', 'W.Editor', 'W.Resources', 'W.CookiesManager', 'W.EditorDialogs', 'W.Preview']);
    def.binds(['initialize', '_callTip']);
    def.skinParts({
        moreInfo: {type: 'htmlElement'},
        title: {type: 'htmlElement'},
        isDontShowAgain: {type: 'htmlElement'},
        isDontShowAgainCont: {type: 'htmlElement'},
        moreHelp: {type: 'htmlElement'}
    });
    def.states({'hidden': ['hidden', 'visible'], 'isMoreLess': ['isMoreLess'], 'isDontShowAgain': ['isDontShowAgain'], 'moreHelp': ['isMoreHelp']});
    def.fields({
        options: {
            tipId: "",
            cookieName: "tips"
        }
    });
    def.methods({
        /* event delegation - every node with an "action" attr should have a function with that name here
         * because we need to bind the "this" object and the event target node we are padding it as an array:
         * this[0] = the real this
         * this[1] = the target node */


        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Data.getDataByQuery('#TOOLTIPS', function (toolTipsData) {
                this.toolTipsData = toolTipsData;
            }.bind(this));

            this.resources.W.Commands.registerCommandAndListener("Tooltip.ShowTip", this, this._showToolTipCmd);

            this.resources.W.Commands.registerCommandAndListener("Tooltip.CloseTip", this, this._closeToolTipCmd);

            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.WSetEditMode", this, function (mode) {
                if (mode.editMode == this.resources.W.Editor.EDIT_MODE.PREVIEW || mode.previousEditMode == this.resources.W.Editor.EDIT_MODE.PREVIEW) {
                    this._closeTip();
                }
            });
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.moreInfo.set('text', this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MORE_INFO'));
            this._skinParts.isDontShowAgainCont.appendText(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'DONT_SHOW_AGAIN'));
        },

        _isToolTipMarkedAsDontShow: function (toolTipId) {
            return this.resources.W.CookiesManager.getCookieParams(this.options.cookieName).indexOf(toolTipId) >= 0;
        },

        _getToolTipFromMap: function (toolTipId) {
            var toolTipsMap = this.toolTipsData.get('toolTips');
            return toolTipsMap[toolTipId] || false;
        },

        _setToolTipValues: function (tip) {
            var resources = this.injects().Resources;
            var title = resources.replacePlaceholders('EDITOR_LANGUAGE', tip.title);
            var content = resources.replacePlaceholders('EDITOR_LANGUAGE', tip.content);

            this.parent(content);

            this._skinParts.title.set('html', title);
            this._setState(tip.isMoreLess, 'isMoreLess');
            this._skinParts.moreInfo.setCollapsed(!tip.isMoreLess);
            this._setState(tip.isDontShowAgain, 'isDontShowAgain');
            this._skinParts.isDontShowAgainCont.setCollapsed(!tip.isDontShowAgain);
            this._tipHelp(tip.help);
        },

        _callTip: function (params, source) {
            if (this._isToolTipMarkedAsDontShow(params.id)) {
                return;
            }
            //we can provide either a tooltip id, or html directly
            var tip = params.id ?
                this._getToolTipFromMap(params.id) || this._getToolTipFromComponentInformation(params.id) :
            {content:params.html, help:{isMoreHelp: false}};

            if (!tip) {
                return false;
            }
            this._resetToolTip();

            this.options.tipId = params.id;
            this._setToolTipValues(tip);
            this._showTip(this._getToolTipCallerNode(source), params.positionOffset);
        },

        _getToolTipFromComponentInformation: function(toolTipId) {
            var selectedComponent = this.resources.W.Editor.getEditedComponent();
            var componentInformation = this.resources.W.Preview.getPreviewManagers().Components.getComponentInformation(selectedComponent.$className);
            return componentInformation && componentInformation.get('toolTips') && componentInformation.get('toolTips')[toolTipId];
        },

        _resetToolTip: function () {
            for (var item in this.skinParts) {
                this._skinParts[item].empty();
            }
            this._skinParts.isDontShowAgain.checked = false;
            this._showTimer = this._defaultShowTimer; //this allows us to override the showTimer in certain cases (e.g. in the rulers, it's 1)
        },

        _tipHelp: function (obj) {
            var shouldShowMoreHelp = obj.isMoreHelp && !!obj.text && !!obj.url && obj.text != "" && obj.url != "";
            if (shouldShowMoreHelp) {
                this.setState('isMoreHelp');
                this._skinParts.moreHelp.set('text', obj.text);
                this._skinParts.moreHelp.set('href', obj.url);

            } else {
                this.removeState('isMoreHelp');
            }
            this._skinParts.moreHelp.setCollapsed(!shouldShowMoreHelp);
        },

        moreHelp: function (trg) {
            var helpServer = this.injects().Config.getHelpServerUrl();
            var helpCenter = helpServer + "/" + trg.get('href');
            helpCenter = helpCenter + this.injects().Config.getMobileHelpParamIfNeeded();
            this.resources.W.EditorDialogs.openHelpDialog(helpCenter);
        },

        dontShow: function (trg) {
            var isChecked = (trg.getElement('input') && trg.getElement('input').get('checked')) || trg.get('checked');
            if (isChecked) {
                this.resources.W.CookiesManager.setCookieParam(this.options.cookieName, this.options.tipId);
            } else {
                this.resources.W.CookiesManager.removeCookieParam(this.options.cookieName, this.options.tipId);
            }
        },

        moreInfo: function () {
            this.removeState('isMoreLess', 'isMoreLess');
        }
    });


});