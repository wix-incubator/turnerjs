define.component('wysiwyg.common.components.DeadComponent', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    def.resources(['W.Config']);

    def.statics({
        IS_DEAD: true,

        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: false
            },
            mobile: {
                disablePropertySplit: true
            }
        }
    });

    def.skinParts({
        'title':{type: 'htmlElement', 'optional': true},
        'desc':{type: 'htmlElement', 'optional': true},
        'desc2':{type: 'htmlElement', 'optional': true}
    });

    def.inherits('core.components.base.BaseComp');

    def.methods({
        initialize: function(compId, viewNode, args){
            if(args){
                this._messageToUser = args.messageToUserObj;
            }
            viewNode.removeAttribute('class');
            this.__oldSkin = viewNode.get('skin');
            this.__oldStyleId = viewNode.get('styleid');
            this.__oldCompId =  viewNode.get('comp');
            this.parent(compId, viewNode, args);
        },

        setSkin: function (skin) {
            this.parent(skin);
            this.$view.setAttribute('skin', this.__oldSkin);
            this.$view.setAttribute('styleid', this.__oldStyleId);
            this.$view.setAttribute('comp', this.__oldCompId);
        },

        _onRender: function(evData){
            var invalidations = evData.data.invalidations;
            if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE])) {
                if(this._messageToUser){
                    this._setTextsFromArgs();
                } else if(this.resources.W.Config.env.$isEditorViewerFrame && this.resources.W.Config.env.isInIframeInEditor()){
                    this._setTextsFromResources(window.top.W.Resources);
                }
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.WIDTH_REQUEST, this.INVALIDATIONS.HEIGHT_REQUEST, this.INVALIDATIONS.FIRST_RENDER])) {
                var dims = this.getRequestDimensions();
                this.$view.setStyles({'width': dims.width + 'px', 'height': dims.height + 'px'});
            }
        },

        _setTextsFromArgs: function(){
            this._skinParts.title && this._skinParts.title.set('html', this._messageToUser.title);
            this._skinParts.desc && this._skinParts.desc.set('html', this._messageToUser.desc1);
            this._skinParts.desc2 && this._skinParts.desc2.set('html', this._messageToUser.desc2);
        },

        _setTextsFromResources: function(editorResources){
            this._skinParts.title && this._skinParts.title.set('html', editorResources.get('EDITOR_LANGUAGE', 'COMP_DeadComponent_TITLE', 'Restoring This Element isn’t Possible.'));
            this._skinParts.desc && this._skinParts.desc.set('html', editorResources.get('EDITOR_LANGUAGE', 'COMP_DeadComponent_DESC', 'Delete it to add something new in its place.'));
            this._skinParts.desc2 && this._skinParts.desc2.set('html', editorResources.get('EDITOR_LANGUAGE', 'COMP_DeadComponent_DESC2', '*Site visitors won’t see this message.'));
        },

        isDataTypeValid: function(){
            return true;
        },
        isDuplicatable: function() {
            return false;
        }

    });
});