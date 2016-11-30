/*global app, PMS*/

app.service('mediaGalleryService', ['$rootScope', 'transportService', 'translationService', function($rootScope, transportService, translationService){
    this._setDefaults = function(){
        this._iFrame = null;
        this._mode = null;
        this._pos = null;
        this._selectionType = null;
        this._loadStarted = false;
        this.cached = false;
        this.opening = false;
        this.visible = false;
        this._shouldBeClosed = false;
    };

    this.openMediaGallery = function(mode, selectionType, pos){
        var iFrame;

        this._mode = mode;
        this._pos = pos;
        this._selectionType = selectionType;
        this._shouldBeClosed = false;
        this.opening = true;

        if (!this._loadStarted){ // prevent errors when user clicks on button more than one time
            this._loadStarted = true;
            this.pms.trigger('load', this);

            if (this._iFrame){
                this._open();
            } else{
                iFrame = this._iFrame = document.body.appendChild(document.createElement('iframe'));
                iFrame.onload = this._iFrameLoad.bind(this);
                iFrame.id = 'mediaGalleryFrame';
                iFrame.className = 'mediaFrame';
                iFrame.setAttribute('allowtransparency', true);
                iFrame.src = transportService.topology.url;
            }
        }
    };

    this._iFrameLoad = function(){
        this.pms.set({
            targetWindow: this._iFrame.contentWindow
        });

        this.cached = true;
        this.pms.on('open', this.show, this);
        this.pms.on('cancel', this.hide, this);
        this._open();
    };

    this._open = function(){
        var topology = transportService.topology;
        
        this.pms.once('items', this['_'+this._mode], this);

        this.pms.sendRAW({
            type: 'settings',
            payload: {
                baseHost: topology.baseHost,
                editorSessionId: topology.editorSessionId,
                i18nCode: translationService.getLang(),
                i18nPrefix: this._selectionType === "single" ? "single_image" : "multiple_images",
                mediaType: "picture",
                publicMediaFile: "photos",
                selectionType: this._selectionType,
                _deployedExperiments: topology.deployedExperiments
            }
        });

        this._loadStarted = false;
        this.visible = true;
    };

    this._add = function(e){
        var data = e.rawEvent.payload.items,
            images = [];

        data.forEach(function(item, i){
            images.push({
                id: transportService.getNewID(),
                data: this._getNeededData(item),
                linkText: '',
                position: transportService.images.length - 1
            });
        }, this);

        $rootScope.$apply(function(){
            transportService.addImages(images);
        });

        this.hide();
    };

    this._change = function(e){
        var data = e.rawEvent.payload.items[0];

        $rootScope.$apply(function(){
            transportService.changeImage(this._pos, this._getNeededData(data));
        }.bind(this));

        this.hide();
    };

    this._getNeededData = function(data){
        return {
            uri: data.uri,
            height: data.height,
            width: data.width,
            title: data.title || data.fileName
        };
    };

    this.close = function(){
        this.pms.trigger('closed', this);
        document.body.removeChild(this._iFrame);
        this.pms.off('open, cancel, items');
        this._setDefaults();
    };

    this.show = function(){
        if (!this._shouldBeClosed){
            this._iFrame.style.display = 'block';
            this._iFrame.contentWindow.focus();
        }

        this.opening = false;
        this.pms.trigger('loaded', this);
    };

    this.hide = function(){
        this.pms.off('items');
        this._iFrame.style.display = 'none';
        this.visible = false;
    };

    this.reset = function(){ //called on OrganizeImages (parent) dialog closing to reset mediaGallery if needed
        if (this.cached){
            this._shouldBeClosed = true;
        } else if (this._loadStarted){
            this.close();
        }
    };

    this.pms = new PMS();
    this._setDefaults();
}]);