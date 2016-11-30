/**
 * @class wysiwyg.editor.components.richtext.ComponentToolBar
 */
define.component('wysiwyg.editor.components.richtext.ComponentToolBar', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.richtext.BaseRichTextToolBar');

    def.resources(['W.Preview', 'W.Resources']);

    def.traits(["wysiwyg.viewer.components.traits.VideoUtils"]);

    def.utilize([
        'wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTImageCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTVideoUrlCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTImageAltCommand'
    ]);

    def.statics({
        controllersDataInfo: {
            componentSize:  {dataQuery: '#CK_EDITOR_COMPONENT_SIZE', command: 'wixComp.size', toolTipKey: 'TOOLBAR_COMPONENT_SIZE', className: 'RTDropDownCommand', isFixedMenu: true, defaultValue: 'default'},
            videoComponentSize:  {dataQuery: '#CK_EDITOR_VIDEO_COMPONENT_SIZE', command: 'wixComp.video.size', toolTipKey: 'TOOLBAR_COMPONENT_SIZE', className: 'RTDropDownCommand', isFixedMenu: true, defaultValue: 'default'},
            alignLeft:      {command: 'wixComp.justify.left', defaultValue: 1,   toolTipKey: 'TOOLBAR_COMPONENT_ALIGN_LEFT',   className: 'RTDualCommand'},
            alignCenter:    {command: 'wixComp.justify.center', defaultValue: 1, toolTipKey: 'TOOLBAR_COMPONENT_ALIGN_CENTER', className: 'RTDualCommand'},
            alignRight:     {command: 'wixComp.justify.right', defaultValue: 1,  toolTipKey: 'TOOLBAR_COMPONENT_ALIGN_RIGHT',  className: 'RTDualCommand'},
            wixImage:       {command: 'wixComp.url', toolTipKey: 'TOOLBAR_COMPONENT_CHANGE_IMAGE', className: 'RTImageCommand'},
            inputUrl:       {command: 'wixComp.video.url', toolTipKey: 'TOOLBAR_COMPONENT_URL', className: 'RTVideoUrlCommand'},
            imageAlt:       {command: 'wixComp.image.alt', toolTipKey: 'TOOLBAR_COMPONENT_ALT_HOVER', className: 'RTImageAltCommand'},
            deleteImage:    {command: 'wixComp.delete', defaultValue: 1,  toolTipKey: 'TOOLBAR_COMPONENT_DELETE',  className: 'RTDualCommand'}
        }
    });

    def.skinParts({
        componentSize: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton'},
                selectionOption: 0,
                hasInput: true
            }
        },
        videoComponentSize: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton'},
                selectionOption: 0,
                hasInput: true
            }
        },
        alignLeft:   {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: 0}, iconSrc: 'richtext/compaligndrop.png'}},
        alignCenter: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: -16, y: 0}, iconSrc: 'richtext/compaligndrop.png'}},
        alignRight:  {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: -32, y: 0},   iconSrc: 'richtext/compaligndrop.png'}},
        deleteImage: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: 0},   iconSrc: 'richtext/trash.png'}},
        wixImage:    {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:'TOOLBAR_COMPONENT_CHANGE_IMAGE'},
        inputUrl:    {type: 'wysiwyg.viewer.components.inputs.TextInput', 'hookMethod': '_urlHookMethod', argObject: {shouldRenderOnDisplay: true}},
        imageAlt:    {type: 'wysiwyg.viewer.components.inputs.TextInput', 'hookMethod': '_altHookMethod', argObject: {shouldRenderOnDisplay: true}}
    });

    def.states({
        componentTypeStates:['image', 'video']
    });

    def.methods({

        _urlHookMethod: function (definition) {
            definition.dataItem = this.resources.W.Data.createDataItem({'text': '', 'type':'Text'}, 'Text');
            return definition;
        },
        _altHookMethod: function (definition) {
            definition.dataItem = this.resources.W.Data.createDataItem({'text': '', 'type':'Text'}, 'Text');
            return definition;
        },
        _onAllSkinPartsReady: function () {
            //we do it here because we need to wait for the viewer for this
            this._initializeControllers(this.controllersDataInfo, this._skinParts);
            this._skinParts.imageAltLabel.textContent = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TOOLBAR_COMPONENT_ALT', 'Alt Text') + ":";
            this._skinParts.imageAlt.setPlaceholder(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TOOLBAR_COMPONENT_ALT_OPTIONAL', '(optional)'));
            this._skinParts.inputUrl.setPlaceholder(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TOOLBAR_COMPONENT_URL', '(optional)'));
            this._skinParts.wixImage._skinParts.label.setStyle('font-size', '12px');

            /* next lines whould be moved to skins with param mapper - done like this because of time issue*/
            this._skinParts.inputUrl._skinParts.input.setStyle('width', 'inherit');
            this._skinParts.imageAltLabel.setStyle('margin-left', '8px');
            this._skinParts.wixImage.$view.setStyle('margin-right', '8px');
            this._skinParts.alignLeft.$view.setStyle('margin-left', '8px');
            this._skinParts.videoComponentSize.$view.setStyle('margin-left', '8px');
        },
        show: function(componentData) {
            var dataItem,
                videoUrl;

            this._startControllersListeners();

            this.$view.uncollapse();
            this._skinParts['transitionToolbar'].style.left = '0';
            this.setTimeout(function(){
                this._skinParts['slidingWrapper'].style.overflow = 'visible';
                //TODO remove ugly hack and use transition end when we have framework
                //Or when we have dropdowns in a different layer we dont need to return overflow!
            }.bind(this), 500);

            Object.forEach(this._controllerInstances, function(controllerInstance){
                controllerInstance.refreshState();
            }, this);

            dataItem = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#" + componentData.dataQuery);
            if (componentData.componentType === "wysiwyg.viewer.components.Video") {
                this.setState('video', 'componentTypeStates');
                videoUrl = this._getVideoUrlFromVideoData(dataItem.getData());
                this._skinParts.inputUrl.setTextContent(videoUrl);
                this._controllerInstances.inputUrl.setDataItem(dataItem);
            } else if (componentData.componentType === "wysiwyg.viewer.components.WPhoto") {
                this.setState('image', 'componentTypeStates');
                this._skinParts.imageAlt.setTextContent(dataItem.get('alt'));
                this._controllerInstances.imageAlt.setDataItem(dataItem);
            } else {
                //todo BI Error
                console.log("unknown component");
            }
        },
        hide: function() {
            this.stopEditing(true);

            this._skinParts['transitionToolbar'].style.left = '570px';
            this._skinParts['slidingWrapper'].style.overflow = 'hidden';
            this.setTimeout(function(){
                this.$view.collapse(); //TODO remove ugly hack and use transition end when we have framework
            }.bind(this), 500);
        }
    });
});
