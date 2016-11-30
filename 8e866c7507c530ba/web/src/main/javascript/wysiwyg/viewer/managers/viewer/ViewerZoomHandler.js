/**
 * @class wysiwyg.viewer.managers.viewer.ViewerZoomHandler
 */
define.Class('wysiwyg.viewer.managers.viewer.ViewerZoomHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Config']);

    /** @lends wysiwyg.viewer.managers.viewer.ViewerZoomHandler */
    def.methods({

        initialize: function(viewer, siteNode){
            this._zoomComp = null;
            this._viewer = viewer;
            this._siteNode = siteNode;
            var cmds = this.resources.W.Commands;
            cmds.registerCommandAndListener('WViewerCommands.OpenZoom', this, this._setZoomData);
        },

        getDefaultGetZoomDisplayerFunction: function (dataType) {
            if (dataType === 'Image') {
                return function (dataItem, maxSize, callback) {
                    var zoomType = this._getCurrentZoomType(true);
                    var settings = this._getZoomDisplayerCompSettings(zoomType);
                    this.injects().Components.createComponent(settings.comp,
                        settings.skin, dataItem,
                        {'maxWidth': maxSize.x, 'maxHeight': maxSize.y},
                        null,
                        function (logic) {
                            callback(logic.getViewNode());
                        }
                    );
                }.bind(this);
            }
        },

          //Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:10 IDT 2012
        getDefaultGetHashPartsFunction: function (dataType) {
            ////TODO: remove this when we start getting data by pages
            // var hashParts = W.Utils.hash.getHashParts();
            // var isZoomUrl = hashParts.id == 'zoom';
            if (dataType === 'Image') {
                return function (dataItem, callback) {
                    W.Data.getDataItem(dataItem, function (imageItem) {
                        callback({'id': "zoom", 'title': imageItem.get('title'), extData: this._viewer.getCurrentPageId() + "/" + imageItem.get('id') });
                    }.bind(this));
                }.bind(this);
            }
        },

        _getZoomDisplayerCompSettings:function(type){
            var displayerSkin;
            var displayerComp;
            if(type === 'MOBILE'){
                displayerSkin = 'wysiwyg.viewer.skins.displayers.MobileMediaZoomDisplayerSkin';
                displayerComp = 'wysiwyg.viewer.components.MobileMediaZoomDisplayer';
            }else{
                displayerSkin = 'wysiwyg.viewer.skins.displayers.MediaZoomDisplayerSkin';
                displayerComp = 'wysiwyg.viewer.components.MediaZoomDisplayer';

            }
            return {
                comp: displayerComp,
                skin: displayerSkin
            };
        },

        _getCurrentZoomComp: function(zoomCompName){
            return (zoomCompName === 'MOBILE' ? this._mobileZoomNode : this._desktopZoomNode);
        },

        _setCurrentZoomComp:function(compLogic, zoomCompName){
            if(zoomCompName === 'MOBILE'){
                this._mobileZoomNode = compLogic;
            } else{
                this._desktopZoomNode = compLogic;
            }
        },

        _setZoomData: function (mediaArgs) {
            this._initZoomIfNeeded(mediaArgs, function (compLogic) {
                this._zoomComp = compLogic.getViewNode() ;
                this._setZoomDataInner(mediaArgs);
            }.bind(this));
        },

        //Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:10 IDT 2012
        removeZoomElement: function () {
            if (this._zoomComp) {
                this._zoomComp.removeFromDOM();
                delete this._zoomComp;
            }
        },
        //Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:10 IDT 2012

        /**
         * will set the zoom data, which in turn will change the url hash
         * that should call the _setMediaZoomItemAndShow
         * extraParams - currently supports hide prev/next buttons in gallery zoom
         * @param mediaArgs
         */
        _setZoomDataInner: function (mediaArgs) {
            if (mediaArgs.itemsList) {
                this._zoomComp.getLogic().setGallery(mediaArgs.itemsList, mediaArgs.currentIndex, mediaArgs.getDisplayerDivFunction, mediaArgs.getHashPartsFunction, mediaArgs.extraParams);
            }
            else if (mediaArgs.item) {
                this._zoomComp.getLogic().setImage(mediaArgs.item, mediaArgs.getDisplayerDivFunction, mediaArgs.getHashPartsFunction, mediaArgs.extraParams);
            }
        },

        //Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:10 IDT 2012
        /**
         * initialize the this._mediaZoom singleton
         * @param callbackWhenZoomReady
         */
        _initZoomIfNeeded: function (mediaArgs, callbackWhenZoomReady) {
            var isGalleryImageZoom =  (mediaArgs.item || (mediaArgs.itemsList && mediaArgs.itemsList.getType() === "ImageList")) && !mediaArgs.extraParams;
            var zoomType = this._getCurrentZoomType(isGalleryImageZoom);

            var zoomComp = this._getCurrentZoomComp(zoomType);
            if(zoomComp){
                this._zoomComp = zoomComp;
                callbackWhenZoomReady(this._zoomComp.getLogic());
                return;
            }else{
                var zoomCompSettings = this._getZoomCompSettings(zoomType);
                this._zoomComp = W.Components.createComponent(zoomCompSettings.comp, zoomCompSettings.skin, null, null, null,
                    function(compLogic){
                        compLogic.getViewNode().insertInto(this._siteNode);
                        this._setCurrentZoomComp(compLogic.getViewNode(), zoomType);
                        callbackWhenZoomReady(compLogic);
                    }.bind(this));
            }
        },

        _getZoomCompSettings: function(type) {
            var mediaZoomSkin;
            var mediaZoomComp;

            //this is a hack just so we wont open the mobile zoom for lists until they finish their work
            if(type === 'MOBILE'){
                mediaZoomSkin = 'wysiwyg.viewer.skins.MobileMediaZoomSkin';
                mediaZoomComp = 'wysiwyg.viewer.components.MobileMediaZoom';
            }else{
                mediaZoomSkin = 'wysiwyg.viewer.skins.MediaZoomSkin';
                mediaZoomComp = 'wysiwyg.viewer.components.MediaZoom';

            }
            return {
                comp: mediaZoomComp,
                skin: mediaZoomSkin
            };
        },

        isZoomOpened: function(){
            return this._zoomComp && this._zoomComp.getLogic && this._zoomComp.getLogic().isZoomOpened();
        },

        showItemInOpenedZoom: function(){
            this._zoomComp.getLogic().showZoomImage();
        },

        hideNextPrevButtons: function(){
            if(this._zoomComp && this._zoomComp.$logic){
                this._zoomComp.$logic.hideNextPrevButtons();
            }
        },

        _getCurrentZoomType:function(galleryImageDisplayer){
            if(this._isMobileOptimizedView()){
                return 'MOBILE';
            }
            if(this._isMobileOrTabletDevice()){
                if(galleryImageDisplayer){
                    return 'MOBILE';
                }else{
                    return 'DESKTOP';
                }
            }else{
                return 'DESKTOP';
            }
        },

        _isMobileOrTabletDevice:function(){
            return  W.Config.mobileConfig.isMobileOrTablet();
        },

        _isMobileDevice:function(){
            return W.Config.mobileConfig.isMobile();
        },

        _isMobileOptimizedView:function(){
            return this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE;
        }
    });
});