define(['lodash'], function (_) {
    "use strict";

    var defaultAnimationParams = {
        duration: {
            type: 'number',
            min: 0,
            max: 4,
            step: 0.05
        },
        delay: {
            type: 'number',
            min: 0,
            max: 4,
            step: 0.1
        }
    };

    var animationsParams = {
        general: [
            {
                name: 'Fade',
                groups: ['animation'],
                params: {}
            },
            {
                name: 'Position',
                groups: ['animation'],
                params: {}
            },
            {
                name: 'Rotate',
                groups: ['animation'],
                params: {}
            },
            {
                name: 'Scale',
                groups: ['animation'],
                params: {}
            }
        ],
        in: [
            // In Animations, duration and delay are set from the default
            {
                name: 'ArcIn',
                groups: ['3d', 'entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['right', 'left']
                    }
                }
            },
            {
                name: 'DropIn',
                groups: ['entrance', 'animation'],
                params: {}
            },
            {
                name: 'ExpandIn',
                groups: ['entrance', 'animation'],
                params: {}

            },
            {
                name: 'FadeIn',
                groups: ['entrance', 'animation'],
                params: {}
            },
            {
                name: 'FlipIn',
                groups: ['3d', 'entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'FloatIn',
                groups: ['entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'FlyIn',
                groups: ['entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'top left', 'top right', 'left', 'bottom', 'bottom left', 'bottom right', 'right']
                    }
                }
            },
            {
                name: 'FoldIn',
                groups: ['3d', 'entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'Reveal',
                groups: ['mask', 'entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'center', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'SlideIn',
                groups: ['mask', 'entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'SpinIn',
                groups: ['entrance', 'animation'],
                params: {
                    cycles: {
                        type: 'number',
                        min: 1,
                        max: 15,
                        step: 1
                    },
                    direction: {
                        type: 'list',
                        list: ['cw', 'ccw']
                    }
                }
            },
            {
                name: 'TurnIn',
                groups: ['entrance', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['right', 'left']
                    }
                }
            },
            {
                name: 'BounceIn',
                groups: ['entrance', 'animation'],
                params: {
                    bounce: {
                        type: 'list',
                        list: ['soft', 'medium', 'hard']
                    },
                    direction: {
                        type: 'list',
                        list: ['top left', 'top right', 'center', 'bottom right', 'bottom left']
                    }
                }
            },
            {
                name: 'GlideIn',
                groups: ['entrance', 'animation'],
                params: {
                    angle: {
                        type: 'angle'
                    },
                    distance: {
                        type: 'number',
                        min: 0,
                        max: 300,
                        step: 1
                    }
                }
            }
        ],
        out: [
            // Out Animations, duration and delay are set from the default
            {
                name: 'ArcOut',
                groups: ['3d', 'exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['right', 'left']
                    }
                }
            },
            {
                name: 'PopOut',
                groups: ['exit', 'animation'],
                params: {}
            },
            {
                name: 'CollapseOut',
                groups: ['exit', 'animation'],
                params: {}

            },
            {
                name: 'FadeOut',
                groups: ['exit', 'animation'],
                params: {}
            },
            {
                name: 'FlipOut',
                groups: ['3d', 'exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'FloatOut',
                groups: ['exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'FlyOut',
                groups: ['exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'top left', 'top right', 'left', 'bottom', 'bottom left', 'bottom right', 'right']
                    }
                }
            },
            {
                name: 'FoldOut',
                groups: ['3d', 'exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'Conceal',
                groups: ['mask', 'exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'center', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'SlideOut',
                groups: ['mask', 'exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top', 'right', 'bottom', 'left']
                    }
                }
            },
            {
                name: 'SpinOut',
                groups: ['exit', 'animation'],
                params: {
                    cycles: {
                        type: 'number',
                        min: 1,
                        max: 15,
                        step: 1
                    },
                    direction: {
                        type: 'list',
                        list: ['cw', 'ccw']
                    }
                }
            },
            {
                name: 'TurnOut',
                groups: ['exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['right', 'left']
                    }
                }
            },
            {
                name: 'BounceOut',
                groups: ['exit', 'animation'],
                params: {
                    direction: {
                        type: 'list',
                        list: ['top left', 'top right', 'center', 'bottom right', 'bottom left']
                    },
                    bounce: {
                        type: 'list',
                        list: ['soft', 'medium', 'hard']
                    }
                }
            },
            {
                name: 'GlideOut',
                groups: ['exit', 'animation'],
                params: {
                    angle: {
                        type: 'angle'
                    },
                    distance: {
                        type: 'number',
                        min: 0,
                        max: 300,
                        step: 1
                    }
                }
            }
        ],
        background: [
            // Background parallax animations
            // TODO: deprecated
            {
                name: 'ContainerFixedBg',
                groups: ['animation', 'background'],
                params: {}
            },
            // ----------------
            {
                name: 'BackgroundReveal',
                groups: ['animation', 'background'],
                params: {}
            },
            {
                name: 'BackgroundParallax',
                groups: ['animation', 'background'],
                params: {}
            },
            {
                name: 'BackgroundZoom',
                groups: ['animation', 'background'],
                params: {}
            },
            {
                name: 'BackgroundFadeIn',
                groups: ['animation', 'background'],
                params: {}
            },
            {
                name: 'BackgroundBlurIn',
                groups: ['animation', 'background'],
                params: {}
            },
            {
                name: 'SiteBackgroundParallax',
                groups: ['animation', 'background'],
                params: {}
            }],
        modes: [
            // Modes animations
            {
                name: "ModesMotion",
                groups: ['entrance', 'animation']
            }
        ]
    };

    function getAnimationSchemas(animations, defaults) {
        var schemas = [];
        _.forEach(animations, function (type) {
            schemas = schemas.concat(
                _.map(type, function (item) {
                    var newItem = _.cloneDeep(item);
                    newItem.type = 'animation';
                    newItem.params = newItem.params || {};
                    if (_.includes(newItem.groups, 'animation')) {
                        _.defaults(newItem.params, defaults);
                    }
                    return newItem;
                })
            );
        });

        return schemas;
    }

    var animations = getAnimationSchemas(animationsParams, defaultAnimationParams);

    var widgetsBehaviorsSchemas = [
        {
            type: 'widget',
            name: 'runCode',
            params: {
                callbackId: '',
                compName: ''
            }
        },
        {
            type: 'widget',
            name: 'runAppCode',
            params: {
                callbackId: '',
                compName: ''
            }
        }
    ];

    var siteBehaviorsSchemas = [
        {
            type: 'site',
            name: 'openPopup',
            params: {
                delay: 2,
                openInDesktop: true,
                openInMobile: false
            }
        }, {
            type: 'site',
            name: 'prefetchPages',
            params: {
                prefetchFilters: {}
            }
        }];

    return widgetsBehaviorsSchemas.concat(siteBehaviorsSchemas, animations);
});
