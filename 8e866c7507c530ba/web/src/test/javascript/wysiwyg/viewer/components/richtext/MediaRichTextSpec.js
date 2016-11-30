describe("MediaRichText", function(){
    testRequire().components('wysiwyg.viewer.components.MediaRichText').
        resources('W.Data', 'W.Css');

    beforeEach(function(){
        var div = new Element('div');
        this._comp = new this.MediaRichText('mockComp', div);
        var data = this.W.Data.createDataItem({
            'type': 'MediaRichText',
            'text': ''
        }, 'MediaRichText');
        this._comp.setDataItem(data);

        this._comp.getRichTextContainer = jasmine.createSpy("getRichTextContainer() spy").andCallFake(function(){
            var div = document.createElement('div');
            div.innerHTML = '<p class="font_8"><span style="font-family: arial, dotum, helvetica, sans-serif; font-size: 13px; line-height: normal;"><img src="//static.wixstatic.com/media/300a449823eb962ddf8e0b253407a2d4.jpg" style="width: 50%; float: left;" wix-comp="{&quot;id&quot;:&quot;innercomp_txtMedia1b5r&quot;,&quot;dataQuery&quot;:&quot;txtMedia1b5r&quot;,&quot;propertyQuery&quot;:&quot;txtMedia1b5r&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.RoundPhoto&quot;,&quot;src&quot;:&quot;//static.wixstatic.com/media/300a449823eb962ddf8e0b253407a2d4.jpg&quot;,&quot;width&quot;:0.5,&quot;float&quot;:&quot;left&quot;}">Im a paragraph. Click here to add your own text and edit me. I’m a great place for you to tell a story and let your users know a little more about you.</span>Im a paragraph. Click here to add your own text and edit me. I’m a great place for you to tell a story and let your users know a little more about you.Im a paragraph. Click here to add your own text <img src="//static.wixstatic.com/media/1bd3ca753c22426c68829695ad4ae7c9.png" style="width: 50%; float: left;" wix-comp="{&quot;id&quot;:&quot;innercomp_txtMedia1ylu&quot;,&quot;dataQuery&quot;:&quot;txtMedia1ylu&quot;,&quot;propertyQuery&quot;:&quot;txtMedia1ylu&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.RoundPhoto&quot;,&quot;src&quot;:&quot;//static.wixstatic.com/media/1bd3ca753c22426c68829695ad4ae7c9.png&quot;,&quot;width&quot;:0.5,&quot;float&quot;:&quot;left&quot;}">and edit me. I’m a great place for you to tell a story and let your users know a little more about you.</p>';
            return div;
        });
    });

        describe("updates text", function(){
            beforeEach(function(){
                this._comp.getRichTextContainer();

                var text = '<h6>I a para<span style="font-family:times new roman;">graph. Click here to add</span> your own text and edit me. I’m a <span style="font-family:play;">great place for you</span> to tell a story and let your users know a little more about you.?</h6>';
                this._comp.getDataItem().set('text', text);
            });

            it("complete successfuly on plain image dataitem", function(){
                spyOn(this._comp, "_createInnerComponents").andCallThrough();
                spyOn(this._comp, "_clearCacheNodesReference").andCallThrough();

                this._comp._updateText();

                expect(this._comp._createInnerComponents).toHaveBeenCalled();
                expect(this._comp._clearCacheNodesReference).toHaveBeenCalled();
            });

            it("updates link data when it should", function(){
                spyOn(this._comp, "_shouldUpdateLinksData").andReturn(true);
                spyOn(this._comp, "_setLinksDataToElements").andCallThrough();

                this._comp._updateText();

                expect(this._comp._setLinksDataToElements).toHaveBeenCalled();

            });

            it("doesn't updates link data when it shouldn't", function(){
                spyOn(this._comp, "_shouldUpdateLinksData").andReturn(false);
                spyOn(this._comp, "_setLinksDataToElements").andCallThrough();

                this._comp._updateText();

                expect(this._comp._setLinksDataToElements.callCount).toEqual(0);

            });

            it("updates mobile when it should", function(){
                spyOn(this._comp, "_isMobile").andReturn(true);
                spyOn(this._comp, "_setMobileComponentAppearance").andReturn({});

                this._comp._updateText();

                expect(this._comp._setMobileComponentAppearance).toHaveBeenCalled();

            });

            it("doesn't updates mobile when it shouldn't", function(){
                this._comp._isMobile = null;
                spyOn(this._comp, "_setMobileComponentAppearance").andReturn({});

                this._comp._updateText();

                expect(this._comp._setMobileComponentAppearance.callCount).toEqual(0);

            });
        });

    describe("updates image size", function() {
        beforeEach(function () {
            this._mockImage = {
                jsonData: {
                    width: 1
                },
                node: {
                    $logic: {
                        _width: 0,
                        setWidth: function(width) {this._width = width;},
                        getDataItem: function() {
                            return {
                                get: function() {return 50;}
                            };
                        }
                    }
                }
            };
            this._comp._isMobile = null;
        });

        it("works", function () {
            this._comp._updateImageSize(this._mockImage, 100);

            expect(this._mockImage.node.$logic._width).toEqual(100);
        });

        it("different multiplier", function () {
            this._mockImage.jsonData.width = 0.33;
            this._comp._updateImageSize(this._mockImage, 100);

            expect(this._mockImage.node.$logic._width).toEqual(33);
        });

        it("on mobile", function () {
            this._comp._isMobile = true;

            this._comp._updateImageSize(this._mockImage, 100);

            expect(this._mockImage.node.$logic._width).toEqual(99);
        });

        it("when there's no width in json", function () {
            delete this._mockImage.jsonData.width;

            this._comp._updateImageSize(this._mockImage, 100);

            expect(this._mockImage.node.$logic._width).toEqual(50);
        });

        it("when there's no width in json and default is smaller than component", function () {
            delete this._mockImage.jsonData.width;

            this._comp._updateImageSize(this._mockImage, 20);

            expect(this._mockImage.node.$logic._width).toEqual(20);
        });
    });

    describe("updates video size", function() {
        beforeEach(function () {
            this._mockVideo = {
                jsonData: {
                    width: 1,
                    dimsRatio: 0.5
                },
                node: {
                    $logic: {
                        _width: 0,
                        _height: 0,
                        setWidth: function(width) {this._width = width;},
                        setHeight: function(height) {this._height = height;},
                        getDataItem: function() {
                            return {
                                get: function() {return 50;}
                            };
                        }
                    }
                }
            };
            this._comp._isMobile = null;
        });

        it("works", function () {
            this._comp._updateVideoSize(this._mockVideo, 100);

            expect(this._mockVideo.node.$logic._width).toEqual(100);
            expect(this._mockVideo.node.$logic._height).toEqual(50);
        });

        it("different multiplier", function () {
            this._mockVideo.jsonData.width = 0.5;
            this._comp._updateVideoSize(this._mockVideo, 100);

            expect(this._mockVideo.node.$logic._width).toEqual(50);
            expect(this._mockVideo.node.$logic._height).toEqual(25);
        });

        it("on mobile", function () {
            this._comp._isMobile = true;

            this._comp._updateVideoSize(this._mockVideo, 100);

            expect(this._mockVideo.node.$logic._width).toEqual(99);
            expect(this._mockVideo.node.$logic._height).toEqual(49.5);
        });

        it("when there's no width in json", function () {
            delete this._mockVideo.jsonData.width;
            this._mockVideo.jsonData.defaultWidth = 100;

            this._comp._updateVideoSize(this._mockVideo, 100);

            expect(this._mockVideo.node.$logic._width).toEqual(100);
            expect(this._mockVideo.node.$logic._height).toEqual(50);
        });

        it("when there's no width in json and default is smaller than component", function () {
            delete this._mockVideo.jsonData.width;
            this._mockVideo.jsonData.defaultWidth = 100;

            this._comp._updateVideoSize(this._mockVideo, 20);

            expect(this._mockVideo.node.$logic._width).toEqual(20);
            expect(this._mockVideo.node.$logic._height).toEqual(10);
        });
    });

    describe("creates inner components", function() {
        beforeEach(function () {
            spyOn(this._comp, "_getNodesFromCompsArray").andReturn([
                {
                    id: 0,
                    $logic: {
                        getComponentId: function() {return 0;}
                    }
                },
                {
                    id: 1,
                    $logic: {
                        getComponentId: function() {return 1;}
                    }
                },
                {
                    id: 2
                }
            ]);
        });

        it("Transform Data Json For Mobile", function () {
            var mockJson = {
                floatValue: 'left'
            };

            this._comp._transformDataJsonForMobile(mockJson);

            expect(mockJson.marginLeft).toEqual('auto');
            expect(mockJson.marginRight).toEqual('auto');
            expect(mockJson.width).toEqual(1);
            expect(mockJson.floatValue).toEqual(undefined);

        });

        it("adds All Comps To Skin Parts", function () {
            this._comp._skinParts = [];

            this._comp._addAllCompsToSkinParts();

            expect(this._comp._skinParts.length).toEqual(2);
            expect(this._comp._skinParts[0]).toEqual(this._comp._getNodesFromCompsArray()[0].$logic);

        });
    });

//    describe("_getUsedFontsInComp", function(){
//        it("should get all font names from spans", function(){
//            this._comp.getDataItem().set('text',
//                '<h6>I a para<span style="font-family:times new roman;">graph. Click here to add</span> your own text and edit me. I’m a <span style="font-family:play;">great place for you</span> to tell a story and let your users know a little more about you.?</h6>');
//
//            var fontNames = this._comp._getUsedFontsInComp();
//            expect(fontNames['times new roman']).toBeTruthy();
//            expect(fontNames['play']).toBeTruthy();
//            expect(Object.keys(fontNames).length).toBe(2);
//        });
//
//        it("should ignore spans without style attribute", function(){
//            this._comp.getDataItem().set('text',
//                '<h6>I a para<span>graph. Click here to add</span> </h6>');
//
//            var fontNames = this._comp._getUsedFontsInComp();
//            expect(Object.keys(fontNames).length).toBe(0);
//        });
//        it("should ignore spans without font family defined", function(){
//            this._comp.getDataItem().set('text',
//                '<h6>I a para<span style="color:red;">graph. Click here to add</span> </h6>');
//
//            var fontNames = this._comp._getUsedFontsInComp();
//            expect(Object.keys(fontNames).length).toBe(0);
//        });
//        //chrome sometimes creates them
//        it("should get all font names from font tags", function(){
//            this._comp.getDataItem().set('text',
//                '<h6><font face="times new roman">aksjd hfksajd hfkasjd hfadsj hfkjfds&nbsp;</font></h6>');
//
//            var fontNames = this._comp._getUsedFontsInComp();
//            expect(fontNames['times new roman']).toBeTruthy();
//            expect(Object.keys(fontNames).length).toBe(1);
//        });
//        it("should combine font names from both spans and font tags", function(){
//            this._comp.getDataItem().set('text',
//                '<h6><font face="times new roman">aksjd hfksajd hfkasjd hfadsj hfkjfds&nbsp;</font></h6><span style="font-family:play;">great place for you</span>');
//
//            var fontNames = this._comp._getUsedFontsInComp();
//            expect(fontNames['times new roman']).toBeTruthy();
//            expect(fontNames['play']).toBeTruthy();
//            expect(Object.keys(fontNames).length).toBe(2);
//        });
//
//    });
});