describe('AlignmentToolsSpec', function() {
    //still need to create tests for isRelative=true and for undo

    var numOfComponents = 5;

    testRequire().
        resources('W.AlignmentTools', 'W.Editor');

    var createText = function(dataID, i) {
        W.Data.addDataItem(dataID,
            {
                'type':'RichText',
                'text': 'gaag'
            });

        var newCompNode = W.Components.createComponent('wysiwyg.viewer.components.WRichText', 'wysiwyg.viewer.skins.WRichTextSkin', '#' + dataID);
        setTempPos(newCompNode, i+1);
        //setPosition(this.componentsForPlay[i].getLogic(), i+1)
        return newCompNode;
    };

    var setTempPos = function(node, seed) {
        node.setStyles({
            position:'absolute',
            left:'0px',
            top:'0px',
            width:'50px',
            height:'50px'
        });
    };

    var createContainer = function() {
        var newCompNode = W.Components.createComponent('core.components.Container', 'wysiwyg.viewer.skins.area.InnerMarginAreaSkin', undefined);
        setTempPos(newCompNode);
        return newCompNode;
    };

    var setCoords = function(components, locations) {
        for (var i = 0; i < components.length; i++) {
            var extraPix = components[i].getExtraPixels();
            components[i].getViewNode().setStyle('position', 'absolute');
            if (!locations[i]) {
                continue;
            }
            components[i].setX(locations[i].x);
            components[i].setY(locations[i].y);
            components[i].setHeight(locations[i].height - extraPix.top - extraPix.bottom);
            components[i].setWidth(locations[i].width);
            //locations[i].parent.getInlineContentContainer().adopt(components[i]);
        }
    };

    beforeEach(function() {
        this.componentsForPlay = [];
        this.componentsForPlayLogic = [];
        //var element = new Element('div');
        //getPlayGround().adopt(element);
        var element = getPlayGround();
        for (var i = 0; i < 5; i++) {
            var newText = createText('textData' + i, i);
            newText.setAttribute('debugID','text_'+i+' '+jasmine.getEnv().currentSpec.description);
            this.componentsForPlay.push(newText);
            //this.componentsForPlayLogic.push(newText.getLogic());
            element.adopt(this.componentsForPlay[i]);
        }
        waitsFor(function() {
            for (var i = 0; i < this.componentsForPlay.length; i++) {
                if (!this.componentsForPlay[i].getLogic || !this.componentsForPlay[i].getLogic().isReady() || this.componentsForPlay[i].getSize().y == 0)
                    return false;
            }
            for (var i = 0; i < this.componentsForPlay.length; i++) {
                this.componentsForPlayLogic.push(this.componentsForPlay[i].getLogic());
            }
            return true;
        }, 'Components to be ready', 300);

        spyOn(this.W.AlignmentTools, '_reportComponentsMove');
        spyOn(this.W.AlignmentTools, '_reportPositionChanged');
        spyOn(this.W.Editor, 'onComponentChanged');
    });

    describe('Test with isRelative=false (to parent)', function(){
        describe('Test alignment', function(){
            describe('left', function(){
                it('all components should be aligned to the original x of the left-most component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.LEFT, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getX(); }, 40);
                });
            });
            describe('right', function(){
                it('all components should be aligned to the original x+width of the right-most component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.RIGHT, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getX()+comp.getWidth(); }, 5*(40+80)); //the rightmost will be: 5 times x+width factors (40 and 80)
                });
            });
            describe('up', function(){
                it('all components should be aligned to the original y of the top-most component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.UP, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getY(); }, 60);
                });
            });
            describe('down', function(){
                it('all components should be aligned to the original y+height of the bottom-most component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.DOWN, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getY()+comp.getPhysicalHeight(); }, 5*(60+120)); //the rightmost will be: 5 times x+width factors (60 and 120)
                });
            });
        });
        describe('Test centers', function(){
            describe('h-center', function(){
                it('the h-center of all components should be the average of the original h-centers', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.HCENTER, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getX()+comp.getWidth()/2; }, 240);
                });
            });
            describe('v-center', function(){
                it('the v-center of all components should be the average of the original v-centers', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.VCENTER, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getY()+comp.getPhysicalHeight()/2; }, 360);
                });
            });
        });
        describe('Test match sizes', function(){
            describe('h-match', function(){
                it('match h-sizes according to the first component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.HSIZE, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getWidth(); }, 80);
                });
            });
            describe('v-match', function(){
                it('match v-sizes according to the first component', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.VSIZE, false);
                    expectAll(this.componentsForPlayLogic, function(comp) { return comp.getPhysicalHeight(); }, 120);
                });
            });
        });
        describe('Test distribution', function(){
            describe('h dist.', function(){
                it('horizontal distribution by averaging the margins', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.HDISTR, false);
                    expect(this.componentsForPlayLogic[0].getX()).toBe(40); //should be untouched
                    expect(this.componentsForPlayLogic[1].getX()).toBe(-40);//avg. margins are -160
                    expect(this.componentsForPlayLogic[2].getX()).toBe(-40);
                    expect(this.componentsForPlayLogic[3].getX()).toBe(40);
                    expect(this.componentsForPlayLogic[4].getX()).toBe(200);
                });
            });
            describe('v dist.', function(){
                it('vertical distribution by averaging the margins', function(){
                    initComponents(this.componentsForPlayLogic);
                    this.W.AlignmentTools.arrangeComponents(this.componentsForPlayLogic, this.W.AlignmentTools.AlignmentCommands.VDISTR, false);
                    expect(this.componentsForPlayLogic[0].getY()).toBe(60);  //should be untouched
                    expect(this.componentsForPlayLogic[1].getY()).toBe(-60); //avg. margins are -190
                    expect(this.componentsForPlayLogic[2].getY()).toBe(-60);
                    expect(this.componentsForPlayLogic[3].getY()).toBe(60);
                    expect(this.componentsForPlayLogic[4].getY()).toBe(300);
                });
            });
        });
    });
    function initComponents(comps) {
        locations = [];
        for (var i=0; i<comps.length; i++) {
            var seed = i+1;
            locations.push({x:seed*40,y:seed*60,width:seed*80,height:seed*120});
        }

        setCoords(comps, locations);
    }
    function setPosition(component, seed) {
        component.setX(seed*40);
        component.setY(seed*60);
        component.setWidth(seed*80);
        component.setHeight(seed*120);
    }
    function expectAll(comps, func, param) {
        for (var i=0; i<numOfComponents; i++) {
            expect(func(comps[i])).toBe(param);
        }
    }
});