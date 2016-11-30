define(['lodash', 'core', 'santaProps', 'utils', 'imageClientApi', 'image'], function (_, core, santaProps, utils, imageClientApi, image) {
    'use strict';

    var mixins = core.compMixins;

    function completeTransition(options) {
        options.component.setState({
            '$prepare': options.preTransitionClass
        });

        utils.animationFrame.request(function() {
            if (options.component.isMounted()) {
                options.component.setState(options.state);
            }
        });
    }

    function touch(component) {
        if (component.state.$pressed) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_dah",
            state: {$pressed: 'pressed'}
        });
    }

    function untouch(component) {
        if (!component.state.$pressed) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_adh",
            state: {
                $pressed: '',
                $hovered: ''
            }
        });
    }

    function hover(component) {
        if (component.state.$hovered) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_dha",
            state: {$hovered: 'hovered'}
        });
    }

    function unhover(component) {
        if (component.state.$pressed) {
            untouch(component);
            return;
        }

        if (!component.state.$hovered) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_hda",
            state: {$hovered: ''}
        });
    }

    function press(component) {
        if (component.state.$pressed) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_had",
            state: {$pressed: 'pressed'}
        });
    }

    function unpress(component) {
        if (!component.state.$pressed) {
            return;
        }

        completeTransition({
            component: component,
            preTransitionClass: "prepare_ahd",
            state: {$pressed: ''}
        });
    }

    function getImageSkinProperties(component, imageRefName) {
        var imageData = component.props.compData[imageRefName];

        if (!imageData) {
            return {};
        }

        imageData = _.assign({alt: component.props.compData.alt}, imageData);

        var props = {
            ref: imageRefName,
            skinPart: imageRefName,
            imageData: imageData,
            containerWidth: component.props.style.width,
            containerHeight: component.props.style.height,
            displayMode: imageClientApi.fittingTypes.LEGACY_FULL
        };

        return component.createChildComponent(
            imageData,
            'core.components.Image', imageRefName,
            props
        );
    }

    function getLinkSkinProperties(component, options) {
        var linkData = {};

        if (options.linkRef) {
            linkData = options.linkRef;
            linkData = utils.linkRenderer.renderLink(linkData, options.linkRenderInfo, options.rootNavigationInfo);
        }

        linkData.title = options.title;
        linkData.style = {
            width: component.props.style.width,
            height: component.props.style.height
        };

        return linkData;
    }

    /**
     * @class components.ImageButton
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    var ImageButton = {
        displayName: 'ImageButton',
        mixins: [
            mixins.timeoutsMixin,
            mixins.skinBasedComp
        ],

        propTypes: _.assign({
            compData: santaProps.Types.Component.compData,
            compProp: santaProps.Types.Component.compProp,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo,
            style: santaProps.Types.Component.style,
            windowFocusEvents: santaProps.Types.SiteAspects.windowFocusEvents
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),

        statics: {
            useSantaTypes: true
        },

        getInitialState: function(){
            this.blurEventAspect = this.props.windowFocusEvents;
            this.blurEventAspect.registerToFocusEvent('blur', this);

            return {
                $opacity: 'supports_opacity',
                $transition: 'transition_' + this.props.compProp.transition,
                $prepare: '',
                $hovered: '',
                $pressed: ''
            };
        },
        getSkinProperties: function() {
            var self = this,
                rootElementProps = {
                    onMouseEnter: function () {
                        hover(self);
                    },
                    onMouseLeave: function () {
                        unhover(self);
                    },
                    onMouseDown: function () {
                        press(self);
                    },
                    onMouseUp: function () {
                        unpress(self);
                    },
                    onDragStart: function (e) {
                        e.preventDefault();
                    },
                    onTouchStart: function () {
                        touch(self);
                    },
                    onTouchEnd: function () {
                        untouch(self);
                    },
                    onTouchMove: function () {
                        if (!self.state.$pressed) {
                            return;
                        }

                        self.setTimeout(rootElementProps.onTouchEnd, 500);
                    },
                    onTouchCancel: function () {
                        untouch(self);
                    },
                    onClick: function () {
                        untouch(self);
                    },
                    onPointerDown: function () {
                        touch(self);
                    },
                    onPointerOut: function () {
                        untouch(self);
                    }
                };

            return {
                '': rootElementProps,
                defaultImage: getImageSkinProperties(self, 'defaultImage'),
                hoverImage: getImageSkinProperties(self, 'hoverImage'),
                activeImage: getImageSkinProperties(self, 'activeImage'),
                link: getLinkSkinProperties(self, {
                    linkRef: self.props.compData.link,
                    title: self.props.compData.alt,
                    linkRenderInfo: self.props.linkRenderInfo,
                    rootNavigationInfo: self.props.rootNavigationInfo
                })
            };
        },

        onBlur: function() {
            unhover(this);
        },

        componentWillUnmount: function() {
            this.blurEventAspect.unregisterFromFocusEvent('blur', this);
        }
    };

    return ImageButton;
});
