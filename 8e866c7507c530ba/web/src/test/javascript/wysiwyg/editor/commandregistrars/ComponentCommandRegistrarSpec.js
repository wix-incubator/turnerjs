describe('ComponentCommandRegistrar', function(){
    describe('General functionality', function(){
        testRequire()
            .classes('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar')
            .resources('W.CompDeserializer', 'W.Preview', 'W.Viewer', 'W.Editor')
        ;

        beforeEach(function() {
            var that = this;
            this._viewer = {
                getSiteNode: function(){},
                getCurrentPageId: function(){return "pageId"},
                getCompByID:function(id){
                    if(id=="pageId")
                    {
                        return that._pageNode
                    }
                }
            };
            this._siteNode = document.createElement('div');
            this._pageNode = document.createElement('span') ;
            spyOn(this._siteNode, 'getElement').andReturn(this._pageNode);
            spyOn(W.Preview, 'getPreviewManagers').andReturn({Viewer: this._viewer});
            spyOn(this._viewer, 'getSiteNode').andReturn(this._siteNode);
            this._componentCommandRegistrar = new this.ComponentCommandRegistrar() ;
        });

        describe("ComponentCommandRegistrar", function() {
            beforeEach(function(){
                this._realEditMode = W.Config.env.$editorMode;
            });
            afterEach(function(){
                W.Config.env.$editorMode = this._realEditMode;
            });
            it("should add component to the current page asynchronously.", function() {
                W.Config.env.$editorMode = W.Editor.EDIT_MODE.CURRENT_PAGE;
                var compDef = {} ;
                var styleId = {} ;
                var componentCreationCallback = jasmine.createSpy();
                spyOn(W.CompDeserializer, 'createAndAddComponent').andCallFake(
                    function(parentNode, compDef, undefined, undefined, styleId, callback){
                        callback();
                    }) ;

                this._componentCommandRegistrar._addComponentToCurrentScope(compDef, styleId, componentCreationCallback) ;

                expect(componentCreationCallback).toHaveBeenCalled() ;
                expect(W.CompDeserializer.createAndAddComponent).toHaveBeenCalledWith(this._pageNode, compDef, undefined, undefined, styleId, componentCreationCallback) ;
            });

            it("should add component to the site node asynchronously.", function() {
                W.Config.env.$editorMode = W.Editor.EDIT_MODE.MASTER_PAGE;
                var compDef = {} ;
                var styleId = {} ;
                var componentCreationCallback = jasmine.createSpy();
                spyOn(W.CompDeserializer, 'createAndAddComponent').andCallFake(
                    function(parentNode, compDef, undefined, undefined, styleId, callback){
                        callback();
                    }) ;

                this._componentCommandRegistrar._addComponentToCurrentScope(compDef, styleId, componentCreationCallback) ;

                expect(componentCreationCallback).toHaveBeenCalled() ;
                expect(W.CompDeserializer.createAndAddComponent).toHaveBeenCalledWith(this._siteNode, compDef, undefined, undefined, styleId, componentCreationCallback) ;
            })
        }) ;
    });

    describe('Container resize commands', function() {
        testRequire()
            .classes('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar', 'core.managers.components.ComponentBuilder').
            resources('W.Editor', 'W.Preview', 'W.Viewer').
            components('core.components.Container');


        var CONTAINER_DEFAULT_WIDTH = 100,
            CONTAINER_DEFAULT_HEIGHT = 100,
            CONTAINER_DEFAULT_X = 0,
            CONTAINER_DEFAULT_Y = 0,
            INNER_CONTENT_WIDTH = 20,
            INNER_CONTENT_HEIGHT = 20,
            LEFT_BOTTOM_X = 10,
            LEFT_BOTTOM_Y = 70,
            RIGHT_TOP_X = 70,
            RIGHT_TOP_Y = 10;

        var container = null,
            leftBottomContent,
            rightTopContent,
            coordinates;

        beforeEach(function() {
            this._componentCommandRegistrar = new this.ComponentCommandRegistrar();

            spyOn(W.Editor, 'getEditingFrame').andReturn(
                {fitToComp: function(){}}
            );

            spyOn(W.Preview, "getPreviewManagers").andReturn(
                {
                    Viewer :{
                        getViewerMode : function(){
                            return  'DESKTOP'
                        },
                        getDocWidth: function(){
                            return 980;
                        }
                    }
                }
            );

            spyOn(W.Editor, 'onComponentChanged');

            container = null;

            this.builder = new this.ComponentBuilder(document.createElement('div'));
            this.builder.withType( 'core.components.Container' )
                .withSkin( 'mock.viewer.skins.area.ContainerMockSkin' )
                .withData( null )
                ._with("htmlId", "mockId")
                .onWixified( function( comp ){
                    container = comp;
                    container.setWidth(CONTAINER_DEFAULT_WIDTH);
                    container.setHeight(CONTAINER_DEFAULT_HEIGHT);
                })
                .create();

            waitsFor( function() {
                return container !== null;
            }, 'container component to be ready', 1000);

            runs(function(){
                coordinates = {
                    editedComponent : container,
                    width : CONTAINER_DEFAULT_WIDTH,
                    height: CONTAINER_DEFAULT_HEIGHT
                };
                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);
            });

            waitsFor(function(){
                return  container.getX() === CONTAINER_DEFAULT_X &&
                    container.getY() === CONTAINER_DEFAULT_Y &&
                    container.getPhysicalHeight() === CONTAINER_DEFAULT_HEIGHT &&
                    container.getWidth() === CONTAINER_DEFAULT_WIDTH
            }, 'container to have default sizes', 100);


        });

        describe('Empty Container resize Behavior',function(){

            it('should resize without limitations within page limit',function(){
                coordinates = {
                    editedComponent : container,
                    width : Math.round(CONTAINER_DEFAULT_WIDTH / 2)
                };

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                expect(container.getWidth()).toBe(coordinates.width);
            });
        });

        describe('Container resize behavior when content is inside',function(){

            beforeEach(function() {
                coordinates = {
                    editedComponent : container
                };

                leftBottomContent = null;
                rightTopContent = null;

                this.builder = new this.ComponentBuilder(document.createElement('div'));
                this.builder.withType( 'core.components.Container' )
                    .withSkin( 'mock.viewer.skins.area.ContainerMockSkin' )
                    .withData( null )
                    ._with("htmlId1", "mockId1")
                    .onWixified( function( comp ){
                        leftBottomContent = comp;
                        leftBottomContent.setWidth(INNER_CONTENT_WIDTH);
                        leftBottomContent.setHeight(INNER_CONTENT_HEIGHT);
                    })
                    .create();

                this.builder = new this.ComponentBuilder(document.createElement('div'));
                this.builder.withType( 'core.components.Container' )
                    .withSkin( 'mock.viewer.skins.area.ContainerMockSkin' )
                    .withData( null )
                    ._with("htmlId2", "mockId2")
                    .onWixified( function( comp ){
                        rightTopContent = comp;
                        rightTopContent.setWidth(INNER_CONTENT_WIDTH);
                        rightTopContent.setHeight(INNER_CONTENT_HEIGHT);
                    })
                    .create();


                waitsFor(function() {
                    return rightTopContent !== null && leftBottomContent !== null;
                }, 'inner content components to be ready', 1000);

                runs(function(){
                    insertContentToContainer.apply(this,[container, leftBottomContent]);
                    insertContentToContainer.apply(this,[container, rightTopContent]);

                    setContentSizePos.apply(this,[leftBottomContent, LEFT_BOTTOM_X, LEFT_BOTTOM_Y, INNER_CONTENT_WIDTH, INNER_CONTENT_HEIGHT]);
                    setContentSizePos.apply(this,[rightTopContent, RIGHT_TOP_X, RIGHT_TOP_Y, INNER_CONTENT_WIDTH, INNER_CONTENT_HEIGHT]);
                });

                waitsFor(function(){
                    return checkCompPosSize(leftBottomContent, LEFT_BOTTOM_X, LEFT_BOTTOM_Y, INNER_CONTENT_WIDTH, INNER_CONTENT_HEIGHT)
                        && checkCompPosSize(rightTopContent, RIGHT_TOP_X, RIGHT_TOP_Y, INNER_CONTENT_WIDTH, INNER_CONTENT_HEIGHT);
                }, 'inner content to be positioned correctly inside container', 1000)

            });

            it('should stop the container\'s top border from passing its top-most component.',function(){
                var contentTopToContainerTop = RIGHT_TOP_Y,
                    newY = CONTAINER_DEFAULT_Y + contentTopToContainerTop + 10,
                    newHeight = CONTAINER_DEFAULT_HEIGHT - contentTopToContainerTop - 10,
                    containerOldHeight = container.getPhysicalHeight(),
                    containerOldY = container.getY();
                coordinates = {
                    editedComponent : container,
                    height : newHeight,
                    y : newY
                };

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                waitsFor(function(){
                    return container.getPhysicalHeight() !== containerOldHeight;
                }, 'container height to change', 100);

                runs(function(){
                    expect(container.getPhysicalHeight()).toEqual(containerOldHeight - contentTopToContainerTop);
                    expect(container.getY()).toEqual(containerOldY + contentTopToContainerTop);
                });
            });

            it('shouldn\'t move content from its absolute position when narrowing top side of container',function(){
                var contentTopToContainerTop = CONTAINER_DEFAULT_HEIGHT - INNER_CONTENT_HEIGHT - LEFT_BOTTOM_Y,
                    newY = CONTAINER_DEFAULT_Y + contentTopToContainerTop + 10,
                    newHeight = CONTAINER_DEFAULT_HEIGHT - contentTopToContainerTop - 10,
                    rightTopContentOldY = rightTopContent.getY() + container.getY(),
                    containerOldHeight = container.getPhysicalHeight();
                coordinates = {
                    editedComponent : container,
                    height : newHeight,
                    y : newY
                };

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                waitsFor(function(){
                    return container.getPhysicalHeight() !== containerOldHeight;
                }, 'container height to change', 100);

                runs(function(){
                    expect(rightTopContent.getY() + container.getY()).toEqual(rightTopContentOldY);
                });
            });

            it('should stop the container\'s bottom border from passing its bottom-most component.',function(){
                var contentBottomToContainerBottom = CONTAINER_DEFAULT_HEIGHT - INNER_CONTENT_HEIGHT - LEFT_BOTTOM_Y,
                    containerOldHeight = container.getPhysicalHeight();
                coordinates = {
                    editedComponent : container,
                    height : container.getPhysicalHeight() - contentBottomToContainerBottom - 10
                };

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                waitsFor(function(){
                    return container.getPhysicalHeight() !== containerOldHeight;
                }, 'container height to change', 100);

                runs(function(){
                    expect(container.getPhysicalHeight()).toEqual(containerOldHeight - contentBottomToContainerBottom);
                });
            });

            it('should stop the container\'s right border from passing its right-most component.',function(){
                var contentRightToContainerRight = CONTAINER_DEFAULT_WIDTH - (INNER_CONTENT_WIDTH + RIGHT_TOP_X),
                    containerOldWidth = container.getWidth();
                coordinates = {
                    editedComponent : container,
                    width : container.getWidth() - contentRightToContainerRight - 10
                };

                runs(function(){
                    this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);
                });

                waitsFor(function(){
                    return container.getWidth() !== containerOldWidth;
                }, 'container to change width', 100);

                runs(function(){
                    expect(container.getWidth()).toEqual(containerOldWidth - contentRightToContainerRight);
                });
            });

            it('should stop the container\'s left border from passing its left-most component.',function(){
                var contentLeftToContainerLeft = LEFT_BOTTOM_X,
                    containerInitialWidth = container.getWidth(),
                    containerInitialX = container.getX();
                newX = CONTAINER_DEFAULT_X + contentLeftToContainerLeft + 10,
                    newWidth = CONTAINER_DEFAULT_WIDTH - contentLeftToContainerLeft - 10;
                coordinates = {
                    editedComponent : container,
                    x : newX,
                    width : newWidth
                };

                runs(function(){
                    this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);
                });

                waitsFor(function(){
                    return container.getWidth() !== containerInitialWidth;
                }, 'container to change width', 100);

                runs(function() {
                    expect(container.getWidth()).toEqual(containerInitialWidth - contentLeftToContainerLeft);
                    expect(container.getX()).toEqual(containerInitialX + contentLeftToContainerLeft);
                });
            });

            it('shouldn\'t move content from its absolute position when narrowing left side of container',function(){
                var contentLeftToContainerLeft = LEFT_BOTTOM_X,
                    containerInitialWidth = container.getWidth(),
                    newX = CONTAINER_DEFAULT_X + contentLeftToContainerLeft + 10,
                    newWidth = CONTAINER_DEFAULT_WIDTH - contentLeftToContainerLeft - 10,
                    leftBottomInitialX = leftBottomContent.getX() + container.getX();
                coordinates = {
                    editedComponent : container,
                    x : newX,
                    width : newWidth
                };

                runs(function(){
                    this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);
                });

                waitsFor(function(){
                    return container.getWidth() !== containerInitialWidth;
                }, 'container width to change', 100);

                runs(function(){
                    expect(leftBottomContent.getX() + container.getX()).toEqual(leftBottomInitialX);
                });
            });
        });
    });
});

describe('ComponentCommandRegistrar', function() {
    testRequire().
        classes('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar')
        .resources('W.Components');

    beforeEach(function() {
        this.compCommandRegistrar = new this.ComponentCommandRegistrar();
        this._compManager = this.W.Components;
        this._compName = 'myComp';
    });

    it("should create compData", function() {
        var eventObj = {data: {passedData: {compType: this._compName}}};
        var params = eventObj.data.passedData;
        var compData = {};
        W.Editor._componentData = {};
        spyOn(this.compCommandRegistrar, '_getCompData').andReturn(compData);
        spyOn(this.compCommandRegistrar, '_onAddComponentInternal');

        this.compCommandRegistrar._onAddComponent(eventObj);

        expect(this.compCommandRegistrar._getCompData).toHaveBeenCalledWith(params);
        expect(this.compCommandRegistrar._onAddComponentInternal).toHaveBeenCalledWith(params, compData);
    });

    it("should get compData for TPA component", function() {
        var eventObj = {data: {passedData: {compData: {}}}};
        var params = eventObj.data.passedData;
        W.Editor._componentData = {};

        var compData = this.compCommandRegistrar._getCompData(params);

        expect(compData).toBeEquivalentTo(params.compData);
    });

    it("should get compData for old format component", function() {
        var eventObj = {data: {passedData: {compType: this._compName}}};
        var params = eventObj.data.passedData;
        W.Editor._componentData = {};
        W.Editor._componentData[this._compName] = 'compData';

        var compData = this.compCommandRegistrar._getCompData(params);

        expect(compData).toBeEquivalentTo('compData');
    });

    it("should get compData for new format component", function() {
        var eventObj = {data: {passedData: {compType: this._compName}}};
        var params = eventObj.data.passedData;
        var compInfo = {}, compData = 'compData';
        W.Editor._componentData = {};
        spyOn(this.compCommandRegistrar, '_createComponentInformation').andReturn(compInfo);
        spyOn(this.compCommandRegistrar, '_createComponentData').andReturn(compData);

        var compData = this.compCommandRegistrar._getCompData(params);

        expect(compData).toBeEquivalentTo('compData');
    });

    it("should not add component that has already been added before to info map", function() {
        var compInfo = {};
        this._compManager.setComponentInformation(this._compName, compInfo);
        spyOn(this.compCommandRegistrar, '_getComponentManager').andReturn(this._compManager);
        spyOn(this._compManager, 'getComponentInformation').andReturn({});
        spyOn(this._compManager, 'addComponentToInfoMap');

        var info = this.compCommandRegistrar._createComponentInformation(this._compName);

        expect(this._compManager.addComponentToInfoMap).not.toHaveBeenCalled();
        expect(info).toBeEquivalentTo(compInfo);
    });

    it("should add component that hasn't been added before to info map", function() {
        spyOn(this.compCommandRegistrar, '_getComponentManager').andReturn(this._compManager);
        spyOn(this._compManager, 'getComponentInformation').andReturn(undefined);
        spyOn(this._compManager, 'addComponentToInfoMap');

        this.compCommandRegistrar._createComponentInformation(this._compName);

        expect(this._compManager.addComponentToInfoMap).toHaveBeenCalled();
    });

    it("should create a component data object with all required properties", function() {
        var compPresets = {compType: this._compName, styleId: 0, size: {}};
        var infoObject = {'skins': {}, 'data': {}};
        var compInfo = {get: function(key) {return infoObject[key]}};
        spyOn(this.compCommandRegistrar, '_getComponentDefaultStyleId').andReturn({});
        spyOn(W.Editor, 'getComponentDefaultSkin').andReturn({});

        var compData = this.compCommandRegistrar._createComponentData(compPresets, compInfo);

        var compDataKeys = _.keys(compData);

        _.forEach(compDataKeys, function(key) {
            expect(compData[key]).toBeDefined();
        });
        expect(compDataKeys.indexOf('comp')).toBeGreaterThan(-1);
        expect(compDataKeys.indexOf('styleId')).toBeGreaterThan(-1);
        expect(compDataKeys.indexOf('size')).toBeGreaterThan(-1);
        expect(compDataKeys.indexOf('data')).toBeGreaterThan(-1);
        expect(compDataKeys.indexOf('skin')).toBeGreaterThan(-1);
        expect(compDataKeys.length).toBe(5);
    });
});

describe('ComponentCommandRegistrar', function() {
    testRequire()
        .classes('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar', 'core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.WPhoto', 'core.components.image.ImageNew')
        .resources('W.Editor', 'W.Preview', 'W.Viewer', 'W.Data', 'W.ComponentLifecycle', 'W.Utils');

    var componentLogic,
        view,
        data,
        props,
        createComponentSpies = function () {
            spyOn(this.ImageNew.prototype, '_setImageSrc');
            spyOn(W.Layout, 'notifyPositionChanged');
        },
        coordinates,
        createComponent = function () {
            var builder = new this.ComponentBuilder(document.createElement('div'));
            componentLogic = null;

            builder.withType('wysiwyg.viewer.components.WPhoto')
                .withSkin('mock.viewer.skins.WPhotoSkin')
                .withData(data)
                ._with("htmlId", "mockId")
                .onWixified(function (component) {
                    componentLogic = component;
                    componentLogic.setComponentProperties(props);

                    componentLogic.setWidth(100);
                    componentLogic.setHeight(300);

                    this.setWidthSpy = spyOn(componentLogic, 'setWidth').andCallThrough();
                    this.setHeightSpy = spyOn(componentLogic, 'setHeight').andCallThrough();
                    this.setSettingsSpy = spyOn(componentLogic._skinParts.img, 'setSettings').andCallThrough();
                })
                .create();

            waitsFor(function () {
                return componentLogic;
            }, "WPhoto to be ready", 1000);

            runs(function () {
                this.expect(componentLogic).not.toBeNull();
                view = componentLogic.getViewNode();
                this.expect(view).not.toBeNull();
                resetSpies();
            });
        };

    beforeEach(function () {
        this._componentCommandRegistrar = new this.ComponentCommandRegistrar();
        spyOn(W.Editor, 'getEditingFrame').andReturn(
            {fitToComp: function(){}}
        );
        spyOn(W.Editor, 'updatePageHeight').andReturn(
          function(){}
        );
        spyOn(W.Editor, 'onComponentChanged');

        spyOn(W.Preview, "getPreviewManagers").andReturn(
            {
                Viewer :{
                    getViewerMode : function(){
                        return  'DESKTOP'
                    },
                    getDocWidth: function(){
                        return 980;
                    }
                },
                Commands: W.Commands,
                Events: W.Events
            }
        );

        data = this.W.Data.createDataItem({
            "type": "Image",
            "uri": 'xxx',
            "title": '',
            "description": '',
            "width": '500',
            "height": '500'
        });
        props = this.W.Data.createDataItem({
            'type': 'WPhotoProperties',
            'displayMode': 'fill'
        });

        createComponentSpies.call(this);
        createComponent.call(this);
    });

    function resetSpies() {
        window.setWidthSpy.reset();
        window.setHeightSpy.reset();
        window.setSettingsSpy.reset();
    }

    describe('Rotate component command',function(){
        it('should change the angle of a component',function(){
            coordinates = {
                editedComponent : componentLogic,
                rotationAngle : 90
            };

            this._componentCommandRegistrar._setSelectedComponentRotationAngle(coordinates);

            expect(componentLogic.getAngle()).toEqual(90);
        });

        it('should have bounding sizes according to angle',function(){
            coordinates = {
                editedComponent : componentLogic,
                rotationAngle : 90
            };

            this._componentCommandRegistrar._setSelectedComponentRotationAngle(coordinates);

            expect(componentLogic.getBoundingWidth()).toEqual(componentLogic.getPhysicalHeight());
            expect(componentLogic.getBoundingHeight()).toEqual(componentLogic.getWidth());
        });

        it('should adjust the angle to the range 0-359',function(){
            coordinates = {
                editedComponent : componentLogic,
                rotationAngle : -370
            };

            this._componentCommandRegistrar._setSelectedComponentRotationAngle(coordinates);

            expect(componentLogic.getAngle()).toEqual(350);
        });
    });

    describe("Resize a rotated component", function(){
        var getComponentCenter = function(component){
            return {
                x : component.getX() + component.getWidth()/2,
                y : component.getY() + component.getPhysicalHeight()/2
            }
        };
        var initialCompCenter;
        var initialX = 300,
            initialY = 400,
            initialWidth = 100,
            initialHeight = 300,
            deltaWidth = 100,
            deltaHeight = 100,
            initialBoundingX,
            initialBoundingY,
            initialBoundingWidth,
            initialBoundingHeight;

        beforeEach(function() {
            coordinates = {
                x : initialX,
                y: initialY,
                width: initialWidth,
                height: initialHeight,
                editedComponent: componentLogic
            }
            componentLogic._lastCoords = {
                x: initialX,
                y: initialY
            }
            componentLogic._lastDimensions = {
                w: initialWidth,
                h: initialHeight
            }
            this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);
            initialCompCenter = getComponentCenter(componentLogic);

            coordinates = {
                editedComponent: componentLogic,
                rotationAngle: 60
            }
            this._componentCommandRegistrar._setSelectedComponentRotationAngle(coordinates);

            initialBoundingHeight = componentLogic.getBoundingHeight();
            initialBoundingWidth = componentLogic.getBoundingWidth();
            initialBoundingX = componentLogic.getBoundingX();
            initialBoundingY = componentLogic.getBoundingY();
        });

        describe("Resize component rotated in the first quadrant - 60 degrees", function(){
            it("Shouldn\'t change the boundingX and boundingY when resizing right side", function(){
                coordinates = {
                    editedComponent: componentLogic,
                    width: componentLogic.getWidth() + deltaWidth
                }

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                var currentBoundingX = componentLogic.getBoundingX();
                var currentBoundingY = componentLogic.getBoundingY();
                expect(currentBoundingX).toEqual(initialBoundingX);
                expect(currentBoundingY).toEqual(initialBoundingY);
            });

            it("Shouldn\'t change the boundingX+boundingWidth and boundingY+boundingHeight when resizing left side", function(){
                coordinates = {
                    editedComponent: componentLogic,
                    width: componentLogic.getWidth() + deltaWidth,
                    x: componentLogic.getX() - deltaWidth
                }

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                var currentBoundingX = componentLogic.getBoundingX();
                var currentBoundingY = componentLogic.getBoundingY();
                var currentBoundingWidth = componentLogic.getBoundingWidth();
                var currentBoundingHeight = componentLogic.getBoundingHeight();
                expect(currentBoundingX + currentBoundingWidth).toEqual(initialBoundingX + initialBoundingWidth);
                expect(currentBoundingY + currentBoundingHeight).toEqual(initialBoundingY + initialBoundingHeight);
            });

            it("Shouldn\'t change the boundingX and boundingY+boundingHeight when resizing top side", function(){
                coordinates = {
                    editedComponent: componentLogic,
                    height: componentLogic.getPhysicalHeight() + deltaHeight,
                    y: componentLogic.getY() - deltaHeight
                }

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                var currentBoundingX = componentLogic.getBoundingX();
                var currentBoundingY = componentLogic.getBoundingY();
                var currentBoundingHeight = componentLogic.getBoundingHeight();
                expect(currentBoundingX).toEqual(initialBoundingX);
                expect(currentBoundingY + currentBoundingHeight).toEqual(initialBoundingY + initialBoundingHeight);
            });

            it("Shouldn\'t change the boundingX+boundingWidth and boundingY when resizing bottom side", function(){
                coordinates = {
                    editedComponent: componentLogic,
                    height: componentLogic.getPhysicalHeight() + deltaHeight
                }

                this._componentCommandRegistrar._setSelectedComponentPosSize(coordinates);

                var currentBoundingX = componentLogic.getBoundingX();
                var currentBoundingY = componentLogic.getBoundingY();
                var currentBoundingWidth = componentLogic.getBoundingWidth();
                expect(currentBoundingX + currentBoundingWidth).toEqual(initialBoundingX + initialBoundingWidth);
                expect(currentBoundingY).toEqual(initialBoundingY);
            });
        });
    });

});

/**
 * Attaches the content to the given container
 * @param container
 * @param content
 */
function insertContentToContainer(container, content){
    content.getParentComponent = function() {
        return {
            getChildComponents : function() {
            return {map: function() {}};
            }
        }
    }
    container.addChild(content);
}

function setContentSizePos(comp, xPos, yPos, width, height){
    var innerCoordinates = {
        editedComponent : comp,
        width: width
    };
    this._componentCommandRegistrar._setSelectedComponentPosSize(innerCoordinates);

    innerCoordinates = {
        editedComponent : comp,
        height : height
    };
    this._componentCommandRegistrar._setSelectedComponentPosSize(innerCoordinates);

    innerCoordinates = {
        editedComponent : comp,
        x : xPos
    };
    this._componentCommandRegistrar._setSelectedComponentPosSize(innerCoordinates);

    innerCoordinates = {
        editedComponent : comp,
        y: yPos
    };
    this._componentCommandRegistrar._setSelectedComponentPosSize(innerCoordinates);

}

function checkCompPosSize(comp, xPos, yPos, width, height){
    return comp.getX() === xPos
        && comp.getY() === yPos
        && comp.getWidth() === width
        && comp.getPhysicalHeight() === height;
}

function getComponentCenter(component) {
    return {

    }
}