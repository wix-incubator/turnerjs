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
        transportService.pms.send('openMediaManager', {selectionType: selectionType});

        this._mode = mode;
        this._pos = pos;
    };

    this._add = function(items){
        var images = [];

        items.forEach(function(item, i){
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
    };

    this._change = function(items){
        var item = items[0];

        $rootScope.$apply(function(){
            transportService.changeImage(this._pos, this._getNeededData(item));
        }.bind(this));
    };

    this._getNeededData = function(data){
        return {
            uri: data.uri,
            height: data.height,
            width: data.width,
            title: data.title || data.fileName
        };
    };

    this._changeImages = function(e){
        this['_' + this._mode](e.data);
    };

    this.pms = new PMS();
    this._setDefaults();
    transportService.pms.on('changeImages', this._changeImages, this);
}]);