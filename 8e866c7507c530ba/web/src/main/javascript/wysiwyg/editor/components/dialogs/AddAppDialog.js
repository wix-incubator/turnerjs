//This file was auto generated when experiment TPA.New was promoted to feature (Sun Aug 05 17:02:29 IDT 2012)
define.component('wysiwyg.editor.components.dialogs.AddAppDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.utilize(['tpa.editor.managers.AppStoreManager']);
    def.resources(['W.EditorDialogs', 'W.TPAEditorManager', 'W.AppsEditor', 'W.Config', 'W.Resources']);
    def.binds(['_onDialogClosing']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        description: {type: 'htmlElement'},
        additionalDescription: {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.inputs.ButtonInput',
            argObject: {
                buttonLabel: "Add to Page",
                iconSrc: "/button-plus.png",
                iconSize: "32px"
            }
        },
        'imageContainer': {type: 'htmlElement'},
        'photoSlide': {type: 'wixapps.integration.components.PaginatedGridGallery',
            argObject: {
                hideIndicatorElement: true
            },
            hookMethod: "_initializeSlideShow"
        },
        'video': {type: 'htmlElement'}
    });
    def.statics({
        PIC_HEIGHT: 250,
        PIC_WIDTH: 450,
        DEFAULT_VIDEO_LANG: "en"
    });
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._closeDialogCB = args.closeCallback;
            this._appDefinitionData = args.appDefinitionData;
            this._type = args.type;
            this._widgetId = args.widgetId; // can be null in case of a section app
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            this.Types = this.imports.AppStoreManager.Types;
            this._videoURL = this._resolveVideoURL();
        },

        _resolveVideoURL: function(){
            var locale = this.resources.W.Config.getLanguage();
            var byLocale = this._appDefinitionData.videoByLocale || {};
            return byLocale[locale] || byLocale[this.DEFAULT_VIDEO_LANG] || this._appDefinitionData.videoURL;
        },

        render: function () {

        },

        _getWidgetDescription: function () {
            var widgetDescription;
            var widgets = this._appDefinitionData["widgets"];
            var widget = widgets && widgets[this._widgetId];
            if (widget && widget.description) {
                widgetDescription = this.resources.W.AppsEditor.localize(widget.description, widget.description);
            }
            return widgetDescription;
        },

        _getAppDescription: function() {
            var description = this.resources.W.AppsEditor.localize(this._appDefinitionData.description, this._appDefinitionData.description);
            if (this._type != this.Types.TPA_SECTION) {
                description = this._getWidgetDescription() || description;
            }
            return description;
        },

        _getButtonLabel: function () {
            var buttonLabel = this.injects().Resources.get('EDITOR_LANGUAGE', "ADD_AS_PAGE");
            if (this._type != this.Types.TPA_SECTION) {
                var btnDefault = this.injects().Resources.get('EDITOR_LANGUAGE', "ADD_TO_PAGE");
                buttonLabel = this.resources.W.AppsEditor.localize("@ADD_TO_PAGE_" + this._widgetId + "@", btnDefault);
            }
            return buttonLabel;
        },

        _onAllSkinPartsReady: function (parts) {
            // subtitle
            var appDefinitionId = this._appDefinitionData.appDefinitionId;
            var subTitle = this.resources.W.AppsEditor.localize(this._appDefinitionData.companyName, this._appDefinitionData.companyName);
            this._dialogWindow.setSubTitle(subTitle);

            // description
            var description = this._getAppDescription();
            parts.description.set("text", description);
            parts.additionalDescription.set("text", this.resources.W.Resources.get('EDITOR_LANGUAGE', "APPS_ADD_DIALOG_BOTTOM_DESCRIPTION"));

            // button
            var buttonLabel = this._getButtonLabel();
            parts.button.setButtonLabel(buttonLabel);

            function onButtonClickedHandler() {
                var appsOfThisType = this.injects().AppStoreManager.countAppElements(this._type, appDefinitionId);
                LOG.reportEvent(wixEvents.APPS_FLOW_ADD_AS_TO_PAGE_BUTTON, {c1: this._type, i1: appsOfThisType, g1: appDefinitionId});

                this._closeDialogCB();
                this.resources.W.EditorDialogs.closeAllDialogs();
            }

            parts.button.addEvent("click", onButtonClickedHandler.bind(this));

            if (!this.resources.W.TPAEditorManager.isAddAllowed(this._type, appDefinitionId)) {
                parts.button.disable();
            }

            this._dialogWindow.setIcon(this._appDefinitionData.appIcon);

            //TODO: Move this to skin once it is possible to use static media URL in params
            parts.imageContainer.setStyle("background-image", "url('" + this.injects().Config.getServiceTopologyProperty('staticMediaUrl') + "/157176afb17f2ed4238938cc188c40e8.wix_mp')"); // stripes

            this._createInnerViewComponent();
        },

        _createInnerViewComponent: function () {
            if (this._videoURL) {
                this._skinParts.video.setStyle("display", "block");
                this._skinParts.video.setStyle("width", this.PIC_WIDTH);
                this._skinParts.video.setStyle("height", this.PIC_HEIGHT);
                this._skinParts.video.setAttribute("src", this._getVideoURL());
            }
            else {
                this._createPhotoSlide();
                this._skinParts.photoSlide.getViewNode().setStyle("display", "block");
            }
        },

        _getVideoURL: function () {
            var url = this._videoURL;
            url += "?wmode=transparent&autohide=0&showinfo=0"; //don't show player controls and video info
            url += "&width=" + this.PIC_WIDTH;
            url += "&height=" + this.PIC_HEIGHT;
            return url;
        },

        _createPhotoSlide: function () {
            var itemsArr = [];

            var pictures = this._appDefinitionData.pictures;
            var picLength = pictures.length;
            if (picLength > 0) {
                var countPicsToAdd = 3 - picLength; // Slideshow supports >=3 photos.
                while (countPicsToAdd > 0) {
                    pictures.push(pictures[0]);
                    countPicsToAdd--;
                }

                Array.each(pictures, function (url) {
                    var dataItemObj = this.injects().Data.addDataItemWithUniqueId("tpa", {
                        'type': 'Image',
                        "uri": url,
                        "width": this.PIC_WIDTH,
                        "height": this.PIC_HEIGHT
                    });
                    itemsArr.push("#" + dataItemObj.id);
                }.bind(this));
            }

            this._skinParts.photoSlide.setHeight(this.PIC_HEIGHT);
            this._skinParts.photoSlide.setWidth(this.PIC_WIDTH);
            this._skinParts.photoSlide.setComponentProperty("expandEnabled", false);
            this._skinParts.photoSlide.setComponentProperty("numCols", 1);
            this._skinParts.photoSlide.setComponentProperty("maxRows", 1);
            this._skinParts.photoSlide.setComponentProperty("autoplay", true);

            this._skinParts.photoSlide.setDataItem(this.injects().Data.createDataItem({'type': 'ImageList', 'items': itemsArr }, 'ImageList'));

            this._skinParts.photoSlide.addEvent("displayerChanged", function () {
                LOG.reportEvent(wixEvents.APPS_FLOW_SLIDESHOW_INTERACTION, {g1: this._appDefinitionData.appDefinitionId});
            }.bind(this));
        },


        _initializeSlideShow: function (definition) {
            definition.dataItem = this.injects().Data.createDataItem({'type': 'ImageList', 'items': [] }, 'ImageList');
            return definition;
        },

        _onDialogClosing: function (event) {
            if (event.result == "CANCEL") {
                LOG.reportEvent(wixEvents.APPS_FLOW_ADD_DIALOG_CANCELED, {g1: this._appDefinitionData.appDefinitionId});
            }
        }
    });

});