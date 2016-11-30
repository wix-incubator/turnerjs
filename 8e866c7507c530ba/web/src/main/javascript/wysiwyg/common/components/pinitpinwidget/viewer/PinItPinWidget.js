define.component('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');


    def.dataTypes(['PinItPinWidget']);

    def.resources(['W.Config', 'topology']);

    def.skinParts({
        iframe: { type: 'htmlElement' }
    });
    def.statics({
        _resizableSides: [
        ],
        EDITOR_META_DATA : {
            general: {
                settings: true,
                design: false
            }
      }
    });

    def.binds(["_postMessageCallback"]);

    def.states({
        ErrorDivState: ['noError','error']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

        },
        _onRender: function(ev){
            if (this._hasPinId()){
               this._registerForPostMessageFromIframe();
               this._updateIframe();
                this.setState('noError', 'ErrorDivState');
            }
        },
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.DATA_CHANGE
            ];

            return invalidations.isInvalidated(renderTriggers);
        },
        _registerForPostMessageFromIframe : function (){
            var self=this;
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
            // Listen for a message from the iframe.
            eventer(messageEvent, this._postMessageCallback, false);
        },
        _postMessageCallback: function (e){
            try{
                var msgData = JSON.parse(e.data);
                id = this.getComponentUniqueId();
                if (msgData && msgData.id != id){ return;}

                if (msgData && msgData.topic && msgData.topic == "resize" ){
                    this._setIframeSize(msgData)
                }
                if (msgData && msgData.topic && msgData.topic == "emptyComp" ){
                    this._setErrorContent();
                }

            }catch(e){}
        },
        _updateIframe: function (){
            this._resetIframeSize();
            this._changeIframeUrl();
        },
        _resetIframeSize : function (){
            this.setHeight(0,true);
            this.setWidth(0,true);
        },
        _changeIframeUrl : function (){
            var iframe = this._skinParts.iframe;
            if (this._hasPinId()){
                iframe.src = this._generateIframeUrl();
            }else{
                iframe.src = '';
            }
        },
        _hasPinId:function (){
            var data = this.getDataItem().getData();
            if (data.pinId){
                return true;
            }
            return false;
        },
        _generateIframeUrl: function () {
            var baseUrl = this.resources.topology.wysiwyg + "/html/external/pinterestWidget.html",
                dataItem = this.getDataItem(),
                sets = {
                    "pinUrl": dataItem.get('pinId'),
                    "originDomain": window.location.origin,
                    "id": this.getComponentUniqueId()
                };

            return baseUrl + '?' + Object.toQueryString(sets);
        },
        _setIframeSize:function(data){
            var iframe = this._skinParts.iframe;
            if (data.height !== parseInt(iframe.style.height)){
                this.setHeight(data.height,true);
            }
            if (data.width !== parseInt(iframe.style.width)){
                this.setWidth(data.width,true);
            }
        },
        _setErrorContent: function (){
            this.setState('error', 'ErrorDivState');
            this._skinParts.iframe.setStyle("width", "0px");
            this._resetIframeSize();
            this.setHeight(274,false);
            this.setWidth(225,false);
        },
        setWidth: function (width,setAlsoIframe){
            this.parent(width);
            if (setAlsoIframe){
                this._skinParts.iframe.setStyle("width", width + "px");
            }

        },
        setHeight: function (height,setAlsoIframe){
            this.parent(height);
            if (setAlsoIframe){
               this._skinParts.iframe.setStyle("height", height + "px");
            }
        }
    });
});