/**
 * Created by IntelliJ IDEA.
 * User: nadav
 * Date: 19/09/11
 * Time: 17:24
 * To change this template use File | Settings | File Templates.
 */

var setTempPos = function(node) {
    node.setStyles({
        position:'absolute',
        left:'0px',
        top:'0px',
        width:'50px',
        height:'50px'
    });
};

var createContainer = function(index, element) {
    var builder = new this.ComponentBuilder(document.createElement('div'));
    builder
        .withType('core.components.Container')
        .withSkin('mock.viewer.skins.LayoutManagerContainerMockSkin')
        ._with("htmlId" + index, "mockId" + index)
        .onWixified(function (component) {
            var compView = component.$view;
            setTempPos(compView);
            compView.setAttribute('debugID','cont_'+index);
            element.adopt(compView);
            this.containersForPlay.push(compView);
        }.bind(this))
        .create();
};

function createTestComponents(createText){
    this.componentsForPlay = [];
    this.containersForPlay = [];
    //var element = new Element('div');
    //getPlayGround().adopt(element);
    var element = getPlayGround();

    for (var i = 0; i < 7; i++) {
        var newText = createText('textData' + i);
        newText.setAttribute('debugID','text_'+i+' '+jasmine.getEnv().currentSpec.description);
        this.componentsForPlay.push(newText);
        element.adopt(this.componentsForPlay[i]);
    }

    for (i = 0; i < 3; i++) {
        createContainer.apply(this, [i, element]);
    }

    waitsFor(function() {
        for (var i = 0; i < this.componentsForPlay.length; i++) {
            if (!this.componentsForPlay[i].getLogic || !this.componentsForPlay[i].getLogic().isReady() || this.componentsForPlay[i].getSize().y == 0){
                return false;
            }
            this.componentsForPlay[i].getLogic().isRendered = function(){return true;};
        }

        return true;
    }, 'Components to be ready', 300);

    waitsFor(function() {
        if(this.containersForPlay.length < 3) {
            return false;
        }

        for (var i = 0; i < this.containersForPlay.length; i++) {
            if (!this.containersForPlay[i].getLogic || this.containersForPlay[i].getSize().y == 0) {
                return false;
            }
            this.containersForPlay[i].getLogic().isRendered = function(){return true;};
        }


        return true;
    }, 'Containers to be ready', 1000);
}

describe("LayoutManager", function() {

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('core.components.Container', 'wysiwyg.viewer.components.WRichText')
        .resources('W.ComponentLifecycle');

    var createText = function(dataID) {
        W.Data.addDataItem(dataID,
            {
                'type':'RichText',
                'text': 'gaag'
            });
        var newCompNode = W.Components.createComponent('wysiwyg.viewer.components.WRichText', 'mock.viewer.skins.TestRichTextSkin', '#' + dataID);
        setTempPos(newCompNode);
        return newCompNode;
    };

    beforeEach(function() {
        W.Viewer._siteStructureData = {get: function(attr) {if (attr=='renderModifiers') return {pageAutoShrink: true};} };
        spyOn(W.Viewer, 'getCompLogicById');

        createTestComponents.apply(this, [createText]);
    });

    runTests.call(this);
});

function runTests() {
    var setCoords = function(components, locations) {
        for (var i = 0; i < components.length; i++) {
            var extraPix = components[i].getLogic().getExtraPixels();
            components[i].setStyle('position', 'absolute');
            if (!locations[i]) {
                continue;
            }
            components[i].getLogic().setX(locations[i].x);
            components[i].getLogic().setY(locations[i].y);
            components[i].getLogic().setHeight(locations[i].height - extraPix.top - extraPix.bottom);
            components[i].getLogic().setWidth(locations[i].width);
            locations[i].parent.getInlineContentContainer().adopt(components[i]);
        }
    };

    var hasAnchor = function(from, to, distance, type, locked) {
        for (var i = 0; i < from.getAnchors().length; i++) {
            var anchor = from.getAnchors()[i];
            if (anchor.toComp === to) {
                var found = true;
                if (distance != undefined && anchor.distance != distance) {
                    found = false;
                }
                if (type != undefined && anchor.type != type) {
                    found = false;
                }
                if (locked != undefined && anchor.locked != locked) {
                    found = false;
                }
                if (found) {
                    return true;
                }
            }
        }
        return false
    };

    it("should be defined", function() {
        expect(W.Layout).toBeDefined();
    });

    describe("toggleHGroup", function() {
        it('should connect 2 components in a group if not connected to anything and disconnect them if connected', function() {
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            var group = this.componentsForPlay[0].getLogic().getHorizontalGroup();
            expect(group).toBe(this.componentsForPlay[1].getLogic().getHorizontalGroup());
            expect(group[0].toComp).toBe(this.componentsForPlay[0].getLogic());
            expect(group[1].toComp).toBe(this.componentsForPlay[1].getLogic());
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), true);
            expect(this.componentsForPlay[0].getLogic().getHorizontalGroup()).toBe(null);
            expect(this.componentsForPlay[1].getLogic().getHorizontalGroup()).toBe(null);

        });
        it('if one of the components is in a group, the other one needs to be added/removed', function() {
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), false);
            var group = this.componentsForPlay[0].getLogic().getHorizontalGroup();
            expect(group).toBe(this.componentsForPlay[1].getLogic().getHorizontalGroup());
            expect(group).toBe(this.componentsForPlay[2].getLogic().getHorizontalGroup());
            expect(group[0].toComp).toBe(this.componentsForPlay[0].getLogic());
            expect(group[1].toComp).toBe(this.componentsForPlay[1].getLogic());
            expect(group[2].toComp).toBe(this.componentsForPlay[2].getLogic());
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), true);
            expect(group).toBe(this.componentsForPlay[0].getLogic().getHorizontalGroup());
            expect(group).toBe(this.componentsForPlay[1].getLogic().getHorizontalGroup());
            expect(this.componentsForPlay[2].getLogic().getHorizontalGroup()).toBe(null);
            //and the other way around
            W.Layout.toggleHGroup(this.componentsForPlay[2].getLogic(), this.componentsForPlay[0].getLogic(), false);
            group = this.componentsForPlay[0].getLogic().getHorizontalGroup();
            expect(group).toBe(this.componentsForPlay[1].getLogic().getHorizontalGroup());
            expect(group).toBe(this.componentsForPlay[2].getLogic().getHorizontalGroup());
            expect(group[0].toComp).toBe(this.componentsForPlay[0].getLogic());
            expect(group[1].toComp).toBe(this.componentsForPlay[1].getLogic());
            expect(group[2].toComp).toBe(this.componentsForPlay[2].getLogic());
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), true);
            expect(group).toBe(this.componentsForPlay[0].getLogic().getHorizontalGroup());
            expect(group).toBe(this.componentsForPlay[1].getLogic().getHorizontalGroup());
            expect(this.componentsForPlay[2].getLogic().getHorizontalGroup()).toBe(null);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), true);
        });
        it('if both components are in a group, it should combine the groups', function() {
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[2].getLogic(), this.componentsForPlay[3].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[1].getLogic(), this.componentsForPlay[3].getLogic(), false);
            var group = this.componentsForPlay[0].getLogic().getHorizontalGroup();
            var groupedComponents = [];
            for ( i = 0; i < 3; i++) {
                expect(this.componentsForPlay[i].getLogic().getHorizontalGroup()).toBe(group);
                groupedComponents.push(group[i].toComp);
            }
            for (var i = 0; i < 3; i++) {
                expect(groupedComponents.indexOf(this.componentsForPlay[i].getLogic()) > -1).toBe(true);
            }
        })
    });

    describe("getOptionalBottomLocks", function() {
        it("should return a list of components who do not overlap with it on the x axis and who overlap on the y axis", function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:201,y:100,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap vertical overlap, should be included
                {x:199,y:100,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //horz overlap. should not be included
                {x:201,y:100,width:50,height:109,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap in bottom limit, should be included
                {x:201,y:201,width:50,height:69,parent:this.containersForPlay[0].getLogic()}
            ] //no horz overlap no vertical overlap, should not be included
            );

            var options = W.Layout.getOptionalBottomLocks(this.componentsForPlay[0].getLogic());
            for (var i = 0; i < options.length; i++) {
                expect(options[i].locked).toBe(false);
                options[i] = options[i].target;
            }
            expect(options.indexOf(this.componentsForPlay[0].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[1].getLogic()) > -1).toBe(true);
            expect(options.indexOf(this.componentsForPlay[2].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[3].getLogic()) > -1).toBe(true);
            expect(options.indexOf(this.componentsForPlay[4].getLogic())).toBe(-1);

        });
        it("should add to the list currently connected components (hgroup) even if not in the limits", function() {
            setCoords(this.componentsForPlay, [

                //component to check from, should not be included
                {x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap in bottom limit, should be included
                {x:201,y:100,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //horz overlap. should not be included
                {x:199,y:100,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //horiz overlap with item 1 (group member) should be included
                {x:250,y:100,width:50,height:109,parent:this.containersForPlay[0].getLogic()},
                //no vert overlap outside bottom limit, should not be included
                {x:1000,y:460,width:50,height:3,parent:this.containersForPlay[0].getLogic()},
                //vert overlapno horz overlap. should be included
                {x:1000,y:90,width:50,height:60,parent:this.containersForPlay[0].getLogic()}
            ]
            );
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            var optionsWithLock = W.Layout.getOptionalBottomLocks(this.componentsForPlay[0].getLogic());
            var options = [];
            for (var i = 0; i < optionsWithLock.length; i++) {
                options[i] = optionsWithLock[i].target;
            }
            expect(options.indexOf(this.componentsForPlay[0].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[1].getLogic()) > -1).toBe(true);
            expect(optionsWithLock[options.indexOf(this.componentsForPlay[1].getLogic())].locked).toBe(true);
            expect(options.indexOf(this.componentsForPlay[2].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[3].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[4].getLogic())).toBe(-1);
            expect(options.indexOf(this.componentsForPlay[5].getLogic()) > -1).toBe(true);
            expect(optionsWithLock[options.indexOf(this.componentsForPlay[5].getLogic())].locked).toBe(false);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), true);
        });
    });

    describe("_getSiblingsYSortedArray", function() {
        it("should return a y-sorted array of elements", function() {

            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:201,y:150,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap in bottom limit, should be included
                {x:199,y:100,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //horz overlap. should not be included
                {x:201,y:98,width:50,height:109,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap in bottom limit, should be included
                {x:201,y:200,width:50,height:69,parent:this.containersForPlay[0].getLogic()}
            ] //no horz overlap outside bottom limit, should not be included
            );


            var resArr = W.Layout._getSiblingsYSortedArray(this.componentsForPlay[0].getLogic());
            expect(resArr.length).toBe(5);
            var currTop = -100000;
            for (i = 0; i < resArr.length; i++) {
                var top = parseInt(resArr[i].getViewNode().getStyle('top'));
                expect(top).toBeGreaterThan(currTop);
                currTop = top;
            }
        });
    });

    describe("_updateAnchors", function() {
        it("should create a bottom top anchor between 2 components when one is above the other (bottom>top), and there is horizontal overlap", function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:-60,y:150,width:50,height:91,parent:this.containersForPlay[0].getLogic()},
                //no horz overlap should not be anchored
                {x:199,y:300,width:50,height:91,parent:this.containersForPlay[0].getLogic()}
                //horz overlap below the first, anchor from first to this should be created
            ]);

            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[0].getLogic().getAnchors()[0];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP)).toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
        });

        it("should create a top top anchor between 2 components when one starts above the other (top>top but not bottom>top), and there is horizontal overlap", function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:-10,y:10,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, top>top, should be anchored
                {x:201,y:50,width:50,height:200,parent:this.containersForPlay[0].getLogic()}
                //no horz overlap, anchor from first to this should not be created
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[0].getLogic().getAnchors()[0];

            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(2);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), 10, anAnchor.ANCHOR_TOP_TOP)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
        });

        it("should create a bottom_bottom anchor between 2 components when the component1.y>component2.y and component1.bottom<component2.bottom and there is horizontal overlap", function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:-10,y:10,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, top1>top2, should be anchored, bottom1>bottom2 should not be anchored
                {x:60,y:50,width:50,height:100,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, top1>top2, should be anchored, bottom1<bottom2 a bottom bottom anchor should be created between 2 and 1
                {x:-70,y:50,width:50,height:100,parent:this.containersForPlay[0].getLogic()}
                //no  horz overlap, even though top1>top2 and bottom1<bottom2 no anchors between them should be create
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[2].getLogic().getAnchors()[1];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(3);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), null, anAnchor.ANCHOR_TOP_TOP)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), null, anAnchor.ANCHOR_TOP_TOP)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(2);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_BOTTOM)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[3].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
        });
        it('should create a bottom_parent anchor between a component and its parent when the component has no bottom top anchors', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:-10,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, bottom1<top2, should be anchored bottom top, no parent anchor should be create for 1
                {x:60,y:50,width:50,height:100,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, top1>top2, should be anchored, bottom1<bottom2 a bottom bottom anchor should be created between 2 and 1
                {x:-70,y:50,width:50,height:100,parent:this.containersForPlay[0].getLogic()}
                //no  horz overlap, even though top1>top2 and bottom1<bottom2 no anchors between them should be create
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[2].getLogic().getAnchors()[1];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(2);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), null, anAnchor.ANCHOR_TOP_TOP)).toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(2);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_BOTTOM)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[3].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[3].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
        });
        it('all anchors should be unlocked if the distance is greater than the threshold specefied in layout manager, unlocked other wise', function() {
            //TODO: add more tests for locking/unlocking of different anchor types
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from, should not be included
                {x:-10,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, bottom1>top2 but by less then the thershold should be top_bottom locked
                {x:60,y:280,width:50,height:100,parent:this.containersForPlay[0].getLogic()},
                //horz overlap, bottom1>top2 by more then the thershold should be top_bottom unlocked
                {x:-70,y:50,width:50,height:100,parent:this.containersForPlay[0].getLogic()}
                //no  horz overlap, even though top1>top2 and bottom1<bottom2 no anchors between them should be create
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[0].getLogic().getAnchors()[0];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(2);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP, false)).toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT)).toBe(true);

        });
        it('should not anchor a component to a component which is indirectly anchored to it through a bottom top anchor', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from
                {x:-10,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it through a bottom_top anchor
                {x:-20,y:240,width:50,height:100,parent:this.containersForPlay[0].getLogic()},
                //component indirectly anchored to it by being anchored to the 2nd through top top
                {x:-20,y:345,width:50,height:100,parent:this.containersForPlay[0].getLogic()},
                //component indirectly anchored to it by being anchored to the 2nd through top bottom
                {x:170,y:345,width:50,height:100,parent:this.containersForPlay[0].getLogic()}
                //component not indirectly anchored to it
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[0].getLogic().getAnchors()[0];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length, '1').toBe(2);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP, true), '2').toBe(true);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[4].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP, false), '3').toBe(true);
            expect(this.componentsForPlay[1].getLogic().getAnchors().length, '4').toBe(2);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.componentsForPlay[2].getLogic(), null, anAnchor.ANCHOR_TOP_TOP), '5').toBe(true);
            expect(hasAnchor(this.componentsForPlay[1].getLogic(), this.componentsForPlay[3].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP), '6').toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length, '7').toBe(2);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[1].getLogic(), null, anAnchor.ANCHOR_BOTTOM_BOTTOM), '8').toBe(true);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[3].getLogic(), null, anAnchor.ANCHOR_BOTTOM_TOP), '9').toBe(true);
            expect(this.componentsForPlay[3].getLogic().getAnchors().length, '10').toBe(1);
            expect(hasAnchor(this.componentsForPlay[3].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT), '11').toBe(true);
            expect(this.componentsForPlay[4].getLogic().getAnchors().length, '12').toBe(1);
            expect(hasAnchor(this.componentsForPlay[4].getLogic(), this.containersForPlay[0].getLogic(), null, anAnchor.ANCHOR_BOTTOM_PARENT), '13').toBe(true);
        });
        it('should keep existing anchors (with existing lock state and distance) if the components relevant has not been changed and the anchor still needs to exist', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from
                {x:0,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it through a bottom_top anchor
                {x:220,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //a 2nd component off to the side
                {x:220,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it bottom_top
                {x:520,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //another component off to the side
                {x:520,y:210,width:50,height:200,parent:this.containersForPlay[0].getLogic()}
                //component anchored to it bottom_top
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var anAnchor = this.componentsForPlay[0].getLogic().getAnchors()[0];
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), 10, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[3].getLogic(), 10, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            expect(this.componentsForPlay[4].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[4].getLogic(), this.componentsForPlay[5].getLogic(), 10, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            //change the distances and add another component between the 5th and 6th
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()},
                //component to check from
                {x:0,y:208,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it through a bottom_top anchor
                {x:220,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //a 2nd component off to the side
                {x:220,y:208,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it bottom_top
                {x:520,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //another component off to the side
                {x:520,y:220,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //component anchored to it bottom_top
                {x:520,y:205,width:50,height:2,parent:this.containersForPlay[0].getLogic()}
                //a component thats in the middle between the 5th and 6th
            ]);
            //lets say that the 3rd one has been moved by the user
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [this.componentsForPlay[2].getLogic()], false);
            expect(this.componentsForPlay[0].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), 10, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            expect(this.componentsForPlay[2].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[2].getLogic(), this.componentsForPlay[3].getLogic(), 8, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
            expect(this.componentsForPlay[4].getLogic().getAnchors().length).toBe(1);
            expect(hasAnchor(this.componentsForPlay[4].getLogic(), this.componentsForPlay[6].getLogic(), 5, anAnchor.ANCHOR_BOTTOM_TOP, true)).toBe(true);
        });
        it('should clear invalid hGroups', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:50,height:55,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:100,y:10,width:50,height:55,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:220,y:60,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //in group 1, no vertical overlap with item 0, makes the group invalid
                {x:500,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //in group 2
                {x:600,y:0,width:50,height:200,parent:this.containersForPlay[0].getLogic()},
                //in group 2
                {x:700,y:0,width:50,height:200,parent:this.containersForPlay[1].getLogic()}
                //in group 2, in different parent, makes the group invalid
            ]);
            //create group 1
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), false);
            //create group 2
            W.Layout.toggleHGroup(this.componentsForPlay[3].getLogic(), this.componentsForPlay[4].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[3].getLogic(), this.componentsForPlay[5].getLogic(), false);

            for (var i = 0; i < 6; i++) {
                //make sure all are in groups
                expect(this.componentsForPlay[i].getLogic().getHorizontalGroup()).toBeDefined();
            }

            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);

            for (i = 0; i < 6; i++) {
                //make sure all groups are cleared
                expect(this.componentsForPlay[i].getLogic().getHorizontalGroup()).toBeFalsy();
            }

        });

        it('should update hGroups distances', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:50,height:55,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:100,y:10,width:50,height:55,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:220,y:60,width:50,height:200,parent:this.containersForPlay[0].getLogic()}
                //in group 1, no vertical overlap with item 0, makes the group invalid

            ]);
            //create group 1
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), false);

            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:50,height:55,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:100,y:17,width:50,height:233,parent:this.containersForPlay[0].getLogic()},
                //in group 1
                {x:220,y:50,width:50,height:210,parent:this.containersForPlay[0].getLogic()}
                //in group 1
            ]);


            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);

            var group = this.componentsForPlay[0].getLogic().getHorizontalGroup();
            for (var i = 0; i < group.length; i++) {
                var fromBottom = group[i].fromComp.getY() + group[i].fromComp.getPhysicalHeight();
                var toBottom = group[i].toComp.getY() + group[i].toComp.getPhysicalHeight();
                expect(group[i].distance).toBe(toBottom - fromBottom);
            }

            //delete group 1
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), true);
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[2].getLogic(), true);
        })
    });

    describe("_enforceAnchors", function() {
        it("should push and pull components anchored to with a locked bottom top anchor, if the top component has been resized and enforce anchors has been notified of this resize", function() {

            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);

            //update the size of the pushers
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:90,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:90,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);

            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(100);

            //was'nt pushed
            expect(this.componentsForPlay[3].getLogic().getY()).toBe(90);


            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:70,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:90,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:90,width:200,height:70,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(80);

            //was'nt pushed
            expect(this.componentsForPlay[3].getLogic().getY()).toBe(90);

        });
        it('should push components anchored with a non locked bottom top anchor if the margin is lower than the default margin and to be pulled up only to its previous coordinates', function() {
            var defMargin = W.Layout.DEFAULT_MARGIN;
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:100,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:100,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //update the size of the pushers
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:250,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:250,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(250 + defMargin);
            //was'nt pushed
            expect(this.componentsForPlay[3].getLogic().getY()).toBe(200);


            //update the size of the pushers
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:400,y:0,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pusher 2
                {x:400,y:200,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(200);
            //was'nt pushed
            expect(this.componentsForPlay[3].getLogic().getY()).toBe(200);
        });
        it('components pushed/pulled should push/pull the components anchored to them', function() {
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:90,width:200,height:80,parent:this.containersForPlay[0].getLogic()},
                //pushed 1
                {x:0,y:180,width:200,height:80,parent:this.containersForPlay[0].getLogic()}
                //pushed 2

            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //update the size of the pushers
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:90,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(100);
            //was also pushed
            expect(this.componentsForPlay[2].getLogic().getY()).toBe(190);


            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:70,parent:this.containersForPlay[0].getLogic()}
                //pusher 1

            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(80);
            //was'nt pushed
            expect(this.componentsForPlay[2].getLogic().getY()).toBe(170);
        });
        it('components anchored using a top_top anchor should be pushed/pulled if the pusher has been moved', function() {
            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:150,parent:this.containersForPlay[0].getLogic()},
                {x:0,y:200,width:200,height:400,parent:this.containersForPlay[0].getLogic()},
                //pusher 1
                {x:0,y:290,width:200,height:400,parent:this.containersForPlay[0].getLogic()}
                //pushed 1
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //update the size of pusher1 and therefore the location of pusher2
            setCoords(this.componentsForPlay, [
                {
                    x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was not pushed
            expect(this.componentsForPlay[2].getLogic().getY()).toBe(340);

            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:100,parent:this.containersForPlay[0].getLogic()}
                //pusher 1

            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.componentsForPlay[2].getLogic().getY()).toBe(240);
        });
        it('components anchored to parent with a locked anchor should resize it when moved/resized', function() {
            setCoords(this.containersForPlay, [
                {x:0,y:0,width:500,height:500,parent:this.containersForPlay[1].getLogic()}
                //container
            ]);
            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:180,parent:this.containersForPlay[0].getLogic()},
                {x:0,y:200,width:200,height:280,parent:this.containersForPlay[0].getLogic()}//anchored to parent through a locked bottom parent
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //update the size of pusher1 and therefore the location of pusher2
            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized
            expect(this.containersForPlay[0].getLogic().getPhysicalHeight()).toBe(520);

            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:100,parent:this.containersForPlay[0].getLogic()}
                //pusher 1

            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was pushed
            expect(this.containersForPlay[0].getLogic().getPhysicalHeight()).toBe(420);


            setCoords(this.componentsForPlay, [
                null,
                {x:0,y:120,width:200,height:300,parent:this.containersForPlay[0].getLogic()}
                //pusher 2

            ]);
            //notify only about item 2 resize
            W.Layout.enforceAnchors([this.componentsForPlay[1].getLogic()]);
            //was pushed
            expect(this.containersForPlay[0].getLogic().getPhysicalHeight()).toBe(440);
        });
        it('components anchored to parent with a non locked anchor should resize it when moved/resized to its size + default margin with a minimum of its prior size', function() {
            var defMargin = W.Layout.DEFAULT_MARGIN;
            setCoords(this.containersForPlay, [
                {x:0,y:0,width:500,height:500,parent:this.containersForPlay[1].getLogic()}
                //container
            ]);
            setCoords(this.componentsForPlay, [
                {x:0,y:100,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //update the size of pusher
            setCoords(this.componentsForPlay, [
                {x:0,y:100,width:200,height:450,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized

            expect(this.containersForPlay[0].getLogic().getPhysicalHeight()).toBe(570 + defMargin);

            setCoords(this.componentsForPlay, [
                {x:0,y:0,width:200,height:100,parent:this.containersForPlay[0].getLogic()}
                //pusher 1

            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized to original height
            expect(this.containersForPlay[0].getLogic().getPhysicalHeight()).toBe(480);
        });
        it('containers resized because of their children should enforce their own anchors ', function() {
            var defMargin = W.Layout.DEFAULT_MARGIN;
            setCoords(this.containersForPlay, [
                {x:0,y:0,width:500,height:300,parent:this.containersForPlay[1].getLogic()},
                {x:0,y:0,width:500,height:800,parent:this.containersForPlay[2].getLogic()}
                //containers
            ]);
            setCoords(this.componentsForPlay, [
                {x:0,y:100,width:200,height:180,parent:this.containersForPlay[0].getLogic()},
                {x:0,y:305,width:200,height:200,parent:this.containersForPlay[1].getLogic()}
            ]);

            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            W.Layout._updateAnchors(this.componentsForPlay[1].getLogic(), [], false);
            //update the size of pusher
            setCoords(this.componentsForPlay, [
                {x:0,y:100,width:200,height:450,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized
            expect(this.componentsForPlay[1].getLogic().getY()).toBe(575);
        });
        it('a component whose size/pos has been changed and is part of an horizontal group should resize its grouped components', function(){
            setCoords(this.componentsForPlay, [
                {x:500,y:100,width:200,height:150,parent:this.containersForPlay[0].getLogic()},
                {x:0,y:200,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
            ]);
            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //create the group
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.componentsForPlay[1].getLogic(), false);
            //update the size of pusher
            setCoords(this.componentsForPlay, [
                {x:500,y:100,width:200,height:450,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized
            expect(this.componentsForPlay[1].getLogic().getPhysicalHeight()).toBe(500);

            //update the location of the pusher
            setCoords(this.componentsForPlay, [
                {x:500,y:200,width:200,height:150,parent:this.containersForPlay[0].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 move
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);
            //was resized
            expect(this.componentsForPlay[1].getLogic().getPhysicalHeight()).toBe(300);
        });

        //TODO: fix this test
        it('a component whose size/pos has been changed and is part of an horizontal group and gets too small for the group should grow accordingly', function(){
            setCoords(this.componentsForPlay, [
                {x:500,y:100,width:200,height:150,parent:this.containersForPlay[1].getLogic()},
                {x:0,y:200,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
            ]);
            setCoords(this.containersForPlay, [
                {x:0,y:0,width:200,height:410,parent:this.containersForPlay[1].getLogic()}
            ]);
            //create the anchors
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            //create the anchors inside the container
            W.Layout._updateAnchors(this.componentsForPlay[1].getLogic(), [], false);
            //create the group
            W.Layout.toggleHGroup(this.componentsForPlay[0].getLogic(), this.containersForPlay[0].getLogic(), false);
            //update the size of the external text (i.e. comp for play 2)
            setCoords(this.componentsForPlay, [
                {x:500,y:100,width:200,height:100,parent:this.containersForPlay[1].getLogic()}
                //pusher 1
            ]);
            //notify only about item 1 resize
            W.Layout.enforceAnchors([this.componentsForPlay[0].getLogic()]);

            //was resized to 140, cause its the minimum
            expect(this.componentsForPlay[0].getLogic().getPhysicalHeight()).toBe(140);
        })
    });

    describe("getComponentMinResizeHeight", function() {
        it("should return the minimum height a component can be resized to with out its child components being outside its innerContent div", function(){
            setCoords(this.componentsForPlay, [
                {x:0,y:200,width:200,height:200,parent:this.containersForPlay[0].getLogic()}
            ]);
            setCoords(this.containersForPlay, [
                {x:0,y:0,width:200,height:410,parent:this.containersForPlay[1].getLogic()}
            ]);
            W.Layout._updateAnchors(this.componentsForPlay[0].getLogic(), [], false);
            var result = W.Layout.getComponentMinResizeHeight(this.containersForPlay[0].getLogic());
            var expectedResult = 400-this.containersForPlay[0].getLogic().getInlineContentContainer().getSize().y+this.containersForPlay[0].getLogic().getPhysicalHeight();
            expect(result).toBe(expectedResult);
        })
    });

    xdescribe('Reports to UndoRedoManager', function() {
        beforeEach(function() {
            this.module = W.UndoRedoManager._positionData;
            var _compPredicate = ComponentsTestUtil.registerEmptyComponentAndSkin("test.comp.DummyComp", "test.skin.DummySkin", {});

            waitsFor(function() {
                return _compPredicate();
            }, 'DummyComp failed', 20);

            runs(function() {
                this.compNode = W.Components.createComponent("test.comp.DummyComp", "test.skin.DummySkin", null, null, null /* wixify */, function(logic) {
                    this.compLogic = logic;
                }.bind(this));
            });

            waitsFor(function() {
                return this.compLogic != undefined;
            }.bind(this), "components to be ready", 100);
        });

        it('should report element size changes with updateSize event', function() {
            spyOn(W.Layout, '_updateAnchors');
            spyOn(W.Layout, 'updateChildAnchors');
            spyOn(W.Layout, '_getAndClearChangedByHGroup').andReturn([]);
            spyOn(W.Layout, '_reportElementsSize').andCallThrough();
            spyOn(W.Layout, 'fireEvent').andCallThrough();
            spyOn(W.Layout, '_getSiblingsYSortedArray').andReturn([]);

            W.Layout.reportResize([this.compLogic]);

            expect(W.Layout.fireEvent).toHaveBeenCalledWithFollowingPartialArguments('updateSize');
        });

        it('should report element move changes with updateSize event', function() {
            spyOn(W.Layout, '_updateAnchors');
            spyOn(W.Layout, 'fireEvent').andCallThrough();
            spyOn(W.Layout, '_getSiblingsYSortedArray').andReturn([]);

            W.Layout.reportMove([this.compLogic]);

            expect(W.Layout.fireEvent).toHaveBeenCalledWithFollowingPartialArguments('updatePosition');
        });

        it('should fire updateAnchors event', function( ){
            spyOn(this.compLogic, 'setAnchors');
            spyOn(W.Layout, 'serializeAnchors');
            spyOn(W.Utils, 'areObjectsEqual').andReturn(false);
            spyOn(W.Layout, 'fireEvent').andReturn();
            var anchorUpdate = {
                data: {
                    changedComponentIds: [this.compLogic.getComponentId()],
                    oldAnchors: undefined,
                    newAnchors: undefined,
                    sender: 'layoutmanager'
                }
            };

            W.Layout._setComponentAnchors(this.compLogic, {});

            expect(W.Layout.fireEvent).toHaveBeenCalledWithEquivalentOf('updateAnchors', anchorUpdate);
        });
    });
}