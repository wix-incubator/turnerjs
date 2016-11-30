define.component('wysiwyg.editor.components.Ruler', function(compDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        rulerContainer : {type: 'htmlElement'},
        background     : {type: 'htmlElement'},
        scaleNumbers   : {type: 'htmlElement'},
        guides         : {type: 'htmlElement'},
        guidesSecondary: {type: 'htmlElement'},
        rulerGuide     : {type: 'wysiwyg.editor.components.RulerGuide', autoCreate: false }
    });

    def.resources(['W.Theme', 'W.Preview', 'W.Commands', 'W.Config', 'W.Editor']);

    def.binds(['_refreshGridLines', 'onScroll', 'onHover', 'onMouseDown', '_handlePreviewReady', '_handleEditorModeSwitch',
                'toggleRulerVisibility']);

    def.states({
        "viewerMode": ["DESKTOP", "MOBILE"]
    });

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.orientationHorizontal = argsObject.orientationHorizontal;

            var cmdManager = this.resources.W.Commands;

            cmdManager.registerCommandListenerByName('EditorCommands.SiteLoaded', this, this._onSiteLoaded);
            cmdManager.registerCommandAndListener("WEditorCommands.SecondaryPreviewReady", this, this._handlePreviewReady, null);
            cmdManager.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._handleViewerModeSwitch, null);
            cmdManager.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._handleEditorModeSwitch, null);
            cmdManager.registerCommandAndListener("WEditorCommands.BeforeSaveUserPrefs", this, this._handleBeforeSaveUserPrefs);
            cmdManager.registerCommandAndListener("PreviewIsReady", this, this._handlePreviewIsReady);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WToggleRulers", this, this.toggleRulerVisibility);
        },

        isRulerTurnedOn: function() {
            return this._rulersTurnedOn ;
        },

        _onSiteLoaded: function(){
            //this.resources.W.Viewer.addEvent(this.resources.W.Viewer.SCREEN_RESIZE_EVENT, this._refreshGridLines);
            this._headerNode = this.resources.W.Preview.getHeaderContainer();
            this._pagesContainerNode = this.resources.W.Preview.getPagesContainer();
            this._footerNode = this.resources.W.Preview.getFooterContainer();

            this._adjustStyles();

            //todo: use this._topBarHeight
            window.addEvent(Constants.CoreEvents.SCROLL, this.onScroll);
            window.addEvent(Constants.CoreEvents.RESIZE, this._refreshGridLines); //TODO: resize appears to be deprecated. if it is, then it should also be corrected elsewhere
            this._view.addEvent('mousemove', this.onHover);
            this._view.addEvent('mousedown', this.onMouseDown);
            this._refreshGridLines();
        },

        _adjustStyles: function(){
            //todo:fix the themeDir url
            var themeDir = this.resources.W.Theme.getProperty('THEME_DIRECTORY');
            if (this.orientationHorizontal){
                this._skinParts.view.setStyles({'width': '100%', 'left': '0', 'height': '20px', 'border-bottom': '1px solid #000', 'top': '36px'});
                //todo: fix the hard-wired top 36
                this._skinParts.background.setStyles({'left': '0', 'top': '0', 'height': '20px', 'width': '100%', 'background': 'url(' + themeDir + 'EditorRulerBG-H.png) repeat-x', 'background-position': '0 -2px'});
                this._skinParts.scaleNumbers.setStyles({'left': '50px', 'top': '0', 'height': '20px', 'width': '100%'});
            } else {
                this._skinParts.view.setStyles({'width': '20px', 'height': '100%', 'border-left': '1px solid #000', 'top': '56px', 'right': '0'});
                //todo: fix the hard-wired top 57
                this._skinParts.background.setStyles({'right': '0', 'top': '0', 'height': '100%', 'width': '20px', 'background': 'url(' + themeDir + 'EditorRulerBG-V.png) repeat-y', 'background-position': '-19px 0px'});
                this._skinParts.scaleNumbers.setStyles({'right': '0', 'top': '0', 'height': '100%', 'width': '20px'});
                this._skinParts.rulerContainer.setStyles({'right': '0', 'width': '20px', 'text-align': 'right'});
            }
        },

        onScroll: function(e){
            this._refreshGridLines();
        },

        onHover: function(e){
            //todo: show tooltip with pixels + temp guide
        },

        onMouseDown: function(e){
            var guidesContainer = this._isSecondaryView() ? this._skinParts.guidesSecondary : this._skinParts.guides;

            var posValue = 0;
            if (this.orientationHorizontal) {
                posValue = e.client.x - this._getSiteStructureLeft();
            } else {
                posValue = e.client.y + window.pageYOffset - (57 - 20); //todo: change the hard-wired 57
            }

            this._addRulerGuide(posValue, guidesContainer);
        },
        /**
         *
         * @param value
         * @param guidesContainer
         * @param {boolean} [suppressBI]
         * @returns {*}
         * @private
         */
        _addRulerGuide: function(value, guidesContainer, suppressBI){
            var position = value;

            var definition = {
                id          : "rulerGuide",
                skin        : "wysiwyg.editor.skins.RulerGuideSkin",
                type        : "wysiwyg.editor.components.RulerGuide",
                autoCreate  : false,
                argObject   : {orientationHorizontal: this.orientationHorizontal}
            };

            if (this.orientationHorizontal) {
                definition.argObject.left = position;
            } else {
                definition.argObject.top = position;
            }

            var guideNode = this._createElement('', guidesContainer, '');
            this._createComponentbyDefinition(definition, guideNode);

            if(!suppressBI) {
                LOG.reportEvent(wixEvents.RULERS_GUIDE_ADDED, {c1: this.orientationHorizontal ? 'left' : 'top', i1: position});
            }

            return guideNode;
        },

        _refreshGridLines: function(){
            if (this.orientationHorizontal){
                var left = this._getSiteStructureLeft();
                this._skinParts.background.style.backgroundPosition = left + 'px -2px';
                this._skinParts.scaleNumbers.style.left = left + 'px';
                this._skinParts.guides.style.left = left + 'px';
                this._skinParts.guidesSecondary.style.left = left + 'px';
            } else {
                var top = -20 - window.pageYOffset; //scrollY doesn't work on IE. this one works on all our supported browsers.
                this._skinParts.background.style.backgroundPosition = '-19px ' + top + 'px';
                this._skinParts.scaleNumbers.style.top = top + 'px';
                this._skinParts.guides.style.top = top + 'px';
                this._skinParts.guidesSecondary.style.top = top + 'px';
            }
            this._drawScaleNumbers();
        },

        _getSiteStructureLeft: function(){
            var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
            var left = viewer.getSiteNode().getLeft();
            return left;
        },

        _drawScaleNumbers: function(){
            var num;
            // CLEAR SCALE NUMBERS BEFORE DRAWING NEW ONES
            this._skinParts.scaleNumbers.innerHTML = "";
            if (this.orientationHorizontal){
                var siteWidth = this.resources.W.Preview.getPreviewManagers() && this.resources.W.Preview.getPreviewManagers().Viewer && this.resources.W.Preview.getPreviewManagers().Viewer.getDocWidth();
                siteWidth = siteWidth ? siteWidth : 980;
                for (num = 0; num <= siteWidth; num += 100){
                    this._createScaleNum(num);
                }
            } else {
                for (num = 0; num <= this.resources.W.Editor.getDocumentHeight(); num += 100){
                    this._createScaleNum(num);
                }
            }
        },

        _createScaleNum: function(num){
            var div;
            if (this.orientationHorizontal){
                var left = num + 3; //num corresponds to pixles, so we can use it as left too
                div = this._createElement(num, this._skinParts.scaleNumbers, 'scaleNumber');
                div.style.left = left + "px";
                //ADDED IN THIS EXPERIMENT TO LOWER THE NUMBER A BIT ON MOBILE MODE
                if (this.resources.W.Config.env.isViewingSecondaryDevice()){
                    div.style.top = "3px";
                }
            } else {
                var top = num; //num corresponds to pixles, so we can use it as left too
                div = this._createElement(num, this._skinParts.scaleNumbers, 'scaleNumber');
                div.style.top = top + 1 + "px";
                div.style.left = '2px';
            }
        },

        _createElement: function(html, parentNode, className){
            var div = document.createElement("div");
            div.innerHTML = html;
            div.className = className;
            parentNode.appendChild(div);
            return div;
        },

        /***
         * toggle ruler's visibility on/off
         */
        toggleRulerVisibility: function(){
            this._rulersTurnedOn = !this._rulersTurnedOn;

            if (this._rulersTurnedOn){
                this.showRuler();
                //since this gets called twice on every toggle (once for each of the two rulers), we'll report it and show the user a notification only on one of them
                if (this.orientationHorizontal){
                    LOG.reportEvent(wixEvents.RULERS_TURNED_ON);
                    this._openRulersNotificationDialog();
                }
            } else {
                if (this.orientationHorizontal){
                    LOG.reportEvent(wixEvents.RULERS_TURNED_OFF);
                }
                this.hideRuler();
            }

            var cmdParams = {
                rulerType: (this.orientationHorizontal ? 'horizontal' : 'vertical'),
                ruler: this,
                visible: this._rulersTurnedOn
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.rulerStateChanged', cmdParams);
        },

        previewMode: function(on){
            if (on){
                this.hideRuler();
            } else {
                if (this._rulersTurnedOn){
                    this.showRuler();
                }
            }
        },

        showRuler: function(){
            this._skinParts.view.setStyle('display', 'inline-block');
        },

        hideRuler: function(){
            this._skinParts.view.setStyle('display', 'none');
        },

        _openRulersNotificationDialog: function(){
            var icon = {x: 0, y: 0, width: 115, height: 97, url: 'icons/rulers_toggle.png'};
            var helpletID = null; //till there's proper help
            W.EditorDialogs.openNotificationDialog("RulersToggle", 'RULERS_TOGGLE_NOTIFICATION_TITLE', "RULERS_TOGGLE_NOTIFICATION", 480, 90, icon, true, helpletID, 1);
        },

        _handlePreviewReady: function(){
            this._refreshGridLines();

            var isSecondaryView = this.resources.W.Config.env.isViewingSecondaryDevice();
            this._skinParts.guides.style.display = isSecondaryView ? 'none' : 'block';
            this._skinParts.guidesSecondary.style.display = isSecondaryView ? 'block' : 'none';
        },

        _hideGuides: function(){
            this._skinParts.guides.style.display = 'none';
            this._skinParts.guidesSecondary.style.display = 'none';
        },

        _handleViewerModeSwitch: function(newMode){
            var mode = newMode.mode;
            this._hideGuides();

            if (this.getState("viewerMode") !== mode){
                this.setState(mode, "viewerMode");
                if (mode === Constants.ViewerTypesParams.TYPES.DESKTOP){
                    this._handlePreviewReady();
                }
            }
        },

        _handleEditorModeSwitch: function(newMode){
            if(newMode.editMode!=="PREVIEW"){
                this._handlePreviewReady();
            }
        },

        isVisible: function(){
            return this._skinParts.view.getStyle('display') == 'inline-block';
        },
        getCurrentGuides: function(){
            if (this._isSecondaryView()) {
                this._getGuides(this._skinParts.guidesSecondary);
            }

            return this._getGuides(this._skinParts.guides);
        },
        _getGuides: function(guidesContainer){
            return _.map(guidesContainer.children, function(element){
                var value = this.orientationHorizontal ? element.style.left : element.style.top;
                value = parseInt(value.replace('px', ''), 10);
                return value;
            }, this);
        },
        _isSecondaryView: function(){
            return this.resources.W.Config.env.isViewingSecondaryDevice();
        },
        getGuidesLeft: function() {
            return parseInt(this._skinParts.guides.style.left);
        },
        _handleBeforeSaveUserPrefs: function(o){
            this._saveGuidesDataToUserPrefs();
        },
        _handlePreviewIsReady: function(){
            this._loadGuidesDataFromUserPrefs();
        },
        _loadGuidesDataFromUserPrefs: function(){
            var userPreferencesHandler = this.resources.W.Editor.userPreferencesHandler;
            var pageId = "masterPage";  // Guides will be saved globally and not per page for now
            var userPrefKey = "rulers." + (this.orientationHorizontal?"H":"V");
            userPreferencesHandler.getData(userPrefKey, {key: pageId})
                .then(function(data){
                    if(data && !_.isEmpty(data)) {
                        this.setGuidesData(data, true);
                    }
                }.bind(this));
        },
        _saveGuidesDataToUserPrefs: function(){
            var userPreferencesHandler = this.resources.W.Editor.userPreferencesHandler;
            var pageId = "masterPage";  // Guides will be saved globally and not per page for now
            var userPrefKey = "rulers." + (this.orientationHorizontal?"H":"V");
            userPreferencesHandler.setData(userPrefKey, this._serializeGuidesData(), {key: pageId});
        },
        clearGuides:function(){
            this._skinParts.guides.innerHTML = "";
            this._skinParts.guidesSecondary.innerHTML = "";
        },
        /**
         *
         * @param {object} guidesData
         * @param {boolean} [suppressBI]
         */
        setGuidesData:function(guidesData, suppressBI){
            var i, arr;

            this.clearGuides();

            arr = guidesData[Constants.ViewerTypesParams.TYPES.DESKTOP];
            for(i=0; i<arr.length; i++){
                this._addRulerGuide(arr[i], this._skinParts.guides, suppressBI);
            }

            arr = guidesData[Constants.ViewerTypesParams.TYPES.MOBILE];
            for(i=0; i<arr.length; i++){
                this._addRulerGuide(arr[i], this._skinParts.guidesSecondary, suppressBI);
            }

            this._handlePreviewReady();
        },

        _serializeGuidesData:function(){
            var guidesData = {};

            guidesData[Constants.ViewerTypesParams.TYPES.DESKTOP] = this._getGuides(this._skinParts.guides);
            guidesData[Constants.ViewerTypesParams.TYPES.MOBILE] = this._getGuides(this._skinParts.guidesSecondary);

            return guidesData;
        }

    });
});

