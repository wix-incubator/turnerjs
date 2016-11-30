describe("LinkableCompSpec", function(){

    testRequire().
        resources('W.Viewer', 'W.Config');
    beforeEach(function(){
        var fakeMethods = {
            render: function() {
                this.renderCalled = true;
            }
        };

        var params = {};
        params.timeout = 100;
        params.dataTypes =  ["Link"];
        params.extendLogic =  'mobile.core.components.base.BaseComponent';
        params.traits = ['wysiwyg.common.components.traits.LinkableComponent'];
        params.skinParts = {'link': {type: 'htmlElement'}};
        params.compParts = {};
        params.logicMethods = fakeMethods;
        params.propertiesSchema = {};
        params.states = [];
        params._comps = [];
        params._params = [];
        params._html = '<a skinPart="link"></a>';
        params.triggers = ['click'];
        params.renderTriggers = [];
        params.rawData = {
            'type': 'Link',
            'linkType': 'FREE_LINK'
        };
        this.comp = ComponentsTestUtil.createAndBuildComp(
            'test.LinkableComponent',
            'test.mobile.core.skins.LinkableComponentSkin2',
            params);

    });

    it(" should call original render",function(){
        this.comp.compLogic.render();
        expect(this.comp.compLogic.renderCalled).toBe(true);
    });

    it(" should change href on <a> element</a>",function(){
        var url = 'http://www.zelopo.com';
        this.comp.compLogic.getDataItem().set('href', url);
        this.comp.compLogic.render();
        var h = this.comp.compLogic._skinParts['link'].get('href');
        expect(h).toBe(url);
    });

    var createWebLinkToTheSameWindow = function(test, url){
        test.comp.compLogic.getDataItem().set('href', url);
        test.comp.compLogic.getDataItem().set('target', '_self');
        test.comp.compLogic.getDataItem().set('linkType', 'WEBSITE');
        test.comp.compLogic.render();
    }.bind(this);

    it("should remove href on <a> element</a> when changing mode to preview when web link target is the same window",function(){
        var url = 'http://www.zelopo.com';
        createWebLinkToTheSameWindow(this, url);
        this.comp.compLogic._linkableComponentEditModeChanged('PREVIEW');
        var h = this.comp.compLogic._skinParts['link'].get('href');
        expect(h).toBe(null);
    });

    it(" should restore href on <a> element</a> when changing mode back from preview when web link target is the same window",function(){
        var url = 'http://www.zelopo.com';
        createWebLinkToTheSameWindow(this, url);
        this.comp.compLogic._linkableComponentEditModeChanged('PREVIEW');
        this.comp.compLogic._linkableComponentEditModeChanged('VIEW');
        var h = this.comp.compLogic._skinParts['link'].get('href');
        expect(h).toBe(url);
    });


    describe("preview mode", function(){
        it("should not render new hrefs on <a> element</a> when in preview mode",function(){
            spyOn(this.W.Config.env, '$isEditorViewerFrame').andReturn(true);
            var url = 'http://www.zelopo.com';
            createWebLinkToTheSameWindow(this, url);
            var h = this.comp.compLogic._skinParts['link'].get('href');
            expect(h).toBe(null);
        });

        it(" should create hrefs on <a> element</a> when in exiting preview mode",function(){
            var isPreviewMode = true;
            spyOn(this.W.Config.env, '$isEditorViewerFrame').andReturn(isPreviewMode);
            var url = 'http://www.zelopo.com';
            createWebLinkToTheSameWindow(this, url);
            isPreviewMode = false;
            this.comp.compLogic._linkableComponentEditModeChanged('VIEW');
            var h = this.comp.compLogic._skinParts['link'].get('href');
            expect(h).toBe(url);
        });
    });

    it(" should open a tooltip when a link to the same window is clicked in preview mode",function(){
        var url = 'http://www.zelopo.com';
        createWebLinkToTheSameWindow(this, url);
        var fakeEvent = {
                preventDefault: function(){}
        };
        this.comp.compLogic._linkableComponentEditModeChanged('PREVIEW');
        spyOn(this.comp.compLogic, '_showNavigationDisabledTooltip');
        this.comp.compLogic._skinParts['link'].fireEvent('click', fakeEvent);
        expect(this.comp.compLogic._showNavigationDisabledTooltip).toHaveBeenCalledXTimes(1);
    });

    it(" should toogle from preview mode and back",function(){
        var url = 'http://www.zelopo.com';
        createWebLinkToTheSameWindow(this, url);
        var fakeEvent = {
                preventDefault: function(){}
        };
        spyOn(this.comp.compLogic, '_showNavigationDisabledTooltip');

        // first call in preview mode
        this.comp.compLogic._linkableComponentEditModeChanged('PREVIEW');
        this.comp.compLogic._skinParts['link'].fireEvent('click', fakeEvent);
        expect(this.comp.compLogic._showNavigationDisabledTooltip).toHaveBeenCalledXTimes(1);

        // second call in view mode
        this.comp.compLogic._linkableComponentEditModeChanged('VIEW');
        this.comp.compLogic._skinParts['link'].fireEvent('click', fakeEvent);
        expect(this.comp.compLogic._showNavigationDisabledTooltip).toHaveBeenCalledXTimes(1);

        // third call in preview mode
        this.comp.compLogic._linkableComponentEditModeChanged('PREVIEW');
        this.comp.compLogic._skinParts['link'].fireEvent('click', fakeEvent);
        expect(this.comp.compLogic._showNavigationDisabledTooltip).toHaveBeenCalledXTimes(2);

        // fourth call in view mode
        this.comp.compLogic._linkableComponentEditModeChanged('VIEW');
        this.comp.compLogic._skinParts['link'].fireEvent('click', fakeEvent);
        expect(this.comp.compLogic._showNavigationDisabledTooltip).toHaveBeenCalledXTimes(2);

    });

});




