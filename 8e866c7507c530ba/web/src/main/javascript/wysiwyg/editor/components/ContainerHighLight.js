define.component('wysiwyg.editor.components.ContainerHighLight', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Editor']);

    def.binds(['_fitToContainer']);
    def.skinParts({
        outline: { 'type': 'htmlElement'},
        label: { 'type': 'htmlElement'}
    });
    def.states({'componentScope': ['page', 'master'], 'highlightAllWidth': ['enabled'], 'highlightContainerType': ['attachToContainer', 'parentContainer'] });
    def.methods({
        initialize: function (compId, viewNode, args) {
            args = args || {} ;
            if (args.highlightContainerType === 'parentContainer'){
                this.resources.W.Editor.registerEditorComponent('parentContainerHighlight', this);

            } else {
                this.resources.W.Editor.registerEditorComponent('containerHighlight', this);
            }
            this._siteBody = $$("body");
            this._previewManager = this.injects().Preview;
            this._highlightContainerType = args.highlightContainerType;

            //Super
            this.parent(compId, viewNode, args);
        },

        /**
         * When skin is ready tell Preview Manager to inject the preview site IFrame into
         * the site container skin part. This allows for preview skin to be replaced without reloading
         * the site.
         */
        _onAllSkinPartsReady: function () {

            this.setState(this._highlightContainerType == "parentContainer" ? "parentContainer" : 'attachToContainer', 'highlightContainerType');

            this.collapse();
            //            this._skinParts.label.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_ATTACH'));
        },

        highlightComponent: function (containerObj) {
            this._highlightedComponent = containerObj;

            if (containerObj) {
                this._skinParts.label.set('text', this._getAttachText(containerObj.logic));
                this._highlightContainer();
                this.uncollapse();
            } else {
                this.collapse();
            }
        },

        _highlightContainer: function () {

            //            console.log(this.getState("parentContainer"));

            var editor = this.injects().Editor;
            if (editor.getComponentScope(this._highlightedComponent.htmlNode) === editor.EDIT_MODE.MASTER_PAGE) {
                this.setState('master', 'componentScope');
            }
            else {
                this.setState('page', 'componentScope');
            }

            this._fitToContainer();
        },

        _getAttachText: function (containerLogic) {

            var containerType = this._highlightContainerType == "parentContainer" ? "PARENT" : "ATTACH";

            if (containerLogic.isInstanceOfClass('wysiwyg.viewer.components.HeaderContainer')) {
                return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_HEADER');
            }

            if (containerLogic.isInstanceOfClass('wysiwyg.viewer.components.FooterContainer')) {
                return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_FOOTER');
            }

            if (containerLogic.isInstanceOfClass('core.components.Page')) {
                return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_PAGE');
            }

            if (containerLogic.isInstanceOfClass('wysiwyg.viewer.components.ScreenWidthContainer')) {
                return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_STRIP');
            }

            if (containerLogic.isInstanceOfClass('core.components.Container')) {
                return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_CONTAINER');
            }


            return this.injects().Resources.get('EDITOR_LANGUAGE', 'CONTAINER_HIGHLIGHT_' + containerType + '_FALLBACK');
        },

        _getEditedComponentExtraPixel: function () {
            //Get extra pixel, assuming padding and margins are set in pixel
            var extras = this._highlightedComponent.getViewNode().getStyles("padding-top", "padding-bottom", "margin-top", "margin-bottom");
            var extraPixel = 0;
            for (var i in extras) {
                extraPixel += Number.from(extras[i]);
            }

            return extraPixel;
        },

        _fitToContainer: function () {
            var highlightAllWidth = this._highlightedComponent.logic.isInstanceOfClass('wysiwyg.viewer.components.ScreenWidthContainer') || this._highlightedComponent.logic.isInstanceOfClass('core.components.Page');

            if (highlightAllWidth) {
                this.setState('enabled', 'highlightAllWidth');
            }
            else {
                if (this.getState('highlightAllWidth')) {
                    this.removeState('enabled', 'highlightAllWidth');
                }
            }

            this.setX(highlightAllWidth ? 0 : this._highlightedComponent.x - 5);
            this.setY(this._highlightedComponent.y - 5);

            // we take off 4 pixels from the width, because the border is 2px on each side (see skin)
            this._skinParts.outline.setStyles({width: highlightAllWidth ? window.getSize().x - 4 : this._highlightedComponent.width + 5, height: this._highlightedComponent.height + 5});
        }
    });
});
