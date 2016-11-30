define.component('wysiwyg.editor.components.dialogs.AviaryDialog', function(compDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.EditorDialogs', 'W.Config', 'W.Utils', 'W.Resources', 'W.Editor', 'W.Preview']);

    def.skinParts({
        content       : {type: 'htmlElement'},
        tmpImage      : {type: 'htmlElement'},
        message       : {type: 'htmlElement'},
        progress      : {type: 'htmlElement'},
        counter       : {type: 'htmlElement'},
        messageContent: {type: 'htmlElement'},
        cancelButton  : {type: 'htmlElement'}
    });

    def.binds([
        '_onDialogOpened', '_onAviarySave', '_onAviaryClose', '_onUploadResponse', '_onAviarySaveButtonClick', '_onError', '_launchAviary', '_closeAviary', '_closeAndSave', '_onAviaryReady', '_onProgress', '_onAbort', '_onCancelUploadClicked'
    ]);
    def.statics({
        MAX_IMAGE_PYRAMID_SIZE: 1500
    });
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};

            //Dialog Init
            this._dialogs = this.resources.W.EditorDialogs;
            this._editor = this.resources.W.Editor;
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.setCloseCallBack(this._closeAviary);
            this._aviaryCloseCause = this._dialogs.DialogButtons.CANCEL;
            this._dialogLanguage = this.resources.W.Resources.getLanguageSymbol();
            //Some predefined parameters for upload
            this._mediaServerRoot = this.resources.W.Config.getServiceTopologyProperty('mediaServerRoot');
            this._baseStaticUrl = '//0.static.' + this._mediaServerRoot + '/api/add_file';
            this._editedTagAttribute = 'edited image';
            this._isSaveInProcess = false;

            this._host = '//editor.';
            this._baseUrl = this._host + this._mediaServerRoot;
            //TODO: Only here to test on local envs.
            if (this._mediaServerRoot.test('pita')){
                this._baseUrl = '//wysiwyg.pita.wixpress.com/editor';
            }

        },

        /**
         * Re-render the dialog on every open
         */
        _onDialogOpened: function(){
            //Reset some declarations
            this._forceCloseTimer = null;
            this._forceClose = false;
            this._newImageSize = null;
            this._newImageUri = null;
            this._xhrObject = null;

            //Set dialog size
//            var windowSize = window.getSize();
//            var width = Math.max(windowSize.x - 100, 850);
//            var height = Math.max(windowSize.y - 120, 550);

//            this._dialogWindow.setWidth(width);
//            this._dialogWindow.setMaxMinHeight(height, height);
//            this._dialogWindow.setPositionByType(Constants.DialogWindow.POSITIONS.CENTER);

            this._data = this._editor.getEditedComponent().getDataItem();

            if (!this._skinParts.content.id){
                LOG.reportError(wixErrors.AVIARY_MISSING_ID_IN_SKIN, "AviaryDialog", "_onDialogOpened");
                return false;
            }
            if (!this._data || this._data.getType() !== 'Image'){
                LOG.reportError(wixErrors.AVIARY_DIALOG_WRONG_DATA_TYPE, "AviaryDialog", "_onDialogOpened");
                return false;
            }

            this._showEditorWaitMessages(this.injects().Resources.get('EDITOR_LANGUAGE', 'AVIARY_LOAD_MESSAGE', 'Loading Image Editor...'), false);
            this._disableCloseButton();
            this._skinParts.cancelButton.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'AVIARY_CANCEL_UPLOAD', 'Cancel'));
            this._skinParts.cancelButton.addEvent(Constants.CoreEvents.CLICK, this._onCancelUploadClicked);

            this._setTempImage();
            this._initAviary();
        },

        /**
         * Insert the original image into the DOM so Aviary can edit it
         */
        _setTempImage: function(){
            var uri = this._data.get('uri');
            var prefix = (uri.test(/(^https?)|(^data)/)) ? '' : '/static/media/';
            var mimeType = (uri.test(/(jpg$)|(jpeg$)/i)) ? 'image/jpeg' : 'image/png';

            if (this._data.get('width') > this.MAX_IMAGE_PYRAMID_SIZE || this._data.get('height') > this.MAX_IMAGE_PYRAMID_SIZE){
                uri = uri + '_' + this.MAX_IMAGE_PYRAMID_SIZE;
            }

            //This line help us bypass Firefox too strict cross origin policy.
            //https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image
            //TODO: We should find a way to make firefox play nice with our proxy
            this._skinParts.tmpImage.crossOrigin = '';

            this._skinParts.tmpImage.src = prefix + uri;
            this._skinParts.tmpImage.id = 'some_random_id_' + Date.now();
            this._skinParts.tmpImage.type = mimeType;
        },

        /**
         * Initialize the Aviary editor if it is not present and launch it when ready
         * Or launch it if it is
         */
        _initAviary: function(){
            if (!window.featherEditor){
                window.featherEditor = new window.Aviary.Feather({
                    apiKey             : '57b23071b',
                    apiVersion         : 3,
                    tools              : 'crop,orientation,enhance,effects,frames,brightness,contrast,saturation,warmth,focus,sharpness,draw,redeye,whiten,blemish,stickers,text',
                    //tools              : 'crop,orientation,enhance,effects,frames,brightness,contrast,saturation,warmth,sharpness,draw,redeye,whiten,blemish,stickers,text',
                    maxSize            : this.MAX_IMAGE_PYRAMID_SIZE,
//                    minimumStyling     : true,
                    theme              : 'minimum',
                    noCloseButton      : true,
                    displayImageSize   : true,
                    onLoad             : this._launchAviary,
                    onSave             : this._onAviarySave,
                    onClose            : this._onAviaryClose,
                    onReady            : this._onAviaryReady,
                    onSaveButtonClicked: this._onAviarySaveButtonClick,
                    onError            : this._onError,
                    appendTo           : this._skinParts.content.id,
                    language           : this._dialogLanguage,
                    launchDelay        : 0
                    //closeDelay         : 0
                });
            } else {
                this._launchAviary();
            }
            //Enable the user to close the dialog after 10 seconds of load time
            this._aviaryIsDeadTimer = this.callLater(this._enableCloseButton, null, 10000);
        },

        /**
         * Get the size in pixels of the image's enclosing component
         * @return {String} the size in pixels as an aspect ratio.
         */
        _getOriginalAspectRatio: function(){
            var component = this._editor.getEditedComponent();
            var componentWidth = component.getWidth();
            var componentHeight = component.getHeight();

            var aspectRatio = componentWidth + ':' + componentHeight;
            return aspectRatio;
        },

        /**
         * Launch Aviary editor with an updated image id and crop sizes
         */
        _launchAviary: function(){
            var originalName = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'AVIARY_ORIGINAL_ASPECT', 'Actual Size');
            window.featherEditor.launch({
                image      : this._skinParts.tmpImage.id,
                //cropPresetStrict: true,
                cropPresetDefault: originalName,
                cropPresets: [
                    [originalName, this._getOriginalAspectRatio()],
                    'Custom'
                ]
            });

            //Don't open autosave dialog while in Aviary
            this._editor.setPostponeAutoSave(60000);
        },

        /**
         * Hide loaders when Aviary is ready.
         * Called by onReady
         * @private
         */
        _onAviaryReady: function(){
            this._hideEditorWaitMessages();
            this._enableCloseButton();
            if (this._aviaryIsDeadTimer){
                clearTimeout(this._aviaryIsDeadTimer);
            }
        },

        /**
         * The default Aviary save callback, called by onSave
         * We bypass this function and should never reach it.
         * @param imageID
         * @param newURL
         */
        _onAviarySave: function(imageID, newURL){
            LOG.reportError(wixErrors.AVIARY_REACHED_INNER_SAVE_FUNCTION, "AviaryDialog", "_onAviarySave");
            return false;
        },

        /**
         * After closing aviary close the dialog, called by onClose
         * depending on _aviaryCloseCause value
         * Uses timers to close the dialog because Aviary "onClose" happens before all close actions happened.
         */
        _onAviaryClose: function(){
            if (this._forceCloseTimer){
                clearTimeout(this._forceCloseTimer);
                this._forceClose = false;
            }
            W.Utils.callLater(this._dialogWindow.endDialog, [this._aviaryCloseCause], this._dialogWindow, 200);

            if (this._aviaryCloseCause === 'CANCEL'){
                if (this._isSaveInProcess){
                    LOG.reportEvent(wixEvents.AVIARY_CANCEL_WHILE_SAVE, {});
                } else {
                    LOG.reportEvent(wixEvents.AVIARY_CANCEL, {});
                }
            }
            // Let autosave dialog pop if it wants too.
            this.injects().Editor.cancelPostponeAutoSave();
        },

        /**
         * Close the aviary editor and suppress Dialog Window default 'CANCEL' action
         * @param event
         * the close result (needs to be: reason) for closing the editor
         * Current known values are 'OK', 'CANCEL'
         * @return {Boolean} return false to suppress Dialog Window default 'CANCEL' action
         */
        _closeAviary: function(event){
            event = event || {};

            if (!this._isCloseButtonEnabled()){
                return false;
            }

            this._aviaryCloseCause = event.result || W.EditorDialogs.DialogButtons.CANCEL;
            window.featherEditor.close();
            this._skinParts.cancelButton.removeEvent(Constants.CoreEvents.CLICK, this._onAbort);

            //If closing the panel once did not work, than in 2 seconds force close click
            if (!this._forceClose){
                if (!this._forceCloseTimer){
                    this._forceCloseTimer = this.callLater(function(){
                        this._forceClose = true;
                    }, [], 2000);
                }
                return false;
            } else {
                LOG.reportError(wixErrors.AVIARY_FORCE_CLOSED, "AviaryDialog", "_closeAviary");
                // Let autosave dialog pop if it wants to.
                this.injects().Editor.cancelPostponeAutoSave();
                return true;
            }

        },

        /**
         * Set the new image data, save original Image Data Ref if one doesn't exist
         */
        _setNewImageData: function(){
            if (!this._newImageSize || !this._newImageUri){
                return;
            }

            var originalImageData = '';
            var originalImageDataRef = this._data.get('originalImageDataRef');

            if (!originalImageDataRef){
                originalImageData = this.resources.W.Preview.getPreviewManagers().Data.addDataItemWithUniqueId('original_image_', this._data.cloneData());
                originalImageDataRef = '#' + originalImageData.id;
            }

            this._data.setFields({
                height              : this._newImageSize.y,
                width               : this._newImageSize.x,
                uri                 : this._newImageUri,
                originalImageDataRef: originalImageDataRef
            });

            this._newImageSize = null;
            this._newImageUri = null;
        },

        /**
         * Get the image data from Aviary's canvas element and update the image Data Item
         * Also, save the original image's URI and dimensions to the image Data Item
         * @param imageID
         * @return {Boolean} return false to suppress Aviary's default save action
         */
        _onAviarySaveButtonClick: function(imageID){
            //Get the list of actions from aviary editor, assume that there will always be one action in the list
            var aviaryActionList = JSON.parse(window.featherEditor.getActionList());
            var isImageChanged = aviaryActionList && aviaryActionList.actionlist && aviaryActionList.actionlist.length > 1;
            var canvasElement = $('avpw_canvas_element');
            var dataUri = '';

            if (isImageChanged){
                this._setEditorWaitState(true, this.injects().Resources.get('EDITOR_LANGUAGE', 'AVIARY_WAIT_MESSAGE', 'Uploading image, please wait...'), true);
                dataUri = encodeURIComponent(canvasElement.toDataURL(this._skinParts.tmpImage.type)); //restore the same type as before
                this._newImageSize = canvasElement.getSize();

                LOG.reportEvent(wixEvents.AVIARY_SAVE_CHANGES, {
                    c1: this._data.get('uri'),
                    i1: this._data.get('originalImageDataRef') ? 1 : 0,
                    g1: this._newImageSize.x + 'X' + this._newImageSize.y + '|' + dataUri.length
                });
                this._uploadDataUrl(dataUri, this._onUploadResponse);
            } else {
                LOG.reportEvent(wixEvents.AVIARY_SAVE_NO_CHANGE, {c1: this._data.get('uri'), i1: this._data.get('originalImageDataRef') ? 1 : 0});
                this._enableCloseButton();
                this._closeAviary({result: W.EditorDialogs.DialogButtons.CANCEL});
            }

            return false;
        },

        /**
         * Show or hide a wait message, Aviary's wait indicator if available and a progress indicator if applicable
         * @param state
         * @param text
         * @param showProgress
         * @private
         */
        _setEditorWaitState: function(state, text, showProgress){
            //If something wrong with Aviary, skip
            if (!(window.featherEditor && window.AV && window.AV.paintWidgetInstance)){
                return;
            }
            // IF true, disable controls and show message
            if (state){
                window.featherEditor.disableControls();
                window.featherEditor.showWaitIndicator();
                this._disableCloseButton();
                this._showEditorWaitMessages(text, showProgress);

            } else {
                // Return to normal
                window.featherEditor.enableControls();
                window.featherEditor.hideWaitIndicator();
                this._enableCloseButton();
                this._hideEditorWaitMessages();
            }
        },

        /**
         * Helper function for _setEditorWaitState
         * Show or hide a wait message and a progress indicator if applicable
         * @param text
         * @param showProgress
         * @private
         */
        _showEditorWaitMessages: function(text, showProgress){
            if (text){
                this._skinParts.messageContent.set('text', text);
                this._skinParts.message.uncollapse();
            } else {
                this._hideEditorWaitMessages();
            }
            if (showProgress){
                this._skinParts.cancelButton.uncollapse();
                // IE < 10 doesn't know how to show upload progress
                if (!window.XDomainRequest){
                    this._skinParts.counter.set('text', '0%');
                    this._skinParts.progress.uncollapse();
                }
            } else {
                this._skinParts.progress.collapse();
                this._skinParts.cancelButton.collapse();
            }
        },

        /**
         * Helper function for _showEditorWaitMessages
         * Hide the wait message
         * @private
         */
        _hideEditorWaitMessages: function(){
            this._skinParts.message.collapse();
        },

        _onUploadResponse: function(response){
            response = response || {};
            if (response.status === 'error' || response.status === 'timeout'){
                this._setEditorWaitState(false);
                LOG.reportError(wixErrors.AVIARY_UPLOAD_TO_STATIC_FAILED, "AviaryDialog", "_onUploadResponse", {c1: response.errorDescription});
                this._showErrorMessage('ERROR_AVIARY_TITLE', 'ERROR_AVIARY_UPLOAD_MESSAGE', 'Code: ' + wixErrors.AVIARY_UPLOAD_TO_STATIC_FAILED.errorCode);
                return false;
            }

            var date = new Date();
            var timestamp = [date.getFullYear(), date.getMonth() + 1, date.getDate(), [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')].join('-');

            this._newImageUri = response.fileName;
            response.originalName = (this._data.get('title') || 'Edited Image') + ' ' + timestamp;

            this._finalizeUpload(response, this);

        },

        _closeAndSave: function(){
            LOG.reportEvent(wixEvents.AVIARY_SAVE_SUCCESS, {c1: this._data.get('uri'), i1: this._data.get('originalImageDataRef') ? 1 : 0});
            this._setNewImageData();
            this._enableCloseButton();
            this._closeAviary({result: this._dialogs.DialogButtons.OK});
        },

        _disableCloseButton: function(){
            //TODO: Refactor DialogWindow and remove this hack.
            this._isDialogCloseButtonEnalbled = false;
            this._dialogWindow._skinParts.xButton.setAttribute('disabled', 'disabled');
        },

        _enableCloseButton: function(){
            //TODO: Refactor DialogWindow and remove this hack.
            this._isDialogCloseButtonEnalbled = true;
            this._dialogWindow._skinParts.xButton.removeAttribute('disabled');

        },

        _isCloseButtonEnabled: function(){
            return this._isDialogCloseButtonEnalbled !== false;
        },

        /**
         * Normal HTTP Request
         * @param method
         * @param url
         * @param data
         * @param onerror
         * @param onload
         * @param contentType
         */
        _request: function(method, url, data, onerror, onload, contentType){
            method = method || 'GET';
            var xhr = new XMLHttpRequest();
            var onChange = function(){
                if (xhr.readyState == 4 /* complete */){
                    if (xhr.status == 200 || xhr.status == 304){
                        onload(xhr);
                    } else {
                        onerror(xhr);
                    }
                }
            };
            xhr.open(method, url, true);
            xhr.onreadystatechange = onChange;
            xhr.setRequestHeader("Content-type", contentType || 'text/plain');
            xhr.send(data);
        },

        /**
         * CORS HTTP Request (Don't Forget: IE < 10 uses only plaintext with no cookie)
         * @param method
         * @param url
         * @param data
         * @param callbacks
         * An object with one or more 0f the following functions:
         * {
         *     onLoad: function(){}
         *     onError: function(){}
         *     onTimeout: function(){}
         *     onProgress: function(){}
         *     onAbort: function(){}
         * }
         * @param contentType
         * @param withCredentials
         */
        _requestCORS: function(method, url, data, callbacks, contentType, withCredentials){
            method = method || 'GET';
            callbacks = callbacks || {};

            var async = true;
            var isXDomain = (typeof XDomainRequest !== "undefined");

            // If IE < 10
            if (isXDomain){
                this._xhrObject = new XDomainRequest();
                async = undefined;
            } else {
                this._xhrObject = new XMLHttpRequest();
            }

            var xhr = this._xhrObject;
            // IE10 issue - xhr.open() should be called before any XHR settings
            xhr.open(method, url, async);

            xhr.timeout = 300000; //Die after 5 minutes
            xhr.onload = callbacks.onLoad || function(){};
            xhr.onerror = callbacks.onError || function(){};
            xhr.ontimeout = callbacks.onTimeout || function(){};
            xhr.onprogress = callbacks.onProgress || function(){};
            if (!isXDomain){
                xhr.onabort = callbacks.onAbort || function(){};
            }


            if (xhr.upload){
                xhr.upload.addEventListener('progress', callbacks.onUploadProgress || function(){
                }, false);
            }
            // If Normal Browser
            if (!isXDomain){
                // Assume data is plain text unless stated otherwise
                xhr.setRequestHeader("Content-type", contentType || 'text/plain');
                xhr.withCredentials = withCredentials ? true : false;
            }

            xhr.send(data);
        },

        _uploadDataUrl: function(dataUri, onFileUploadEnd){
            this._getTicket(this._baseUrl + '/media/tickets/get', function(res){
                var ticket = res.responseValue;
                if (!ticket){
                    LOG.reportError(wixErrors.AVIARY_UPLOAD_GET_TICKET_FAILED, "AviaryDialog", "_getTicket", {c1: res.errorDescription});
                    this._showErrorMessage('ERROR_AVIARY_TITLE', 'ERROR_AVIARY_UPLOAD_MESSAGE', 'Code: ' + wixErrors.AVIARY_UPLOAD_GET_TICKET_FAILED.errorCode);
                    this._setEditorWaitState(true);
                    return false;
                }
                this._startUpload(ticket, dataUri, onFileUploadEnd);
            }.bind(this));
        },

        _getTicket: function(url, onTicketResponse){
            var getTicketValue = function(res){
                try{
                    res = JSON.parse(res.responseText);
                } catch(ticketError){
                    res.status = 'error';
                    res.errorDescription = 'Parse error: ticket returned unexpected response';
                }
                onTicketResponse(res);
            };

            this._request('GET', url + '?accept=json', null, getTicketValue, getTicketValue, 'text/plain');
        },

        _startUpload: function(ticket, dataUri, onFileUploadEnd){

            var parse = this._parseMediaResponseXML;

            var parseFileUploadResponse = function(){
                var responseBody = this.responseXML || this.responseText;
                onFileUploadEnd(parse(responseBody));
            };

            var dataObj = {datauri: dataUri, ut: ticket, s: 'media'};
            var data = [];
            var name;
            for (name in dataObj){
                if (dataObj.hasOwnProperty(name)){
                    data.push(name + '=' + dataObj[name]);
                }
            }
            data = data.join('&');
            var callbacks = {
                onLoad          : parseFileUploadResponse,
                onError         : parseFileUploadResponse,
                onTimeout       : parseFileUploadResponse,
                onUploadProgress: this._onProgress,
                onAbort         : this._onAbort
            };
            this._requestCORS('POST', this._baseStaticUrl, data, callbacks, 'application/x-www-form-urlencoded', false);
        },

        _finalizeUpload: function(response, context){
            var data = this._createMediaAddRequestXML(response);
            var url = this._baseUrl + '/media/private/add';

            var onerror = function(){
                context._setEditorWaitState(true);
                LOG.reportError(wixErrors.AVIARY_UPLOAD_UPDATE_MEDIA_FAILED, "AviaryDialog", "_finalizeUpload");
                this._showErrorMessage('ERROR_AVIARY_TITLE', 'ERROR_AVIARY_UPLOAD_MESSAGE', 'Code: ' + wixErrors.AVIARY_UPLOAD_UPDATE_MEDIA_FAILED.errorCode);
                return false;
            }.bind(context);

            var onsuccess = function(){
                this._closeAndSave();
            }.bind(context);

            this._request('POST', url, data, onerror, onsuccess, "application/xml");
        },

        _createMediaAddRequestXML: function(response){
            var r = '<mediaItemList>';
            r += '<mediaItem';
            r += ' mediaType="' + 'picture';
            r += '" componentType="' + 'photo';
            r += '" fileName="' + response.fileName;
            r += '" originalFileName="' + response.originalName;
            r += '" fileSize="' + response.fileSize;
            r += '" width="' + response.width;
            r += '" height="' + response.height;
            r += '" mimeType="' + response.mimeType;
            r += '" iconURL="' + response.iconUrl;
            r += '" version="' + response.ver;
            r += '" tags="' + this._editedTagAttribute;
            r += '" />\n';

            r += '</mediaItemList>';
            return r;
        },

        _parseMediaResponseXML: function(response){
            var upload;
            var success;
            var doc;
            // For IE XDomainRequest
            if (typeof response === 'string'){
                doc = new Element('div');
                doc.innerHTML = response;
            } else {
                doc = response;
            }

            if (doc){
                upload = doc.querySelector('upload');
                success = upload.getAttribute('success');
            } else {
                upload = {getAttribute: function(){
                    return 'No Response Error';
                }};
                success = false;
            }
            if (success === 'true'){
                var properties = doc.querySelector('properties');
                var sys_meta = doc.querySelector('sys_meta');
                return {
                    status      : upload.getAttribute('errorDescription'),
                    originalName: sys_meta.getAttribute('original_file'),
                    mimeType    : sys_meta.getAttribute('mime_type'),
                    fileUrl     : sys_meta.getAttribute('file_url'),
                    iconUrl     : sys_meta.getAttribute('icon_url'),
                    fileSize    : sys_meta.getAttribute('file_size'),
                    width       : sys_meta.getAttribute('width'),
                    height      : sys_meta.getAttribute('height'),
                    ver         : sys_meta.getAttribute('ver'),
                    fileName    : properties.getAttribute('file_name')
                };
            } else {
                return {
                    status          : 'error',
                    origin          : upload.getAttribute('origin'),
                    errorCode       : upload.getAttribute('errorCode'),
                    errorDescription: upload.getAttribute('errorDescription')
                };
            }

        },

        /**
         * Show error message popup
         * @param titleLangId
         * @param messageLangId
         * @param details
         * @param onAfterCloseError
         */
        _showErrorMessage: function(titleLangId, messageLangId, details, onAfterCloseError){
            var title = titleLangId && this.resources.W.Resources.get('EDITOR_LANGUAGE', titleLangId);
            var message = messageLangId && this.resources.W.Resources.get('EDITOR_LANGUAGE', messageLangId);
            var callback = onAfterCloseError && onAfterCloseError.apply(this, arguments);

            W.EditorDialogs.openPromptDialog(title, message, details, this._dialogs.DialogButtonSet.OK, callback || function(){
            });
        },

        _onCancelUploadClicked: function(){
            if (this._xhrObject){
                this._xhrObject.abort();

                // XDomainRequest doesn't have an 'onabort' method so polyfilling it
                if (window.XDomainRequest){
                    this._onAbort();
                }

            } else {
                this._setEditorWaitState(false);
            }
        },

        _onAbort: function(){
            this._setEditorWaitState(false);
            LOG.reportEvent(wixEvents.AVIARY_CANCEL_WHILE_SAVE, {});
            this._xhrObject = null;
            return false;
        },

        _onProgress: function (event) {
            if (event.lengthComputable) {
                //event.loaded the bytes browser receive
                //event.total the total bytes set by the header

                var percentComplete = Math.round(event.loaded / event.total * 100) + '%';
                this._skinParts.counter.set('text', percentComplete);
            }
        },

        /**
         * Throw an error when Aviary fails
         * @param errorObj
         */
        _onError: function(errorObj){
            LOG.reportError(wixErrors.AVIARY_RETURNED_AN_ERROR, "AviaryDialog", "_onError", {i1: errorObj.code, c1: errorObj.message});
            this._showErrorMessage('ERROR_AVIARY_TITLE', 'ERROR_AVIARY_GENERAL_MESSAGE', 'Codes: ' + wixErrors.AVIARY_RETURNED_AN_ERROR.errorCode + ', ' + errorObj.code);
            return false;
        }
    });

});
