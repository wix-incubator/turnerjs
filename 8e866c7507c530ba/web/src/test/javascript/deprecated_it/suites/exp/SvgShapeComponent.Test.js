testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver');
//testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');
describe("EditorAcceptance:", function () {
    beforeEach(function () {
        window.editor = window.editor || new this.ComponentsDriver();

    });

    describe("shape component", function () {
        var shapeComponent,
            edges = {
                TOP: 'top',
                TOP_RIGHT: 'topRight',
                RIGHT: 'right',
                BOTTOM_RIGHT: 'bottomRight',
                BOTTOM: 'bottom',
                BOTTOM_LEFT: 'bottomLeft',
                LEFT: 'left',
                TOP_LEFT: 'topLeft'
            },
            snapToGridTolerance = 10, //pixels
            addOffset = function (origin, offset) {
                return {
                    x: (origin.x || 0) + (offset.x || 0),
                    y: (origin.y || 0) + (offset.y || 0)
                };
            },
            addOffsetX = function (origin, offset) {
                return {
                    x: (origin.x || 0) + (offset.x || 0),
                    y: origin.y
                };
            },
            addOffsetY = function (origin, offset) {
                return {
                    x: origin.x,
                    y: (origin.y || 0) + (offset.y || 0)
                };
            };

        beforeEach(function () {
            this.addMatchers({
                toBeCloseEnoughTo: function (expectedPosition, tolerance) {
                    return Math.abs(expectedPosition.x - this.actual.x) < tolerance
                        && Math.abs(expectedPosition.y - this.actual.y) < tolerance;
                }
            });

            editor
                .removeComponent(shapeComponent)
                .then(function () {
                    return editor.createComponent('addSvgShape', 'wysiwyg.viewer.components.svgshape.SvgShape');
                })
                .then(function (component) {
                    console.log('beforeach', component.getSize());
                    shapeComponent = component;
                });

            waitsFor(function () {
                return editor.isComponentReady(shapeComponent);
            }, 'shape component to be positioned', 1000);
        });

        describe("general component resizing", function () {
            this.testPositionAfterResize = function (offset, resizeSourceEdge, resizeTargetEdge) {
                it('should be positioned correctly after resizing the component, from the ' + resizeSourceEdge + ' knob towards ' + resizeTargetEdge + '.', function () {
                    var expectedPosition,
                        currentPosition = editor.getElementPosition(shapeComponent),
                        componentResized;

                    switch (resizeSourceEdge) {
                        case edges.TOP:
                        case edges.LEFT:
                        case edges.TOP_LEFT:
                            expectedPosition = addOffset(currentPosition, offset);
                            break;

                        case edges.TOP_RIGHT:
                            expectedPosition = addOffsetY(currentPosition, offset);
                            break;

                        case edges.RIGHT:
                        case edges.BOTTOM:
                        case edges.BOTTOM_RIGHT:
                            expectedPosition = currentPosition;
                            break;

                        case edges.BOTTOM_LEFT:
                            expectedPosition = addOffsetX(currentPosition, offset);
                            break;

                        default:
                            throw new Error('unexpected resizeSourceEdge: ' + resizeSourceEdge);
                    }

                    componentResized = editor.resizeComponent(shapeComponent, offset, resizeSourceEdge);

                    waitsFor(function () {
                        return componentResized.isFulfilled();
                    });
                    runs(function () {
                        expect(editor.getElementPosition(shapeComponent)).toBeCloseEnoughTo(expectedPosition, snapToGridTolerance);
                    });


                });

                it('should be resized correctly, when resizing from the ' + resizeSourceEdge + ' knob towards ' + resizeTargetEdge + '.', function () {
                    var expectedSize,
                        currentSize = shapeComponent.getSize(),
                        resizeOffset = {
                            x: offset.x,
                            y: offset.y
                        },
                        componentResized;

                    switch (resizeSourceEdge) {
                        case edges.TOP:
                        case edges.TOP_RIGHT:
                            resizeOffset.y *= -1;
                            expectedSize = addOffset(currentSize, resizeOffset);
                            break;

                        case edges.BOTTOM_LEFT:
                        case edges.LEFT:
                            resizeOffset.x *= -1;
                            expectedSize = addOffset(currentSize, resizeOffset);
                            break;

                        case edges.TOP_LEFT:
                            resizeOffset.x *= -1;
                            resizeOffset.y *= -1;
                            expectedSize = addOffset(currentSize, resizeOffset);
                            break;

                        case edges.BOTTOM:
                        case edges.BOTTOM_RIGHT:
                        case edges.RIGHT:
                            expectedSize = addOffset(currentSize, resizeOffset);
                            break;

                        default:
                            throw new Error('unexpected resizeSourceEdge: ' + resizeSourceEdge);
                    }

                    componentResized = editor.resizeComponent(shapeComponent, offset, resizeSourceEdge);

                    waitsFor(function () {
                        return componentResized.isFulfilled();
                    });
                    runs(function () {
                        expect(shapeComponent.getSize()).toBeCloseEnoughTo(expectedSize, snapToGridTolerance);
                    });

                });
            };

            this.testPositionAfterResize({x: 0, y: 100}, edges.TOP, edges.TOP);
            this.testPositionAfterResize({x: 0, y: -50}, edges.BOTTOM, edges.TOP);

            this.testPositionAfterResize({x: 50, y: -50}, edges.TOP_RIGHT, edges.TOP_RIGHT);
            this.testPositionAfterResize({x: 50, y: -50}, edges.BOTTOM_LEFT, edges.TOP_RIGHT);

            this.testPositionAfterResize({x: 50, y: 0}, edges.RIGHT, edges.RIGHT);
            this.testPositionAfterResize({x: 50, y: 0}, edges.LEFT, edges.RIGHT);

            this.testPositionAfterResize({x: 50, y: 50}, edges.BOTTOM_RIGHT, edges.BOTTOM_RIGHT);
            this.testPositionAfterResize({x: 50, y: 50}, edges.TOP_LEFT, edges.BOTTOM_RIGHT);

            this.testPositionAfterResize({x: 0, y: 50}, edges.BOTTOM, edges.BOTTOM);
            this.testPositionAfterResize({x: 0, y: 50}, edges.TOP, edges.BOTTOM);

            this.testPositionAfterResize({x: -50, y: 50}, edges.BOTTOM_LEFT, edges.BOTTOM_LEFT);
            this.testPositionAfterResize({x: -50, y: 50}, edges.TOP_RIGHT, edges.BOTTOM_LEFT);

            this.testPositionAfterResize({x: -50, y: 0}, edges.LEFT, edges.LEFT);
            this.testPositionAfterResize({x: -50, y: 0}, edges.RIGHT, edges.LEFT);

            this.testPositionAfterResize({x: -50, y: -50}, edges.TOP_LEFT, edges.TOP_LEFT);
            this.testPositionAfterResize({x: -50, y: -50}, edges.BOTTOM_RIGHT, edges.TOP_LEFT);
        });

        describe('resizing shape component', function () {
            var setComponentSize = function (width, height) {
                    var dfd = Q.defer();
                    setTimeout(function () {
                        var logic = shapeComponent.getLogic();
                        logic.setWidth(width);
                        logic.setHeight(height);

                        setTimeout(function () {
                            dfd.resolve();
                        }, 100);
                    }, 100);
                    return dfd.promise;
                },
                setupShapeWithSkin = function (skinName) {
                    var dfd = Q.defer();

                    setComponentSize(300, 300)
                        .then(function () {
                            return editor.setSkinForComponent(shapeComponent, skinName);
                        })
                        .then(function () {
                            return editor.resizeComponent(shapeComponent, {x: -100, y: -100}, edges.TOP_LEFT);
                        })
                        .then(function () {
                            dfd.resolve();
                        });

                    return dfd.promise;
                };

            //todo: use mock skins in favor of real skins
            it('should correctly resize a shape with a single <path> element', function () {
                var shapeReady = setupShapeWithSkin('skins.viewer.svgshape.SvgShapeBirdSkin');

                waitsFor(function () {
                    return shapeReady.isFulfilled();
                });

                runs(function () {
                    var shapeLogic = shapeComponent.getLogic(),
                        pathNode = shapeLogic.svgElement.childNodes[1].childNodes[1];

                    expect(pathNode.getAttribute('d')).toBe('M245.635613 239.035442c0 0,-4.761903 -18.859203,7.539282 -21.490781c0 0,-5.953569 -47.806561,39.682126 -41.667091c0 0,-9.920234 -17.105257,5.555951 -27.193412c0 0,-18.253563 -18.421046,0 -33.772357c0 0,-23.809514 -21.052624,-7.142854 -55.701295c0 0,-23.810705 -36.403935,-16.270232 -59.210505c0 0,26.190465 45.614458,41.66665 59.210505s51.190455 77.192078,48.413076 120.174957S340.476051 262.719644,340.476051 262.719644s31.745225 3.947367,32.142844 34.210514l27.77856 14.035522c0 0,-32.540463 15.351311,-44.44522 27.193412s-69.444019 53.509192,-121.82495 31.578936c0 0,-22.620229 29.82499,-71.826161 27.193412S47.620219 322.368306,30.55594 282.017004S0 230.263076,0 230.263076s35.71308 13.596047,46.82498 42.105248c0 0,18.253563 -23.684202,49.99998 28.069726c0 0,20.635706 -7.894734,28.969035 14.473679c0 0,12.698805 -22.368413,30.952368 -4.385524c0 0,-29.763083 -62.28024,-27.77856 -116.22759L17.857136 42.543405l103.967814 95.174966l-2.380951 -128.947322L153.571366 182.894672c0 0,33.729748 28.947358,44.444029 32.456568S236.509426 222.368342,245.635613 239.035442z');
                });
            });

//                it('should correctly resize a shape with multiple <path> elements', function () {
//                    var shapeReady = setupShapeWithSkin('skins.viewer.svgshape.SvgShapeAntsSkin');
//
//                    waitsFor(function () {
//                        return shapeReady.isFulfilled();
//                    });
//
//                    runs(function () {
//                        var shapeLogic = shapeComponent.getLogic(),
//                            pathNode1 = shapeLogic.svgElement.childNodes[1].childNodes[1],
//                            pathNode2 = shapeLogic.svgElement.childNodes[1].childNodes[3];
//
//                        expect(pathNode1.getAttribute('d')).toBe('M190.821006 86.23824c0 0,-12.242376 -10.193263,4.530182 -15.187085c0 0,9.017377 -2.75899,17.308534 -1.953372c0 0,2.124695 1.269102,3.039329 -9.205622V46.356762c0 0,0.190244 -2.417698,8.673474 -8.862644c0 0,12.048474 -6.928655,12.81951 -24.814899c0 0,-0.531402 -3.706181,1.396646 -3.867137c0 0,2.916768 -1.450282,1.759756 4.510957c0 0,-0.085061 16.920513,-15.509449 28.360968c0 0,-3.22317 0.805618,-2.838109 15.147479c0 0,-0.358537 11.440454,-5.371645 13.374444c0 0,8.111889 4.673598,8.49695 7.735116c0 0,-1.921646 1.772192,10.226523 1.128371c0 0,10.22195 0.804776,17.74207 5.318261c0 0,6.942987 3.060676,13.113108 -1.612079c0 0,20.243594 -8.700004,31.619812 1.93399c0 0,1.928048 3.384271,-1.928048 1.53118c0 0,-3.406097 -6.042137,-15.2314 -5.236519c0 0,-8.676218 0.967416,-16.002436 4.673598c0 0,-7.520121 4.995508,-20.244509 -1.128371c0 0,-3.471036 -3.867137,-18.509448 -2.417698c0 0,-1.35 14.180905,-15.2314 16.91967c0 0,-8.098169 2.900563,-12.147254 -3.705339c0 0,-2.7 -2.900563,-2.7 -0.160955c0 0,4.049085 10.151128,-13.303352 14.019107l-10.797254 1.933147c0 0,-4.242072 3.546069,6.555182 3.384271c0 0,19.281399 0.805618,23.908533 -4.028092c0 0,3.084146 -2.799439,10.604267 4.078653c0 0,10.604267 6.395228,20.630485 9.295791c0 0,1.927134 4.189889,-6.556097 0c0 0,-13.057315 -5.914048,-20.437497 -8.700847c0 0,-2.314024 -1.773877,-9.447255 1.611237c0 0,-11.761279 5.317418,-26.992679 -1.128371c0 0,-4.821036 -1.772192,-5.977133 5.317418c0 0,-2.314024 3.062361,2.120122 8.379779l16.582314 18.208154c0 0,2.891158 3.385114,1.735061 8.217981c0 0,-7.328048 20.464897,-5.977133 30.134002c0 0,0.96311 13.213489,-1.350914 11.441297c0 0,-3.277134 2.578653,-1.541158 -7.896914c0 0,0 -24.492988,4.627133 -35.449735c0 0,1.928048 -2.095787,-1.928048 -4.672755c0 0,-13.689327 -8.218824,-19.858533 -24.493831c0 0,-2.699085 -7.734273,-10.026218 7.574161c0 0,-1.35 6.123879,0.96311 12.407028c0 0,0.385976 12.08596,-8.48323 21.111245l-24.679569 20.464054c0 0,-26.799691 16.435962,-33.740848 23.364617c0 0,-4.242072 3.867137,-5.39817 6.445789c-1.157012 2.578653,-6.941157 2.2559,-3.471036 -2.094102c0 0,17.117375 -15.824164,35.090848 -26.105068c0 0,22.943594 -16.596917,27.763715 -22.075291c0 0,9.062194 -11.44214,7.905182 -20.626694c0 0,0 -4.350845,-4.242072 0.644663c-4.242072 4.994665,-8.098169 16.757873,-24.678655 16.435962c0 0,0.771036 4.672755,-6.171036 6.283149c0 0,-3.084146 0.484551,-13.49451 0.806461c0 0,0.192073 3.545226,-6.942072 2.740451c0 0,-13.303352 -0.806461,-18.701521 -18.854503c0 0,-2.314024 -6.605902,4.04817 -7.573318c0 0,1.542988 -13.696354,14.653351 -14.985681c0 0,3.278048 -13.053377,21.97957 -11.763207c0 0,5.784145 -5.641014,13.882315 -4.995508c0 0,0.578049 -6.929497,-19.665546 -5.318261c0 0,-20.051521 7.735116,-31.427739 9.50815c0 0,-32.583836 11.602252,-40.29603 11.440454c0 0,-4.820121 -1.773034,5.206097 -3.867979l62.2756 -19.17557c0 0,11.760364 -4.834553,22.558533 -0.160955c0 0,3.083231 0.966573,4.820121 3.545226c0 0,1.927134 4.189889,9.254267 2.2559l6.749084 -1.289326c0 0,2.699085 -0.645506,-1.928048 -3.545226c0 0,-14.654266 -8.863487,-18.508534 -21.270515c0 0,2.120122 -2.578653,-10.027133 -1.934832c0 0,-22.944509 3.545226,-42.417066 -14.019107c0 0,-1.542073 -2.416012,0.964024 -1.611237c0 0,13.496339 12.891579,26.992679 12.246916l21.97957 -0.322753c0 0,6.363109 -1.450282,10.797254 6.928655l12.725303 17.403378c0 0,0 4.350845,15.039327 -1.127529c0 0,3.470121 -0.805618,1.349085 -11.441297c0 0,-2.699085 -5.962081,18.895424 -20.142144c0 0,13.496339 -5.156463,16.388412 -10.151128c0 0,2.314024 -4.351687,4.04817 -1.612079c0 0,3.830487 4.14017,-10.79634 9.669105c0 0,-13.548473 6.014328,-22.557618 20.142986c0 0,-1.254878 2.416855,-1.880488 6.283992c0 0,-0.819512 5.156463,4.193597 -2.2559c0 0,8.675303 -12.729781,20.630485 -6.123879C190.050884 88.092174,192.841433 88.357623,190.821006 86.23824z');
//                        expect(pathNode2.getAttribute('d')).toBe('M234.778316 227.23746c0 0,-4.464329 -4.388766,-9.778352 -1.625563c0 0,-9.349389 4.063485,-13.600608 13.324725c0 0,-0.212195 2.113484,-6.800304 -3.087642l-8.926828 -5.688205c0 0,-1.062805 -2.43708,-13.177132 1.869945c0 0,-12.964022 7.394666,-37.829262 3.0059c0 0,-5.739328 1.788203,3.825914 2.925844c0 0,17.851826 4.387923,41.229871 -5.931744c0 0,3.825914 -1.543821,8.713718 3.656462c0 0,5.313109 4.387081,10.414023 5.200283c0 0,-5.737499 12.837646,16.364632 13.000287c0 0,1.062805 -0.975,2.763109 2.761518l8.076218 13.001129c0 0,2.33689 3.575563,1.274085 11.538207c0 0,-2.124695 21.287369,5.951523 26.000573c0 0,4.675609 -0.325281,-1.275 -5.525564c0 0,-3.400609 -2.275282,-1.700305 -13.650006l0.849695 -12.675006c0 0,-1.275 -13.650006,-12.750913 -23.074729c0 0,25.291459 -6.825846,18.914631 -17.551693c0 0,-7.225609 -4.22444,-3.082317 -3.737361c0 0,10.09573 0.649719,10.945425 -4.063485c0 0,2.975304 -3.41208,2.550914 6.013486c0 0,-0.849695 18.037929,-4.251219 28.437653c0 0,-4.675609 14.78849,-2.125609 17.55085c0 0,2.338719 2.275282,2.338719 -4.22444c0 0,2.97439 -19.988773,7.224694 -29.738777c0 0,5.737499 -13.975287,-2.975304 -23.725291c0 0,-3.304573 -4.712362,4.829268 -7.475565l5.584755 -2.111799c0 0,3.613719 -2.276125,11.478657 5.037643c0 0,9.349389 6.337081,18.487497 5.19944l9.139938 -0.649719c0 0,1.700305 -0.216573,1.700305 -3.900002c0 0,0.001829 -4.982867,15.586278 -3.682586c0 0,3.683231 -1.645787,0 -2.34017c0 0,-17.852741 -1.995506,-19.552131 7.323037c0 0,-0.546951 3.748316,-13.915242 -1.002809c-0.267073 -0.095225,-0.542378 -0.194663,-0.820427 -0.297472c-14.167681 -5.19944,-11.052437 -8.23315,-22.953655 -8.23315c0 0,-3.967682 -4.767137,9.635669 -4.117418c0 0,4.493597 1.235394,5.667072 5.416856c0 0,-0.282622 3.033709,7.935365 -0.216573c0 0,4.24756 -1.951686,13.883229 -0.867978c0 0,3.117987 1.301124,3.968597 -7.582588c0 0,0.282622 -5.633429,15.01829 -5.633429c0 0,4.817377 -3.032867,0 -2.816293c0 0,-15.870729 -0.000843,-18.986887 12.133994c0 0,-0.567988 2.817136,-9.350303 1.517697c0 0,-5.951523 -0.867978,-8.501523 1.082866c0 0,-9.916462 -2.38399,-10.48262 -9.316858c0 0,30.317373 7.474722,35.98536 -16.630625c0 0,3.68506 -18.254502,-15.017376 -22.58765c0 0,-28.620727 -6.175284,-32.020422 22.58765c0 0,0.284451 7.095509,3.399695 11.212926c0 0,1.006097 1.152809,-2.665243 0.745787c-0.226829 -0.026124,-0.470122 -0.057303,-0.735366 -0.096067c-4.533841 -0.649719,-3.116158 2.166574,-1.701219 4.549721c0 0,-4.53567 3.034552,-4.817377 -7.582588c0 0,-2.833536 -6.716295,4.817377 -12.350567c7.651828 -5.634272,4.816463 -7.799161,2.266463 -12.566298c0 0,-12.18201 -15.383434,4.534755 -36.184566c0 0,-1.13689 -3.032867,-3.968597 0c0 0,-16.434144 20.150571,-1.982012 39.434006c0 0,0.567073 4.98371,-6.801218 7.3677c0 0,-5.952438 2.598878,-3.117987 20.364616c0 0,2.835365 7.151969,-4.532926 1.517697l-64.043587 -61.318847c0 0,-4.817377 -1.515169,-0.282622 2.38399l61.490844 60.668285c0 0,2.550914 4.984553,1.701219 6.71798c0 0,1.323475 3.237642,-6.013719 -0.460955c-0.253354 -0.127247,-0.514939 -0.263764,-0.7875 -0.407023c-8.216157 -4.333148,-12.185669 -1.73427,-18.701521 0.649719c0 0,-3.969512 4.550564,-16.435973 -4.766294c0 0,-6.233231 -9.966577,-22.385667 -2.165731c0 0,-2.834451 3.247754,1.415853 2.382304c0 0,7.08384 -6.717138,13.317986 -2.59972c0 0,13.603351 12.783713,20.971643 12.134837c0 0,7.933535 -0.216573,9.351218 -2.167417c0 0,8.14573 -5.851688,14.698168 -0.217416c0 0,0.035671 2.166574,-5.915853 3.251125C238.318864 212.557678,230.385329 213.097847,234.778316 227.23746z');
//                    });
//                });

            it('should correctly resize a shape with <polygon> element', function () {
                var shapeReady = setupShapeWithSkin('skins.viewer.svgshape.SvgShapeArrowRightSkin');

                waitsFor(function () {
                    return shapeReady.isFulfilled();
                });

                runs(function () {
                    var shapeLogic = shapeComponent.getLogic(),
                        polygonNode = shapeLogic.svgElement.childNodes[1].childNodes[1];

                    expect(polygonNode.getAttribute('points')).toBe('273.315495,400.397577 400.604282,200.198789 273.315495,0 189.366788,0 286.177418,152.263542 0,152.263542 0,249.169874 285.504112,249.169874 189.206546,400.647288');
                });
            });

//                it('should correctly resize a shape with <circle> element', function () {
//                    var shapeReady = setupShapeWithSkin('skins.viewer.svgshape.SvgShapeCircleSkin');
//
//                    waitsFor(function () {
//                        return shapeReady.isFulfilled();
//                    });
//
//                    runs(function () {
//                        var shapeLogic = shapeComponent.getLogic(),
//                            circleNode = shapeLogic.svgElement.childNodes[1].childNodes[1];
//
//                        expect(circleNode.getAttribute('cx')).toBeCloseEnoughTo('180', 1);
//                        expect(circleNode.getAttribute('cy')).toBeCloseEnoughTo('180', 1);
//                        expect(circleNode.getAttribute('r')).toBeCloseEnoughTo('150', 1);
//                    });
//                });
        });
    });
});
