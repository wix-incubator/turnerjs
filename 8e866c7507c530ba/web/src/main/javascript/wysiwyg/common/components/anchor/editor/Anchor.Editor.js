define.component('Editor.wysiwyg.common.components.anchor.viewer.Anchor', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    var strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.anchor.editor.AnchorPanel',
        skin: 'wysiwyg.common.components.anchor.editor.skins.AnchorPanelSkin'
    });

    def.binds(strategy.merge(['_onEditModeChange']));

    def.resources(strategy.merge(['W.Commands']));

    def.statics({
        _resizableSides: [],
        _moveDirections: [Constants.BaseComponent.MoveDirections.VERTICAL],
        _BUTTON_WIDTH: 122,
        _RULERS_ON: false,
        _MOBILE_PREFIX: 'mobile_',
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21781'
    });

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            /**@type wysiwyg.common.utils.AnchorManager*/
            this._anchorManager = this.resources.W.Viewer.getAnchorManager();
            this._sizeLimits = {
                minH: 21,
                minW: 0,
                maxH: 21,
                maxW: 999999
            };
        }),
        _onRender: strategy.after(function (renderEvent) {
                var invalidations = renderEvent.data.invalidations,
                    data = this.getDataItem();

                if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                    this._setCompSize();
                    this._anchorManager.increaseNumberOfAnchors();
                    this._moveDirections = [Constants.BaseComponent.MoveDirections.VERTICAL];

                    if(this._isNewAnchor()){
                        this.resources.W.Commands.executeCommand("WEditorCommands.ShowAnchorDialog", {compId: this.getComponentUniqueId()}, this);
                        data.set('name', this._generateAnchorName());
                        data.set('compId', this.getComponentId());
                    }
                }

                if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                    this._skinParts.anchorName.set('text', data.get('name'));
                }
            }
        ),
        _onEditModeChange: function (mode, oldMode) {
            this._setCompSize();
            this._toggleVisibility();
        },
        /**
         * Prevent component from moving horizontally
         * @param requestedX
         */
        setX: function(requestedX){
            return;
        },
        /**
         * Since the component is taking the full width of the screen,
         * Its X position should always be 0.
         * */
        getX: function(){
            return 0;
        },
        getSelectableWidth: function(){
            return this._BUTTON_WIDTH;
        },
        getSelectableX: function () {
            var docWidth = parseInt(this.resources.W.Viewer.getDocWidth(), 10),
                clientWidth = document.body.clientWidth;

            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                return docWidth - this.getSelectableWidth()- this._getRulerWidth();
            } else if(clientWidth < docWidth){
                return clientWidth - this.getSelectableWidth() - this._getRulerWidth();
            } else {
                return docWidth + (clientWidth - docWidth) * 0.5 - this.getSelectableWidth() - this._getRulerWidth();
            }
        },
        /**
         * Returns true if the anchor is new, and false otherwise.
         * What qualifies as a "new" anchor?
         * 1. Anchor which was added from the menu.
         * 2. Anchor which was copied.
         *
         * The reason for this mechanism is that when you
         * copy a component (not just anchors, but any kind of component),
         * It is generated with the same data from the original component.
         * Since we consider a copied anchor to be a new anchor,
         * we simply compare it's real id with the id associated in its data.
         *
         * @returns {boolean}
         * @private
         */
        _isNewAnchor: function(){
            return this.getDataItem().get('compId') !== this.getComponentId();
        },
        _generateAnchorName: function(){
            return "Anchor " + this._anchorManager.getNumberOfAnchors();
        },
        /*_onRulersToggle: function(state){
            this._RULERS_ON = state;
            this._setCompSize();
        },*/
        _getRulerWidth: function(){
            if(this.resources.W.Config.env.isViewingSecondaryDevice()/* || !this._RULERS_ON*/){
                return 3;
            }

            return 23;
        },
        _registerEvents: strategy.after(function(){
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);
            this.resources.W.Commands.registerCommandAndListener("WPreviewCommands.ViewerStateChanged", this, this._onEditModeChange);
        }),
        _unregisterEvents: strategy.after(function(){
            this.resources.W.Commands.unregisterListener(this._onEditModeChange);
        })
    });

});