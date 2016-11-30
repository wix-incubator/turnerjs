define.experiment.Class('wysiwyg.editor.managers.OrganizeImagesManager.OINewMediaManager', function (def) {
    def.resources([
        'topology',
        'scriptLoader',
        'W.Preview',
        'W.Commands',
        'W.Config',
        'W.Resources',
        'W.Utils',
        'W.Experiments'
    ]);

    def.utilize([
        'core.components.image.ImageUrlNew',
        'wysiwyg.common.utils.LinkRenderer',
        'wysiwyg.editor.utils.Spinner'
    ]);

    def.statics({
        dialogData: null,
        _dataManager: null,
        _dialogLayer: null,
        _linkRenderer: null,
        _thumbModesMap: {
            clipImage: 'crop',
            flexibleWidthFixed: 'fit'
        },
        _selectedImg: null,
        _spinner: null,
        _linkDialogOpened: false,
        _helpDialogOpened: false,
        _translationKeys: [
            'ORGANIZE_IMAGES_DIALOG_TITLE',
            'ORGANIZE_IMAGES_DIALOG_DESC',
            'ORGANIZE_IMAGES_DIALOG_ADD',
            'ORGANIZE_IMAGES_DIALOG_REPLACE',
            'ORGANIZE_IMAGES_DIALOG_DONE',
            'ORGANIZE_IMAGES_DIALOG_CANCEL',
            'ORGANIZE_IMAGES_DIALOG_NO_IMG_SELECTED',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_LINK',
            'ORGANIZE_IMAGES_DIALOG_IMG_LINK_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE_TOOLTIP',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC_TOOLTIP',
            'ORGANIZE_IMAGES_DIALOG_EMPTY_MSG',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_YES',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_NO',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_HEADER',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_MSG'
        ],

        mediaManager: {
            framePath: "index.html",
            protocolPath: "scripts/protocol.js",
            baseUrl: "mediaGalleryG5BaseUrl",
            baseHost: "baseDomain"
        }
    });

    def.methods({
        initialize: function (params) {
            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;
            this._dialogLayer = W.Editor.getDialogLayer();
            this._linkRenderer = new this.imports.LinkRenderer();
            this._spinner = new this.imports.Spinner();
            this.setup(params);

            if (!window.PMS) {
                this.resources.scriptLoader.loadResource(
                    {
                        url: this.resources.topology.wysiwyg + "/html/external/OINewMediaManagerExperiment/libs/PMS.js"
                    },
                    {
                        onLoad: this._newDialog.bind(this),
                        onFailed: function () {
                            LOG.reportError("Organize Images failed to load PMS (Post Message Service)");
                        }
                    }
                );
            } else {
                this.openDialog();
            }

            document.body.on('keydown', this, this._onEsc); // keydown used because DialogWindow closes on keydown event.
        },

        setup: function (params) {
            params.comp = this._getComp();
            this.dialog = document.getElementById('organizeImagesDialog');
            this.dialogData = this._getImagesData(params.comp);
            this._compData = params.comp._data;
        },

        _onEsc: function (e) {
            if (e.code === 27 && this.dialog.hasClass('visible') && !this._linkDialogOpened && !this._helpDialogOpened) {
                this.pms.send('close');
            }
        },

        _getComp: function () {
            return W.Editor.getSelectedComp();
        },

        _getImagesData: function (comp) {
            var wConfig = this.resources.W.Config,
                dialogData = {
                    images: [],
                    thumb: {},
                    translation: this._getTranslation(),
                    isPreset: comp._data.getMeta('isPreset'),

                    topology: {
                        editorSessionId: window.editorModel.editorSessionId,
                        baseHost: wConfig.getServiceTopologyProperty('baseDomain'),
                        deployedExperiments: this.resources.W.Experiments._runningExperimentIds,
                        staticMediaUrl: wConfig.getServiceTopologyProperty('staticMediaUrl'),

                        mediaManager: {
                            framePath: 'index.html',
                            baseUrl: wConfig.getServiceTopologyProperty('mediaGalleryG5BaseUrl')
                        }
                    }
                },
                items = comp._data.get('items'),
                imageData,
                link,
                linkData;

            items.forEach(function (id, i) {
                imageData = this._dataManager.getDataByQuery(id);
                link = imageData.get('link');
                linkData = link && this._dataManager.getDataByQuery(link);

                dialogData.images.push({
                    id: imageData.get('id'),
                    data: imageData.cloneOwnData(),
                    linkText: linkData ? this._linkRenderer.renderLinkDataItemForPropertyPanel(linkData) : ''
                });
            }, this);

            dialogData.thumb = { //TODO: this is thumb size (it is displayed in preview image section). Different components has different ways to calculate it, so this point should be universalized
                w: comp._itemWidth,
                h: comp._itemHeight - comp._bottomGap,
                mode: this._thumbModesMap[comp.getComponentProperties().get('imageMode')]
            };

            return dialogData;
        },

        _getTranslation: function () {
            var keys = this._translationKeys,
                translator = this.resources.W.Resources,
                translation = {};

            keys.forEach(function (key) {
                translation[key] = translator.get('EDITOR_LANGUAGE', key);
            });

            return {
                lang: this.resources.W.Config.getLanguage(),
                map: translation
            };
        },

        _setDialog: function () {
            LOG.reportEvent(wixEvents.ORGIMAGES_DIALOG_LOADED, {c1: 'new Organize Images'});

            this.pms.send('set', this.dialogData);
        },

        _newDialog: function () {
            var dialog = document.createElement('iframe');

            this._spinner.show();
            this.removeDialog();
            this.dialog = dialog;
            dialog.on('load', this, this._iFrameLoad);
            dialog.id = 'organizeImagesDialog';
            dialog.src = this.resources.topology.wysiwyg + "/html/external/OINewMediaManagerExperiment/index.html";
            dialog.setAttribute('allowtransparency', true);
            this._dialogLayer.insertBefore(dialog, this._dialogLayer.children.length ? this._dialogLayer.children[0] : null); // fix for IE 9, which can't process "undefined" as a second argument
        },

        _iFrameLoad: function () {
            this.pms = new window.PMS({
                connectionID: 'OrganizeImages',
                targetWindow: this.dialog.contentWindow
            });

            this.pms.on('ready', this._setDialog, this);
            this.pms.on('setup', this.showDialog, this);
            this.pms.on('closed', this.hideDialog, this);
            this.pms.on('openLinkDialog', this._openLinkDialog, this);
            this.pms.on('openHelpDialog', this._openHelpDialog, this);
            this.pms.on('openMediaManager', this._openMediaManager, this);
            this.pms.on('save', this._save, this);
            this.pms.on('bi', this._triggerBiEvent, this);
            this.pms.on('biChanges', this._triggerBiOnChanges, this);
        },

        hideDialog: function () {
            this.dialog.removeClass('visible');
            this._dialogLayer.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
        },

        removeDialog: function () {
            if (this.dialog) {
                this._dialogLayer.removeChild(this.dialog);
            }

            document.off('keyup', this, this._onEsc);
        },

        openDialog: function () {
            if (!this.dialog) {
                this._newDialog();
            } else {
                this._setDialog();
            }
        },

        showDialog: function () {
            this.dialog.addClass('visible');
            this.dialog.contentWindow.focus();
            this._dialogLayer.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this._spinner.hide();
        },

        _openLinkDialog: function (e) {
            var image = this._selectedImg = e.data,
                imageData = this._dataManager.getDataByQuery(image.id);

            window.focus();
            this._linkDialogOpened = true;

            if (!imageData) { //if there is new just added image
                imageData = this._createImageData(image.data);
            }

            this.resources.W.Commands.executeCommand('WEditorCommands.OpenLinkDialogCommand', {
                left: image.left,
                top: image.top,
                data: imageData,
                closeCallback: this._sendLink.bind(this, imageData)
            });
        },

        _sendLink: function (imageData, state, linkData, result) {
            if ((result.result === 'OK' || result.result === 'ClickOutside') && linkData || result.result === 'remove') {
                this.pms.send('setLink', {
                    link: linkData ? '#' + linkData.get('id') : null,
                    linkText: this._linkRenderer.renderLinkDataItemForPropertyPanel(linkData),
                    imgData: this._selectedImg,
                    id: imageData.get('id')
                });
            } else {
                this.pms.send('setLinkCanceled');
            }

            this._linkDialogOpened = false;
        },

        _openHelpDialog: function (e) {
            window.focus();
            this._helpDialogOpened = true;

            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', {
                helpId: e.data.helpId,
                closeCallback: function () {
                    this._helpDialogOpened = false;
                }.bind(this)
            });
        },

        _openMediaManager: function(e){
            this._selectionType = e.data.selectionType;

            this.resources.scriptLoader.loadResource(
                {
                    url: this.resources.W.Config.getServiceTopologyProperty(this.mediaManager.baseUrl) + this.mediaManager.protocolPath
                },
                {
                    onLoad: this._mediaManagerProtocolLoaded.bind(this),
                    onFailed: function () {
                        LOG.reportError(wixErrors.MEDIA_GALLERY_FAIL_LOAD_PROTOCOL, this.className, '_onLoadDelay', this._baseUrl);
                    }
                }
            );
        },

        _mediaManagerProtocolLoaded: function(){
            this._mediaFrame = this._createMediaFrame();
            document.body.appendChild(this._mediaFrame);
            this._mediaManagerProtocol = Protocol.forEditor(this._mediaFrame.contentWindow, window);
            this._mediaManagerProtocol.onReady(this._setMediaManagerHandlers.bind(this));
        },

        _createMediaFrame: function(){
            var frame = document.getElementById('#mediaGalleryFrame');

            if (frame) {
                frame.parentNode.removeChild(frame);
            }

            frame = document.createElement('iframe');
            frame.style.setProperty('width', '100%');
            frame.style.setProperty('height', '100%');
            frame.style.setProperty('display', 'none');
            frame.style.setProperty('overflow', 'hidden');
            frame.style.setProperty('position', 'fixed');
            frame.style.setProperty('left', 0);
            frame.style.setProperty('top', 0);
            frame.setAttribute('id', 'mediaGalleryFrame');
            frame.setAttribute('src', this.resources.W.Config.getServiceTopologyProperty(this.mediaManager.baseUrl) + this.mediaManager.framePath);

            return frame;
        },

        _setMediaManagerHandlers: function(){
            this._mediaManagerProtocol.onItems(this._sendImageData.bind(this));
            this._mediaManagerProtocol.onCancel(this._closeMediaManager.bind(this));

            this._mediaManagerProtocol.initialize({
                baseHost: 'baseDomain',
                editorSessionId: window.editorModel.editorSessionId,
                i18nCode: this.resources.W.Config.getLanguage(),
                i18nPrefix: this._selectionType === "single" ? "single_image" : "multiple_images",
                mediaType: "picture",
                publicMediaFile: "photos",
                selectionType: this._selectionType,
                _deployedExperiments: this.resources.W.Experiments._runningExperimentIds
            });

            this._showMediaManager();
        },

        _showMediaManager: function(){
            this._mediaFrame.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this._mediaFrame.style.setProperty('display', 'block');
        },

        _sendImageData: function(e){
            this.pms.send('changeImages', e.items);
            this._closeMediaManager();
        },

        _closeMediaManager: function(){
            this._mediaFrame.parentNode.removeChild(this._mediaFrame);
        },

        _save: function (e) {
            var images = e.data,
                items = [],
                imageData;

            images.forEach(function (image, i) {
                if (image.id.indexOf('new_') !== -1) {
                    imageData = this._createImageData(image.data);
                } else {
                    imageData = this._setImageData(image);
                }

                items.push('#' + imageData.get('id'));
            }, this);

            this._compData.set('items', items);

            if (this._compData.getMeta('isPreset')) {
                this._compData.setMeta('isPreset', false);
            }
        },

        _triggerBiEvent: function(e){
            var eData = e.data,
                params = eData.params || {};

            LOG.reportEvent(wixEvents[eData.name], params);
        },

        _triggerBiOnChanges: function(e){
            var p,
                changes = e.data;

            for (p in changes){
                if (changes.hasOwnProperty(p)){
                    LOG.reportEvent(wixEvents[p], changes[p]);
                }
            }
        },

        _createImageData: function (data) {
            data.type = 'Image'; //this is required to create dataItem with correct data type
            var dataItem = this._dataManager.addDataItemWithUniqueId('image_', data).dataObject;

            dataItem.setMeta('isPreset', false);

            return dataItem;
        },

        _setImageData: function (image) {
            var dataItem = this._dataManager.getDataByQuery('#' + image.id);

            dataItem.setFields(image.data);

            return dataItem;
        }
    });
});