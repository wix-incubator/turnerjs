/**
 * @class wysiwyg.viewer.components.PinterestFollow
 */
define.component('wysiwyg.viewer.components.PinterestFollow', function(componentDefinition){

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'topology']);

    def.dataTypes(['PinterestFollow']);

    def.skinParts({
        followButtonTag: { type: 'htmlElement' },
        followButton: { type: 'htmlElement' }
    });

    def.statics({
        EDITOR_META_DATA:{
            general: {
                settings: true,
                design: false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [];
        },

        _onRender: function (ev) {
            this._updatePinterestData();
        },

        _updatePinterestData: function(){
            this._setPinterestBtnTxt();
            this._setPinterestUrl();
        },

        _setPinterestBtnTxt: function(){
            var buttonText = this._getPinterestBtnTxt();

            this._skinParts.followButtonTag.innerHTML = buttonText;
        },

        _setPinterestUrl: function(){
            var url = this._getPinterestUrl();
//            this._skinParts.followButtonTag.setAttribute('href', url);
            this._skinParts.followButton.setAttribute('href', url);
        },

        _getPinterestUrl: function(){
            var data = this.getDataItem();
            var url = data ? data.get('urlChoice') : '';
            var tempUrl = url.split('.');
            var pinterestUrl = [];

            tempUrl.forEach(function(param){
                if((param !== "pinterest.com/") && (param !== "http://www.pinterest.com/") && (param !== "www.pinterest.com/") || (param === "http://pinterest.com/")){
                    pinterestUrl.push(param);
                }
            });

            return '//www.pinterest.com/' + pinterestUrl;
        },

        _getPinterestBtnTxt: function(){
            var data = this.getDataItem();
            return data ? data.get('label') : '';
        }

    });
});