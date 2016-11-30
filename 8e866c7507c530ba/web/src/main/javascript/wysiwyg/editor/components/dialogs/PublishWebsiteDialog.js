define.component('wysiwyg.editor.components.dialogs.PublishWebsiteDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Resources' , 'W.Editor', 'W.Data', 'W.Config', 'W.Preview']);
    def.binds([
        '_onPublishNowClick',
        '_onSiteURLClick',
        '_onChangeSEOSettings',
        '_createMobileOffering',
        '_createMobileInfoGroup',
        '_goToMobileEditor',
        '_displayMobileInfoGroup',
        '_onToggleSEOindexCheckbox'
    ]);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['SiteSettings']);
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;

            this._charactersValidator = this._inputValidators.charactersValidator;

            this._editorStatusAPI = this.injects().Editor.getEditorStatusAPI();

            //get site URL:
            this._websiteUrl = this.injects().Config.getUserPublicUrl();

            //check if this is the first time that the site is published
            this._firstTimePublish = !this._editorStatusAPI.isPreviouslyPublished();
        },


        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');
            var egColor = '#999999';
            var panel = this;
            var publishButtonText = panel._translate('PUBLISH_BUTTON');

            var mainLabel = panel._translate('PUBLISH_WEB_MAIN_LABEL_FIRSTTIME');

            this.addBreakLine();
            this.addLabel(mainLabel, null, null, 'icons/save_publish.png', {x: "-2px", y: "-56px"}, {width: '30px', height: '30px'});


            this._createWebsiteAddressField();

//            this.addLabel(panel._translate('PUBLISH_WEB_SEO_MOBILE_LABEL'), {'padding-top': '12px'}, 'SubLabel');

            this.addBreakLine('16px');

            this._createSeoGroup();
            this.addBreakLine('16px');

            this._getMobileOfferingState(this._createMobileOffering);
            this._createMobileInfoGroup();

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addBreakLine('21px');
                this.addButtonField(null, publishButtonText, null, null, 'blue', "60px")
                    .addEvent(Constants.CoreEvents.CLICK, panel._onPublishNowClick);
            }, 'skinless', null, null, null, 'center');
        },

        _createWebsiteAddressField: function (){
            if (this._firstTimePublish) {
                this.addSubLabel(this._translate('PUBLISH_WEB_URL_LABEL') + " " + this._websiteUrl);
            }
            else {
                this.addSubLabel();
                this.addInlineTextLinkField(this._translate('PUBLISH_WEB_URL_LABEL'), "", this._websiteUrl, "", null, null, 'selectable')
                    .addEvent(Constants.CoreEvents.CLICK, this._onSiteURLClick);
            }
        },

        _createSeoGroup: function () {
            var panel = this;
            this.addInputGroupFieldWithIcon('icons/prepublish-icon_SEO_black.png',  {width:'32px', height:'32px'}, true, false, function () {
                this.setNumberOfItemsPerLine(2);
                var seoOnOff = this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover").bindToField('allowSEFindSite').addEvent(Constants.CoreEvents.INPUT_CHANGE, panel._onToggleSEOindexCheckbox);
                seoOnOff.getHtmlElement().style.margin = "7px 0px 0px 0px";
                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(1);
                    this.addLabel(panel._translate('PUBLISH_WEB_SEO_ALLOW_SEARCH'), {'font-size': '14px', 'color': '#363636'}, null, null, null, null, "Publish_dlg_seo_group_ttid", {'margin':0, 'width':'350px'});
                    this.addInlineTextLinkField(null, null, panel._translate("PUBLISH_WEB_SEO_EDIT"), panel._translate("PUBLISH_WEB_SEO_RECOMMENDED"), null, null, "default")
                        .addEvent(Constants.CoreEvents.CLICK, panel._onChangeSEOSettings);

                }, 'skinless', null, null, {padding: '0px 0px 0px 24px', width: "367px"});
            }, 'skinless', null, null, {padding: '0px 0px 0px 0px', width: "517px"});
        },

        _onToggleSEOindexCheckbox: function(e){
            LOG.reportEvent(wixEvents.SEO_CHECKED_IN_SEO_PANEL, {c1: 'PublishDialog', i1: !!e.value});
        },

        _createMobileOffering: function () {
            var panel = this;
            this.addInputGroupFieldWithIcon('icons/prepublish-icon_mobile_black.png', {width:'32px', height:'32px'}, true, false, function () {
                this.setNumberOfItemsPerLine(2);
                var mobileOnOff = this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover")
                    .setValue(panel._multipleStructure.get('hasMobileStructure'));
                mobileOnOff.getHtmlElement().style.margin = "7px 0px 0px 0px";
                mobileOnOff.addEvent('inputChanged', function (e) {
                    panel._multipleStructure._data["origin"] = "publish-dialog" ;
                    panel._multipleStructure.set('hasMobileStructure', e.value);
                    panel._displayMobileInfoGroup();
                });
                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(1);
                    panel._publishOptimizedLabel = this.addLabel(panel._translate("PUBLISH_WEB_MOBILE_OPTIMIZED_VIEW"), {'height': '20px', 'font-size': '14px', 'color': '#363636'}, null, null, null, null, "Publish_dlg_mobile_offering_ttid");
                    panel._goToMobileEditorLink = this.addInlineTextLinkField(
                            null,
                            null,
                            panel._translate('PUBLISH_WEB_MOBILE_EDIT_MOBILE_OPTIMIZED_VIEW'),
                            null, null, null, "default")
                        .addEvent(Constants.CoreEvents.CLICK, panel._goToMobileEditor);

                }, 'skinless', null, null, {padding: '0px 0px 0px 24px', width: "367px"});
            }, 'skinless', null, null, {padding: '0px 0px 0px 0px', width: "517px"}).runWhenReady(function (inputGroupComp) {
                    this._mobileOfferingGroup = inputGroupComp;
                }.bind(this));
        },

        _createMobileInfoGroup: function () {
            var panel = this;
            this.addInputGroupFieldWithIcon('icons/prepublish-icon_info.png', {width:'32px', height:'20px'}, false, true, function () {
                this.setNumberOfItemsPerLine(2);
                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(2);
                    this.addInlineTextLinkField(
                            null,
                            panel._translate('PUBLISH_WEB_MOBILE_INFO_PREFIX'),
                            panel._translate('PUBLISH_WEB_MOBILE_INFO_LINK'),
                            null,
                            null, null, "default")
                        .addEvent(Constants.CoreEvents.CLICK, panel._goToMobileEditor);
                }, 'skinless', null, null, {padding: '0px 0px 0px 0px', width: "387px"});

            }, 'skinless', null, null, {width: "517px", padding:"5px 0px 5px 0px"}).runWhenReady(function (inputGroupComp) {
                    this._mobileInfoGroup = inputGroupComp;
                    this._mobileInfoGroup.$view.style.borderTopLeftRadius = "0px";
                    this._mobileInfoGroup.$view.style.borderTopRightRadius = "0px";
                    this._mobileInfoGroup.$view.style.borderTopWidth  = "0px";
                    this._displayMobileInfoGroup();
                }.bind(this));


        },

        _displayMobileInfoGroup:function(){
            if(this._multipleStructure.get('hasMobileStructure') && this.resources.W.Config.env.isViewingDesktopDevice()){
                this._mobileInfoGroup.uncollapseGroup();
                this._mobileInfoGroup.$view.style.borderBottomWidth  = "1px";
                this._mobileOfferingGroup.$view.style.borderBottomLeftRadius = "0px";
                this._mobileOfferingGroup.$view.style.borderBottomRightRadius = "0px";
                this._mobileOfferingGroup.$view.style.borderBottomWidth  = "0px";
                this._goToMobileEditorLink.getHtmlElement().setStyle("opacity", 0);
                this._publishOptimizedLabel.getHtmlElement().$logic._skinParts.label.setStyle("padding-top", "8px");
            }else{
                this._mobileInfoGroup.collapseGroup();
                this._mobileInfoGroup.$view.style.borderBottomWidth  = "0px";
                this._mobileOfferingGroup.$view.style.borderBottomLeftRadius = "5px";
                this._mobileOfferingGroup.$view.style.borderBottomRightRadius = "5px";
                this._mobileOfferingGroup.$view.style.borderBottomWidth  = "1px";
                this._goToMobileEditorLink.getHtmlElement().setStyle("opacity", 1);
                this._publishOptimizedLabel.getHtmlElement().$logic._skinParts.label.setStyle("padding-top", "0px");
            }
        },

        _goToMobileEditor: function () {
            this._dialogWindow.closeDialog();
            this.resources.W.Commands.executeCommand('WEditorCommands.SetViewerMode', {mode: Constants.ViewerTypesParams.TYPES.MOBILE, src: 'publishDialog'});
        },

        _onPublishNowClick: function () {
            this._dialogWindow.closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.Publish');

            //report BI event
            var allowSEO = (this._allowSEO) ? 1 : 0;
            if (this._firstTimePublish) {
                LOG.reportEvent(wixEvents.PUBLISH_BUTTON_CLICKED_IN_PUBLISH_DIALOG, {g1: this.resources.W.Editor._templateId, i1: allowSEO});
            } else {
                LOG.reportEvent(wixEvents.UPDATE_BUTTON_CLICKED_IN_PUBLISH_DIALOG, {i1: allowSEO});
            }
        },

        _onSiteURLClick: function () {
            window.open(this._websiteUrl);
        },

        _getMobileOfferingState: function (callback) {
            this.resources.W.Data.getDataByQuery('#MULTIPLE_STRUCTURE', function (multipleStructure) {
                this._multipleStructure = multipleStructure;
                callback();
            }.bind(this));
        },

        //TODO remove this
        _getQuickActions: function (callback) {
            this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS', function (quickActions) {
                this._quickActions = quickActions;
                callback();
            }.bind(this));
        },


        _onChangeSEOSettings: function (e) {
            this._dialogWindow.closeDialog();
            LOG.reportEvent(wixEvents.EDITOR_PUBLISH_EDIT_SEO_CLICKED);
            this.injects().Commands.executeCommand('WEditorCommands.Settings');
            this.injects().Commands.executeCommand('WEditorCommands.ShowSEO', 'seoPanel');
        }
    });

});
