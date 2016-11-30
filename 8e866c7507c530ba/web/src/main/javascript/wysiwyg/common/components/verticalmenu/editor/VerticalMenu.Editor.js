define.component('Editor.wysiwyg.common.components.verticalmenu.viewer.VerticalMenu', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    var strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.verticalmenu.editor.VerticalMenuPanel',
        skin: 'wysiwyg.common.components.verticalmenu.editor.skins.VerticalMenuPanelSkin'
    });

    def.helpIds({
        componentPanel: '/node/21350',
        advancedStyling: '/node/21350',
        chooseStyle: '/node/21350'
    });

    def.styles(1);

    def.traits(['wysiwyg.common.components.verticalmenu.editor.traits.MenuDataHandler']);

    def.resources(['W.Utils', 'W.Commands']);

    def.binds(strategy.merge(['_onEditModeChange']));

    def.statics({
        _compMinWidth: 50,
        _defaultCompHeight: 400,  //This value should be the same in menu.json -> layout section
        EDITOR_META_DATA: {
            general:{
                settings:true,
                design:true
            },
            custom:[
                {
                    label:'FPP_RENAME_PAGES_LABEL',
                    command:'WEditorCommands.PageSettings',
                    commandParameter:{parentPanel: 'pagesPanel'}
                },
                {
                    label:'FPP_NAVIGATE_LABEL',
                    command:'WEditorCommands.Pages'
                }
            ],
            dblClick:{
                command:'WEditorCommands.Pages'
            }
        }
    });

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);
        }),

        /**
         * @override _onRender in component logic when inside the editor
         * @param renderEvent
         * @private
         */
        _onRender: function(renderEvent) {
            this.parent(renderEvent);
            var invalidations = renderEvent.data.invalidations;

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                this._updateComponentAccordingToProperties();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._onFirstRender(invalidations);
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE, this.INVALIDATIONS.HEIGHT_REQUEST])) {
                var currentHeight = this.getHeight();
                var dontRecalculateHeight = (currentHeight === this._defaultCompHeight);
                this._setItemsHeight(dontRecalculateHeight);
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.POSITION])) {
                this._setDirectionToOpenSubMenu();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.STYLE_PARAM_CHANGE, this.INVALIDATIONS.SIZE])) {
                this._forceCssRenderIfNeeded(invalidations);

                this._setSizeLimits(invalidations);
                this._setItemsHeight();
            }
        },

        /**
         * When a style param changes, it doesn't cause a change in params that are calculated
         * according to it. (e.g. with sumParams).
         * This manually checks if such a style-param changed, and then forces the skin's CSS
         * to be re-rendered
         * @param invalidations
         * @private
         */
        _forceCssRenderIfNeeded: function(invalidations) {
            var searchParams = ['SKINS_submenuMargin', 'brw'], // dropdownMarginReal skinParam depends on these params
                styleParamInvalidations = invalidations.getInvalidationByType(this.INVALIDATIONS.STYLE_PARAM_CHANGE);

            if (!styleParamInvalidations) {
                return;
            }

            for (var i=0; i<styleParamInvalidations.length; i++) {
                for (var j=0; j < searchParams.length; j++) {
                    if (styleParamInvalidations[i].properties.hasOwnProperty(searchParams[j])) {
                        this._forceCssRender();
                        return;
                    }
                }
            }
        },

        _forceCssRender: function() {
            var skin = this.getSkin(),
                skinName = skin.$className,
                style = skin.getStyle();

            style.setStyleRenderFlagForSkin(skinName, false);
            skin._renderCss();
        },

        /**
         * Runs once on FIRST_RENDER invalidation
         * @param invalidations
         * @private
         */
        _onFirstRender: function (invalidations) {
            this._sizeLimits = {
                minW: this._compMinWidth,
                minH: this.MINIMUM_HEIGHT_DEFAULT,
                maxW: this.MAXIMUM_WIDTH_DEFAULT,
                maxH: this.MAXIMUM_HEIGHT_DEFAULT
            };

            this._setSizeLimits(invalidations, true);
            this._updateComponentAccordingToProperties();
            this._setDirectionToOpenSubMenu();
        },

        /**
         * Calculates the component minimum width
         * @returns {number}
         * @private
         */
        _getCompMinWidth: function () {
            var borderWidth = this._getSkinParamValue('brw');
            return (this._compMinWidth + 2*borderWidth);
        },

        /**
         * Sets the minimum width of the component
         * @param invalidations
         * @param force
         * @private
         */
        _setSizeLimits: function (invalidations, force) {
            var invalidation = invalidations.getInvalidationByType('styleParamChange') || [];
            var isBorderWidthParamChanged = !!(invalidation[0] && invalidation[0].properties && invalidation[0].properties.brw);
            var shouldSetMinWidth = !!(force || isBorderWidthParamChanged);

            if(shouldSetMinWidth) {  //Do it only on first render or when brw (border width) is changed
                this._sizeLimits.minW = this._getCompMinWidth();
            }
        },

        /**
         * Invoked when switching between editor & preview modes.
         * Setting the sub-menu side & direction because the menu might be inside a container and didn't get position change invalidation
         * @param mode
         * @private
         */
        _onEditModeChange: function (mode) {
            if(mode === 'PREVIEW') {
                this._setDirectionToOpenSubMenu();
            }
        }
    });
});