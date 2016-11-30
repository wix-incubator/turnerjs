define.Class('wysiwyg.editor.layoutalgorithms.LayoutAlgoConfig', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands']);

    def.statics({
        MOBILE_WIDTH: 320,
        COMPONENT_MOBILE_MARGIN_Y: 10,
        COMPONENT_MOBILE_MARGIN_X: 10,
        SITE_SEGMENT_PADDING_X: 20,
        TINY_MENU_SIZE: 50,
        TEXT_MAX_LENGTH_FOR_RESCALING: 25,
        COMPONENTS_NOT_RECOMMENDED_FOR_MOBILE: ['wysiwyg.viewer.components.VerticalLine', 'wysiwyg.viewer.components.FlashComponent', 'wysiwyg.viewer.components.EbayItemsBySeller'],

        COMPONENTS_NOT_NEED_TO_RESCALE_HEIGHT: [
            "wysiwyg.viewer.components.MatrixGallery",
            "wysiwyg.viewer.components.SliderGallery",
            'wysiwyg.viewer.components.ScreenWidthContainer',
            'wysiwyg.viewer.components.BgImageStrip',
            'wysiwyg.viewer.components.PaginatedGridGallery',
            'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton',
            'wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow'
        ],

        VISUAL_COMPONENTS: [
            'wysiwyg.viewer.components.WPhoto',
            'mobile.core.components.Container',
            'wysiwyg.viewer.components.SlideShowGallery',
            "wysiwyg.viewer.components.MatrixGallery",
            "wysiwyg.viewer.components.SliderGallery",
            'wysiwyg.viewer.components.PaginatedGridGallery',
            'wysiwyg.viewer.components.Video'
        ],

        COMPONENTS_NEED_RESCALING_TO_SPECIFIC_HEIGHT: {
            "wysiwyg.viewer.components.GoogleMap": 240
        },
        COMPONENTS_NEED_RESCALING_TO_FIT_RESERVED_SPACE: [
            "wysiwyg.viewer.components.WRichText",
            "VIRTUAL_GROUP"
//            "wysiwyg.viewer.components.SiteButton"
        ],

        NON_MOBILE_COMPONENTS: [
            'wysiwyg.viewer.components.menus.DropDownMenu',
            'wysiwyg.viewer.components.HorizontalMenu',
            'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu'
        ],

        COMPONENTS_TAKE_FULL_CONTAINER_WIDTH: [
            'wysiwyg.viewer.components.HeaderContainer',
            'wysiwyg.viewer.components.FooterContainer'
        ],

        COMPONENTS_NOT_SUITABLE_FOR_PROPORTION_GROUPING: [
            'wysiwyg.viewer.components.ScreenWidthContainer',
            'wysiwyg.viewer.components.BgImageStrip',
            'wysiwyg.viewer.components.FiveGridLine'
        ],

        SCREEN_WIDTH_COMPONENTS: [
            'wysiwyg.viewer.components.ScreenWidthContainer',
            'wysiwyg.viewer.components.BgImageStrip'
        ],

        PAGE_COMPONENTS: [
            'mobile.core.components.Page',
            'wixapps.integration.components.AppPage'
        ],
        ANCHOR_LOCK_THRESHOLD: 70

    });

    def.methods({

        initialize: function(modules) {
            this._classNameToExtraOperationMapper = {};
            this._componentMobileValidityMapper = {};
            this._componentMobileRecommendedMapper = {};
            this._isSuitableForProportionGroupingMapper = {};
            this._marginFromContainerMapper = {};
            this._dimensionCalculatorMapper = {};

            this._registerSpecialClassNames();
            this._registerCommands();
        },

        _registerSpecialClassNames: function() {
            var i;
            for (i=0;i<this.NON_MOBILE_COMPONENTS.length; i++) {
                this.registerClassNameToLayoutAlgo({
                    className: this.NON_MOBILE_COMPONENTS[i],
                    isMobileFunc: function() {return false;}
                });
            }
            for (i=0;i<this.COMPONENTS_NOT_RECOMMENDED_FOR_MOBILE.length; i++) {
                this.registerClassNameToLayoutAlgo({
                    className: this.COMPONENTS_NOT_RECOMMENDED_FOR_MOBILE[i],
                    isMobileRecommendedFunc: function() {return false;}
                });
            }
            for (i=0;i<this.COMPONENTS_TAKE_FULL_CONTAINER_WIDTH.length; i++) {
                this.registerClassNameToLayoutAlgo({
                    className: this.COMPONENTS_TAKE_FULL_CONTAINER_WIDTH[i],
                    setMarginFromContainerFunc: function() {return 0;}
                });
            }
            for (i=0;i<this.COMPONENTS_NOT_SUITABLE_FOR_PROPORTION_GROUPING.length; i++) {
                this.registerClassNameToLayoutAlgo({
                    className: this.COMPONENTS_NOT_SUITABLE_FOR_PROPORTION_GROUPING[i],
                    isSuitableForProportionGroupingFunc: function() {return false;}
                });
            }
        },

        _registerCommands: function() {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.RegisterClassNameToLayoutAlgo", this, this.registerClassNameToLayoutAlgo);
        },

        registerClassNameToLayoutAlgo: function(params) {
            if (params.extraOperationsFunc) {
                this._registerExtraOperationsForComponentClassName(params);
            }
            if (params.isMobileFunc) {
                this._registerIsMobileComponentFunction(params);
            }
            if (params.isSuitableForProportionGroupingFunc) {
                this._registerIsSuitableForProportionGroupingFunction(params);
            }
            if (params.setMarginFromContainerFunc) {
                this._registerMarginFromContainerFunction(params);
            }
            if (params.dimensionCalculatorFunc) {
                this._registerDimensionCalculatorFunction(params);
            }
            if(params.isMobileRecommendedFunc){
                this._registerIsMobileRecommendedComponentFunction(params);
            }
        },

        _registerExtraOperationsForComponentClassName: function(params) {
            if (!this._classNameToExtraOperationMapper[params.className]) {
                this._classNameToExtraOperationMapper[params.className] = [];
            }

            this._classNameToExtraOperationMapper[params.className].push(params.extraOperationsFunc);
        },

        _registerIsMobileComponentFunction: function(params) {
            this._componentMobileValidityMapper[params.className] = params.isMobileFunc;
        },

        _registerIsMobileRecommendedComponentFunction: function(params) {
            this._componentMobileRecommendedMapper[params.className] = params.isMobileRecommendedFunc;
        },

        _registerIsSuitableForProportionGroupingFunction: function(params) {
            this._isSuitableForProportionGroupingMapper[params.className] = params.isSuitableForProportionGroupingFunc;
        },

        _registerMarginFromContainerFunction: function(params) {
            this._marginFromContainerMapper[params.className] = params.setMarginFromContainerFunc;
        },

        _registerDimensionCalculatorFunction: function(params) {
            this._dimensionCalculatorMapper[params.className] = params.dimensionCalculatorFunc;
        },

        getOverrideDimension: function(component) {
            var dimensionCalculatorFunc = this._dimensionCalculatorMapper[component.componentType];
            if (dimensionCalculatorFunc) {
                return dimensionCalculatorFunc(component);
            }
            return null;
        },

        activateExtraOperationsForComponentClassName: function(component, addedComponentListOnMerge) {
            var isNewComponent;
            if (!addedComponentListOnMerge) { //conversion algorithm
                isNewComponent = true;
            }
            else {
                isNewComponent = (addedComponentListOnMerge.contains(component.id));
            }

            if (component.id) {
                var className = component.componentType;
                if (this._classNameToExtraOperationMapper[className]) {
                    for (var i=0; i<this._classNameToExtraOperationMapper[className].length; i++) {
                        this._classNameToExtraOperationMapper[className][i](_.clone(component), isNewComponent);
                    }
                }
            }

            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length; i++ ) {
                    this.activateExtraOperationsForComponentClassName(children[i], addedComponentListOnMerge);
                }
            }
        },

        isMobileComponent: function(component) {
            return !this.isNonMobileComponent(component);
        },

        isNonMobileComponent: function(component) {
            var isComponentMobileFunc = this._componentMobileValidityMapper[component.componentType];
            if (isComponentMobileFunc) {
                return !isComponentMobileFunc(component);
            }
            return false;
        },

        isNonMobileRecommendedComponent: function(component) {
            var isComponentMobileRecommendedFunc = this._componentMobileRecommendedMapper[component.componentType];
            if (isComponentMobileRecommendedFunc) {
                return !isComponentMobileRecommendedFunc(component);
            }
            return false;
        },

        isSuitableForProportionGrouping: function(component) {
            var isSuitableForProportionMappingFunc = this._isSuitableForProportionGroupingMapper[component.componentType];
            if (isSuitableForProportionMappingFunc) {
                return isSuitableForProportionMappingFunc(component);
            }
            return true;
        },

        getOverrideMarginFromContainer: function(component) {
            var marginFromContainerFunc = this._marginFromContainerMapper[component.componentType];
            if (marginFromContainerFunc) {
                return marginFromContainerFunc();
            }
            return undefined;
        }
    });


});
//